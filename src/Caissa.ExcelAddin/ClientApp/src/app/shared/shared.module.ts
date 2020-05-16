import { NgModule, ErrorHandler, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { ErrorInterceptor } from './utils/error.interceptor';

import { CacheService } from './services/common/cache.service';

import { UniqueGeneratorService } from './services/common/unique-generator.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectivePreloadingStrategy } from './utils/selective-preloading-strategy';
import { FilterPipe } from './pipes/filter.pipe';

import { DragDropModule } from '@angular/cdk/drag-drop';


const interceptors = [
    {
        multi: true,
        provide: HTTP_INTERCEPTORS,
        useClass: ErrorInterceptor
    }
];

const providers = [
    CacheService,
    UniqueGeneratorService,
    SelectivePreloadingStrategy,
    ...interceptors,
];
@NgModule({
    declarations: [FilterPipe],
    exports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        FilterPipe
    ],
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        DragDropModule
    ],
    entryComponents: [
    ]
})
export class SharedModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: providers
        };
    }
}
