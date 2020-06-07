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

    <div v-if="connected">
      <h3>Rooms</h3>
      <ul>
	<router-link tag='li'
		     v-for="room in sortedJoinedRooms"
		     v-bind:key="room"
		     :to="{ name: 'room', params: { id: room }}">
	  <Channel :name="room"
		   v-bind:key="room"
		   :count="unreadCounts[room]"/>
	</router-link>
	<router-link tag='li' :to="{ name: 'rooms' }">
	  <span><font-awesome-icon icon="city" />
	    ROOMS
	  </span>
	</router-link>
      </ul>
    </div>

    <div v-if="connected">
      <h3>Private Messages</h3>
      <ul>
	<router-link tag='li'
		     v-for="id in sortedPrivateMessages"
		     v-bind:key="id"
		     :to="{ name: 'user', params: { id: id }}">
	  <Channel :name="users[id].username"
		   :count="privateUnreadCounts[id]"/>
	</router-link>
      
	<router-link tag='li' :to="{ name: 'users' }">
	  <span><font-awesome-icon icon="users" />
	    PEOPLE
	  </span>
	</router-link>
      </ul>
    </div>
    
    <h3></h3>     
    <ul>
      <router-link v-if="connected" tag='li' class="forum" :to="{ name: 'forum' }">
	<span><font-awesome-icon icon="mail-bulk" />
	  FORUM
	</span>
      </router-link>

      <router-link tag='li' :to="{ name: 'settings' }">
	<span><font-awesome-icon icon="cog" />
	  SETTINGS</span>
      </router-link>
      <router-link tag='li' :to="{ name: 'about' }">
	<span><font-awesome-icon icon="info-circle" />
	  ABOUT
	</span>
      </router-link>
    </ul>

  </div>
</template>

<script>
import { mapState } from 'vuex';
import Channel from './Channel.vue';

export default {
  computed: {
    ...mapState(['server', 'connected', 'connecting',
		 'unreadCounts', 'joinedRooms',
		 'privateTranscripts', 'users', 'privateUnreadCounts',
		]),

    sortedJoinedRooms: {
      get() {
	return this.joinedRooms.concat()
	  .sort((a, b) => {
	    const la = a && a.toLowerCase();
	    const lb = b && b.toLowerCase();
	    if (la < lb) return -1;
	    if (la > lb) return 1;
	    return 0;
	  });
      },
    },

    sortedPrivateMessages: {
      get() {
	// to perform a not-in-place sort
	return Object.keys(this.privateTranscripts)
	.filter((id) => this.users[id])
	  .sort((a, b) => {
	    const ua = this.users[a].usernames;
	    const ub = this.users[b].usernames;
	    if (ua < ub) return -1;
	    if (ub < ua) return 1;
	    return 0;
	  });
      },
    },
  },

  methods: {
  },
  
  name: 'ChannelList',
  
  components: {
    Channel,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
li {
    padding: 6pt;
}

li.router-link-exact-active {
    background-color: #45f;
}

li.forum.router-link-active {
    background-color: #45f;
}

li a {
    text-decoration: none;
    color: white;
}

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
    height: 16pt;
    color: white;
    margin-top: 6pt;
    margin-bottom: 6pt;
    padding-bottom: 6pt;
    font-size: 14pt;
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
    
    padding-right: 6pt;
    cursor: pointer;
}


li svg {
    color: #aaa;
}

li span {
text-decoration: none;
color: #fff;
font-size: 8pt;
}


</style>
