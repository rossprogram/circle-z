import Vue from 'vue';
import Vuex from 'vuex';
import DiffMatchPatch from 'diff-match-patch';
import stringHash from 'string-hash';
import { createSharedMutations } from 'vuex-electron';
import electron from 'electron';
import VuexPersistence from 'vuex-persist';
import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import * as service from '../services';

const diffMatchPatch = new DiffMatchPatch();

Vue.use(Vuex);

let persistPath = '/';

if (electron) {
  if (electron.remote) persistPath = electron.remote.app.getPath('userData');
  else persistPath = electron.app.getPath('userData');

  if (electron.remote) persistPath = electron.remote.app.getPath('userData');
  else persistPath = electron.app.getPath('userData');
}

const { ipcMain } = require('electron');

let playSound = () => {};
let sendNotification = () => {};

if (electron) {
  if (electron.ipcMain) {
    ipcMain.on('dinger', (event) => {
      playSound = () => {
        event.reply('ding');
      };
      
      sendNotification = (args) => {
        event.reply('notify', args);
      };
    });
  }
}

let showAnnouncement = () => {};
let openExternal = (url) => { console.log('Failed to open', url); };

if (electron) {
  if (electron.shell) {
    openExternal = electron.shell.openExternal;
  }

  if (electron.dialog) {
    showAnnouncement = function (e) {
      electron.dialog.showMessageBox({
        type: 'info',
        message: e,
        buttons: ['OK'],
      });    
    };
  }
}

const vuexPersist = new VuexPersistence({
  storage: {},
  saveState: (_, state) => {
    try {
      fs.writeFileSync(path.join(persistPath, 'store.json'),
                       JSON.stringify(state),
                       'utf8');
    } catch (err) {
      console.log(err);
    }
  },
  restoreState: () => {
    try {
      const data = fs.readFileSync(path.join(persistPath, 'store.json'),
                                   'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.log(err);
    }

    return {};
  },
  reducer: (state) => ({
    server: state.server,
    port: state.port,
    email: state.email,
    password: state.password,
    everConnected: state.everConnected,
    readPosts: state.readPosts,
    family: state.family,
    audioNotifications: state.audioNotifications,
  }),
  filter: (mutation) => ((mutation.type === 'setServerParameters')
                        || (mutation.type === 'addToFamily')
                        || (mutation.type === 'removeFromFamily')

                        || (mutation.type === 'setAudioNotifications')                        

                        || (mutation.type === 'markPostRead')
                        || (mutation.type === 'markPostUnread')                        
                        || (mutation.type === 'connected')),
});

export default new Vuex.Store({
  state: {
    unreadCounts: {},
    transcripts: {},

    joinedRooms: [],

    privateTranscripts: {},    
    privateUnreadCounts: {},    
        
    userIds: [],
    users: {},
    family: [],
    self: {},
    isStaff: false,
    
    roomnames: [],
    rooms: {},

    documents: {},
    shadows: {},
    cursors: {},
    selections: {},
    templates: [],
    problemSets: [],
    
    blackboards: {},
    pointers: {},

    readPosts: [],
    posts: {},
    rootPosts: [],

    metadatas: {},
    
    counter: 1,

    connected: false,
    connecting: false,
    
    server: 'circlez.rossprogram.org',
    port: 7817,
    email: '',
    password: '',

    everConnected: false,
    snackbar: { snack: '', visible: false },

    connectedUserCount: 0,
    requestsPerSecond: 0,
    serverMemoryUsed: 0,
    serverTime: undefined,
    pingTime: undefined,

    videos: [],
    playingVideo: '',

    texFiles: {},
    fileList: [],

    audioNotifications: true,
  },

  getters: {
    mumbleUrl: (state) => {
      if (state.self && state.self.username && state.self.mumblePassword) {
        const { username } = state.self;
        const password = state.self.mumblePassword;
        const server = state.self.mumbleServer;
        const port = state.self.mumblePort;
        return `mumble://${username}:${password}@${server}:${port}/`;
      } 
      return `mumble://${state.server}/`;
    },
  },
  
  mutations: {
    setFileList(state, { filenames }) {
      state.fileList = filenames;
    },

    setAudioNotifications(state, value) {
      state.audioNotifications = value;
    },

    setProblemSets(state, { sets }) {
      state.problemSets = sets;
    },

    setMetadatas(state, { metadatas }) {
      metadatas.forEach((m) => {
        const {
          name, author, template,
          submitted, submittedAt,
          graded, gradedAt,
          completed, completedAt, 
        } = m;
        
        if (state.metadatas[name] === undefined) {
          Vue.set(state.metadatas, name, {});
        }

        Vue.set(state.metadatas[name], 'author', author);
        Vue.set(state.metadatas[name], 'template', template);
        Vue.set(state.metadatas[name], 'submitted', submitted);
        Vue.set(state.metadatas[name], 'submittedAt', submittedAt);
        Vue.set(state.metadatas[name], 'graded', graded);
        Vue.set(state.metadatas[name], 'gradedAt', gradedAt);
        Vue.set(state.metadatas[name], 'completed', completed);
        Vue.set(state.metadatas[name], 'completedAt', completedAt);                
      });
    },    
    
    addToFamily(state, id) {
      if (state.family.indexOf(id) < 0) {
        state.family.push(id);
      }
    },

    removeFromFamily(state, id) {
      if (state.family.indexOf(id) >= 0) {
        state.family.splice(state.family.indexOf(id), 1);
      }
    },

    addTexFile(state, { filename, body }) {
      Vue.set(state.texFiles, filename, body);
    },

    setTemplates(state, { templates }) {
      state.templates = templates;
    },
    
    showSnack(state, snack) {
      state.snackbar.snack = snack;
      state.snackbar.visible = true;
    },
    
    connected(state) {
      state.everConnected = true;
      state.connecting = false;
      state.connected = true;
      state.shadows = {};
      state.cursors = {};
      state.selections = {};
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
      state.isStaff = self.isStaff;
    },

    updateVideos(state, videos) {
      state.videos = videos;
    },

    updatePlayingVideo(state, playingVideo) {
      state.playingVideo = playingVideo;
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

        Vue.set(state.users[id], 'id', id);
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
        const { name, users, topic } = room;

        if (state.roomnames.indexOf(name) < 0) {
          state.roomnames.push(name);
          Vue.set(state.rooms, name, { name });
        }

        Vue.set(state.rooms[name], 'name', name);
        Vue.set(state.rooms[name], 'users', users);
        Vue.set(state.rooms[name], 'topic', topic);
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

      if (message.text) {
        sendNotification({
          title: state.users[user].username,
          body: message.text, 
        });
      }
      
      state.counter += 1;
    },    
    
    incrementUnreadCount(state, roomname) {
      if (state.unreadCounts[roomname] !== undefined) {
        Vue.set(state.unreadCounts, roomname, state.unreadCounts[roomname] + 1);
        playSound();
      } else {
        Vue.set(state.unreadCounts, roomname, 1);
        playSound();
      }
    },

    incrementPrivateUnreadCount(state, id) {
      if (state.privateUnreadCounts[id] !== undefined) {
        Vue.set(state.privateUnreadCounts, id, state.privateUnreadCounts[id] + 1);
        playSound();
      } else {
        Vue.set(state.privateUnreadCounts, id, 1);
        playSound();
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

    setDocumentCursor(state, { id, userId, cursor }) {
      if (state.cursors[id] === undefined) {
        Vue.set(state.cursors, id, {});
      }
      Vue.set(state.cursors[id], userId, cursor);
    },

    setDocumentSelection(state, { id, userId, range }) {
      if (state.selections[id] === undefined) {
        Vue.set(state.selections, id, {});
      }
      Vue.set(state.selections[id], userId, range);
    },

    setShadow(state, { id, text }) {
      Vue.set(state.shadows, id, text);
    },

    updateBlackboard(state, { id, update }) {
      if (state.blackboards[id] === undefined) {
        Vue.set(state.blackboards, id, { ink: [] });
      }

      if (update.page !== undefined) Vue.set(state.blackboards[id], 'page', update.page);

      if (update.ink !== undefined) Vue.set(state.blackboards[id], 'ink', update.ink);

      if (update.presenter !== undefined) Vue.set(state.blackboards[id], 'presenter', update.presenter);

      if (update.pdf !== undefined) Vue.set(state.blackboards[id], 'pdf', update.pdf);
    },

    addBlackboardInk(state, {
      id, artist, uuid, style, points, 
    }) { // eslint-disable-line no-unused-vars
      if (state.blackboards[id] === undefined) {
        Vue.set(state.blackboards, id, { ink: [] });
      }

      state.blackboards[id].ink.push({
        artist, uuid, style, points, 
      });
    },
    
    setBlackboardPointer(state, { id, user, position }) {
      if (state.pointers[id] === undefined) {
        Vue.set(state.pointers, id, { });
      }

      Vue.set(state.pointers[id], user, position);
    },

    markPostRead(state, postId) {
      if (state.readPosts.indexOf(postId) < 0) {
        state.readPosts.push(postId);
      }
    },

    markPostUnread(state, postId) {
      if (state.readPosts.indexOf(postId) >= 0) {
        state.readPosts.splice(state.readPosts.indexOf(postId), 1);
      }
    },
    
    addPosts(state, { posts }) {
      posts.forEach((post) => {
        if (state.posts[post.id] === undefined) Vue.set(state.posts, post.id, {});

        Vue.set(state.posts[post.id], 'id', post.id);        
        Vue.set(state.posts[post.id], 'body', post.body);
        Vue.set(state.posts[post.id], 'subject', post.subject);
        Vue.set(state.posts[post.id], 'createdAt', post.createdAt);
        Vue.set(state.posts[post.id], 'updatedAt', post.updatedAt);
        Vue.set(state.posts[post.id], 'upvoteCount', post.upvoteCount);
        Vue.set(state.posts[post.id], 'downvoteCount', post.downvoteCount);
        Vue.set(state.posts[post.id], 'parent', post.parent);
        Vue.set(state.posts[post.id], 'hidden', post.hidden);
        Vue.set(state.posts[post.id], 'author', post.author);
        Vue.set(state.posts[post.id], 'ancestors', post.ancestors);
      });

      posts.forEach((post) => {
        if (post.parent === undefined || post.parent === null) {
          if (state.rootPosts.indexOf(post.id) < 0) {
            state.rootPosts.push(post.id);
          }
        } else {
          if (state.posts[post.parent].children === undefined) {
            Vue.set(state.posts[post.parent], 'children', []);
          }
          if (state.posts[post.parent].children.indexOf(post.id) < 0) {
            state.posts[post.parent].children.push(post.id);
          }
        }
      });      
    },

    setupChildPosts(state, { parent }) {
      const post = state.posts[parent];

      if (post) {
        if (post.children === undefined) {
          Vue.set(state.posts[parent], 'children', []);
        }
      }
    },

    updateServerStatus(state,
                       {
                         connectedUserCount,
                         requestsPerSecond,
                         serverTime,
                         memoryUsed,
                       }) {
      state.connectedUserCount = connectedUserCount;
      state.requestsPerSecond = requestsPerSecond;
      state.serverTime = new Date(serverTime);
      state.serverMemoryUsed = memoryUsed;
      state.pingTime = new Date();
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

    topic({ commit }, { room, topic }) { // eslint-disable-line no-unused-vars
      service.topic(room, topic);
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

      server.on('setVideos', (videos) => {
        commit('updateVideos', videos);
      });

      server.on('playVideo', (video) => {
        commit('updatePlayingVideo', video);
      });      
      
      server.on('users', (users) => {
        commit('updateUsers', users);
        
        // FIXME: this is a real hack -- it propagates state.self to other copies of the store
        if (state.self) commit('setSelf', state.self);
      });

      server.on('ping', (data) => {
        commit('updateServerStatus', data);
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

      server.on('shareImage', (room, from, image) => {
        commit('pushMessage', {
          room,
          message: {
            from,
            image,
            timestamp: (new Date()).toString(),
          },
        });
        commit('incrementUnreadCount', room);
      });      
      
      server.on('emote', (room, from, text) => {
        commit('pushMessage', {
          room,
          message: {
            from,
            action: text,
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
        //if (state.documents[id] !== text)
        commit('setDocument', { id, text });
        commit('setShadow', { id, text });        
      });

      server.on('getDocument', (id) => {
        service.setDocument(id, state.documents[id]);
        commit('setShadow', { id, text: state.documents[id] });
      });

      server.on('setDocumentCursor', (id, userId, cursor) => {
        commit('setDocumentCursor', { id, userId, cursor });
      });

      server.on('setDocumentSelection', (id, userId, range) => {
        commit('setDocumentSelection', { id, userId, range });
      });

      server.on('addPosts', (posts) => {
        commit('addPosts', { posts });
      });
      
      server.on('updateBlackboard', (id, update) => {
        const changes = {};
        
        if (update.page !== undefined) {
          changes.page = update.page;
        }

        if (update.ink !== undefined) {
          changes.ink = update.ink;
        }

        if (update.presenter !== undefined) {
          changes.presenter = update.presenter;
        }
        
        if (update.pdf !== undefined) {
          changes.pdf = update.pdf;
        }

        commit('updateBlackboard', { id, update: changes });
      });

      server.on('addBlackboardInk', (id, artist, uuid, style, points) => {
        commit('addBlackboardInk', {
          id, artist, uuid, style, points, 
        });
      });

      server.on('setBlackboardPointer', (id, user, position) => {
        commit('setBlackboardPointer', { id, user, position });
      });
      
      server.on('patchDocument', (id, patch, checksum) => {
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
      });

      server.on('announce', (from, message) => {
        let fromName = from;
        if (state.users[from]) fromName = `@${state.users[from].username}`;
        showAnnouncement(`${fromName}: ${message}`);
      });

      server.on('addTexFile', async (filename, url) => {
	const response = await fetch(url);
	const body = await response.text();

        commit('addTexFile', { filename, body });
      });

      server.on('openFile', (filename, url) => {
        openExternal(url);
      });

      server.on('setFileList', (filenames) => {
        commit('setFileList', { filenames });
      });

      server.on('setTemplates', (templates) => {
        commit('setTemplates', { templates });
      });

      server.on('setProblemSets', (sets) => {
        commit('setProblemSets', { sets });
      });

      server.on('setMetadatas', (metadatas) => {
        commit('setMetadatas', { metadatas });
      });                  
    },

    sendMessage({ state, dispatch, commit }, // eslint-disable-line no-unused-vars
                { room, message }) {
      
      service.say(room, message);
    },

    sendImage({ state, dispatch, commit }, // eslint-disable-line no-unused-vars
                { room, image }) {
      
      service.shareImage(room, image);
    },

    sendEmote({ state, dispatch, commit }, // eslint-disable-line no-unused-vars
              { room, message }) {
      
      service.emote(room, message);
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

    clearDocument({ commit }, // eslint-disable-line no-unused-vars
                  id) {
      service.clearDocument(id);
    },

    submitDocument({ commit }, // eslint-disable-line no-unused-vars
                  id) {
      service.submitDocument(id);
    },
    
    gradeDocument({ commit }, // eslint-disable-line no-unused-vars
                  id) {
      service.gradeDocument(id);
    },

    completeDocument({ commit }, // eslint-disable-line no-unused-vars
                  id) {
      service.completeDocument(id);
    },

    updateDocumentCursor({ state, commit },
                         { id, cursor }) {
      service.setDocumentCursor(id, cursor);
      commit('setDocumentCursor', { id, userId: state.self.id, cursor });
    },

    updateDocumentSelection({ state, commit }, 
                            { id, range }) {
      service.setDocumentSelection(id, range);
      commit('setDocumentSelection', { id, userId: state.self.id, range });
    },
    
    updateDocument({ state, dispatch, commit }, // eslint-disable-line no-unused-vars
                   { id, text }) {
      if (state.documents[id] === undefined) return;
      
      // We are not permitted to update a document until AFTER an initial fetchDocument      
      if (state.shadows[id] === undefined) return;
        
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

    updateBlackboardPointer({ state, commit }, // eslint-disable-line no-unused-vars
                            { id, position }) {
      service.setBlackboardPointer(id, position);
    },

    fetchBlackboard({ state, commit }, // eslint-disable-line no-unused-vars
                    id) {
      service.getBlackboard(id);
    },

    setBlackboardPdf({ state, commit }, // eslint-disable-line no-unused-vars
                     { id, pdf }) {
      service.setBlackboardPdf(id, pdf);
    },

    addBlackboardInk({ state, commit }, // eslint-disable-line no-unused-vars
                     {
 id, uuid, style, points, 
}) {
      service.addBlackboardInk(id, uuid, style, points);
    },

    clearBlackboardInk({ state, commit }, // eslint-disable-line no-unused-vars
                       { id }) {
      service.clearBlackboardInk(id);
    },

    clearBlackboardPdf({ state, commit }, // eslint-disable-line no-unused-vars
                       { id }) {
      service.clearBlackboardPdf(id);
    },

    updateBlackboardPage({ state, commit }, // eslint-disable-line no-unused-vars
                         { id, page }) {
      service.setBlackboardPage(id, page);
    },
    
    upvotePost({ commit }, // eslint-disable-line no-unused-vars
               { post }) {
      service.upvotePost(post);
    },

    downvotePost({ commit }, // eslint-disable-line no-unused-vars
               { post }) {
      service.downvotePost(post);
    },
    
    removePost({ commit }, // eslint-disable-line no-unused-vars
               post) {
      service.removePost(post);
    },

    writePost({ commit }, // eslint-disable-line no-unused-vars
              { parent, subject, body }) {
      service.writePost(parent, subject, body);
    },

    fetchPosts({ commit }, // eslint-disable-line no-unused-vars
               { parent }) {
      commit('setupChildPosts', { parent });
      service.getPosts(parent);
    },

    fetchRootPosts({ commit }) { // eslint-disable-line no-unused-vars
      service.getRootPosts();
    },

    readPost({ commit }, postId) {
      commit('markPostRead', postId);
    },

    unreadPost({ commit }, postId) {
      commit('markPostUnread', postId);
    },    

    announceUserJoin({ commit }, { room, user }) {
      commit('pushMessage', {
        room,
        message: {
          from: user,
          join: true,
          action: 'entered the chat',
          timestamp: (new Date()).toString(),
        },
      });
    },

    announceUserPart({ commit }, { room, user }) {
      commit('pushMessage', {
        room,
        message: {
          from: user,
          part: true,
          action: 'left the chat',
          timestamp: (new Date()).toString(),
        },
      });
    },

    getVideos() {
      service.getVideos();
    },

    getVideo({ commit }, { video }) { // eslint-disable-line no-unused-vars
      service.getVideo(video);
    },

    playVideo({ commit }, playingVideo) { // eslint-disable-line no-unused-vars
      commit('updatePlayingVideo', playingVideo);
    },

    makeAnnouncement({ commit }, message) { // eslint-disable-line no-unused-vars
      service.announce(message);
    },

    getTexFiles({ commit }) { // eslint-disable-line no-unused-vars
      service.getTexFiles();
    },

    getFiles({ commit }) { // eslint-disable-line no-unused-vars
      service.getFiles();
    },

    requestFile({ commit }, filename) { // eslint-disable-line no-unused-vars
      service.requestFile(filename);
    },            

    setFamilyMembership({ commit }, { id, membership }) {
      if (membership) commit('addToFamily', id);
      else commit('removeFromFamily', id);
    },

    getTemplates({ commit }) { // eslint-disable-line no-unused-vars
      service.getTemplates();
    },

    getProblemSets({ commit }) { // eslint-disable-line no-unused-vars
      service.getProblemSets();
    },    

    getGradingQueue({ commit }) { // eslint-disable-line no-unused-vars
      service.getGradingQueue();
    },

    updateAudioNotifications({ commit }, audioNotifications) {
      console.log(audioNotifications);
      commit('setAudioNotifications', audioNotifications);
    },

  },

  modules: {
  },
  
  plugins: [
    createSharedMutations(),
    vuexPersist.plugin,
  ],
  
});
