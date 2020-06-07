<template>
<div>
  <div @contextmenu="showMenu" @click.stop.prevent="gotoPost" v-if="post" class="post">
    <div class="subject"><Tex>{{ post.subject }}</Tex></div>
    <div class="body"><Tex>{{ post.body }}</Tex></div>
    <div class="byline">
      <span class="author">{{ username }}</span>
      <span class="time">
	<font-awesome-icon icon="clock" />
	{{ new Date(post.createdAt) | moment }}
      </span>
      <span class="votes">
	<span @click.stop.prevent="upvote" class="upvote"><font-awesome-icon icon="thumbs-up" /></span>
	<span class="count">{{ post.upvoteCount - post.downvoteCount }}</span>
	<span @click.stop.prevent="downvote" class="downvote">
	  <font-awesome-icon icon="thumbs-down" /></span>
      </span>
      <button v-if="showReply === false" @click.stop.prevent="startReply">
	<font-awesome-icon icon="reply" /> Reply
      </button>
    </div>
  </div>

  <div class="children">
    <div v-if="showReply || !post" class="reply">
      <input type="text" v-model="replySubject" class="reply-subject"
	     placeholder="Type the subject…"/>
      <textarea v-model="replyBody" class="reply-body" placeholder="Type your message…"/>
      <div class="preview">
	<Tex :key="replyBody">{{ replyBody }}</Tex>
      </div>
      <button @click="makePost"><font-awesome-icon icon="paper-plane" /> Post</button>&nbsp;
      <button v-if="post" @click="cancelPost">
	<font-awesome-icon icon="paper-plane" /> Cancel</button>
    </div>
    <div v-if="(showChildren === true) && ((postId === undefined) || (post && post.children))">
      <Post v-for="child in sortedChildren"
	    :key="`${child}-${sortBy}-${posts[child].children}`"
	    :postId="child" :sortBy="sortBy"/>
    </div>
    <div v-else-if="post">
      <span class="view-replies" @click="viewReplies">View replies&hellip;</span>
    </div>
  </div>
</div>
</template>

<script>
import Tex from '@/components/Tex';
import moment from 'moment';
import { mapActions, mapState } from 'vuex';

const { getCurrentWindow, Menu, MenuItem } = require('electron').remote;

export default {
  name: 'Post',
  computed: {
    ...mapState(['posts',
		 'rootPosts',
		 'users']),

    post() {
      return this.posts[this.postId];
    },

    children() {
      if (this.post) return this.post.children;
      return this.rootPosts;
    },

    sortedChildren() {
      if (this.children === undefined) return [];
      
      return this.children.concat().sort((x, y) => {
	const a = this.posts[x];
	const b = this.posts[y];
	let la = 0;
	let lb = 0;
	
	if (this.sortBy === 'top') {
	  la = a.upvoteCount - a.downvoteCount;
	  lb = b.upvoteCount - b.downvoteCount;
	} else if (this.sortBy === 'recent') {
	  la = (new Date(a.createdAt)).getTime();
	  lb = (new Date(b.createdAt)).getTime();
	} else if (this.sortBy === 'oldest') {
	  la = -(((new Date(a.createdAt)).getTime()));
	  lb = -(((new Date(b.createdAt)).getTime()));
	}

	if (la === lb) return 0;
	if (la > lb) return -1;
	return 1;
      });
    },
    
    username: {
      get() {
	if (this.users[this.post.author]) return this.users[this.post.author].username;
	return 'unknown user';
      },
    },
  },

  data() {
    return {
      showReply: false,
      replySubject: '',
      replyBody: '',
      showChildren: true,
    };
  },
  
  methods: {
    ...mapActions([
      'upvotePost',
      'downvotePost',
      'fetchPosts',
      'writePost',
    ]),

    showMenu(e) {
      const menu = new Menu();
      const menuItem = new MenuItem({
	label: this.showChildren ? 'Hide replies' : 'Show replies', 
	click: () => {
	  this.showChildren = !this.showChildren;
	},
      });
      menu.append(menuItem);

      e.preventDefault();
      menu.popup(getCurrentWindow());
    },
    
    gotoPost() {
      this.$router.push({ name: 'forum', params: { id: this.postId } });
    },

    cancelPost() {
      this.showReply = false;
    },
    
    makePost() {
      if (this.postId) {
	this.writePost({
	  parent: this.postId,
	  subject: this.replySubject,
	  body: this.replyBody, 
	});
      } else {
	this.writePost({
	  parent: null,
	  subject: this.replySubject,
	  body: this.replyBody, 
	});
      }
      
      this.replyBody = '';
      this.replySubject = '';
      this.showReply = false;
    },

    
    startReply() {
      this.showReply = true;
    },
    
    upvote() {
      this.upvotePost({ post: this.postId });
    },

    downvote() {
      this.downvotePost({ post: this.postId });
    },

    viewReplies() {
      this.showChildren = true;
      this.fetchPosts({ parent: this.postId });
    },
  },
  
  props: {
    postId: String,
    sortBy: String,
  },
  
  components: {
    Tex,
  },
  
  filters: {
    moment(date) {
      return moment(date).format('HH:mm MMMM D');
    },
  },

  
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.children {
    border-left: solid 1px #eee;
    padding-left: 0.5em;
    margin-left: 0.5em;
    opacity: 0.9;
}

.post:hover {
    background: #eee;
}

.post {
    border-top: solid 1px #eee;
    padding-top: 0.5em;
    margin-top: 0.5em;
}

.subject {
    font-family: "Computer Modern Serif";
    font-weight: bold;
}

.body {
    font-family: "Computer Modern Serif";
}

.byline {
    color: #888;
    padding-bottom: 3pt;
}

.byline button {
    float: right;
}

.byline > span {
    margin-right: 0.5em;
    padding-right: 0.5em;
    border-right: solid 1px #DDD;
}

.upvote:hover, .downvote:hover {
    color: black;
}

.count {
    min-width: 18pt;
    text-align: center;
    display: inline-block;
}

.reply {
    padding-top: 6pt;
    padding-bottom: 6pt;
    margin-top: 6pt;
    margin-bottom: 6pt;    
}

.reply .preview {
    font-family: "Computer Modern Serif";
    color: #888;
}

.reply input {
    display: block;
    width: 100%;
    margin-bottom: 6pt;
}

.reply textarea {
    display: block;
    width: 100%;
    margin-bottom: 6pt;
}

.view-replies {
    padding-top: 12pt;
    padding-bottom: 12pt;
    color: #ccc;
}

.view-replies:hover {
    color: black;
}


</style>
