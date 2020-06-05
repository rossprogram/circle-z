import Vue from 'vue';
import { Splitpanes, Pane } from 'splitpanes';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faFilePdf, faChalkboard, faCog, faCity, faHashtag, faExclamationTriangle, faSync,
  faInfoCircle, faSignOutAlt, faSignInAlt, faExchangeAlt, faUsers, faPencilAlt, faVideo,
  faStepForward, faStepBackward, faEraser, faHammer,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import App from './App.vue';
import router from './router';
import store from './store';

import 'splitpanes/dist/splitpanes.css';

library.add(faCog,
            faFilePdf,
            faCity,
            faHashtag,
            faExclamationTriangle,
            faExchangeAlt,
            faEraser,
            faSync,
            faHammer,
            faStepForward,
            faStepBackward,
            faChalkboard,
            faInfoCircle,
            faSignOutAlt,
            faSignInAlt,
            faUsers,
            faVideo,
            faPencilAlt);
 
Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

Vue.component('splitpanes', Splitpanes);
Vue.component('pane', Pane);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
