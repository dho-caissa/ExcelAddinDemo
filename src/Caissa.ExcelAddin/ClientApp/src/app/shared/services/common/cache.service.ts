import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { UniqueGeneratorService } from './unique-generator.service';

enum StorageType {
    Session,
    Local,
    Server,
    ServerScopedToCaissaClient
}

export enum CacheKeys {
    UploadData,
    UploadAction
}

interface Setting { key: string; storageType: StorageType; }

const CacheSettings: { [key: string]: Setting } = {
    [CacheKeys.UploadData]: { key: 'caissa:upload:data', storageType: StorageType.Session },
    [CacheKeys.UploadAction]: { key: 'caissa:upload:action', storageType: StorageType.Session },
};


@Injectable()
export class CacheService {

    private uniqueId: string;

    public constructor(
        private http: HttpClient,
        private uniqueGeneratorService: UniqueGeneratorService,
        private activatedRoute: ActivatedRoute) {
    }


    public setItem(key: CacheKeys, value: any, ...additionalKeys: any[]): Promise<void> {
        const setting = CacheSettings[key];
        const prefix = additionalKeys.join(':');
        let identifier = prefix ? `${setting.key}:${prefix}` : setting.key;

        if (!setting) {
            return Promise.reject(new Error('Invalid Key'));
        }

        switch (setting.storageType) {
            case StorageType.Session:
                identifier = `${identifier}`;
                return this.sessionStorageSetItem(identifier, value);
            case StorageType.Local:
                identifier = `${identifier}`;
                return this.localStorageSetItem(identifier, value);
            case StorageType.Server:
                return this.serverStorageSetItem(identifier, value, false);
            case StorageType.ServerScopedToCaissaClient:
                return this.serverStorageSetItem(identifier, value, true);
        }

        throw new Error('Invalid Key');
    }

    public getItem<T>(key: CacheKeys, ...additionalKeys: any[]): Promise<T> {
        const setting = CacheSettings[key];

        if (!setting) {
            return Promise.reject<T>(new Error('Invalid Key'));
        }

        const prefix = additionalKeys.join(':');
        const identifier = prefix ? `${setting.key}:${prefix}` : setting.key;
        const scopedIdentifier = `${identifier}`;


        switch (setting.storageType) {

            case StorageType.Local:
                const localValue = this.localStorageGetItem(scopedIdentifier);
                if (localValue != null) {
                    return Promise.resolve(localValue);
                } else {
                    return Promise.resolve(this.localStorageGetItem(identifier));
                }

            case StorageType.Server:
                return this.serverStorageGetItem(identifier, false);
            case StorageType.ServerScopedToCaissaClient:
                return this.serverStorageGetItem(identifier, true);
            case StorageType.Session:
            default:
                const sessionValue = this.sessionStorageGetItem(scopedIdentifier);
                if (sessionValue != null) {
                    return Promise.resolve(sessionValue);
                } else {
                    return Promise.resolve(this.sessionStorageGetItem(identifier));
                }
        }
    }

    public getDateItem(key: CacheKeys, ...additionalKeys: any[]): Promise<Date> {
        return this.getItem<string>(key, ...additionalKeys)
            .then(date_string => date_string != null ? new Date(<any>date_string) : null);
    }

    private sessionStorageSetItem(key: string, value: any) {

        if (value != null) {
            sessionStorage.setItem(key, JSON.stringify(value));
        } else {
            sessionStorage.removeItem(key);
        }
        return Promise.resolve();
    }

    private localStorageSetItem(key: string, value: any) {

        if (value != null) {
            localStorage.setItem(key, JSON.stringify(value));
        } else {
            localStorage.removeItem(key);
        }
        return Promise.resolve();
    }

    private sessionStorageGetItem<T>(key: string) {
        const data = sessionStorage.getItem(key);
        return this.parseData(data);
    }

    private localStorageGetItem<T>(key: string) {
        const data = localStorage.getItem(key);
        return this.parseData(data);
    }

    private parseData(data) {

        if (data == null) {
            return null;
        }
        try {
            return JSON.parse(data);
        } catch (exception) {
            return data;
        }
    }

    private serverStorageSetItem(key: string, value: any, isClientScoped?: boolean) {
        return Promise.reject('Not implemented');

        // if (value != null) {
        //     return this._http.post(this._apiUrl, null,
        //         { key: key, value: JSON.stringify(value), isClientScoped: isClientScoped }).toPromise();
        // } else {
        //     return this._http.deconste(this._apiUrl, { key: key, isClientScoped: isClientScoped }).toPromise();
        // }
    }

    private serverStorageGetItem<T>(key: string, isClientScoped?: boolean) {
        return Promise.reject('Not implemented');
        // return this._http.get(this._apiUrl, { key: key, isClientScoped: isClientScoped }).toPromise().then((result) => {
        //     if (_.isString(result)) {
        //         return CacheService._parseData(result);
        //     }
        //     return result;
        // });
    }

}
