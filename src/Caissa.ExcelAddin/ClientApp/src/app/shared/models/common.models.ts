import { Colors, parseColumn, ExcelRangeMapping } from '../utils/excel-helpers';

export enum StatusCode {
    NotAtempted = 1,
    Success = 2,
    Falied = 3,
    Ignored = 4
}

export interface BatchErrorMessage {
    variableName: string;
    errorMessage: string;
}

export interface BatchUploadStatus {
    statusCode: StatusCode;
    errorMessages: BatchErrorMessage[];
}

export function getStatusMessage(statusCode: StatusCode) {
    switch (statusCode) {
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


export interface BatchEntry {
    status?: string | BatchUploadStatus;
}

export function addColumnRanges(worksheet: Excel.Worksheet, rangeMappings: ExcelRangeMapping[]): number {
    let colNum = 0;
    for (const mapping of rangeMappings) {
        const cell = worksheet.getCell(0, colNum++);
        const column = parseColumn(colNum);
        const columnRange = worksheet.getRange(`${column}:${column}`);
        worksheet.names.add(mapping.rangeName, columnRange);
        cell.values = [[mapping.columnHeader]];

        if (mapping.color) {
            cell.format.fill.color = mapping.color;
        }
    }

    return rangeMappings.length;
}
