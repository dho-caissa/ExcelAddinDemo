import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RouteNames } from './shared/models/constants';
import { environment } from '../environments/environment';
import { SelectivePreloadingStrategy } from './shared/utils/selective-preloading-strategy';

export const appRoutes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: '**',
        redirectTo: RouteNames.Home
    }

];



@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes,
            {
                enableTracing: false,
                useHash: true,
                preloadingStrategy: SelectivePreloadingStrategy,
            } // <-- debugging purposes only
        )
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }
