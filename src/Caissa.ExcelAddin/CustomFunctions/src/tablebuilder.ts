import { DateHelper } from './datehelper';
import { Dictionary } from 'lodash';

export enum DataType {
  Integer = 1,
  Percent = 2,
  Decimal = 3,
  Date = 4,
  Text = 5
}

export enum ReportComplexType {
  Exposure = 1,
  Holding = 2,
  UDF = 3,
  Returns = 4,
  Composition = 5,
  ExposureHistorical = 6,
  ReturnHistorical = 7,
  ClassProfile = 8,
  CommitmentProfile = 9
}

export enum ReportEntityType {
  Portfolio = 1,
  Fund = 2,
  PortfolioOfGroup = 3,
  FundOfPortfolio = 4,
  Class = 5,
  Commitment = 6
}

export interface ReportField {
  fieldKey: string;
  fieldId: number;
  fieldName: string;
  fieldGroup: string;
  fieldGroupId: string;
  dataType: DataType;
}

export interface ReportComplex {
  complexId: string;
  complexDescription?: string;
  complexType: ReportComplexType;
  settingsJson: string;
  fields: ReportField[];
}

export enum ReportFormat {
  Vertical = 1,
  Horizontal = 2,
  Flat = 3,
  TimeSeriesDatesHorizontal = 4,
  TimeSeriesDatesVertical = 5
}

export interface ReportEntity {
  entityId: number;
  entityType: ReportEntityType;
  entityName?: string;
}
// export interface ReportCriteria {
//   id?: string;
//   reportName: string;
//   reportScope: ReportScope;
//   entities: ReportEntity[];
//   complexes: ReportComplex[];
//   format: ReportFormat;
// }

export interface ReportCategory {
  fieldKey: string;
  categoryId: string;
  categoryDescription: string;
}

export interface ReportDataItem {
  entityKey: string;
  complexKey: string;
  fieldKey: string;
  categoryId: string;
  categoryDescription: string;
  value: any;
  date?: string;
}
export enum EntityType {
  None = 0,
  Portfolio = 1,
  Fund = 2
}

export interface Entity {
  id: number;
  key?: string;
  entityType: EntityType;
  entityName?: string;
}

export interface ReportResult {
  complexes: ReportComplex[];
  entities: Entity[];
  reportData: ReportDataItem[];
  fieldLabels: { [key: string]: ReportCategory[] };
  format: ReportFormat;
  dates: string[];
}

/**
 * Takes a positive integer and returns the corresponding column name.
 * @param {number} num  The positive integer to convert to a column name.
 * @return {string}  The column name.
 */
export function parseColumn(num: number): string {
  let ret = '';
  for (let a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
    ret = String.fromCharCode(parseInt(String((num % b) / a), null) + 65) + ret;
  }
  return ret;
}

/**
 * Takes in a cell address and returns an array containing the corresponding
 * column number followed by the row number.
 * @param {string} strCellAddr  The address of the cell (eg. AD32).
 * @return {!Array.<number>}  An array of two numbers:  the column number and
 *     the row number.
 */
export function parseAddress(strCellAddr: string) {
  let i = strCellAddr.search(/\d/);
  let colNum = 0;
  const rowNum = +strCellAddr.replace(/\D/g, function (letter) {
    colNum += (parseInt(letter, 36) - 9) * Math.pow(26, --i);
    return '';
  });
  return [colNum, rowNum];
}

export function getJsDateFromExcel(excelDate: number) {
  return new Date((excelDate - (25567 + 2)) * 86400 * 1000);
}

export class TableBuilder {
  private excelColumnLimit = 16384;
  private excelRowLimit = 1048576;

  private formatMapping = {
    [DataType.Integer]: '#,###',
    [DataType.Decimal]: '#,###.00',
    [DataType.Percent]: '0.00%',
    [DataType.Text]: '@',
    [DataType.Date]: '@'
  };

  private headerLabels = {
    fieldType: 'Field Type',
    fieldParameter: 'Field Parameter',
    fieldName: 'Field Name',
    categories: 'Categories',
    entity: 'Entity',
    value: 'Value'
  };

  public generateReport(report: ReportResult, format: ReportFormat) {
    switch (format) {
      case ReportFormat.Horizontal:
        return this.populateDataHorizontal(report);
      case ReportFormat.Vertical:
        return this.populateDataVertical(report);
      case ReportFormat.Flat:
        return this.populateDataFlat(report);
      case ReportFormat.TimeSeriesDatesHorizontal:
       return  this.populateTimeSeriesDatesHoriztonal(report);
      case ReportFormat.TimeSeriesDatesVertical:
        return this.populateTimeSeriesDatesVertical(report);
  }
}

  private populateTimeSeriesDatesVertical(
    report: ReportResult
  ) {
    const dataDictionary = this.buildDataDictionary(report);

    const entitiesRow = [this.headerLabels.entity];
    const fieldTypeRow = [this.headerLabels.fieldType];
    const fieldParameterRow = [this.headerLabels.fieldParameter];
    const categoryRow = [this.headerLabels.categories];
    const fieldNameRow = [this.headerLabels.fieldName];
    const dataRows = [];

    const headerRowFormat = [];

    const textFormat = this.formatMapping[DataType.Text];

    const excelDateFormat = this.formatMapping[DataType.Date];

    const dataFormats = [];

    for (let i = -1; i < report.dates.length; i++) {
      const row = [];
      const rowFormats = [];
      let date = null;

      if (i >= 0) {
        date = report.dates[i];
        row.push(DateHelper.formatUTCDate(date));
        rowFormats.push(excelDateFormat);
      } else {
        headerRowFormat.push(textFormat);
      }

      for (const entity of report.entities) {
        for (const complex of report.complexes) {
          for (const field of complex.fields) {
            const categories = report.fieldLabels[field.fieldKey];

            if (categories == null) {
              continue;
            }

            for (const category of categories) {
              if (i === -1) {
                entitiesRow.push(entity.entityName);
                fieldTypeRow.push(complex.complexDescription);
                fieldParameterRow.push(field.fieldGroup);
                categoryRow.push(category.categoryDescription);
                fieldNameRow.push(field.fieldName);
                headerRowFormat.push(textFormat);
              } else {
                let data = null;

                const dataDic = this.extractDataArray(
                  dataDictionary,
                  entity.key,
                  complex.complexId,
                  field.fieldKey,
                  category.categoryId
                );

                if (dataDic != null) {
                  data = dataDic[date];
                }

                if (data != null) {
                  row.push(data);
                  rowFormats.push(this.formatMapping[field.dataType]);
                } else {
                  row.push(null);
                  rowFormats.push(null);
                }
              }
            }
          }
        }
      }
      if (row.length) {
        dataRows.push(row);
        dataFormats.push(rowFormats);
      }
    }

    const rangeData = [
      entitiesRow,
      fieldTypeRow,
      fieldParameterRow,
      categoryRow,
      fieldNameRow,
      ...dataRows
    ];

    const formats = [
      headerRowFormat,
      headerRowFormat,
      headerRowFormat,
      headerRowFormat,
      headerRowFormat,
      ...dataFormats
    ];

    if (this.validate(rangeData)) {
      return rangeData;
    }  else {
      return this.generateErrorReport(rangeData);
    }
  }

  private populateTimeSeriesDatesHoriztonal(
    report: ReportResult
  ) {
    const dataDictionary = this.buildDataDictionary(report);

    const headerRow = [
      this.headerLabels.entity,
      this.headerLabels.fieldType,
      this.headerLabels.fieldParameter,
      this.headerLabels.categories,
      this.headerLabels.fieldName
    ];

    const textFormat = this.formatMapping[DataType.Text];
    const headerFormats = [
      textFormat,
      textFormat,
      textFormat,
      textFormat,
      textFormat
    ];

    const excelDateFormat = this.formatMapping[DataType.Date];

    for (const date of report.dates) {
      headerRow.push(DateHelper.formatUTCDate(date));
      headerFormats.push(excelDateFormat);
    }

    const rangeData = [headerRow];

    const dataFormats = [headerFormats];

    for (const entity of report.entities) {
      for (const complex of report.complexes) {
        for (const field of complex.fields) {
          const categories = report.fieldLabels[field.fieldKey];

          if (categories == null) {
            continue;
          }

          for (const category of categories) {
            const rowFormats = [
              textFormat,
              textFormat,
              textFormat,
              textFormat,
              textFormat
            ];
            const row = [];

            row.push(entity.entityName);
            row.push(complex.complexDescription);
            row.push(field.fieldGroup);
            row.push(category.categoryDescription);
            row.push(field.fieldName);

            const dataDic = this.extractDataArray(
              dataDictionary,
              entity.key,
              complex.complexId,
              field.fieldKey,
              category.categoryId
            );

            for (const date of report.dates) {
              let data = null;
              if (dataDic != null) {
                data = dataDic[date];
              }

              if (data != null) {
                row.push(data);
                rowFormats.push(this.formatMapping[field.dataType]);
              } else {
                row.push(null);
                rowFormats.push(null);
              }
            }

            rangeData.push(row);
            dataFormats.push(rowFormats);
          }
        }
      }
    }

    if (this.validate(rangeData)) {
      return rangeData;
    }  else {
      return this.generateErrorReport(rangeData);
    }
  }

  private populateDataHorizontal(report: ReportResult): Array<Array<any>> {
    const dataDictionary = this.buildDataDictionary(report);
    let rowCount = 4;
    let columnCount = 1;
    const rangeData = [];
    const rangeFormats = [];
    // Header Rows
    const fieldTypes = [this.headerLabels.fieldType];
    const fieldParameters = [this.headerLabels.fieldParameter];
    const fieldNames = [this.headerLabels.fieldName];
    const fieldcategories = [this.headerLabels.categories];
    const headerFormats = [this.formatMapping[DataType.Text]];

    for (const complex of report.complexes) {
      for (const field of complex.fields) {
        const categories = report.fieldLabels[field.fieldKey];
        if (categories == null) {
          continue;
        }

        for (const category of categories) {
          fieldTypes.push(complex.complexDescription);
          fieldParameters.push(field.fieldGroup);
          fieldNames.push(field.fieldName);
          fieldcategories.push(category.categoryDescription);
          headerFormats.push(this.formatMapping[DataType.Text]);
          columnCount++;
        }
      }
    }

    rangeData.push(fieldTypes);
    rangeData.push(fieldParameters);
    rangeData.push(fieldNames);
    rangeData.push(fieldcategories);

    rangeFormats.push(headerFormats);
    rangeFormats.push(headerFormats);
    rangeFormats.push(headerFormats);
    rangeFormats.push(headerFormats);

    // Data Rows
    for (const entity of report.entities) {
      const rowData = [entity.entityName];
      const rowFormat = [this.formatMapping[DataType.Text]];

      for (const complex of report.complexes) {
        for (const field of complex.fields) {
          const categories = report.fieldLabels[field.fieldKey];
          if (categories == null) {
            continue;
          }
          for (const category of categories) {
            const data = this.extractData(
              dataDictionary,
              entity.key,
              complex.complexId,
              field.fieldKey,
              category.categoryId
            );
            rowData.push(this.formatData(data, field.dataType));
            rowFormat.push(this.formatMapping[field.dataType]);
          }
        }
      }
      rangeData.push(rowData);
      rangeFormats.push(rowFormat);
      rowCount++;
    }

   if (this.validate(rangeData)) {
      return rangeData;
    }  else {
      return this.generateErrorReport(rangeData);
    }
  }

  private populateDataVertical(
    report: ReportResult
  ) {
    let rowCount = 1;
    let columnCount = 4;
    const dataDictionary = this.buildDataDictionary(report);
    const headerRow = [
      this.headerLabels.fieldType,
      this.headerLabels.fieldParameter,
      this.headerLabels.fieldName,
      this.headerLabels.categories
    ];

    const headerFormat = [
      this.formatMapping[DataType.Text],
      this.formatMapping[DataType.Text],
      this.formatMapping[DataType.Text],
      this.formatMapping[DataType.Text]
    ];

    for (const entity of report.entities) {
      headerRow.push(entity.entityName);
      headerFormat.push(this.formatMapping[DataType.Text]);
      columnCount++;
    }

    const rangeData = [headerRow];
    const rangeFormats = [headerFormat];
    for (const complex of report.complexes) {
      for (const field of complex.fields) {
        const categories = report.fieldLabels[field.fieldKey];
        if (categories == null) {
          continue;
        }

        for (const category of categories) {
          const rowData = [];
          const rowFormat = [];
          rowData.push(complex.complexDescription);
          rowData.push(field.fieldGroup);
          rowData.push(field.fieldName);
          rowData.push(category.categoryDescription);
          rowFormat.push(this.formatMapping[DataType.Text]);
          rowFormat.push(this.formatMapping[DataType.Text]);
          rowFormat.push(this.formatMapping[DataType.Text]);
          rowFormat.push(this.formatMapping[DataType.Text]);

          for (const entity of report.entities) {
            const data = this.extractData(
              dataDictionary,
              entity.key,
              complex.complexId,
              field.fieldKey,
              category.categoryId
            );
            rowData.push(this.formatData(data, field.dataType));
            rowFormat.push(this.formatMapping[field.dataType]);
          }
          rangeData.push(rowData);
          rangeFormats.push(rowFormat);
          rowCount++;
        }
      }
    }

    if (this.validate(rangeData)) {
      return rangeData;
    }  else {
      return this.generateErrorReport(rangeData);
    }
  }

  private populateDataFlat(report: ReportResult) {
    const textFormat = this.formatMapping[DataType.Text];
    const headerRow = [
      this.headerLabels.entity,
      this.headerLabels.fieldType,
      this.headerLabels.fieldParameter,
      this.headerLabels.fieldName,
      this.headerLabels.categories,
      this.headerLabels.value
    ];

    const headerFormat = [
      textFormat,
      textFormat,
      textFormat,
      textFormat,
      textFormat,
      textFormat
    ];

    const dataDictionary = this.buildDataDictionary(report);
    const rangeData = [headerRow];
    const rangeFormats = [headerFormat];
    for (const entity of report.entities) {
      for (const complex of report.complexes) {
        for (const field of complex.fields) {
          const categories = report.fieldLabels[field.fieldKey];
          if (categories == null) {
            continue;
          }

          for (const category of categories) {
            const data = this.extractData(
              dataDictionary,
              entity.key,
              complex.complexId,
              field.fieldKey,
              category.categoryId
            );
            if (data == null) {
              continue;
            }

            rangeData.push([
              entity.entityName,
              complex.complexDescription,
              field.fieldGroup,
              field.fieldName,
              category.categoryDescription,
              this.formatData(data, field.dataType)
            ]);

            rangeFormats.push([
              textFormat,
              textFormat,
              textFormat,
              textFormat,
              textFormat,
              this.formatMapping[field.dataType]
            ]);
          }
        }
      }
    }

    if (this.validate(rangeData)) {
      return rangeData;
    }  else {
      return this.generateErrorReport(rangeData);
    }
  }

  private extractData(
    dataDictionary: Dictionary<
      Dictionary<Dictionary<Dictionary<ReportDataItem[]>>>
    >,
    entityKey: string,
    complexKey: string,
    fieldKey: string,
    catergoryId: string
  ) {
    if (dataDictionary[entityKey] == null) {
      return null;
    }

    if (dataDictionary[entityKey][complexKey] == null) {
      return null;
    }

    if (dataDictionary[entityKey][complexKey][fieldKey] == null) {
      return null;
    }

    if (dataDictionary[entityKey][complexKey][fieldKey][catergoryId] == null) {
      return null;
    }

    if (
      dataDictionary[entityKey][complexKey][fieldKey][catergoryId].length === 0
    ) {
      return null;
    }

    return dataDictionary[entityKey][complexKey][fieldKey][catergoryId][0]
      .value;
  }

  private extractDataArray(
    dataDictionary: Dictionary<
      Dictionary<Dictionary<Dictionary<ReportDataItem[]>>>
    >,
    entityKey: string,
    complexKey: string,
    fieldKey: string,
    catergoryId: string
  ) {
    if (dataDictionary[entityKey] == null) {
      return null;
    }

    if (dataDictionary[entityKey][complexKey] == null) {
      return null;
    }

    if (dataDictionary[entityKey][complexKey][fieldKey] == null) {
      return null;
    }

    if (dataDictionary[entityKey][complexKey][fieldKey][catergoryId] == null) {
      return null;
    }

    if (
      dataDictionary[entityKey][complexKey][fieldKey][catergoryId].length === 0
    ) {
      return null;
    }

    const result: { [key: string]: any } = {};
    dataDictionary[entityKey][complexKey][fieldKey][catergoryId].forEach(x => {
      result[x.date] = x.value;
    });
    return result;
  }

  private buildDataDictionary(
    report: ReportResult
  ): Dictionary<Dictionary<Dictionary<Dictionary<ReportDataItem[]>>>> {
    const dic: Dictionary<
      Dictionary<Dictionary<Dictionary<ReportDataItem[]>>>
    > = {};
    for (const item of report.reportData) {
      if (dic[item.entityKey] == null) {
        dic[item.entityKey] = {};
      }
      if (dic[item.entityKey][item.complexKey] == null) {
        dic[item.entityKey][item.complexKey] = {};
      }
      if (dic[item.entityKey][item.complexKey][item.fieldKey] == null) {
        dic[item.entityKey][item.complexKey][item.fieldKey] = {};
      }
      if (
        dic[item.entityKey][item.complexKey][item.fieldKey][item.categoryId] ==
        null
      ) {
        dic[item.entityKey][item.complexKey][item.fieldKey][item.categoryId] = [
          item
        ];
      } else {
        dic[item.entityKey][item.complexKey][item.fieldKey][
          item.categoryId
        ].push(item);
      }
    }
    return dic;
  }

  private formatData(data: any, dataType: DataType) {
    switch (dataType) {
      case DataType.Date:
        return DateHelper.formatUTCDate(data);
      default:
        return data;
    }
  }

  private validate(rangeData: any[][]): boolean {
    if (rangeData.length > this.excelRowLimit) {
      return false;
    }

    if (rangeData.length && rangeData[0].length > this.excelColumnLimit) {
      return false;
    }

    return true;
  }

  private generateErrorReport(rangeData: any[][]) {
    let message = null;
    if (rangeData.length > this.excelRowLimit) {
      message = `Error generating report, the amount of rows exceed the excel limit of ${
        this.excelRowLimit
        }`;
    }

    if (rangeData.length && rangeData[0].length > this.excelColumnLimit) {
      message = `Error generating report, the amount of columns exceed the excel limit of ${
        this.excelColumnLimit
        }`;
    }

    return [
      ['Error Message', 'Number of Rows', 'Number of Columns'],
      [
        message,
        rangeData.length,
        rangeData.length > 0 ? rangeData[0].length : 0
      ]
    ];
  }
}
