<template>
<Header @refresh='refresh' :buttons="{ Refresh: 'sync' }" name="People">
  <div class="search-panel">
    <input v-model="search" type="search" placeholder="Search">
  </div>
  <div class="cards">
    <div class="card-item" v-for="user in filteredUsers" v-bind:key="user">
      <div class="card" @click="gotoChannel(user)">
	<span class="user">
	  {{ user }}
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
    ...mapState(['usernames', 'users']),

    filteredUsers: {
      get() {
	return this.usernames.filter(
	  (name) => name.toLowerCase().match(this.search.toLowerCase()),
	).sort();
      },
    },
  },
  methods: {
    ...mapActions(['who']),

    refresh() {
      this.who();
    },

    gotoChannel(channel) {
      this.$router.push({ name: 'chat', params: { id: channel } });
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

</style>
