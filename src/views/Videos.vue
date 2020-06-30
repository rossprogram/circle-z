<template>
<Header name="Videos">
  <splitpanes class="default-theme">
    <pane min-size="50" size="70" max-size="80">
      <video-player v-if="playingVideo"
	:src="`http://hls.rossprogram.org.s3.amazonaws.com/${playingVideo}.m3u8`"
	type="application/x-mpegURL" :options="videoOptions"/>
    </pane>
    <pane size="20">
      <ul class="library">
	<li :class="{active: video.video === playingVideo}"
	    @click="playVideo(video.video)" v-for="video in videos" :key="video.video">
	  <span class="title"><Tex>{{ video.title }}</Tex></span>
	  <span class="author">{{ video.author }}</span>
	  <img :src="`http://thumbnails.rossprogram.org.s3.amazonaws.com/${video.video}.0000001.jpg`"/>
	</li>
      </ul>
    </pane>
  </splitpanes>
</Header>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Header from '@/components/Header.vue';
import VideoPlayer from '@/components/VideoPlayer.vue';
import 'video.js/dist/video-js.css';
import Tex from '@/components/Tex';

export default {
  computed: {
    ...mapState(['videos', 'playingVideo']),
  },
  
  data() {
    return {
      videoOptions: {
	autoplay: false,
	controls: true,
	fill: true,
      },
    };
  },
  
  methods: {
    ...mapActions([
      'getVideos',
      'playVideo',
      'getVideo',
    ]),

  },

  
  mounted() {
    this.getVideos();
  },
  
  components: {
    Header,
    VideoPlayer,
    Tex,
  },
  name: 'Videos',
};

</script>

<style scoped lang="scss">

  li.active {
  background-color: #ddd;
  }

  ul.library li.active:hover {
  background-color: #ddd;
  }
  
  ul.library {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-y: scroll;
  }
  
  ul.library li {
  list-style-type:none;
  margin: 0;
  padding: 0;
  padding: 6pt;
  margin-bottom: 12pt;
  padding-bottom: 12pt;
  }

  ul.library li:hover {
  background-color: #eee;
  }
  
  ul.library li .title {
  display: inline-block;
  font-weight: bold;
  font-family: "Computer Modern Serif";
  }

  ul.library li .author {
  display: inline-block;
  float: right;
  opacity: 0.3;
  margin-left: 1em;
  }
  

  ul.library li img {
  width: 100%;
  }
  
</style>
