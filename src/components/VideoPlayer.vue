<template>
<video disablepictureinpicture ref="videoPlayer" class="video-js"
       ></video>
</template>

<script>
import videojs from 'video.js';

require('videojs-contrib-quality-levels');
 
// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-http-source-selector');

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
    type: {
      type: String,
    },
  },

  watch: {
    src() {
      this.player.src({ type: this.type, src: this.src });
    },
  },
  
  data() {
    return {
      player: null,
    };
  },
  mounted() {
    this.options.controlBar = {
      children: [
        'playToggle',
        'progressControl',
        'volumePanel',
        'qualitySelector',
	'playbackRateMenuButton',
        'fullscreenToggle',
      ],
    };
    this.options.playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    this.player = videojs(this.$refs.videoPlayer, this.options, () => {
      console.log('onPlayerReady', this);
      console.log(this.src);
      console.log(this.type);
	this.player.httpSourceSelector();
      if (this.src) {

	  this.player.src({ type: this.type, src: this.src });
      }
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
