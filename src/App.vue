<template>
  <div>
    <Snackbar/>
    <router-view v-if="$route.meta && $route.meta.fullscreen"/>
    <splitpanes v-else class="default-theme">
      <pane min-size="10" size="20" max-size="40">
	<ChannelList/>
      </pane>
      <pane size="60">
	<router-view/>
      </pane>
    </splitpanes>
  </div>
</template>

<script>
import ChannelList from '@/components/ChannelList.vue';
import Snackbar from '@/components/Snackbar.vue';
import '@/fonts/serif/cmun-serif.css';
import '@/fonts/sans/cmun-sans.css';
import { mapActions } from 'vuex';

export default {
  components: {
    ChannelList,
    Snackbar,
  },

  methods: {
    ...mapActions(['initialize']),
  },

  created() {
    this.initialize();
  },
};
</script>

<style lang="scss">
  
@font-face {
  font-family: system;
  font-style: normal;
  font-weight: 300;
src: local(".SFNSText-Light"),
  local(".HelveticaNeueDeskInterface-Light"),
  local(".LucidaGrandeUI"),
  local("Ubuntu Light"),
  local("Segoe UI Light"),
  local("Roboto-Light"),
  local("DroidSans"),
  local("Tahoma");
}

body {
  font-family: "Computer Modern Sans";
  margin: 0;
  height: 100vh;
  background-color: white;
  user-select: none;
}

html,body{margin:0;padding:0;}

#app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}

.splitpanes.default-theme .splitpanes__pane {
    background-color: white !important;
}

.splitpanes.default-theme .splitpanes__splitter {
    background-color: #fff !important;
    border: 0 !important;
}

#nav {
  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

</style>
