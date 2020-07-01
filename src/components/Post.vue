<template>
<div>
  <div @contextmenu="showMenu" v-if="post"
       :class="{ post: true, hidden: post.hidden, unread: !isRead, read: isRead }">
    <div @click="gotoPost" class="subject"><Tex>{{ post.subject }}</Tex></div>
    <div @click="gotoPost" class="body"><Tex>{{ post.body }}</Tex></div>
    <div class="byline">
      <span class="author">
	<User v-bind:key="post.author" :userId="post.author"/>
      </span>
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
	&times; Cancel</button>
    </div>
    <div v-if="(showChildren === true) && ((postId === undefined) || (post && post.children))">
      <Post v-for="child in sortedChildren"
	    :key="`${child}-${sortBy}-${posts[child].children}-${root}`"
	    :postId="child" :sortBy="sortBy" :root="root"/>
    </div>
    <div v-else-if="post">
      <span class="view-replies" @click="viewReplies">View replies&hellip;</span>
    </div>
  </div>
</div>
</template>

<script>
import Tex from '@/components/Tex';
import User from '@/components/User.vue';
import moment from 'moment';
import { mapActions, mapState } from 'vuex';

const {
 getCurrentWindow, Menu, MenuItem, dialog, 
} = require('electron').remote;

export default {
  name: 'Post',
  computed: {
    ...mapState(['posts',
		 'rootPosts',
		 'readPosts',
		 'self',
		 'users']),

    isRead() {
      return (this.readPosts.indexOf(this.postId) >= 0);
    },
    
    post() {
      return this.posts[this.postId];
    },

    children() {
      const f = (p) => (this.self.isStaff) || (!this.posts[p].hidden)
	    || (this.posts[p].hidden && this.posts[p].author === this.self.id);
      
      if (this.post) return this.post.children.filter(f);
      return this.rootPosts.filter(f);
    },

    sortedChildren() {
      if (this.children === undefined) return [];
      
      return this.children.concat().sort((x, y) => {
	const a = this.posts[x];
	const b = this.posts[y];
	let la = 0;
	let lb = 0;
	
	if (this.sortBy === 'default') {
    la = a.upvoteCount - a.downvoteCount - (new Date(a.createdAt)).getTime() / 10000000;
	  lb = b.upvoteCount - b.downvoteCount - (new Date(b.createdAt)).getTime() / 10000000;
  } else if (this.sortBy === 'top') {
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
      'removePost',
      'readPost',
      'unreadPost',
    ]),

    showMenu(e) {
      const menu = new Menu();

      const menuItemReplies = new MenuItem({
	label: this.showChildren ? 'Hide replies' : 'Show replies', 
	click: () => {
	  this.showChildren = !this.showChildren;
	},
      });
      menu.append(menuItemReplies);

      const menuItemRead = new MenuItem({
	label: this.isRead ? 'Mark as unread' : 'Mark as read', 
	click: () => {
	  if (this.isRead) {
	    this.unreadPost(this.postId);
	  } else {
	    this.readPost(this.postId);
	  }
	},
      });
      menu.append(menuItemRead);

      if (((this.post.author === this.self.id) || (this.self.isStaff)) && (!this.post.hidden)) {
	const menuItemDelete = new MenuItem({
	  label: 'Delete post',
	  click: async () => {
	    const result = await dialog.showMessageBox({
	      type: 'question',
	      message: 'Are you sure you want to delete this post?',
	      buttons: ['Yes', 'No'],
	      defaultId: 1,
	    });

	    if (result.response === 0) {
	      this.removePost(this.postId);
	    }
	  },
	});
	menu.append(menuItemDelete);
      }
      
      e.preventDefault();
      menu.popup(getCurrentWindow());
    },
    
    gotoPost(e) {
      if (this.root !== this.postId) {
	this.$router.push({ name: 'forum', params: { id: this.postId } });
	e.preventDefault();
      }
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
    root: String,
  },
  
  components: {
    Tex,
    User,
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

.hidden {
    text-decoration: line-through;
}

.unread {
    background-color: #FFFF8F;
}

.children {
    border-left: solid 1px #eee;
    padding-left: 0.5em;
    margin-left: 0.5em;
    opacity: 0.9;
}

.post:hover {
    background: #eee;
}

.post.unread:hover {
    background:  #DDDD33;
}

.post {
    border-top: solid 1px #eee;
    padding-top: 0.5em;
    margin-top: 0.5em;
    padding-left: 0.25em;
}

.subject {
    font-family: "Computer Modern Serif";
    font-weight: bold;
}

.body {
    font-family: "Computer Modern Serif";
}

.byline {
    font-size: 80%;
    color: #888;
    padding-top: 3pt;
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
