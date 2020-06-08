<template>
<Header :name="this.users[this.$route.params.id].username"
	@leave='leave'
	:buttons="{ Leave: 'sign-out-alt' }">
  <splitpanes class="default-theme">
    <pane min-size="50" size="70" max-size="80">
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
    <pane size="20">
      <div class="user-detail">
	<span class="username">{{ user.username }}</span>
	<span class="email" @click="email">{{ user.email }}</span>

	<span v-if="user.isConnected">online now</span>
      </div>
    </pane>
  </splitpanes>
</Header>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import ChatEvent from '@/components/ChatEvent.vue';
import Header from '@/components/Header.vue';

const { remote } = require('electron');

export default {
  computed: {
    ...mapState(['privateTranscripts', 'users', 'self']),

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
