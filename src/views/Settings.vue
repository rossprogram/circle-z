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

    <input type="checkbox" id="audioNotifications"
	   :checked="audioNotifications" @change="updateAudioNotifications"/>
    <label for="audioNotifications">Play a sound when messages arrive</label>        
    <hr/>
    
    <p>Your local time is {{ localTime }}, which is {{ localEasternTime }} in the Ross timezone.</p>
    
    <div v-if="connected">
      <p>As of {{ pingTimeRelative }}, there
	{{ (connectedUserCount === 1) ? 'was' : 'were' }} {{ connectedUserCount }} connected
	user{{ (connectedUserCount === 1) ? '' : 's' }}.</p>
      
      <p>The server time is {{ serverTime }}.</p>

      <p>The server is handling {{ requestsPerTimeUnit }}
      and using {{ Math.ceil(serverMemoryUsed / 1024 / 1024) }} megabytes of memory.</p>

      <hr/>
      
      <p>Here is your login information for Mumble.</p>

      <dl>
	<dt>Username:</dt>
	<dd>{{ self.username }}</dd>
	<dt>Password:</dt>
	<dd>{{ self.mumblePassword }}</dd>
	<dt>Server:</dt>
	<dd>{{ self.mumbleServer }}</dd>	  	  	  
	<dt>Port:</dt>
	<dd>{{ self.mumblePort }}</dd>
      </dl>

      <p>Once you log in successfully into Mumble once, then you will
	be able to use a certificate and will not need to re-enter the
	above credentials.</p>
      
    </div>

    <div v-if="self && self.isStaff && connected">
      <hr/>

      <p>As staff, you are permitted to make system-wide announcements.</p>
      
      <div class="panel">
	<div class="row">
	  <label for="announcement">message:</label>
	  <input id="announcement" v-model="announcement">	
	</div>

	<button @click="announce"
		>Announce</button>
	</div>

    </div>
  </Header>
</template>

<script>
// @ is an alias to /src
import Header from '@/components/Header.vue';
import { mapActions, mapState } from 'vuex';
import * as moment from 'moment-timezone';

export default {
  name: 'Settings',

  components: {
    Header,
  },

  data() {
    return {
      now: new Date(),
      announcement: '',
    };
  },

  
  computed: {
    ...mapState(['server', 'port', 'email', 'password',
		 'connected', 'connecting',
		 'connectedUserCount',
		 'requestsPerSecond',
		 'serverMemoryUsed',
		 'serverTime', 'pingTime',
		 'self',
		 'audioNotifications',
		]),

    pingTimeRelative() {
      return moment(this.pingTime).fromNow();
    },

    localEasternTime() {
      return moment(this.now).tz('America/New_York').format('LLLL');
    },

    localTime() {
      return moment(this.now).format('LLLL');
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
  
  created() {
    this.interval = setInterval(() => { this.now = new Date(); },
					500);
    
  },

  beforeDestroy() {
    clearInterval(this.interval);
  },
  
  methods: {
    ...mapActions([
      'makeAnnouncement',
      'quit',
      'connect',
      'updateServerParameters',
    ]),

    announce() {
      this.makeAnnouncement(this.announcement);
      this.announcement = '';
    },
    
    updateAudioNotifications(e) {
      this.$store.dispatch('updateAudioNotifications', e.target.checked);
    },
    
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

dd {
    user-select: all;
}
	

</style>
