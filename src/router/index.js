import Vue from 'vue';
import VueRouter from 'vue-router';
import About from '../views/About.vue';
import Chat from '../views/Chat.vue';
import Forum from '../views/Forum.vue';
import PrivateChat from '../views/PrivateChat.vue';
import RoomList from '../views/RoomList.vue';
import UserList from '../views/UserList.vue';
import Settings from '../views/Settings.vue';
import Editor from '../views/Editor.vue';
import Blackboard from '../views/Blackboard.vue';

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
    path: '/forum/:id?',
    name: 'forum',
    component: Forum,
  },
  
  {
    path: '/rooms/:id/blackboard',
    name: 'blackboard',
    component: Blackboard,
    meta: {
      fullscreen: true,
    },
  },
  
  {
    path: '/rooms/:id/editor',
    name: 'editor',
    component: Editor,
    meta: {
      fullscreen: true,
    },
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
