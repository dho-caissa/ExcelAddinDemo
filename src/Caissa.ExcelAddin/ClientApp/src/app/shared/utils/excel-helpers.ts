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

export enum DataType {
    String,
    Number,
    Bool,
    Date
}

export enum Operation {
    Read = 1,
    Write = 2,
    ReadAndWrite = Read | Write
}

export interface ExcelRangeMapping {
    rangeName: string;
    rangeAddress?: string;
    columnHeader: string;
    color?: string;
    columnWidth?: number;
    propertyName?: string;
    dataType?: DataType;
    operation?: Operation;
}

export interface ExcelDataDefinition<T> {
    rangeName: string;
    rangeAddress: string;
    columnHeader: string;
    color?: string;
    columnWidth: number;
    propertyName: keyof T;
    dataType: DataType;
    operation: Operation;
}

export const Colors = {
    blue: '#ccddff',
    lightPink: '#ffb6c1',
    lightYellow: '#ffffe0',
    orange: 'orange',
    whiteSmoke: '#f5f5f5'
};
