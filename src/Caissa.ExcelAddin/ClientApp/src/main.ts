import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { parseAddress } from './app/shared/utils/excel-helpers';

if (environment.production) {
    enableProdMode();
}

interface ExcelFormat {
    address: string;
    columnFormats: string[];
    rowCount: number;
    columnCount: number;
}

/// Petre 2018-08-14: JUST FOR DEBUGGING IN CHROME (any browser): Comment out the following code block to view it in the browser.
 Office.onReady(async (info) => {
   platformBrowserDynamic().bootstrapModule(AppModule)
       .catch(err => console.log(err));

        async function formatData(event: Excel.WorksheetCalculatedEventArgs) {
            const dataFormatPrefix = 'DATAFORMAT_';

            const keys  = await  OfficeRuntime.storage.getKeys();

            const dataFormatKeys = keys.filter( key => key.includes(dataFormatPrefix));

            const items = await OfficeRuntime.storage.getItems(dataFormatKeys);

            await OfficeRuntime.storage.removeItems(dataFormatKeys);

            await Excel.run(async (context) => {

                for (const key of dataFormatKeys) {
                    const [worksheetName, cellAddress] = key.replace(dataFormatPrefix, '').split('!');
                    const item: ExcelFormat = JSON.parse(items[key]);
                    const worksheet = context.workbook.worksheets.getItem(worksheetName);
                    const [column, row] = parseAddress(cellAddress);
                    const range = worksheet.getRangeByIndexes(row - 1, column - 1, item.rowCount, item.columnCount);
                    const formats = [];

                    for (let i = 0; i < item.rowCount; i++) {
                        formats.push(item.columnFormats);
                    }
                    range.numberFormat = formats;
                    range.format.autofitColumns();
                }
                return context.sync();
            });
        }

        await Excel.run( async ctx => {
            ctx.workbook.worksheets.onCalculated.add(formatData);
            return await ctx.sync();
        });
 });
