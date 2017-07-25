import Vue from './lib/vue.min';
import React from './lib/react.min';
import ReactDOM from './lib/react-dom.min';

import HelloMessageVue from './hello.vue';
import HelloMessageJsx from './world.jsx';

setTimeout(() => {
    console.log('Rollup with plugins enabled.');
});

new Vue({
    el: '#vueApp',
    components: { HelloMessageVue },
    template: `
        <HelloMessageVue name="vue"/>
    `
});

ReactDOM.render(
  <HelloMessageJsx name="react" />,
  document.getElementById('reactApp')
);