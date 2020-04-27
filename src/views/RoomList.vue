<template>
<Header @refresh='refresh' :buttons="{ Refresh: 'sync' }" name="Rooms">
  <div class="search-panel">
    <span>
      {{ filteredChannels.length }}
      room{{ (filteredChannels.length === 1) ? '' : 's' }}
    </span><input v-model="search" type="search" placeholder="Search">
  </div>
  <div class="cards">
    <div class="card-item" v-for="channel in filteredChannels" v-bind:key="channel">
      <div class="card" @click="gotoChannel(channel)">
	<span class="channel">
	  <span class="hashes">
	    <font-awesome-icon icon="hashtag"
			       v-for="n in channel.replace(/[^#]/g,'').length" v-bind:key="n" />
	  </span><span class="channel-name">{{ channel.replace(/#/g,'') }}</span>
	</span>
	<span class="user-count">
	  {{ userCounts[channel] }}
	  {{ (userCounts[channel] === 1) ? 'person' : 'people' }}
	  {{ (joinedChannels.indexOf(channel) >= 0) ? 'including you' : '' }}
	</span>
	<span class="topic">{{ topics[channel] }}</span>
      </div>
    </div>
    <div v-if="newChannel" class="card-item" key="newChannel">
      <div class="card" @click="gotoChannel(newChannel)">
	<span class="channel">
	  <span class="hashes">
	    <font-awesome-icon icon="hashtag"
			       v-for="n in newChannel.replace(/[^#]/g,'').length" v-bind:key="n" />
	  </span><span class="channel-name">{{ newChannel.replace(/#/g,'') }}</span>
	</span>
	<span class="user-count">
	  0 people.
	</span>
      </div>
    </div>
  </div>
</Header>
</template>

<script>
import Header from '@/components/Header.vue';
import { mapActions, mapState } from 'vuex';

export default {
  name: 'RoomList',
  components: {
    Header,
  },

  data() {
    return {
      search: '',
    };
  },
  
  computed: {
    ...mapState(['channels', 'userCounts', 'topics', 'joinedChannels']),

    newChannel: {
      get() {

	if (this.search) {
	  if (this.search === '') return undefined;
	  if (this.search.match(/[A-Za-z]/)) {
	    let newName = this.search.replace(/[^#A-Za-z0-9]/g, '');
	    newName = newName.toLowerCase();
	    
	    if (newName[0] !== '#') newName = `#${newName}`;

	    if (this.filteredChannels.indexOf(newName) >= 0) return undefined;
	    
	    return newName;
	  }
	}

	return undefined;
      },
    },
    
    filteredChannels: {
      get() {
	const nonemptyChannels = this.channels.filter((name) => this.userCounts[name] > 0);
	
	return nonemptyChannels.filter(
	  (name) => name.toLowerCase().match(this.search.toLowerCase()),
	).sort();
      },
    },
  },
  methods: {
    ...mapActions(['list']),

    refresh() {
      this.list();
    },

    gotoChannel(channel) {
      this.$router.push({ name: 'chat', params: { id: channel } });
    },
  },

  mounted() {
    return this.list();
  },

};
</script>


<style scoped lang="scss">
.cards {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
}
  
.card-item {
display: flex;
@media (min-width: 288pt) {
width: 100%;
    }
@media (min-width: 576pt) {
width: 50%;
    }
@media (min-width:864pt) {
width: 33.33333%;
    } 
@media (min-width:1152pt) {
width: 25%;
    } 
@media (min-width:1440pt) {
width: 20%;
    } 
overflow: hidden;
}

.card:hover {
box-shadow: 0 3pt 6pt 0 rgba(0,0,0,0.3);
background-color: #eee;
}

.card {
  box-shadow: 0 3pt 6pt 0 rgba(0,0,0,0.2);
  transition: 0.3s;
padding: 6pt;
margin: 6pt;
  flex-direction: column;
  display: flex;
width: 100%;
}

.channel {
font-size: 125%;
border-bottom: 1px solid #ddd;
margin-bottom: 6pt;
}

.hashes {
    letter-spacing: -1pt;
    color: #777;
}

.channel-name {
font-weight: bold;
  margin-left: 2pt;
}

</style>
