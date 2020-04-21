<template>
  <div class="channel-list">
    <h2>irc.rossprogram.org</h2>
    <h3>Rooms</h3>
    <ul>
      <Channel name="##foyer" :count="12"/>
      <Channel name="####somany" :count="10"/>      
      <Channel name="#hello"/>
      <Channel name="#goodbye"/>
      <Channel name="#whee" :count="912"/>
      <Channel name="#what"/>
      <Channel name="#butyes"/>
      <Channel name="#aroom"/>
      <router-link tag='li' :to="{ name: 'rooms' }">
	<a>
	  room list
	</a>
      </router-link>  
    </ul>

  </div>
</template>

<script>
import Channel from './Channel.vue';

export default {
  components: {
    Channel,
  },
  name: 'ChannelList',
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

  
.channel-list {
    background: #334;
    color: white;
    padding: 0;
    height: 100vh;    
    margin: 0;
    overflow-y: auto;
    overflow-x: hidden;
    user-select: none;    
}

h2 {
    font-weight: normal;
    height: 12pt;
    color: white;
    margin-top: 6pt;
    margin-bottom: 6pt;
    padding-bottom: 6pt;
    font-size: 10pt;
    padding-left: 6pt;
    border-bottom: 1px solid #444;
}

h3 {
    font-variant: small-caps;
    color: #99a;
    text-transform: uppercase;
    margin-top: 12pt;
    margin-bottom: 4pt;
    font-size: 8pt;
    padding-left: 6pt;
}

ul {
    font-size: 10pt;
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
    display: block;
    padding: 0;
    padding-left: 12pt;
    padding-bottom: 6pt;
    padding-top: 6pt;
    margin-bottom: 0;
    margin-top: 0;
    padding-right: 6pt;
}

  li.router-link-exact-active {
background-color: #45f;
}


li a {
text-decoration: none;
color: #999;
text-transform: uppercase;
font-size: 8pt;
}


</style>
