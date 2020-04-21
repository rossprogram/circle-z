<template>
  <Header name="Settings">

    <p>connected = {{ this.connected }}</p>

    <button v-if = "!(connected || connecting)" @click="connect">Connect</button>
    <button v-if = "connected" @click="quit">Disconnect</button>
    <span v-if = "(!connecting) && connecting">Connecting...</span>
    
    <label for="server">Server</label>
    <input id="server" :disabled="connected || connecting"
	   :value="server" type="text"
	   @input="updateServer"
	   placeholder="irc.rossprogram.org?">
    
    <label for="port">Port</label>
    <input id="port" :disabled="connected || connecting"
	   :value="port" type="number"
	   @input="updatePort"
	   placeholder="6667">
    
    <label for="password">Password</label>
    <input id="password" :disabled="connected || connecting"
	   :value="password"
	   @input="updatePassword"
	   type="password">

    <label for="nick">Nick</label>
    <input id="nick" 
	   v-model="nick"
	   type="text">
    <button :disabled = "this.$store.state.nick === nick"
	    @click="updateNick">Change nick</button>
  </Header>
</template>

<script>
// @ is an alias to /src
import Header from '@/components/Header.vue';
import { mapActions, mapState } from 'vuex';

export default {
  name: 'Settings',
  components: {
    Header,
  },

  data() {
    return {
      newNick: undefined,
    };
  },
  
  computed: {
    ...mapState(['server', 'port', 'password', 'connected', 'connecting']),

    nick: {
      get() {
	return this.newNick || this.$store.state.nick;
      },
      set(value) {
	this.newNick = value;
      },
    },
  },

  methods: {
    ...mapActions([
      'quit',
      'connectToIRC',
      'updateServerParameters',
      'changeNick',      
    ]),

    connect() {
      this.connectToIRC();
    },

    updatePassword(e) {
      this.updateServerParameters({ password: e.target.value });
    },
    updateServer(e) {
      this.updateServerParameters({ server: e.target.value });
    },
    updatePort(e) {
      this.updateServerParameters({ port: e.target.value });
    },
    updateNick() {
      this.changeNick({ nick: this.newNick });
    },

  },
};
</script>

<style scoped lang="scss">

</style>
