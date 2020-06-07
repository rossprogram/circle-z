<template>
  <div class="header">
    <div class="content">

      <span class="toolbar">
	<label for="sort-by">Sort by </label>
	<select  v-model="sortBy" name="sort-by" id="sort-by">
	  <option value="top">Top</option>
	  <option value="recent">Recent</option>
	  <option value="oldest">Oldest</option>
	</select>&nbsp;
	<button class="parent-button" @click="gotoParent" :disabled="this.$route.params.id === undefined">
	  <font-awesome-icon icon="level-up-alt" /> Up
	</button>
      </span>

      <ul v-if="post" class="breadcrumb">
	<router-link tag='li'
		     :to="{ name: 'forum' }">
	  <span>Forums</span>
	</router-link>
	
	<router-link tag='li'
		     v-for="ancestor in post.ancestors"
		     :key="`breadcrumb-${ancestor}`"
		     :to="{ name: 'forum', params: { id: ancestor } }">
	  <span v-if="posts[ancestor].subject">{{ posts[ancestor].subject }}</span>
	  <span v-else>{{ posts[ancestor].body.slice(0,10) }}</span>
	</router-link>
	
	<li v-if="post.subject">{{ post.subject }}</li>
	<li v-else>{{ post.body.slice(0,10) }}</li>
      </ul>
      <ul v-else class="breadcrumb">
	<router-link tag='li'
		     :to="{ name: 'forum' }">
	  <span>Forums</span>
	</router-link>
      </ul>
<Post :key="`${this.$route.params.id}-${this.sortBy}-${this.children}`"
      :postId="this.$route.params.id"
      :sortBy="sortBy"/>
</div>
</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Post from '@/components/Post.vue';

export default {
  computed: {
    ...mapState(['posts', 'rootPosts']),

    post() {
      if (this.$route.params.id !== undefined) return this.posts[this.$route.params.id];
      return undefined;
    },

    children() {
      if (this.post) return this.post.children;
      return undefined;
    },

  },

  data() {
    return {
      sortBy: 'top',
    };
  },

  
  methods: {
    ...mapActions([
      'fetchRootPosts',
      'fetchPosts',
    ]),

    gotoParent() {
      this.$router.push({ name: 'forum', params: { id: this.post.parent } });      
    },

    goBack() {
      window.history.back();
    },
  },
  
  // Sometimes these are re-used, so between mounted and
  // beforeRouteUpdate we capture both possibilities
  beforeRouteUpdate(to, from, next) {
    if (to.params.id !== undefined) {
      this.fetchPosts({ parent: to.params.id });
    } else {
      this.fetchRootPosts();
    }
    next();
  },

  mounted() {
    if (this.$route.params.id !== undefined) {
      this.fetchPosts({ parent: this.$route.params.id });
    } else {
      this.fetchRootPosts();
    }
  },
  
  components: {
    Post,
  },
  name: 'Forum',
};

</script>

<style scoped lang="scss">

.toolbar {
  float: right;
}
  
/* Style the list */
ul.breadcrumb {
    color: black;
    font-weight: bold;
    list-style: none;
    padding: 0;
    margin-top: 0pt;
    margin-bottom: 0pt;
    padding-bottom: 6pt;
    font-size: 14pt;
    padding-left: 0pt;
}

/* Display list items side by side */
ul.breadcrumb li {
  display: inline;
  font-size: 18px;
}

ul.breadcrumb li span:hover {
    text-decoration: underline;
}

/* Add a slash symbol (/) before/behind each list item */
ul.breadcrumb li+li:before {
    color: #ccc;
  padding-left: 8px;
  content: "/\00a0";
}

/* Add a color to all links inside the list */
ul.breadcrumb li a {
  color: #0275d8;
  text-decoration: none;
}

/* Add a color on mouse-over */
ul.breadcrumb li a:hover {
  color: #01447e;
  text-decoration: underline;
}

.header {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-content: space-between;
}
  
.content {
  flex-grow: 1;
  overflow-y: scroll;
  height: 100%;
  padding: 6pt;
}

</style>
