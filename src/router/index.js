import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Chat from '../views/Chat.vue';
import RoomList from '../views/RoomList.vue';

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
];

const router = new VueRouter({
  routes,
});

export default router;
