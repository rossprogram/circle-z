<template>
<Header name="About">
  <div class="page">
    <div class="content">
      <h3>What is this?</h3>
      <p><img alt="Circle Z logo" src="../assets/icon.png"/>
	This is <span class="circle">ℤ</span>, or
	&ldquo;C<span class="irc">irc</span>le ℤ,&rdquo; an
	<a target="_blank" @click.prevent="openExternalBrowser"
	   href="https://en.wikipedia.org/wiki/Internet_Relay_Chat">IRC</a>
	client with special features to facilitate online mathematics
	courses.  This platform was designed specifically for
	the <a target="_blank" @click.prevent="openExternalBrowser"
	       href="https://rossprogram.org/">Ross Mathematics
	  Program</a>.</p>

      <div v-if="true || everConnected === false">
	<h3>First time here?</h3>
	<p>If this is your first time here, you should head to 
	  <router-link :to="{ name: 'settings' }">Settings</router-link>
	  to configure your connection.
	</p>
	<p>After you've connected, you can visit the various rooms and
	discuss mathematical ideas with your friends.</p>
      </div>
      
    </div>
    <footer>
      <p>Copyright &copy; 2020, Jim Fowler.</p>
      <p>This program comes with <strong>ABSOLUTELY NO WARRANTY</strong>.</p>
      <p>This is <a target="_blank" @click.prevent="openExternalBrowser" href="https://github.com/rossprogram/circle-z/blob/master/LICENSE">free software</a>, and you are welcome to redistribute it
	under certain conditions.</p>
    </footer>
  </div>
</Header>
</template>

<script>
import Header from '@/components/Header.vue';
import { mapState } from 'vuex';

const { remote } = require('electron');

export default {
  name: 'Home',

  computed: {
    ...mapState(['everConnected']),
  },
  
  components: {
    Header,
  },
  methods: {
    openExternalBrowser(e) {
      remote.shell.openExternal(e.target.href);
    },
  },
};
</script>

<style scoped lang="scss">
  .page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  }

  p {
      margin-bottom: 6pt;
      margin-top: 0;
  }
  
  h3 {
      margin-bottom: 3pt;
      margin-top: 12pt;
  }

  .content {
  }


  footer p {
  color: gray;
  margin: 0;
  }
  
  .irc {
  font-weight: bold;
  text-decoration: underline;
  }
  
  .circle {
  display: inline-block;
  text-align: center;
    border-radius: 50%;
    width: 14pt;
  height: 14pt;
  border: solid black 0.5pt;
  }

  img {
  float: right;
  width: 15vh;
  height: 15vh;
  }
  
</style>
