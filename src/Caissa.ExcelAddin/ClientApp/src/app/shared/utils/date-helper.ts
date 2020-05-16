import * as moment from 'moment';
import * as _ from 'lodash';

export enum DatePartType {
    MILLISECOND,
    SECOND,
    MINUTE,
    HOUR,
    DAY,
    WEEK,
    MONTH,
    YEAR
}
export const DateFormats = {
    ForwardSlash_MM_DD_YY: {
        localFormat: 'mm/dd/yy',
        angularFormat: 'MM/dd/yy',
        momentFormat: 'MM/DD/YY',
        highchartFormat: '%m/%d/%y'
    },
    ForwardSlash_MM_DD_YYYY: {
        localFormat: 'MM/dd/yyyy',
        angularFormat: 'MM/dd/yyyy',
        momentFormat: 'MM/DD/YYYY',
        highchartFormat: '%m/%d/%Y'
    },
    ForwardSlash_DD_MM_YY: {
        localFormat: 'dd/mm/yyyy',
        angularFormat: 'dd/MM/yyyy',
        momentFormat: 'DD/MM/YYYY',
        highchartFormat: '%d/%m/%Y'
    },
    ForwardSlash_DD_MM_YYYY: {
        localFormat: 'dd/mm/yy',
        angularFormat: 'dd/MM/yy',
        momentFormat: 'DD/MM/YY',
        highchartFormat: '%d/%m/%y'
    },
    ForwardSlashColon_DD_MM_YYYY_HH_MM_SS: {
        localFormat: 'mm/dd/yyyy HH:mm',
        angularFormat: 'MM/dd/yyyy HH:mm',
        momentFormat: 'MM/DD/YYYY HH:mm',
        highchartFormat: '%d/%m/%y%h:%m'
    },

    Dash_MM_DD_YYYY: { localFormat: 'mm-dd-yyyy', angularFormat: 'MM-dd-yyyy', momentFormat: 'MM-DD-YYYY', highchartFormat: '%m-%d-%Y' },
};
type UnitOfTime = ('year' | 'years' | 'y' |
    'quarter' | 'quarters' | 'Q' |
    'month' | 'months' | 'M' |
    'week' | 'weeks' | 'w' |
    'date' | 'dates' | 'd' |
    'day' | 'days' |
    'hour' | 'hours' | 'h' |
    'minute' | 'minutes' | 'm' |
    'second' | 'seconds' | 's' |
    'millisecond' | 'milliseconds' | 'ms');

export class DateHelper {
    /**
     * Check if the date is valid
     *
     * @static
     * @param {Date} date Date to check
     * @returns {boolean} true if the date is valid
     * @memberof DateHelper
     */
    public static isValidDate(date: Date): boolean {
        return moment(date).isValid();
    }

    public static getCurrentDate() {
        const currentDate = new Date();
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    }

    public static getCurrentUTCDate() {
        const currentDate = new Date();
        return new Date(
            Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
        );
    }

    public static getLocalInUTC(date: Date) {
        return new Date(
            Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(),
                date.getHours(), date.getMinutes(), date.getSeconds())
        );
    }

    public static getUTCInLocal(date: Date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
            date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    }

    /**
     *
     * @param year The year part of the date, e.g. 2000 corresponds to the year 2000.
     * @param month The month part of the date, e.g. 11 corresponds to the month of November.
     * @param day The day part of the date, e.g. 25 corresponds to the 25 day of the month.
     */
    public static getUTCDate(year: number, month: number, day: number) {
        return new Date(
            Date.UTC(year, month - 1, day)
        );
    }

    public static isCalendarEndOfMonthUTC(date: Date): boolean {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        const dayOfTheMonth = date.getUTCDate();

        return dayOfTheMonth === (new Date(year, month + 1, 0)).getDate();
    }

    // UTC date is always returned.
    // Gets the next end of month for a given reference date.
    // If null|undefined is passed to this function, the end of month of the current month will be returned.
    // E.g. if date = 2017/03/23 => returnValue = 2017/03/31
    public static getNextEndOfMonth(date?: string | Date): Date {

        let parseDate: Date;
        if (typeof (date) === 'string') {
            parseDate = DateHelper.parseDate(<string>date);
        } else if (date === undefined || date == null) {
            parseDate = DateHelper.getCurrentUTCDate();
        } else {
            parseDate = date as Date;
        }

        const endOfMonth = DateHelper.getCalendarUTCEndOfMonthByDate(parseDate);

        if (DateHelper.dateEqualityComparer(parseDate, endOfMonth)) {
            DateHelper.dateAdd(endOfMonth, DatePartType.DAY, 2);
            return DateHelper.getCalendarUTCEndOfMonthByDate(endOfMonth);
        } else {
            return endOfMonth;
        }
    }


    // UTC date is always returned.
    // Gets the previous end of month for a given reference date.
    // If null|undefined is passed to this function, the end of month of the previous month will be returned.
    // E.g. if date = 2017/03/23 => returnValue = 2017/02/28
    public static getPreviousEndOfMonth(date?: string | Date) {

        let parseDate: Date;
        if (typeof (date) === 'string') {
            parseDate = DateHelper.parseDate(<string>date);
        } else if (date === undefined || date == null) {
            parseDate = DateHelper.getCurrentUTCDate();
        } else {
            parseDate = date as Date;
        }

        parseDate.setDate(1);
        DateHelper.dateAdd(parseDate, DatePartType.MONTH, -1);
        const endOfMonth = DateHelper.getCalendarUTCEndOfMonthByDate(parseDate);
        return endOfMonth;
    }

    public static getCalendarUTCEndOfMonthByDate(date: Date) {
        return DateHelper.getCalendarUTCEndOfMonth(date.getFullYear(), date.getMonth());
    }

    public static getCalendarUTCEndOfMonth(year: number, month: number) {
        if (month < 11) {
            return new Date(Date.UTC(year, month + 1, 0));
        } else {
            return new Date(Date.UTC(year + 1, 0, 0));
        }
    }

    public static getPreviousCalendarUTCEndOfYear(date: Date): Date {
        return new Date(Date.UTC(date.getUTCFullYear() - 1, 11, 31));
    }

    public static cloneDate(date: Date): Date {
        return new Date(date.valueOf());
    }

    // If the modified date is month end, the resulting date will remain month end.
    public static dateAddAndAdjustEOM(date: Date, size: DatePartType, value) {
        switch (size) {
            case DatePartType.DAY:
            case DatePartType.HOUR:
            case DatePartType.WEEK:
            case DatePartType.MINUTE:
            case DatePartType.SECOND:
            case DatePartType.MILLISECOND:
                DateHelper.dateAdd(date, size, value);
                break;

            case DatePartType.MONTH:
            case DatePartType.YEAR:
            default:
                if (DateHelper.isCalendarEndOfMonthUTC(date)) {
                    // Subtruct 10 days to make sure when adding months or years, the month doesn't change.
                    // In the end we are going to get month end, so it really doesn't matter
                    DateHelper.dateAdd(date, DatePartType.DAY, -10);
                    DateHelper.dateAdd(date, size, value);
                    date.setTime(DateHelper.getCalendarUTCEndOfMonthByDate(date).getTime());
                } else {
                    DateHelper.dateAdd(date, size, value);
                }
        }
    }

    // size = 'day'
    public static dateAdd(date: Date, size: DatePartType, value) {
        value = parseInt(value, null);
        let incr = 0;
        switch (size) {
            case DatePartType.DAY:
                incr = value * 24;
                DateHelper.dateAdd(date, DatePartType.HOUR, incr);
                break;
            case DatePartType.HOUR:
                incr = value * 60;
                DateHelper.dateAdd(date, DatePartType.MINUTE, incr);
                break;
            case DatePartType.WEEK:
                incr = value * 7;
                DateHelper.dateAdd(date, DatePartType.DAY, incr);
                break;
            case DatePartType.MINUTE:
                incr = value * 60;
                DateHelper.dateAdd(date, DatePartType.SECOND, incr);
                break;
            case DatePartType.SECOND:
                incr = value * 1000;
                DateHelper.dateAdd(date, DatePartType.MILLISECOND, incr);
                break;
            case DatePartType.MILLISECOND:
                date.setTime(date.getTime() + value);
                break;
            case DatePartType.MONTH:
            case DatePartType.YEAR:
                // setUTCMonth() is dangerous; 5/31/2010 - 3 months = 3/2/2010! Same concept applies to setUTCFullYear().
                const dateCopy = new Date(date);
                const datePart: UnitOfTime = size === DatePartType.MONTH ? 'month' : 'year';
                const targetDate = moment.utc(dateCopy).add(value, datePart);
                date.setUTCDate(1);
                date.setUTCMonth(targetDate.month());
                date.setUTCFullYear(targetDate.year());
                date.setUTCDate(targetDate.date());
                break;
            default:
                break;
        }
    }

    /*
        Checks whether the current UTC year is a leap year.
        Examples:
            2016 -> TRUE, 2015 -> FALSE
            2015-12-31 11:00 PM NYC Time -> TRUE  (because in London it is 2016-01-01 regardless of the timepart)
            2016-12-31 11:00 PM NYC Time -> FALSE (because in London it is 2017-01-01 regardless of the timepart)
    */
    public static isLeapYearUTC(yearOrDate: number | Date): boolean {
        if (yearOrDate === undefined || yearOrDate === null) {
            return false;
        }

        const year: number = yearOrDate instanceof Date ? yearOrDate.getUTCFullYear() : yearOrDate;
        return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
    }

    public static dateEqualityComparer(date1: Date, date2: Date): boolean {
        if ((date1 instanceof Date) === false || (date2 instanceof (Date) === false)) {
            return false;
        }

        return (date1.getUTCDate() === date2.getUTCDate()
            && date1.getUTCMonth() === date2.getUTCMonth()
            && date1.getUTCFullYear() === date2.getUTCFullYear());
    }

    public static round(value: number, precision: number = 10) {
        const decimals = Math.pow(10, precision);
        return Math.round(value * decimals) / decimals;
    }

    public static getModelStateErrors(modelState: any) {
        return _.flattenDeep(_.values(modelState));
    }

    /*
       This function should be used when parsing strings that come from the server which
       are already in UTC.
       Parses a string to a Date object in the local time zone.
       Example 2016/11/30 will be parsed to 2016-11-30 00:00:00.000 in NYC time,
       but it will be 2016/12/01 05:00:00.000 London time.
    */
    public static parseDate(date: string, format?: string): Date {
        let parsedDate = null;
        if (format) {
            parsedDate = moment(date, format);
        } else {
            // this function is used with UTC dates, so check whether it is in the ISO format first.
            parsedDate = moment(date, moment.ISO_8601);
            if (!parsedDate.isValid()) {
                parsedDate = moment(date, DateFormats.Dash_MM_DD_YYYY.momentFormat, false);
            }
        }
        return parsedDate.isValid() ? parsedDate.toDate() : null;
    }

    /*
       This is the right function to use when parsing dates on the client which are missing the time parts
       and need to be transfered to the server.
       Parses a string to a Date object in the UTC time zone.
       Example 2016/11/30 will be parsed to 2016-11-29 19:00:00.000 in NYC time,
       but it will be 2016/12/01 05:00:00.000 London time.
    */
    public static parseToUTCDate(date: string, format?: string): Date {
        let parsedDate = null;
        if (format) {
            parsedDate = moment(date, format);
        } else {
            // this function is used with local dates, so check whether it is in the moment format first.
            parsedDate = moment(date, DateFormats.Dash_MM_DD_YYYY.momentFormat, false);
            if (!parsedDate.isValid()) {
                parsedDate = moment(date, moment.ISO_8601);
            }
        }
        return parsedDate.isValid() ? DateHelper.getLocalInUTC(parsedDate.toDate()) : null;
    }

    public static parseNumber(value: string): number {
        if (value === undefined || value === null || value === '') {
            return null;
        }

        const val1 = Number.parseFloat(value);
        const val2 = Number(value);
        if (val1 === val2) {
            return val1;
        }

        return Number.NaN;
    }

    public static parseBool(value: string): boolean {
        if (value === undefined || value === null || value === '') {
            return null;
        }

        switch (value.toLowerCase()) {
            case 'true':
                return true;
            case 'false':
                return false;
            default:
                return null;
        }

    }

    public static dateToUnixTimestamp(value: Date): number {
        return moment(value).unix();
    }

    // Formats a given date in the local time zone
    // @value - The value should be a Date object or a string in ISO DateFormat
    public static formatLocalDate(value: any, dateFormat: string): string {
        let date: Date;

        if (typeof value === 'string') {
            date = new Date(value);
        } else {
            date = value;
        }
        return moment(date).format(dateFormat);
    }

    // Formats the current date in UTC e.g. 2016/06/06 19:00:00 in EST
    // is 2016/06/07 00:00:00 in UTC, so '2016/06/07' will be returned.
    // @value - The value should be a Date object or a string in ISO DateFormat
    public static formatUTCDate(value: any, dateFormat: string = DateFormats.Dash_MM_DD_YYYY.momentFormat): string {
        let date: Date;

        if (typeof value === 'string') {
            date = new Date(value);
        } else {
            date = value;
        }

        return moment(date).utc().format(dateFormat);
    }
}
