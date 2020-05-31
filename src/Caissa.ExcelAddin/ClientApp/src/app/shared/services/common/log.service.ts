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

    }

    public debug(message: string, data?: Object) {

    }

    public info(message: string, data?: Object) {

    }

    public warn(message: string, data?: Object) {

    }

    public error(message: any, exception: any) {

    }

    private _getLogData(message: string, data?: any) {
    }

}
