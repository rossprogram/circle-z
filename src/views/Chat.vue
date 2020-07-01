<template>
<Header :name="this.$route.params.id"
	@leave='leave'
	@editor='editor'
	@chalkboard='chalkboard'
	:buttons="{ Chalkboard: 'chalkboard', Editor: 'pencil-alt', Leave: 'sign-out-alt' }">
  <splitpanes class="default-theme">
    <pane min-size="50" size="70" max-size="80">
      <div @contextmenu="showMenu" class="chat">
	<div class="transcript">
	  <ChatEvent v-for="message in transcript"
		     v-bind:key="message.id"
		     :actor="message.from"
		     :join="message.join"
		     :part="message.part"
		     :image="message.image"
		     :timestamp="message.timestamp"
		     :action="message.action"
		     :message="message.text"/>
	  <ChatEvent style="opacity: 0.5;"  :actor="self.id" :key="commandline" :message="commandline"/>
	</div>
	<input type="text" v-model="commandline" class="message"
	       v-on:keyup.up="historyUp"
	       v-on:keyup.enter="processCommand"
	       placeholder="Type your message…"/>
      </div>
    </pane>
    <pane size="20">
      <ul class="user-list">
	<li v-for="user in usersInRoom" v-bind:key="user" :userId="user">
	  <User v-bind:key="user" :userId="user"/>
	</li>
      </ul>
    </pane>
  </splitpanes>
</Header>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import ChatEvent from '@/components/ChatEvent.vue';
import User from '@/components/User.vue';
import Header from '@/components/Header.vue';
import imageType from 'image-type';
import fs from 'fs';
import datauri from 'datauri';

const {
  getCurrentWindow, Menu, MenuItem, dialog,
} = require('electron').remote;

function showErrorBox(e) {
  dialog.showMessageBox({
    type: 'error',
    message: e,
    buttons: ['OK'],
  });
}

export default {
  computed: {
    ...mapState(['self', 'users', 'transcripts', 'rooms']),
    
    transcript: {
      get() {
	return this.transcripts[this.$route.params.id];
      },
    },
    
    room: {
      get() {
	return this.rooms[this.$route.params.id];
      },
    },

    usersInRoom: {
      get() {
	if (this.room) {
	  return this.room.users.filter((u) => {
	    if (this.users[u]) return this.users[u].isConnected;
	    return false;
	  });
	}
	return [];
      },
    },
  },

  data() {
    return {
      history: [],
      commandline: '',
    };
  },
  
  watch: {
    transcript() {
      const container = this.$el.getElementsByClassName('transcript')[0];
      container.scrollTop = container.scrollHeight;
    },
    
    commandline() {
      const container = this.$el.getElementsByClassName('transcript')[0];
      container.scrollTop = container.scrollHeight;
    },

    usersInRoom(currentUsers, previousUsers) { // eslint-disable-line no-unused-vars
      // People tell me they find this distracting
      
      /*
      currentUsers.forEach((user) => {
	if (previousUsers.indexOf(user) < 0) {
	  this.announceUserJoin({
	    room: this.$route.params.id,
	    user,
	  });
	}
      });

      previousUsers.forEach((user) => {
	if (currentUsers.indexOf(user) < 0) {
	  this.announceUserPart({
	    room: this.$route.params.id,
	    user,
	  });	  
	}
      });
      */
    },
  },
  
  methods: {
    ...mapActions([
      'sendMessage',
      'sendImage',      
      'sendEmote',
      'viewMessages',
      'announceUserJoin',
      'announceUserPart',
      'join',
      'part',
      'focus',
      'topic',
    ]),

    showMenu(e) {
      const menu = new Menu();

      const menuItem = new MenuItem({
	label: 'Send image',
	click: () => {
	  dialog.showOpenDialog({
	    properties: ['openFile'],
	  })
	    .then((result) => {
	      if (result.canceled === false) {
		const filePath = result.filePaths[0];
	      
		fs.readFile(filePath, (err, data) => {
		  if (err) {
		    showErrorBox(err.toString());
		  } else if (data.length > 128 * 1024) {
		    showErrorBox('Your image file must be under 128kb; large images result in a less than optimal multi-user experience.');
		  } else if (imageType(data)) {
		    datauri(filePath, (error, content, meta) => {
		      if (err) {
			showErrorBox(error.toString());
		      } else {
			console.log('Sending image with', meta);
			this.sendImage({
			  room: this.$route.params.id,
			  image: content, 
			});
		      }
		    }); 
		  } else {
		    showErrorBox('The file does not seem to be an image.');
		  }
		});
	      }		    
	    })
	    .catch((err) => {
	      showErrorBox(err.toString());
	    });
	  },
      });
      menu.append(menuItem);

      e.preventDefault();
      menu.popup(getCurrentWindow());
    },

    historyUp() {
      const m = this.history.filter((x) => x.startsWith(this.commandline));
      if (m.length > 0) {
	const last = m[m.length - 1];
	this.commandline = last;
      }
    },

    editor() {
      const routeData = this.$router.resolve({
	name: 'editor',
	params: { id: this.$route.params.id }, 
      });
      // to ensure I only have one of each window open, use the href
      // as the frame id
      window.open(routeData.href, routeData.href);
    },

    chalkboard() {
      const routeData = this.$router.resolve({
	name: 'chalkboard',
	params: { id: this.$route.params.id }, 
      });
      // to ensure I only have one of each window open, use the href
      // as the frame id
      window.open(routeData.href, routeData.href);
    },

    video() {
      const routeData = this.$router.resolve({
	name: 'video',
	params: { id: this.$route.params.id }, 
      });
      window.open(routeData.href, '_blank');
    },
    
    leave() {
      this.part({ room: this.$route.params.id });
      this.$router.push({ name: 'rooms' });
    },

    mumbleToChannel(room) {
      console.log('mumbleToChannel', room);
      this.focus(room);
    },

    processCommand() {
      if (this.commandline.match(/^\/topic *$/)) {
	this.topic({
	  room: this.$route.params.id,
	  topic: '',
	});
	this.history.push(this.commandline);
	this.commandline = '';
	return;
      } if (this.commandline.match(/^\/topic /)) {
	this.topic({
	  room: this.$route.params.id,
	  topic: this.commandline.slice(7), 
	});
	this.history.push(this.commandline);
	this.commandline = '';
	return;
      }
      if (this.commandline.match(/^\/me /)) {
	this.sendEmote({
	  room: this.$route.params.id,
	  message: this.commandline.slice(4),
	});
	this.history.push(this.commandline);
	this.commandline = '';
	return;
      }
      if (this.commandline.match(/^\/emote /)) {
	this.sendEmote({
	  room: this.$route.params.id,
	  message: this.commandline.slice(7),
	});
	this.history.push(this.commandline);
	this.commandline = '';
	return;
      }
      if (this.commandline.match(/^\/action /)) {
	this.sendEmote({
	  room: this.$route.params.id,
	  message: this.commandline.slice(8),
	});
	this.history.push(this.commandline);
	this.commandline = '';
	return;
      }
      
      this.sendMessage({
	room: this.$route.params.id,
	message: this.commandline, 
      });
      this.history.push(this.commandline);
      this.commandline = '';
    },
  },

  beforeDestroy() {
    clearInterval(this.interval);
  },
  
  // Sometimes these are re-used, so between mounted and
  // beforeRouteUpdate we capture both possibilities
  beforeRouteUpdate(to, from, next) {
    this.viewMessages({ room: to.params.id });
    this.join({ room: to.params.id });
    this.mumbleToChannel(to.params.id);
    next();
  },
  
  mounted() {
    this.interval = setInterval(() => {
      this.viewMessages({ room: this.$route.params.id });
    }, 1000);
    
    this.viewMessages({ room: this.$route.params.id });
    this.mumbleToChannel(this.$route.params.id);
    return this.join({ room: this.$route.params.id });
  },
  
  components: {
    ChatEvent,
    Header,
    User,
  },
  name: 'Chat',
};

</script>

<style scoped lang="scss">
  .user-list {
      height: 100%;
      padding: 0;
      margin: 0;
      padding-left: 6pt;
      border-left: solid #aaa 1px;
  }
  
  .chat {
      height: 100%;
      padding: 0;
      margin: 0;
  display: flex;
  flex-direction: column;
    align-content: space-between;
  }
  
  div.transcript {
  flex-grow: 1;
  overflow-y: auto;
  user-select: text;
  }

  input.message:focus {
  border: 0;
  outline: none;
  }
  
  .message {
  border: 0;
  padding: 0pt;
  padding: 6pt;
  margin: 0;
  font-family: monospace;
  }
  
  h2 {
  height: 12pt;
    color: black;
    margin-top: 6pt;
    margin-bottom: 6pt;
    padding-bottom: 6pt;
    font-size: 10pt;
    padding-left: 6pt;
  border-bottom: 1px solid #eee;
  user-select: none;    
}
</style>
