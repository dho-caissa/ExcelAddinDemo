import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface AppSettings {
    apiEndpoint: string;
    identityServerEndpoint: string;
    arc: { [key: string]: string };
    maxConcurrentApiCallsFromCustomFunctions: string;
}


@Injectable({
    providedIn: 'root'
})
export class AppSettingsService {
    public apiEndpoint: string;
    public identityServerEndpoint: string;
    public maxConcurrentApiCallsFromCustomFunctions: number = 5;
    public arc: {[key: string]: string};
    constructor(private http: HttpClient) {

    }

    public async init() {
        const data = await  this.http.get<AppSettings>('/api/appsettings').toPromise();
        this.apiEndpoint = data.apiEndpoint.replace(/\/$/, ''); // remove trailing slash if present
        this.identityServerEndpoint = data.identityServerEndpoint.replace(/\/$/, ''); // remove trailing slash if present
        this.arc = data.arc;
        if (data.maxConcurrentApiCallsFromCustomFunctions != null) {
            this.maxConcurrentApiCallsFromCustomFunctions = parseInt(data.maxConcurrentApiCallsFromCustomFunctions);
        }
    }
}
