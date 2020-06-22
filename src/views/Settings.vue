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
	     placeholder="7817">
      </div>
      <div class="row">
      <label for="password">email:</label>
      <input id="password" :disabled="connected || connecting"
	     :value="email"
	     @input="updateEmail"
	     placeholder="your email">
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
    <div v-if="connected">
      <p>As of {{ pingTimeRelative }}, there
	{{ (connectedUserCount === 1) ? 'was' : 'were' }} {{ connectedUserCount }} connected
	user{{ (connectedUserCount === 1) ? '' : 's' }}.</p>
      
      <p>The server time is {{ serverTime }}.</p>
      <p>The server is handling {{ requestsPerTimeUnit }}
      and using {{ Math.ceil(serverMemoryUsed / 1024 / 1024) }} megabytes of memory.</p>

    </div>
  </Header>
</template>

<script>
// @ is an alias to /src
import Header from '@/components/Header.vue';
import { mapActions, mapState } from 'vuex';
import moment from 'moment';

export default {
  name: 'Settings',

  components: {
    Header,
  },
  
  computed: {
    ...mapState(['server', 'port', 'email', 'password',
		 'connected', 'connecting',
		 'connectedUserCount',
		 'requestsPerSecond',
		 'serverMemoryUsed',
		 'serverTime', 'pingTime',
		]),

    pingTimeRelative() {
      return moment(this.pingTime).fromNow();
    },

    requestsPerTimeUnit() {
      if ((60 * this.requestsPerSecond) < 1) {
	return `${Math.ceil(this.requestsPerSecond * 60 * 60)} requests per hour`;
      }
      if (this.requestsPerSecond < 1) {
	return `${Math.ceil(this.requestsPerSecond * 60)} requests per minute`;
      }
      return `${Math.ceil(this.requestsPerSecond)} requests per second`;
    },
  },
    
  methods: {
    ...mapActions([
      'quit',
      'connect',
      'updateServerParameters',
    ]),


    updatePassword(e) {
      this.updateServerParameters({ password: e.target.value });
    },
    updateServer(e) {
      this.updateServerParameters({ server: e.target.value });
    },
    updateEmail(e) {
      this.updateServerParameters({ email: e.target.value });
    },
    updatePort(e) {
      this.updateServerParameters({ port: e.target.value });
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
