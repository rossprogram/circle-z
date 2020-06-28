<template>
<Header @refresh='refresh' :buttons="{ Refresh: 'sync' }" name="People">
  <div class="search-panel">
    <input v-model="search" type="search" placeholder="Search">
    <span id="onlyOnlineCheckbox">
      <input type="checkbox" id="onlyOnline" name="onlyOnline" v-model="onlyOnline"/>
      <label for="onlyOnline">only online</label>

      <input type="checkbox" id="onlyFamily" name="onlyFamily" v-model="onlyFamily"/>
      <label for="onlyFamily">only family</label>
    </span>
  </div>
  <div class="cards">
    <div class="card-item" v-for="id in filteredUserIds" v-bind:key="id">
      <div class="card" @click="gotoUser(id)">
	<span :class="{ user: true, online: users[id].isConnected }">
	  <User :userId="id"/>
	  <span class="realname">{{ users[id].firstName }} {{ users[id].lastName }}</span>	  
	</span>
      </div>
    </div>
  </div>
  
</Header>
</template>

<script>
import Header from '@/components/Header.vue';
import User from '@/components/User.vue';
import { mapActions, mapState } from 'vuex';

export default {
  name: 'UserList',
  components: {
    Header,
    User,
  },

  data() {
    return {
      search: '',
      onlyOnline: false,
      onlyFamily: false,
    };
  },
  
  computed: {
    ...mapState(['userIds', 'users', 'family']),

    filteredUserIds: {
      get() {
	return this.userIds.filter(
	  (id) => JSON.stringify(this.users[id]).toLowerCase().match(this.search.toLowerCase())
	    && ((!this.onlyOnline) || (this.users[id].isConnected))
	    && ((!this.onlyFamily) || (this.family.indexOf(id) >= 0)),	  
	).sort((a, b) => {
	  const ua = this.users[a].username;
	  const ub = this.users[b].username;
	  if (ua > ub) return 1;
	  if (ua < ub) return -1;
	  return 0;
	});
      },
    },
  },
  methods: {
    ...mapActions(['who']),

    refresh() {
      this.who();
    },

    gotoUser(id) {
      this.$router.push({ name: 'user', params: { id } });
    },
  },

  mounted() {
    return this.who();
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

.realname {
      font-style: italic;
      float: right;
}

.user {
    opacity: 0.5;
}

.user.online {
    opacity: 1;
}

#onlyOnlineCheckbox {

}


</style>
