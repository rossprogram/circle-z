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
import Chalkboard from '../views/Chalkboard.vue';
import Auditorium from '../views/Auditorium.vue';
import Videos from '../views/Videos.vue';
import Files from '../views/Files.vue';
import ProblemSets from '../views/ProblemSets.vue';
import GradingQueue from '../views/GradingQueue.vue';

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
    path: '/problem-sets',
    name: 'problem-sets',
    component: ProblemSets,
  },
  {
    path: '/grading',
    name: 'grading',
    component: GradingQueue,
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
    path: '/videos',
    name: 'videos',
    component: Videos,
  },
  {
    path: '/files',
    name: 'files',
    component: Files,
  },
  
  {
    path: '/auditorium',
    name: 'auditorium',
    component: Auditorium,
    meta: {
      fullscreen: true,
    },
  },
  
  {
    path: '/rooms/:id/chalkboard',
    name: 'chalkboard',
    component: Chalkboard,
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
