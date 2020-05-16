import { ExcelDataDefinition, Operation, DataType, Colors, parseColumn } from '../../utils/excel-helpers';
import { BatchUploadStatus, StatusCode, BatchEntry } from '../../models/common.models';
import { DateHelper } from '../../utils/date-helper';
import { Observable } from 'rxjs';

interface RangeMapping<T> {
    range: Excel.Range;
    definition: ExcelDataDefinition<T>;
    values: any[][];
}

export abstract class ExcelBaseService<T extends BatchEntry> {
    public abstract definitions: ExcelDataDefinition<T>[];
    public abstract generateTemplate(): Observable<OfficeExtension.IPromise<void>>;
    public abstract readTemplate(): Observable<OfficeExtension.IPromise<T[]>>;

    public abstract updateTemplate(entries: T[], worksheetName: string): Observable<OfficeExtension.IPromise<void>>;

    public async  unProtectWorksheet(worksheetName: string) {
        await Excel.run(async context => {
            const worksheet = context.workbook.worksheets.getItem(worksheetName);
            worksheet.load(['protection', 'protection/protected']);
            await context.sync();
            if (worksheet.protection.protected === true) {
                worksheet.protection.unprotect();
                await context.sync();
            }
        });
    }

    public async protectWorksheet(worksheetName: string) {
        await Excel.run(async context => {
            const worksheet = context.workbook.worksheets.getItem(worksheetName);
            worksheet.load(['protection', 'protection/protected']);
            await context.sync();
            if (worksheet.protection.protected === false) {
                worksheet.protection.protect({
                    allowAutoFilter: false,
                    allowDeleteColumns: false,
                    allowDeleteRows: false,
                    allowFormatCells: false,
                    allowFormatColumns: false,
                    allowFormatRows: false,
                    allowInsertColumns: false,
                    allowInsertHyperlinks: false,
                    allowInsertRows: false,
                    allowPivotTables: false,
                    allowSort: false
                });
            }

            await context.sync();
        });
    }
    protected populateData(
        worksheet: Excel.Worksheet,
        definitions: ExcelDataDefinition<T>[],
        dataArray: T[]): number {

        const rowArray: Array<Array<any>> = [];
        for (const data of dataArray) {
            const columnArray = [];
            for (const definition of definitions) {
                const val = definition.dataType === DataType.Date
                    ? DateHelper.formatUTCDate(data[definition.propertyName])
                    : data[definition.propertyName];
                columnArray.push(val);
            }
            rowArray.push(columnArray);
        }

        const lastRow = rowArray.length + 1;
        const columnCount = rowArray[0].length;
        const lastColumnLetter = parseColumn(columnCount);
        const range = worksheet.getRange(`A2:${lastColumnLetter}${lastRow}`);
        range.values = rowArray;

        return rowArray.length;

    }

    protected addNamedRanges(worksheet: Excel.Worksheet, definitions: ExcelDataDefinition<T>[]): number {

        for (const definition of definitions) {
            const columnRange = worksheet.getRange(definition.rangeAddress);
            const cell = columnRange.getRow(0);
            worksheet.names.add(definition.rangeName, columnRange);
            cell.values = [[definition.columnHeader]];
            if (definition.color) {
                cell.format.fill.color = definition.color;
            }

            if (definition.columnWidth) {
                columnRange.format.columnWidth = definition.columnWidth;
            }

            // Petre 2019-01-17: Commented out by Lyndon to prevent some Excel versions throwing JS error when downloading the templates.
            // if (definition.dataType === DataType.Date) {
            //     columnRange.numberFormat = <any>'m/d/yyyy';
            // }
        }

        return definitions.length;
    }

    protected async readExcel(context: Excel.RequestContext, worksheet: Excel.Worksheet,
        dataDefinitions: ExcelDataDefinition<T>[]): Promise<T[]> {
        const usedRange = worksheet.getUsedRange().load(['values']);
        const lastCell = usedRange.getLastCell().load(['rowIndex']);

        const rangeMappings = this.filterByOperation(Operation.Read, dataDefinitions, worksheet);
        await context.sync();

        const values = usedRange.values;
        const items: T[] = [];
        for (let i = 1; i <= lastCell.rowIndex; i++) {
            const entry: any = {};
            for (const item of rangeMappings) {
                let value = values[i][item.range.columnIndex];
                if (item.definition.dataType === DataType.Date) {
                    value = value === '' ? null : this.getJsDateFromExcel(value);
                }
                entry[item.definition.propertyName] = value;
            }
            items.push(entry);
        }
        return items;
    }

    protected async updateExcel(context: Excel.RequestContext,
        worksheet: Excel.Worksheet, definitions: ExcelDataDefinition<T>[], entries: T[]) {

        const usedrange = worksheet.getUsedRange();
        const lastCell = usedrange.getLastCell().load(['address']);
        const rangeMappings = this.filterByOperation(Operation.Write, definitions, worksheet);
        await context.sync();

        const range = worksheet.getRange(`A2:${lastCell.address}`);
        range.format.fill.clear();

        let rowIndex = 0;

        const columnMapping: { [variableName: string]: number; } = {};
        for (const entry of entries) {

            const row: any = {};
            for (const item of rangeMappings) {
                const data = entry[item.definition.propertyName];

                const val = item.definition.propertyName === 'status' ? this.getStatusMessage(<any>data) : data;
                item.values.push([val]);


                if (item.definition.propertyName === 'status' && typeof (entry.status) !== 'string' && entry.status) {

                    if (entry.status.errorMessages != null && entry.status.errorMessages.length > 0) {
                        for (const errorMessage of entry.status.errorMessages) {
                            if (errorMessage.variableName !== null && errorMessage.variableName !== '') {
                                let columnIndex: number = columnMapping[errorMessage.variableName];

                                if (columnIndex == null) {
                                    const columnRange = worksheet.getRange(errorMessage.variableName).load(['columnIndex']);
                                    await context.sync();
                                    columnIndex = columnRange.columnIndex;
                                    columnMapping[errorMessage.variableName] = columnIndex;
                                }

                                if (columnIndex != null) {
                                    range.getCell(rowIndex, columnIndex).format.fill.color = Colors.orange;
                                }
                            }
                        }
                    }
                }
            }

            rowIndex++;
        }

        for (const item of rangeMappings) {
            range.getColumn(item.range.columnIndex).values = item.values;
        }
    }

    protected getJsDateFromExcel(excelDate: number) {
        return new Date((excelDate - (25567 + 2)) * 86400 * 1000);
    }

    private filterByOperation(operation: Operation, definitions: ExcelDataDefinition<T>[], worksheet: Excel.Worksheet) {
        const rangeMappings: RangeMapping<T>[] = [];
        const readMappings = definitions.filter(x => (x.operation & operation) === operation);

        for (const item of readMappings) {
            const range = worksheet.getRange(item.rangeName).load(['columnIndex']);
            rangeMappings.push({
                definition: item,
                range: range,
                values: []
            });
        }
        return rangeMappings;
    }

    private getStatusMessage(status: string | BatchUploadStatus) {
        if (typeof (status) === 'string') {
            return status;
        }

        const statusDesc = status.errorMessages.map(x => x.errorMessage).join(' | ');

        if (statusDesc) {
            return statusDesc;
        }

        switch (status.statusCode) {
            case StatusCode.NotAtempted:
                return 'Not Attempted';
            case StatusCode.Success:
                return 'Success';
            case StatusCode.Falied:
                return 'Failed';
            case StatusCode.Falied:
                return 'Ignored';
        }

    }


}
