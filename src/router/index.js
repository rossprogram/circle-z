import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Chat from '../views/Chat.vue';
import RoomList from '../views/RoomList.vue';
import Settings from '../views/Settings.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },

  {
    path: '/rooms/:id',
    name: 'chat',
    component: Chat,
  },

  {
    path: '/rooms',
    name: 'rooms',
    component: RoomList,
  },
  
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
