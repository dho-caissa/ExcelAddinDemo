import { Injectable } from '@angular/core';

@Injectable()
export class UniqueGeneratorService {

    public generateNumber() {
        const length = 8;
        const timestamp = +new Date;

        const ts = timestamp.toString();
        const parts = ts.split('').reverse();
        let id = '';

        for (let i = 0; i < length; ++i) {
            const index = this.getRandomInt(0, parts.length - 1);
            id += parts[index];
        }

        return id;
    }

    public static generateGuid() {
        const s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        };

        return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
    }

    private s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    private getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
