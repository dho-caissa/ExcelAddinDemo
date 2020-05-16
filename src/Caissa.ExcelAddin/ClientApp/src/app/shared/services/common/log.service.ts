import { Injectable } from '@angular/core';
import { JL } from 'jsnlog';
import { AppSettingsService } from '../data/app-settings.service';
@Injectable({
    providedIn: 'root'
})
export class LogService {

    private _logger: JL.JSNLogLogger;

    constructor(private _appSettingsService: AppSettingsService ) {
    }

    public init() {
        const authAppender = JL.createAjaxAppender('Auth');
        authAppender.setOptions({
        });
        JL.setOptions({
            defaultAjaxUrl: `${this._appSettingsService.apiEndpoint}/jsnlog.logger`,

        });

        this._logger = JL('CaissaExcelAddinJS').setOptions({
            appenders: [authAppender]
        });
    }

    public debug(message: string, data?: Object) {
        this._logger.debug(this._getLogData(message, data));
    }

    public info(message: string, data?: Object) {
        this._logger.info(this._getLogData(message, data));
    }

    public warn(message: string, data?: Object) {
        this._logger.warn(this._getLogData(message, data));
    }

    public error(message: any, exception: any) {
        this._logger.error(this._getLogData(message, exception));
    }

    private _getLogData(message: string, data?: any) {
        const logData: any = {};

        logData.exceptionMessage = message + (data && data.statusText ? `: ${data.statusText}` : '');
        logData.stackTrace = data && data.stackTrace || '';
        logData.apiUrl = data && data.url || '';

        logData.diagnostics = `Version: ${Office.context.diagnostics.version}
                                Host: ${Office.context.diagnostics.host}
                                Platform: ${Office.context.diagnostics.platform}`;

        return logData;
    }

}
