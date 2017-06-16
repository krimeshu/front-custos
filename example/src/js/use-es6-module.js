import { foo } from './lib/small-module';
import { foo as foo2 } from './lib/sub-module';
import Vue from './lib/vue';
import hello from './hello.vue';

foo();
foo2();

setTimeout(() => {
    console.log('Rollup with babel plugin enabled.');
});

new Vue({
    el: '#vueApp',
    components: { hello },
    template: `
        <hello/>
    `
})