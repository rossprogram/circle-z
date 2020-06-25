<template>
<Header :name="'@' + this.users[this.$route.params.id].username"
	@leave='leave'
	:buttons="{ Leave: 'sign-out-alt' }">
  <splitpanes horizontal class="default-theme">
    <pane size="50">
      <div class="user-detail">
	<dl>

	  <dt>Username</dt>
	  <dd><User v-bind:key="user.id" :userId="user.id"/></dd>
	  
	  <dt>Name</dt>
	  <dd>{{ user.firstName }}
	    <span v-if="user.nickname">&ldquo;{{ user.nickname }}&rdquo;</span>
	    {{ user.lastName }}
	  </dd>

	  <dt>My family</dt>
	  <dd><input type="checkbox" id="family" v-model="familyMembership">
	    <label for="family">A member of my family</label></dd>
	  
	  <dt>Email</dt>
	  <dd><span class="email" @click="email">{{ user.email }}</span></dd>

	  <dt>Role</dt>
	  <dd><span v-if="user.isSuperuser">superuser</span>
	    <span v-if="user.isJuniorCounselor">junior counselor</span>
	    <span v-if="user.isCounselor">counselor</span>
	    <span v-if="user.isStaff">staff</span>
	    <span
	      v-if="!user.isSuperuser && !user.isJuniorCounselor && !user.isCounselor && !user.isStaff">
	      participant</span>
	  </dd>

	  <dt>Status</dt>
	  <dd><span v-if="user.isConnected">online now</span>
	    <span v-else>disconnected</span>
	  </dd>

	  <dt>Rooms</dt>
	  <dd class="roomnames">
	    <span class="roomname" v-for="room in currentRooms" :key="room.name">
	      <router-link :to="{ name: 'room', params: { id: room.name }}">{{ room.name }}</router-link>
	    </span>
	  </dd>
	  
	</dl>
	
      </div>
    </pane>
    <pane min-size="30" size="50" max-size="80">
      <div class="chat">
	<div class="transcript">
	  <ChatEvent v-for="message in transcript"
		     v-bind:key="message.id"
		     :actor="message.from"
		     :join="message.join"
		     :part="message.part"
		     :timestamp="message.timestamp"
		     :action="message.action"
		     :message="message.text"/>
	  <ChatEvent style="opacity: 0.5;" :actor="self.id" :key="commandline" :message="commandline"/>
	</div>
	<input type="text" v-model="commandline" class="message"
	       v-if="user.isConnected"
	       v-on:keyup.enter="processCommand"
	       placeholder="Type your message…"/>
      </div>
    </pane>

  </splitpanes>
</Header>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import ChatEvent from '@/components/ChatEvent.vue';
import User from '@/components/User.vue';
import Header from '@/components/Header.vue';

const { remote } = require('electron');

export default {
  computed: {
    ...mapState(['privateTranscripts', 'users', 'self', 'rooms', 'family']),

    currentRooms: {
      get() {
	return Object.values(this.rooms).filter((room) => room.users.indexOf(this.$route.params.id) >= 0);
      },
    },

    familyMembership: {
      get() {
	return this.family.indexOf(this.$route.params.id) >= 0;
      },
      set(membership) {
	this.setFamilyMembership({ id: this.$route.params.id, membership });
      },
    },
    
    user: {
      get() {
	if (this.users[this.$route.params.id]) {
	  return this.users[this.$route.params.id];
	} 

	return {};
      },
    },
    
    transcript: {
      get() {
	return this.privateTranscripts[this.$route.params.id];
      },
    },
  },

  data() {
    return {
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
  },
  
  methods: {
    ...mapActions([
      'sendPrivateMessage',
      'viewPrivateMessages',
      'closePrivateMessages',
      'setFamilyMembership',
    ]),

    email() {
      remote.shell.openExternal(`mailto:${this.user.email}`);
    },
    
    leave() {
      this.closePrivateMessages({ user: this.$route.params.id });
      this.$router.push({ name: 'users' });
    },

    processCommand() {
      this.sendPrivateMessage({
	user: this.$route.params.id,
	message: this.commandline, 
      });
      this.commandline = '';
    },
  },

  beforeDestroy() {
    clearInterval(this.interval);
  },
  
  // Sometimes these are re-used, so between mounted and
  // beforeRouteUpdate we capture both possibilities
  beforeRouteUpdate(to, from, next) {
    this.viewPrivateMessages({ user: to.params.id });
    next();
  },
  
  mounted() {
    this.interval = setInterval(() => {
      this.viewPrivateMessages({ user: this.$route.params.id });
    }, 1000);
    
    this.viewPrivateMessages({ user: this.$route.params.id });
  },
  
  components: {
    ChatEvent,
    User,
    Header,
  },
  name: 'PrivateChat',
};

</script>

<style scoped lang="scss">
  .user-detail span {
  display: block;
  }

  .user-list {
  height: 100%;
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

  .email {
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

  dl {
  display: grid;
  grid-template-columns: max-content auto;
}

dt {
    grid-column-start: 1;
    font-weight: bold;
}

dd {
  grid-column-start: 2;
}

span.roomname {
    display: inline;
}

span.roomname::after {
    content: ', ';
}
.roomnames span.roomname:last-child::after {
    content: '';
}
</style>
