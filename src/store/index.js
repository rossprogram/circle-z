import Vue from 'vue';
import Vuex from 'vuex';
import { createPersistedState, createSharedMutations } from 'vuex-electron';
import * as service from '../services';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    unreadCounts: {},
    transcripts: {},

    joinedRooms: [],

    privateTranscripts: {},    
    privateUnreadCounts: {},    
        
    userIds: [],
    users: {},
    
    roomnames: [],
    rooms: {},
    
    counter: 1,

    connected: false,
    connecting: false,
    
    mumblePort: 64738,
    // mumbleServer: 'irc.rossprogram.org',
    
    server: 'mumble.rossprogram.org',
    port: 7817,
    email: '',
    password: '',

    everConnected: false,
    snackbar: { snack: '', visible: false },
  },

  getters: {
    mumbleUrl: (state) => {
      console.log(state.self);
      if (state.self && state.self.username && state.self.mumblePassword) {
        const { username } = state.self;
        const password = state.self.mumblePassword;
        return `mumble://${username}:${password}@${state.server}:${state.mumblePort}/`;
      } 
        return `mumble://${state.server}:${state.mumblePort}/`;
    },
  },
  
  mutations: {
    showSnack(state, snack) {
      state.snackbar.snack = snack;
      state.snackbar.visible = true;
    },
    
    connected(state) {
      state.everConnected = true;
      state.connecting = false;
      state.connected = true;
    },
    
    disconnected(state) {
      state.connecting = false;
      state.connected = false;

      state.users = {};
      state.userIds = [];
      state.rooms = {};
      state.roomnames = [];
    },
    
    connecting(state) {
      state.connected = false;
      state.connecting = true;
    },
    
    setSelf(state, self) {
      state.self = self;
    },

    updateUsers(state, users) {
      users.forEach((user) => {
        const {
          id, email, username, firstName, nickname, lastName,
          isSuperuser, isCounselor, isJuniorCounselor,
          isStaff, isConnected, 
        } = user;
        
        if (state.userIds.indexOf(id) < 0) {
          state.userIds.push(id);
          Vue.set(state.users, id, { id });
        }

        Vue.set(state.users[id], 'email', email);
        Vue.set(state.users[id], 'username', username);
        Vue.set(state.users[id], 'firstName', firstName);
        Vue.set(state.users[id], 'nickname', nickname);
        Vue.set(state.users[id], 'lastName', lastName);
        Vue.set(state.users[id], 'isSuperuser', isSuperuser);
        Vue.set(state.users[id], 'isCounselor', isCounselor);
        Vue.set(state.users[id], 'isJuniorCounselor', isJuniorCounselor);
        Vue.set(state.users[id], 'isStaff', isStaff);
        Vue.set(state.users[id], 'isConnected', isConnected);
      });
    },

    updateRooms(state, rooms) {
      rooms.forEach((room) => {
        const { name, users } = room;

        if (state.roomnames.indexOf(name) < 0) {
          state.roomnames.push(name);
          Vue.set(state.rooms, name, { name });
        }

        Vue.set(state.rooms[name], 'users', users);
      });
    },
    
    joinRoom(state, room) {
      if (state.joinedRooms.indexOf(room) < 0) state.joinedRooms.push(room);
    },

    leaveRoom(state, room) {
      const index = state.joinedRooms.indexOf(room);
      if (index >= 0) state.joinedRooms.splice(index, 1);
    },
    
    markRead(state, roomname) {
      Vue.set(state.unreadCounts, roomname, 0);
    },

    markPrivateRead(state, id) {
      Vue.set(state.privateUnreadCounts, id, 0);
    },    

    removePrivateTranscript(state, id) {
      Vue.set(state.privateUnreadCounts, id, 0);
      Vue.delete(state.privateTranscripts, id);
    },
    
    pushMessage(state, { room, message }) {
      if (state.transcripts[room] !== undefined) {
        state.transcripts[room].push({ ...message, id: state.counter });
      } else {
        state.roomnames.push(room);
        Vue.set(state.transcripts, room, [{ ...message, id: state.counter }]);
      }

      state.counter += 1;
    },

    pushPrivateMessage(state, { user, message }) {
      if (state.privateTranscripts[user] !== undefined) {
        state.privateTranscripts[user].push({ ...message, id: state.counter });
      } else {
        Vue.set(state.privateTranscripts, user, [{ ...message, id: state.counter }]);
      }

      state.counter += 1;
    },    
    
    incrementUnreadCount(state, roomname) {
      if (state.unreadCounts[roomname] !== undefined) {
        Vue.set(state.unreadCounts, roomname, state.unreadCounts[roomname] + 1);
      } else {
        Vue.set(state.unreadCounts, roomname, 1);
      }
    },

    incrementPrivateUnreadCount(state, id) {
      if (state.privateUnreadCounts[id] !== undefined) {
        Vue.set(state.privateUnreadCounts, id, state.privateUnreadCounts[id] + 1);
      } else {
        Vue.set(state.privateUnreadCounts, id, 1);
      }
    },
    
    setServerParameters(state, {
      server, port, password, email, 
    }) {
      if (server !== undefined) state.server = server;
      if (port !== undefined) state.port = port;
      if (email !== undefined) state.email = email;
      if (password !== undefined) state.password = password;
    },

  },
  
  actions: {
    updateServerParameters({ commit }, {
      server, port, password, email, 
    }) {
      commit('setServerParameters', {
        server, port, password, email, 
      });
    },

    viewMessages({ commit }, { room }) { // eslint-disable-line no-unused-vars
      commit('markRead', room);
    },

    viewPrivateMessages({ commit }, { user }) { // eslint-disable-line no-unused-vars
      commit('markPrivateRead', user);
    },    

    quit({ commit }) { // eslint-disable-line no-unused-vars
      service.quit();
    },
    
    join({ commit }, { room }) { // eslint-disable-line no-unused-vars
      service.join(room);
    },

    part({ commit }, { room }) { // eslint-disable-line no-unused-vars
      service.part(room);
      commit('leaveRoom', room);
    },    
    
    list() {
      service.list();
    },

    who() {
      service.who();
    },

    focus({ commit }, room) { // eslint-disable-line no-unused-vars
      service.focus(room);
    },    

    joinPreviouslyJoinedChannels({ state }) {
      state.joinedChannels.forEach(service.join);
    },

    initialize({ commit }) {
      commit('disconnected');
    },

    /*
    createClient({ dispatch, commit }) {
      irc.on('users online', (event) => {
        console.log('users online', event);
      });

      irc.on('whois', (event) => {
        console.log('whois', event);
      });


      irc.on('join', (event) => {
        commit('addJoinedUsers', {
          channel: event.channel,
          user: event.nick,
        });
        dispatch('appendToTranscript', {
          roomname: event.channel,
          message: {
            from: event.nick,
            join: true,
            action: 'enters the room.',
            timestamp: (new Date()).toString(),
          },
        });
      });

      irc.on('part', (event) => {
        commit('removeJoinedUsers', {
          channel: event.channel,
          user: event.nick,
        });
        dispatch('appendToTranscript', {
          roomname: event.channel,
          message: {
            from: event.nick,
            part: true,
            action: 'leaves the room.',
            timestamp: (new Date()).toString(),
          },
        });
      });
      
      irc.on('userlist', (event) => {
        commit('setJoinedUsers', {
          channel: event.channel,
          users: event.users.map((u) => u.nick), 
        });
      });

      
      irc.on('message', (event) => {
        console.log(event);

        if (event.type === 'privmsg') {
          if (event.target.match(/^#/)) {
            dispatch('appendToTranscript', {
              roomname: event.target,
              message: {
                from: event.nick,
                text: event.message,
                timestamp: (new Date()).toString(),
              },
            });
          } else {
            dispatch('appendToTranscript', {
              roomname: event.nick,
              message: {
                from: event.nick,
                text: event.message,
                timestamp: (new Date()).toString(),
              },
            });
            commit('addJoinedChannel', event.nick);
          }
        }

        if (event.type === 'action') {
          if (event.target.match(/^#/)) {
            dispatch('appendToTranscript', {
              roomname: event.target,
              message: {
                from: event.nick,
                action: event.message,
                timestamp: (new Date()).toString(),
              },
            });
          } else {
            dispatch('appendToTranscript', {
              roomname: event.nick,
              message: {
                from: event.nick,
                action: event.message,
                timestamp: (new Date()).toString(),
              },
            });
            commit('addJoinedChannel', event.nick);
          }
        }
      });      
    },
    */
    
    connect({ state, dispatch, commit }) { // eslint-disable-line no-unused-vars
      commit('connecting');

      const server = service.connect({
        host: state.server,
        port: state.port,
        email: state.email,
        password: state.password,
      });

      server.on('users', (users) => {
        commit('updateUsers', users);
      });

      server.on('rooms', (rooms) => {
        commit('updateRooms', rooms);
      });
      
      server.on('error', (error) => {
        commit('showSnack', error);
      });

      server.on('connected', (user) => {
        commit('connected');
        commit('setSelf', user);
        dispatch('who');
        dispatch('list');
      });

      server.on('disconnected', () => {
        commit('disconnected');
      });      

      server.on('joined', (room) => {
        commit('joinRoom', room);
      });

      server.on('say', (room, from, text) => {
        commit('pushMessage', {
          room,
          message: {
            from,
            text,
            timestamp: (new Date()).toString(),
          },
        });
        commit('incrementUnreadCount', room);
      });

      server.on('privmsg', (from, text) => {
        commit('pushPrivateMessage', {
          user: from,
          message: {
            from,
            text,
            timestamp: (new Date()).toString(),
          },
        });
        commit('incrementPrivateUnreadCount', from);
      });     
    },

    sendMessage({ state, dispatch, commit }, // eslint-disable-line no-unused-vars
                { room, message }) {
      
      service.say(room, message);
    },

    closePrivateMessages({ commit }, // eslint-disable-line no-unused-vars
                         { user }) {
      commit('removePrivateTranscript', user);
    },
    
    sendPrivateMessage({ state, dispatch, commit }, // eslint-disable-line no-unused-vars
                       { user, message }) {
      service.privmsg(user, message);
      
      commit('pushPrivateMessage',
             {
               user,
               message: {
                 from: state.self.id,
                 text: message,
                 timestamp: (new Date()).toString(),
               },
             });
    },
  },

  modules: {
  },
  
  plugins: [
    createPersistedState(),
    createSharedMutations(),
  ],
});
