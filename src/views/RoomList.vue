<template>
<Header @refresh='refresh' :buttons="{ Refresh: 'sync' }" name="Rooms">
  <div class="search-panel">
    <span>
      {{ filteredRooms.length }}
      room{{ (filteredRooms.length === 1) ? '' : 's' }}
    </span><input v-model="search" type="search" placeholder="Search">
  </div>
  <div class="cards">
    <div class="card-item" v-for="roomname in filteredRooms" v-bind:key="roomname">
      <div class="card" @click="gotoRoom(roomname)">
	<span class="room">
	  <span class="hashes">
	    <font-awesome-icon icon="hashtag"
			       v-for="n in roomname.replace(/[^#]/g,'').length" v-bind:key="n" />
	  </span><span class="room-name">{{ roomname.replace(/#/g,'') }}</span>
	  <span><Tex>{{rooms[roomname].topic}}</Tex></span>
	</span>
	<span class="user-count">
	  {{ rooms[roomname].users.length }}
	  {{ (rooms[roomname].users.length === 1) ? 'person' : 'people' }}
	  {{ (rooms[roomname].users.indexOf(self.id) >= 0) ? 'including you' : '' }}
	</span>
	<ul class="user-list">
	  <li v-for="user in rooms[roomname].users" v-bind:key="user" :userId="user">
	    <User v-bind:key="`${user}-${roomname}`" :userId="user"/>
	  </li>
	</ul>
      </div>
    </div>
    <div v-if="newRoom" class="card-item" key="newRoom">
      <div class="card" @click="gotoRoom(newRoom)">
	<span class="room">
	  <span class="hashes">
	    <font-awesome-icon icon="hashtag"
			       v-for="n in newRoom.replace(/[^#]/g,'').length" v-bind:key="n" />
	  </span><span class="room-name">{{ newRoom.replace(/#/g,'') }}</span>
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
import Tex from '@/components/Tex';
import User from '@/components/User.vue';
import { mapActions, mapState } from 'vuex';

export default {
  name: 'RoomList',
  components: {
    Header,
    Tex,
    User,
  },

  data() {
    return {
      search: '',
    };
  },
  
  computed: {
    ...mapState(['rooms', 'self']),

    newRoom: {
      get() {

	if (this.search) {
	  if (this.search === '') return undefined;
	  if (this.search.match(/[A-Za-z]/)) {
	    let newName = this.search.replace(/[^#A-Za-z0-9]/g, '');
	    newName = newName.toLowerCase();
	    
	    if (newName[0] !== '#') newName = `#${newName}`;

	    if (this.filteredRooms.indexOf(newName) >= 0) return undefined;
	    
	    return newName;
	  }
	}

	return undefined;
      },
    },
    
    filteredRooms: {
      get() {
	const nonemptyRooms = Object.keys(this.rooms)
	      .filter((name) => (this.rooms[name].users.length > 0));
	
	return nonemptyRooms.filter(
	  (name) => (name.toLowerCase().includes(this.search.toLowerCase())
		    || (this.rooms[name].topic
		     && this.rooms[name].topic.includes(this.search.toLowerCase()))
		   ),
	).sort();
      },
    },
  },
  methods: {
    ...mapActions(['list']),

    refresh() {
      this.list();
    },

    gotoRoom(room) {
      this.$router.push({ name: 'room', params: { id: room } });
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

.room {
font-size: 125%;
border-bottom: 1px solid #ddd;
margin-bottom: 6pt;
}

.hashes {
    letter-spacing: -1pt;
    color: #777;
}

.room-name {
font-weight: bold;
  margin-left: 2pt;
}

ul.user-list {
    padding: 0;
    margin: 0;
    display: inline;
    list-style: none;
}

ul.user-list li + li:before {
    content: ", ";
}

ul.user-list li {
    display: inline;
}

</style>
