<template>
<div class="chat">
  <h2>{{ this.$route.params.id }}</h2>
  <div class="transcript">
    <ChatEvent v-for="message in transcript" v-bind:key="message.id"
	       :actor="message.from"
	       :timestamp="message.timestamp"
	       :message="message.text"/>
    <ChatEvent style="opacity: 0.5;" actor="me" :key="commandline" :message="commandline"/>
  </div>
  <input type="text" v-model="commandline" class="message"
	 v-on:keyup.enter="processCommand"
	 placeholder="Type your message…"/>
</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import ChatEvent from '@/components/ChatEvent.vue';

export default {
  computed: {
    ...mapState(['transcripts']),

    transcript: {
      get() {
	return this.transcripts[this.$route.params.id];
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
    ]),

    processCommand() {
      this.sendMessage({
	roomname: this.$route.params.id,
	message: this.commandline, 
      });
      this.commandline = '';
    },
  },
      
  components: {
    ChatEvent,
  },
  name: 'Chat',
};

</script>

<style scoped lang="scss">
  .chat {
  height: 100vh;
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
  width: 100%;
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
