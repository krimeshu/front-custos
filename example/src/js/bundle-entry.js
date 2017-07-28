import * as modFuncs from './lib/mod-funcs';
import i from './lib/mod-funcs';
import tester from './lib/es6-tests';

modFuncs.foo();
modFuncs.bar();

console.log('modFuncs.i:', modFuncs.i);
console.log('i in modFuncs:', modFuncs.i);

tester.test();

class CountObj {
    static count = 0;
    id = 0;
    constructor() {
        CountObj.count++;
        this.id = CountObj.count;
    }
    async load() {
        return await this.doLoad(ms);
    }
    doLoad() {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}

