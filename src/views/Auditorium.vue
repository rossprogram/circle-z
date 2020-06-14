<template>
<div id="content">
  <video-player :options="videoOptions"/>
</div>
</template>

<script>
import VideoPlayer from '@/components/VideoPlayer.vue';
import 'video.js/dist/video-js.css';

export default {
  computed: {

  },
  
  data() {
    return {
      videoOptions: {
	autoplay: true,
	controls: true,
	fill: true,
	sources: [
	  {
	    src: 'https://dvz9ly91cfhhm.cloudfront.net/stream/index.m3u8',
	    type: 'application/x-mpegURL',
	  },
	],
      },
    };
  },
  
  methods: {
  },

  beforeRouteUpdate() {
    console.log('update');
  },
    
  mounted() {
    /*
    if (Hls.isSupported()) {
      const video = document.getElementById('video');
      const hls = new Hls();
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource('');
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log(`manifest loaded, found ${data.levels.length} quality level`);
	});
	video.play();
	video.currentTime = video.duration - 1;
      });
      }*/
  },

  beforeDestroy() {
  },

  components: {
    VideoPlayer,
  },

  name: 'Auditorium',
};


</script>

<style scoped lang="scss">

  #content {
      width: 100%;
      height: 100%;
      background: black;
      position: absolute;
      top: 0;
      left: 0;
  }


#video {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}

</style>
