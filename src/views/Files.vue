<template>
<Header name="Files">
  <div class="search-panel">
    <span>
      {{ filteredFilenames.length }}
      file{{ (filteredFilenames.length === 1) ? '' : 's' }}
    </span><input v-model="search" type="search" placeholder="Search">
  </div>
  <div class="cards">
    <div class="card-item" v-for="filename in filteredFilenames" v-bind:key="filename">
      <div class="card" @click="open(filename)">
	{{ filename.replace(/.pdf$/,'') }}
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
    ...mapState(['fileList']),
    
    filteredFilenames: {
      get() {
	return this.fileList.filter(
	  (name) => (name.toLowerCase().replace(/\.pdf$/, '').includes(this.search.toLowerCase())),
	).sort();
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
      'getFiles',
      'requestFile',
    ]),

    open(filename) {
      this.requestFile(filename);
    },
  },
  
  mounted() {
    this.getFiles();
  },
  
  components: {
    Header,
  },
    
  name: 'Files',
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

.has-staff {
    opacity: 0.2;
    float: right;
}
  
</style>
