<template>
<div id="content">
  <div id="video-container">
    <video id="video"></video>
</div>
  </div>
</template>

<script>
import Hls from 'hls.js';

export default {
  computed: {

  },

  data() {
    return {
    };
  },
  
  methods: {
  },

  beforeRouteUpdate() {
    console.log('update');
  },
    
  mounted() {
    if (Hls.isSupported()) {
      const video = document.getElementById('video');
      const hls = new Hls();
      // bind them together
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource('https://dvz9ly91cfhhm.cloudfront.net/stream/index.m3u8');
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log(`manifest loaded, found ${data.levels.length} quality level`);
	});
	video.play();
	video.currentTime = video.duration - 1;
      });
    }
  },

  beforeDestroy() {
  },
  
  components: {
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
  }

#video-container
{
    width: 100vw; 
    height: 56.25vw; /* height:width ratio = 9/16 = .5625  */
    max-height: 100vh;
    max-width: 177.78vh; /* 16/9 = 1.778 */
    margin: auto;
    position: absolute;
    top:0;bottom:0; /* vertical center */
    left:0;right:0; /* horizontal center */
}


#video {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}

</style>
