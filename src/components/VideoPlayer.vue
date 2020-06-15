<template>
  <video disablepictureinpicture ref="videoPlayer" class="video-js"></video>
</template>

<script>
import videojs from 'video.js';

export default {
  name: 'VideoPlayer',
  props: {
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    src: {
      type: String,
    },
  },

  watch: {
    src() {
      this.player.src(this.src);
    },
  },
  
  data() {
    return {
      player: null,
    };
  },
  mounted() {
    this.player = videojs(this.$refs.videoPlayer, this.options, function onPlayerReady() {
      console.log('onPlayerReady', this);
    });
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  },
};
</script>

<style>
button.vjs-picture-in-picture-control {
  display: none !important;
}

</style>
