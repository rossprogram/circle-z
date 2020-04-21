import Vue from 'vue';
import { Splitpanes, Pane } from 'splitpanes';
import App from './App.vue';
import router from './router';
import store from './store';

import 'splitpanes/dist/splitpanes.css';

Vue.config.productionTip = false;

Vue.component('splitpanes', Splitpanes);
Vue.component('pane', Pane);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
