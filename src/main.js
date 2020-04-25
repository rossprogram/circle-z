import Vue from 'vue';
import { Splitpanes, Pane } from 'splitpanes';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faCog, faCity, faHashtag, faExclamationTriangle, faSync,
  faInfoCircle, faSignOutAlt, faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import App from './App.vue';
import router from './router';
import store from './store';

import 'splitpanes/dist/splitpanes.css';

library.add(faCog,
            faCity,
            faHashtag,
            faExclamationTriangle,
            faSync,
            faInfoCircle,
            faSignOutAlt,
            faUsers);
 
Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

Vue.component('splitpanes', Splitpanes);
Vue.component('pane', Pane);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
