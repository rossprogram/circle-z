import Vue from 'vue';
import VueRouter from 'vue-router';
import About from '../views/About.vue';
import Chat from '../views/Chat.vue';
import PrivateChat from '../views/PrivateChat.vue';
import RoomList from '../views/RoomList.vue';
import UserList from '../views/UserList.vue';
import Settings from '../views/Settings.vue';
import Editor from '../views/Editor.vue';
import Video from '../views/Video.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/about',
  },
  {
    path: '/about',
    name: 'about',
    component: About,
  },
  
  {
    path: '/rooms/:id',
    name: 'room',
    component: Chat,
  },
  {
    path: '/users/:id',
    name: 'user',
    component: PrivateChat,
  },  

  {
    path: '/rooms/:id/editor',
    name: 'editor',
    component: Editor,
  },

  {
    path: '/rooms/:id/video',
    name: 'video',
    component: Video,
  },

  {
    path: '/roomlist',
    name: 'rooms',
    component: RoomList,
  },

  {
    path: '/users',
    name: 'users',
    component: UserList,
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
