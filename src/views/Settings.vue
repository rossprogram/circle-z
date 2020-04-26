<template>
  <Header name="Settings">

    <p v-if="connected">You are connected to <code>{{ this.server }}</code>.</p>

    <p v-if="!connected">You are <strong>not</strong> connected.  Fill
    out the fields below, then click &ldquo;Connect&rdquo; to log
    in.</p>

    <hr/>
    
    <div class="panel">
      <div class="row">
      <label for="server">server:</label>
      <input id="server" :disabled="connected || connecting"
	     :value="server" type="text"
	     @input="updateServer"
	     placeholder="irc.rossprogram.org?">
      </div>
      <div class="row">
      <label for="port">port:</label>
      <input id="port" :disabled="connected || connecting"
	     :value="port" type="number"
	     @input="updatePort"
	     placeholder="6667">
      </div>
      <div class="row">
      <label for="password">password:</label>
      <input id="password" :disabled="connected || connecting"
	     :value="password"
	     @input="updatePassword"
	     type="password">
      </div>

      <button v-if = "!(connected || connecting)" @click="connect"
	      ><font-awesome-icon icon="sign-in-alt" /> Connect</button>
      <button  v-if = "connected" @click="quit"
	       ><font-awesome-icon icon="sign-out-alt" /> Disconnect</button>
      <button disabled="true"
	      class="connecting"
	      v-if = "(!connected) && connecting"
	      ><font-awesome-icon icon="sync" /> Connecting&hellip;</button>
    </div>
    
    <hr/>

    <p>Your <code>nick</code>, short for <em>nickname,</em> is how
    people here know who you are.  Pick a name that is short and
    recognizable.</p>
    
    <div class="panel">
      <div class="row">
	<label for="nick">nick:</label>
	<input id="nick" 
	       v-model="nick"
	       type="text">
      </div>
      <button :disabled = "this.$store.state.nick === nick"
	      @click="updateNick"><font-awesome-icon icon="exchange-alt" />
	Change nick</button>
    </div>

    <hr/>
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
	return (this.newNick === undefined)
	  ? this.$store.state.nick
	  : this.newNick;
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
.connecting svg {
   animation-name: spin;
    animation-duration: 4000ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
}

@keyframes spin {
    from {
        transform:rotate(0deg);
    }
    to {
        transform:rotate(360deg);
    }
}
  
hr {
    border: none;
    border-bottom: 1px solid #aaa;
    margin-top: 24pt;
    margin-bottom: 24pt;
}

.panel  button {
    margin-left: 1.2in;
    padding: 3pt;
}


.panel {
    margin-top: 6pt;
    margin-bottom: 6pt;
}

.panel .row {
    margin-bottom: 3pt;
}

.panel .row label {
    width: 1in;
    text-align: right;
    display: inline-block;
    margin-right: 0.2in;
}
</style>
