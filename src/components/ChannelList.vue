<template>
  <div class="channel-list">
    <h2>{{ server }}
      <span class="disconnected"
	    title="You are disconnected."
	    v-if="connected === false && (connecting === false)">
	<router-link :to="{ name: 'settings' }">
	  <font-awesome-icon icon="exclamation-triangle" />
	</router-link>
      </span>
      <span class="connecting"
	    title="Connecting…"
	    v-if="connected === false && (connecting === true)">
	<router-link :to="{ name: 'settings' }">
	  <font-awesome-icon icon="sync" />
	</router-link>
      </span>
    </h2>
    <h3>Rooms</h3>
    <ul>
      <Channel name="##foyer" :count="12"/>
      <Channel name="####somany" :count="10"/>      
      <Channel name="#hello"/>
      <Channel name="#goodbye"/>
      <Channel name="#whee" :count="912"/>
      <Channel name="#what"/>
      <Channel name="#butyes"/>
      <Channel name="#aroom"/>
    </ul>
    <ul>
      <router-link tag='li' :to="{ name: 'rooms' }">
	<a><font-awesome-icon icon="city" />
	  room list
	</a>
      </router-link>
      <router-link tag='li' :to="{ name: 'settings' }">
	<a><font-awesome-icon icon="cog" />
	  settings
	</a>
      </router-link>
    </ul>

  </div>
</template>

<script>
import { mapState } from 'vuex';
import Channel from './Channel.vue';

export default {
  computed: {
    ...mapState(['server', 'connected', 'connecting']),
  },

  name: 'ChannelList',
  
  components: {
    Channel,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.75; }
  100% { opacity: 1; }
}
  
.disconnected a {
    color: yellow;
    animation: pulse 1s linear infinite;
}

.connecting a {
    color: #aaa;
}

.connecting a svg {
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

.channel-list {
    background: #334;
    color: white;
    padding: 0;
    height: 100vh;    
    margin: 0;
    overflow-y: auto;
    overflow-x: hidden;
    user-select: none;    
}

h2 {
    font-weight: normal;
    height: 12pt;
    color: white;
    margin-top: 6pt;
    margin-bottom: 6pt;
    padding-bottom: 6pt;
    font-size: 10pt;
    padding-left: 12pt;
    border-bottom: 1px solid #444;
}

h3 {
    font-variant: small-caps;
    color: #99a;
    text-transform: uppercase;
    margin-top: 12pt;
    margin-bottom: 4pt;
    font-size: 8pt;
    padding-left: 12pt;
}

ul {
    font-size: 10pt;
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
    display: block;
    padding: 0;
    padding-left: 12pt;
    padding-bottom: 6pt;
    padding-top: 6pt;
    margin-bottom: 0;
    margin-top: 0;
    padding-right: 6pt;
}


li.router-link-exact-active {
    background-color: #45f;
}

li svg {
    color: #aaa;
}

li a {
text-decoration: none;
color: #fff;
text-transform: uppercase;
font-size: 8pt;
}


</style>
