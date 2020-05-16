import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
    selector: 'app-home',
    styleUrls: ['./home.component.scss'],
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit , OnDestroy {

    constructor() { }

    public ngOnInit() {
    }

    public ngOnDestroy() {
    }

    public async recalculate() {
        await Excel.run((ctx) => {
            ctx.application.calculate(Excel.CalculationType.full);
            return ctx.sync()
        });
    }

}
