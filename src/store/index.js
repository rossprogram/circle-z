import Vue from 'vue';
import Vuex from 'vuex';
import { createPersistedState, createSharedMutations } from 'vuex-electron';
import IRC from 'irc-framework';

Vue.use(Vuex);
const irc = new IRC.Client();

export default new Vuex.Store({
  state: {
    roomnames: [],
    unreadCounts: {},
    transcripts: {},
    usernames: [],
    users: {},
    nick: '',
    counter: 1,
    connected: false,

    channels: [],
  },
  
  mutations: {
    connected(state) {
      state.connected = true;
    },
    disconnected(state) {
      state.connected = false;
    },
    connecting(state) {
      state.connected = false;
    },
    
    setNick(state, nick) {
      state.nick = nick;
    },
    
    markRead(state, roomname) {
      Vue.set(state.unreadCounts, roomname, 0);
    },

    pushMessage(state, { roomname, message }) {
      if (state.transcripts[roomname] !== undefined) {
        state.transcripts[roomname].push({ ...message, id: state.counter });
      } else {
        state.roomnames.push(roomname);
        Vue.set(state.transcripts, roomname, [{ ...message, id: state.counter }]);
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
  },
  
  actions: {
    connectToIRC({ dispatch, commit }) { // eslint-disable-line no-unused-vars
      console.log('connecting to irc');
      
      irc.connect({
        host: 'irc.rossprogram.org',
        port: 6667,
        nick: 'robot',
        gecos: 'real name',
        password: process.env.IRC_PASSWORD,
      });
      commit('connecting');

      irc.on('close', () => {
        commit('disconnected');
      });

      irc.on('socket close', () => {
        commit('disconnected');
      });      
      
      irc.on('registered', (event) => {
        commit('connected');
        commit('setNick', event.nick);
        console.log(event);
        irc.list();
        irc.channel('##foyer').join();
      });
  
      irc.on('ctcp request', (event) => {
        console.log(event);
      });
  
      irc.on('channel list', (event) => {
        console.log(event);
      });

      irc.on('userlist', (event) => {
        console.log('user list', event);
      });      

      irc.on('topic', (event) => {
        console.log('topic', event);
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
                timestamp: new Date(),
              },
            });
          } else {
            dispatch('appendToTranscript', {
              roomname: event.nick,
              message: {
                from: event.nick,
                text: event.message,
                timestamp: new Date(),
              },
            });
          }
        }
      });
      
    },
    
    appendToTranscript({ dispatch, commit }, // eslint-disable-line no-unused-vars
                       { roomname, message }) { 
      console.log({ roomname, message });
      commit('pushMessage', { roomname, message });
      commit('incrementUnreadCount', roomname);
    },
    
    sendMessage({ state, dispatch, commit }, // eslint-disable-line no-unused-vars
                { roomname, message }) {
      irc.say(roomname, message);
      commit('pushMessage',
             {
               roomname,
               message: {
                 from: state.nick,
                 text: message,
                 timestamp: new Date(),
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
