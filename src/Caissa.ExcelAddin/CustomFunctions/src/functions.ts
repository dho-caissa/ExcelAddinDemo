const dataFormatPrefix = 'DATAFORMAT_';
(async () => {
  const keys = await OfficeRuntime.storage.getKeys();
  const dataFormatKeys = keys.filter(key => key.includes(dataFormatPrefix));
  await OfficeRuntime.storage.removeItems(dataFormatKeys);
})();

/**
 * Gets Fund Market Value.
 * @customfunction FUND.MARKETVALUE.Fail
 * @returns Fund Market Value
 */
async function getFundMarketValueFail(
) {

    try {
        const path = 'https://localhost:44360/data/GetDataFailed';
        const response = await fetch(path);
        const text = await response.text()
        const json = JSON.parse(text);
        
        if (json === null || json === undefined) {
            return "#no data";
        } else {
            return json;
        }
    } catch (err) {
        return "#exception:" + err;
    }
}
CustomFunctions.associate("FUND.MARKETVALUE.Fail", getFundMarketValueFail);


/**
 * Gets Fund Market Value.
 * @customfunction FUND.MARKETVALUE.Success
 * @returns Fund Market Value
 */
async function getFundMarketValueSuccess(
) {

    try {
        const path = 'https://localhost:44360/data/GetDataSuccess';
        const response = await fetch(path);
        const text = await response.text()
        const json = JSON.parse(text);

        if (json === null || json === undefined) {
            return "#no data";
        } else {
            return json;
        }
    } catch (err) {
        return "#exception:" + err;
    }
}
CustomFunctions.associate("FUND.MARKETVALUE.Success", getFundMarketValueSuccess);

