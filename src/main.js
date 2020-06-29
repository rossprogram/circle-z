import Vue from 'vue';
import { Splitpanes, Pane } from 'splitpanes';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faFilePdf, faChalkboard, faCog, faCity, faHashtag, faExclamationTriangle, faSync,
  faInfoCircle, faSignOutAlt, faSignInAlt, faExchangeAlt, faUsers, faPencilAlt, faVideo,
  faStepForward, faStepBackward, faEraser, faHammer, faMailBulk, faReply,
  faThumbsUp, faThumbsDown, faClock, faPaperPlane, faLevelUpAlt, faFilm,
  faMicrophone, faSchool, faStar, faUserFriends, faQuestionCircle, faGavel, faCheck,
  faInbox, faTasks, faFolderOpen, faSave, faCamera,
} from '@fortawesome/free-solid-svg-icons';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import App from './App.vue';
import router from './router';
import store from './store';

import 'splitpanes/dist/splitpanes.css';

library.add(faTwitch,
            faCamera,
            faCheck,
            faFolderOpen,
            faSave,
            faTasks,
            faCog,
            faInbox,
            faFilePdf,
            faCity,
            faPaperPlane,
            faSchool,
            faHashtag,
            faMicrophone,
            faUserFriends,
            faGavel,
            faExclamationTriangle,
            faQuestionCircle,
            faExchangeAlt,
            faEraser,
            faLevelUpAlt,
            faSync,
            faFilm,
            faHammer,
            faMailBulk,
            faClock,
            faStepForward,
            faStepBackward,
            faChalkboard,
            faInfoCircle,
            faSignOutAlt,
            faReply,
            faSignInAlt,
            faStar,
            faUsers,
            faVideo,
            faThumbsUp,
            faThumbsDown,
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
