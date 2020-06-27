<template>
  <Header @refresh='refresh' :buttons="{ Refresh: 'sync' }" name="Problem Sets">
  <div class="search-panel">
    <span>
      {{ filteredSets.length }}
      file{{ (filteredSets.length === 1) ? '' : 's' }}
    </span><input v-model="search" type="search" placeholder="Search">
  </div>
  <div class="cards">
    <div class="card-item" v-for="set in filteredSets" v-bind:key="set.template">
      <div class="card" @click="open(set)">
	<span :class="{empty: set.empty, filename: true}">{{ set.template.replace(/.tex/,'') }}</span>
	<span class="filetype">
	  <span title="Empty" class="empty" v-if="set.empty">Ø</span>

	  <span title="Submitted for grading" class="submitted" v-else-if="set.submitted">
	    <font-awesome-icon icon="inbox" /></span>
	  <span title="Graded" class="graded" v-else-if="set.graded">◯</span>
	  <span title="Completed" class="completed" v-else-if="set.completed">
	    <font-awesome-icon icon="check" /></span>
	  <span title="In progress" class="progress" v-else>
	    <font-awesome-icon icon="tasks" /></span>	  
	</span>
      </div>
    </div>
  </div>
</Header>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Header from '@/components/Header.vue';

export default {
  computed: {
    ...mapState(['self', 'templates', 'problemSets']),

    sets() {
      const rest = this.templates
	    .filter((t) => this.problemSets.filter((p) => p.template === t).length === 0)
	    .map((t) => ({
	      template: t, submitted: false, graded: false, completed: false, empty: true, 
	    }));
      
      return this.problemSets.concat(rest);
    },
    
    filteredSets: {
      get() {
	const matches = this.sets.filter(
	  (s) => (s.template.toLowerCase().replace(/\.tex$/, '').includes(this.search.toLowerCase())),
	).sort();

	const exact = this.sets.filter((s) => s.template === `${this.search}.tex`).length > 0;
	if (!exact && this.search.length > 0) {
	  matches.push({
	    template: `${this.search}.tex`,
	    submitted: false,
	    graded: false,
	    completed: false,
	    empty: true, 
	  }); 
	}
	
	return matches;
      },
    },
  },
  
  data() {
    return {
      search: '',      
    };
  },
  
  methods: {
    ...mapActions([
      'getTemplates',
      'getProblemSets',
      'requestFile',
    ]),

    refresh() {
      this.getTemplates();
      this.getProblemSets();    
    },

    open(set) {
      const routeData = this.$router.resolve({
	name: 'editor',
	params: { id: `${this.self.id}:${set.template}` }, 
      });
      window.open(routeData.href, routeData.href);      
    },
  },
  
  mounted() {
    this.getTemplates();
    this.getProblemSets();    
  },
  
  components: {
    Header,
  },

  name: 'ProblemSets',
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

</style>
