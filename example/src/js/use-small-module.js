import { foo } from './lib/small-module';
import { foo as foo2 } from './lib/sub-module';

foo();
foo2();

setTimeout(() => {
    console.log('Rollup with babel plugin enabled.');
});