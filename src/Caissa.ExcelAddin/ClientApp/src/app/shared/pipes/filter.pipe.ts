import { Pipe, PipeTransform } from '@angular/core';
import * as fuzzysort from 'fuzzysort';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

    private fuzzySortOptions: Fuzzysort.KeysOptions<any>;
    private sortResult: Fuzzysort.Fuzzysort;

    constructor() {
        this.fuzzySortOptions = {
            limit: 20,
            allowTypo: true,
            threshold: -16000,
            keys: null
        };
        this.fuzzySortOptions.scoreFn = (a) => Math.max(a[0] ? a[0].score : -100000, a[1] ? a[1].score - 2000 : -100000,
            a[2] ? a[2].score - 6000 : -100000);
        this.sortResult = fuzzysort.new(this.fuzzySortOptions);
    }

    public transform(arrayToFilter: any, filterString: any, filterProperties: any[]) {
        if (arrayToFilter && filterString && filterProperties) {
            this.fuzzySortOptions.keys = filterProperties;

            // // if your targets don't change often, provide prepared targets instead of raw strings!
            // arrayToFilter.forEach(t => t.filePrepared = fuzzysort.prepare(t[filterProperties[0]]));

            // // don't use options.key if you don't need a reference to your original obj
            // arrayToFilter = arrayToFilter.map(t => t.filePrepared);

            const searchResult = this.sortResult.go(filterString, arrayToFilter, this.fuzzySortOptions);
            return (<any>searchResult).map(x => x.obj);
        } else {
            return arrayToFilter;
        }

    }

}
