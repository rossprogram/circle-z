<template>
<Header name="Videos">
  <splitpanes class="default-theme">
    <pane min-size="50" size="70" max-size="80">
      <video-player :src="playingVideo" :options="videoOptions"/>
    </pane>
    <pane size="20">
      <p>LIBRARY</p>
      <p>playingVideo = {{playingVideo}}</p>
      <p>{{videos}}</p>
    </pane>
  </splitpanes>
</Header>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Header from '@/components/Header.vue';
import VideoPlayer from '@/components/VideoPlayer.vue';
import 'video.js/dist/video-js.css';

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
      'getVideo',
    ]),

  },

  
  mounted() {
    this.getVideos();
    this.getVideo({ video: 'test1.mp4' });
    // return this.join({ room: this.$route.params.id });
  },
  
  components: {
    Header,
    VideoPlayer,
  },
  name: 'Videos',
};

</script>

<style scoped lang="scss">
</style>
