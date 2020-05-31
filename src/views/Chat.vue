<template>
<Header :name="this.$route.params.id"
	@leave='leave'
	@editor='editor'
	@blackboard='blackboard'
	:buttons="{ Blackboard: 'chalkboard', Editor: 'pencil-alt', Leave: 'sign-out-alt' }">
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
	  <ChatEvent style="opacity: 0.5;"  :actor="self.id" :key="commandline" :message="commandline"/>
	</div>
	<input type="text" v-model="commandline" class="message"
	       v-on:keyup.enter="processCommand"
	       placeholder="Type your message…"/>
      </div>
    </pane>
    <pane size="20">
      <div class="user-list">
	<User v-for="user in usersInRoom" v-bind:key="user" :nick="user"/>
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

export default {
  computed: {
    ...mapState(['nick', 'self', 'password',
		 'transcripts', 'rooms']),
    
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
	return [];
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
      'sendMessage',
      'viewMessages',
      'join',
      'part',
      'focus',
    ]),

    editor() {
      this.$router.push({
	name: 'editor',
	params: { id: this.$route.params.id }, 
      });
    },

    blackboard() {
      this.$router.push({
	name: 'blackboard',
	params: { id: this.$route.params.id }, 
      });
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
      this.sendMessage({
	room: this.$route.params.id,
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
