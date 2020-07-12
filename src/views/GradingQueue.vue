<template>
  <Header @refresh='refresh' :buttons="{ Refresh: 'sync' }" name="Grading Queue">
  <div class="search-panel">
    <span>
      {{ filtered.length }}
      file{{ (filtered.length === 1) ? '' : 's' }}
    </span><input v-model="search" type="search" placeholder="Search">

    <input type="checkbox" id="onlyFamily" name="onlyFamily" v-model="onlyFamily"/>
    <label for="onlyFamily">only family</label>

    <input type="checkbox" id="onlyUngraded" name="onlyUngraded" v-model="onlyUngraded"/>
    <label for="onlyUngraded">ungraded</label>

    <input type="checkbox" id="onlyJuniorCounselor"
	   name="onlyJuniorCounselor" v-model="onlyJuniorCounselor"/>
    <label for="onlyJuniorCounselor">junior counselors</label>    
  </div>
  <div class="cards">
    <div class="card-item" v-for="id in filtered" v-bind:key="id">
      <div class="card" @click="open(id)">
	<div class="title">
	  <span><User :userId="metadatas[id].author"/></span>/
	  <span>{{ metadatas[id].template }}</span>

	  <span class="filetype">
	    <span title="Submitted for grading" class="submitted" v-if="metadatas[id].submitted">
	      <font-awesome-icon icon="inbox" /></span>
	
	    <span title="Graded" class="graded" v-if="metadatas[id].graded">◯</span>
	
	    <span title="Completed" class="completed" v-if="metadatas[id].completed">
	      <font-awesome-icon icon="check" /></span>
	  </span>
	</div>

	<div class="info">
	  <span class="time" v-if="metadatas[id].submittedAt">
	    Submitted {{ fromNow(metadatas[id].submittedAt) }}</span>
	</div>
      </div>
    </div>
  </div>
</Header>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Header from '@/components/Header.vue';
import User from '@/components/User.vue';
import moment from 'moment';

export default {
  computed: {
    ...mapState(['metadatas', 'family', 'self', 'users', 'templates', 'problemSets']),


    filtered: {
      get() {
	let keys = Object.keys(this.metadatas);

	keys = keys.filter((k) => {
	  const m = this.metadatas[k];

	  if (this.onlyFamily) {
	    if (this.family.indexOf(m.author) < 0) return false;
	  }

	  if (this.onlyUngraded) {
	    if (m.submitted === false) return false;
	  }

	  if (this.onlyJuniorCounselor) {
	    if (this.users[m.author]) {
	      if (this.users[m.author].isJuniorCounselor) return true;
	    }
	    return false;
	  }	  

	  if (JSON.stringify(m).toLowerCase().match(this.search.toLowerCase())) return true;
	  if (this.users[m.author]) {
	    if (JSON.stringify(this.users[m.author]).toLowerCase()
		.match(this.search.toLowerCase())) return true;
	  }
	  	  
	  return false;
	});
	
	return keys.sort((x, y) => {
	  const a = this.metadatas[x];
	  const b = this.metadatas[y];

	  let la = 0;
	  if (a.submittedAt) la = new Date(a.submittedAt);

	  let lb = 0;
	  if (b.submittedAt) lb = new Date(b.submittedAt);

	  if (la === lb) return 0;
          if (la > lb) return -1;
          return 1;
	});
      },
    },
  },
  
  data() {
    return {
      search: '',
      onlyFamily: true,
      onlyUngraded: true,
      onlyJuniorCounselor: false,
    };
  },
  
  methods: {
    ...mapActions([
      'getGradingQueue',
    ]),

    fromNow(d) {
      return moment(d).fromNow();
    },

    refresh() {
      this.getGradingQueue();    
    },

    open(id) {
      const routeData = this.$router.resolve({
	name: 'editor',
	params: { id },
      });
      window.open(routeData.href, routeData.href);
    },
  },
  
  mounted() {
    this.getGradingQueue();    
  },
  
  components: {
    Header,
    User,
  },

  name: 'GradingQueue',
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
  //flex-direction: column;
  //display: flex;
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

.has-staff {
    opacity: 0.2;
    float: right;
}

.empty {
    opacity: 0.5;
}

.filename {
    display: inline-block;
}

.filetype {
    float: right;
    margin-left: auto;
}

.graded {
    color: #AA0000;
}

.completed {
    color: green;
}

.submitted {
    color: #CCCC00;
}

.title {
    display: block;
}

.info {
    display: block;
}

.time {
    opacity: 0.5;
}

</style>
