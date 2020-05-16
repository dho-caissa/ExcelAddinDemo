import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { AppSettingsService } from './shared/services/data/app-settings.service';
import { LogService } from './shared/services/common/log.service';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';

export function appInit(appSettingService: AppSettingsService, logService: LogService) {
    return () =>
        new Promise(async (resolve, reject) => {
            await appSettingService.init();
            logService.init();
            resolve();
        });
}
@NgModule({
    declarations: [
        AppComponent,
        HomeComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        SharedModule.forRoot()
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: appInit,
            multi: true,
            deps: [AppSettingsService, LogService]
        },
        { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
