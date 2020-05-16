export function AutoUnsubscribe(blackList = []) {

    return function (constructor) {
        const original = constructor.prototype.ngOnDestroy;

        constructor.prototype.ngOnDestroy = function () {
            // tslint:disable-next-line:forin
            for (const prop in this) {
                const property = this[prop];
                if (!blackList.includes(prop)) {
                    if (property && (typeof property.unsubscribe === 'function')) {
                        property.unsubscribe();
                    }
                }
            }
            if (original && typeof original === 'function') {
                original.apply(this, arguments);
            }
        };
    };

}
