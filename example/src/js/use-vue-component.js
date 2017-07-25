import Vue from './lib/vue.min';

import HelloMessageVue from './hello.vue';

new Vue({
    el: '#vueApp',
    components: { HelloMessageVue },
    template: `
        <HelloMessageVue name="vue"/>
    `
});
