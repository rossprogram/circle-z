import Vue from 'vue';
import Vuex from 'vuex';
import { createPersistedState, createSharedMutations } from 'vuex-electron';
import IRC from 'irc-framework';

Vue.use(Vuex);
let irc;

export default new Vuex.Store({
  state: {
    roomnames: [],
    unreadCounts: {},
    transcripts: {},
    usernames: [],
    users: {},
    counter: 1,
    connected: false,
    connecting: false,
    
    server: 'irc.rossprogram.org',
    port: 6667,
    nick: 'robot2',
    password: '',

    channels: [],
    topics: {},
    userCounts: {},
  },
  
  mutations: {
    connected(state) {
      state.connecting = false;
      state.connected = true;
    },
    disconnected(state) {
      state.connecting = false;
      state.connected = false;
    },
    connecting(state) {
      state.connected = false;
      state.connecting = true;
    },
    
    setNick(state, nick) {
      state.nick = nick;
    },

    addChannels(state, channels) {
      channels.forEach((channel) => {
        const name = channel.channel;
        const userCount = channel.num_users;
        const { topic } = channel;
        
        if (state.channels.indexOf(name) < 0) state.channels.push(name);

        Vue.set(state.topics, name, topic);
        Vue.set(state.userCounts, name, userCount);        
      });
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

    setServerParameters(state, { server, port, password }) {
      if (server !== undefined) state.server = server;
      if (port !== undefined) state.port = port;
      if (password !== undefined) state.password = password;
    },
  },
  
  actions: {
    updateServerParameters({ commit }, { server, port, password }) {
      commit('setServerParameters', { server, port, password });
    },

    quit(_, { message }) {
      if (irc) irc.quit(message);
    },

    changeNick({ commit, state }, { nick }) {
      if (irc && state.connected) irc.changeNick(nick);
      else commit('setNick', nick);
    },

    list({ state }) {
      if (irc && state.connected) irc.list();
    },
    
    connectToIRC({ state, dispatch, commit }) { // eslint-disable-line no-unused-vars
      console.log('connecting to irc');
      
      commit('connecting');

      irc = new IRC.Client();

      console.log(state.server, state.port);
      console.log('password=', state.password);
      
      irc.connect({
        host: state.server,
        port: state.port,
        nick: state.nick,
        gecos: 'real name',
        password: state.password,
        encoding: 'utf8',
        enable_echomessage: true,
      });

      irc.on('close', () => {
        commit('disconnected');
      });

      irc.on('raw', (event) => {
        console.log(event);
      });
      
      irc.on('debug', (event) => {
        console.log(event);
      });
      
      irc.on('reconnecting', () => {
        commit('disconnected');
        commit('connecting');
      });

      irc.on('socket close', () => {
        commit('disconnected');
      });      
      
      irc.on('registered', (event) => {
        commit('connected');
        commit('setNick', event.nick);
        console.log(event);
        dispatch('list');
        irc.channel('##foyer').join();
      });
  
      irc.on('ctcp request', (event) => {
        console.log(event);
      });
  
      irc.on('channel list', (event) => {
        commit('addChannels', event);
      });

      irc.on('userlist', (event) => {
        console.log('user list', event);
      });      

      irc.on('topic', (event) => {
        console.log('topic', event);
      });
      
      irc.on('notice', (event) => {
        console.log('notice', event);
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
      if (irc) irc.say(roomname, message);
      
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
