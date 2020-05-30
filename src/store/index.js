import Vue from 'vue';
import Vuex from 'vuex';
import { createPersistedState, createSharedMutations } from 'vuex-electron';
import DiffMatchPatch from 'diff-match-patch';
import stringHash from 'string-hash';
import * as service from '../services';

const diffMatchPatch = new DiffMatchPatch();

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

    documents: {},
    shadows: {},
    
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
      state.shadows = {};
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

    setDocument(state, { id, text }) {
      Vue.set(state.documents, id, text);
    },

    setShadow(state, { id, text }) {
      if (state.shadows && state.shadows[id]) console.log('shadow was', stringHash(state.shadows[id]), 'and is now', stringHash(text));
      Vue.set(state.shadows, id, text);
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

      server.on('setDocument', (id, text) => {
        console.log('*setDocujment');
        if (state.documents[id] !== text) commit('setDocument', { id, text });
        commit('setShadow', { id, text });        
      });

      server.on('getDocument', (id) => {
        console.log('*getDocujment');
        service.setDocument(id, state.documents[id]);
        commit('setShadow', { id, text: state.documents[id] });
      });
      
      server.on('patchDocument', (id, patch, checksum) => {
        console.log('*patchDocujment');
        console.log('patch document[', id, '] with ', patch);
        const patches = diffMatchPatch.patch_fromText(patch);
        const document = state.documents[id] || '';
        const shadow = state.shadows[id] || '';
        
	// Confirm that our shadow matched their shadow        
        if (stringHash(shadow) === checksum) {
          // fuzzypatch the true state
          const applied = diffMatchPatch.patch_apply(patches, document);
          // if the patch applied cleanly...
          if (applied[1].every((x) => x)) {
            const text = applied[0];
            commit('setDocument', {
              id,
              text,
            });
          } else {
            console.log('patch did not apply cleanly. oh well.');
          }

          commit('setShadow', {
            id,
            text: diffMatchPatch.patch_apply(patches, shadow)[0],
          });
        } else {
          service.getDocument(id);
        }

        // FIXME: check if we have any more updates to send?
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

    fetchDocument({ commit }, // eslint-disable-line no-unused-vars
                  id) {
      service.getDocument(id);
    },
    
    updateDocument({ state, dispatch, commit }, // eslint-disable-line no-unused-vars
                   { id, text }) {
      if (state.documents[id] === undefined) return;
      
      // We are not permitted to update a document until AFTER an initial fetchDocument      
      if (state.shadows[id] === undefined) return;
        
      //if (state.documents[id] === text) return;

      if (state.documents[id] !== text) {
        commit('setDocument', { id, text });
      }
      
      const shadow = state.shadows[id] || '';
        
      const patch = diffMatchPatch.patch_toText(diffMatchPatch.patch_make(shadow, text));
        
      if (patch !== '') {
        service.patchDocument(id, patch, stringHash(shadow));
        commit('setShadow', { id, text });
      }
    },

  },

  modules: {
  },
  
  plugins: [
    createPersistedState(),
    createSharedMutations(),
  ],
});
