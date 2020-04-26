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
    nick: 'yourname',
    password: '',

    joinedUsers: {},
    joinedChannels: [],
    channels: [],
    topics: {},
    userCounts: {},

    everConnected: false,
  },
  
  mutations: {
    connected(state) {
      state.everConnected = true;
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

    updateUsers(state, users) {
      users.forEach((user) => {
        const { nick } = user;
        const { away } = user;
        const { ident } = user;
        const realName = user.real_name;
        //const { hostname } = user;
        //const { server } = user;        
        
        if (state.usernames.indexOf(nick) < 0) {
          state.usernames.push(nick);
          Vue.set(state.users, nick, { nick });
        }

        Vue.set(state.users[nick], 'away', away);
        Vue.set(state.users[nick], 'online', true);
        Vue.set(state.users[nick], 'realName', realName);
        Vue.set(state.users[nick], 'ident', ident);        
      });
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

    addJoinedChannel(state, channel) {
      if (state.joinedChannels.indexOf(channel) < 0) state.joinedChannels.push(channel);
    },

    removeJoinedChannel(state, channel) {
      const index = state.joinedChannels.indexOf(channel);
      if (index >= 0) state.joinedChannels.splice(index, 1);
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

    setJoinedUsers(state, { channel, users }) {
      Vue.set(state.joinedUsers, channel, users);
    },
    
    addJoinedUsers(state, { channel, user }) {
      if (state.joinedUsers[channel] !== undefined) {
        state.joinedUsers[channel].push(user);
      } else {
        Vue.set(state.joinedUsers, channel, [user]);
      }
    },
    
    removeJoinedUsers(state, { channel, user }) {
      if (state.joinedUsers[channel] !== undefined) {
        const index = state.joinedUsers[channel].indexOf(user);
        if (index >= 0) state.joinedUsers[channel].splice(index, 1);
      }
    },
  },
  
  actions: {
    updateServerParameters({ commit }, { server, port, password }) {
      commit('setServerParameters', { server, port, password });
    },

    quit(_, { message }) {
      if (irc) irc.quit(message);
    },

    viewMessages({ commit }, { channel }) {
      commit('markRead', channel);
    },
    
    join({ commit }, { channel }) {
      if (irc) {
        if ((channel[0] === '#') || (channel[0] === '&')) irc.channel(channel).join();
        commit('addJoinedChannel', channel);
      }
    },

    part({ commit }, { channel }) {
      if (irc) {
        if ((channel[0] === '#') || (channel[0] === '&')) irc.part(channel);
        commit('removeJoinedChannel', channel);
      }
    },
    
    changeNick({ commit, state }, { nick }) {
      if (irc && state.connected) irc.changeNick(nick);
      else commit('setNick', nick);
    },

    list({ state }) {
      if (irc && state.connected) {
        irc.list();
        console.log('requesting channel list...');
      }
    },

    who({ state }) {
      if (irc && state.connected) {
        irc.who('*');
        console.log('requesting who *...');
      }
    },

    joinPreviouslyJoinedChannels({ state }) {
      state.joinedChannels.forEach(
        (name) => irc.channel(name).join(),
      );
    },

    createClient({ state, dispatch, commit }) {
      irc = new IRC.Client();

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

      irc.on('nick', (event) => {
        if (event.nick === state.nick) commit('setNick', event.new_nick);
        console.log('nick', event);
      });
      
      irc.on('registered', (event) => {
        commit('connected');
        commit('setNick', event.nick);
        console.log(event);
        dispatch('list');
        dispatch('who');
        dispatch('joinPreviouslyJoinedChannels');
      });
  
      irc.on('ctcp request', (event) => {
        console.log(event);
      });

      irc.on('users online', (event) => {
        console.log('users online', event);
      });

      irc.on('whois', (event) => {
        console.log('whois', event);
      });

      irc.on('wholist', (event) => {
        commit('updateUsers', event.users);
      });

      irc.on('channel list', (event) => {
        commit('addChannels', event);
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
    
    connectToIRC({ state, dispatch, commit }) { // eslint-disable-line no-unused-vars
      commit('connecting');

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
