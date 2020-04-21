<template>
<div class="user-list">
  <h2><input class="search" type="text" placeholder="Search users…"></h2>
  <div class="search-box">
    
  </div>
  <ul>
    <Channel name="foyer" count="12"/>
    <Channel name="somany" count="10"/>      
    <Channel name="hello"/>
    <Channel name="goodbye"/>
    <Channel name="whee" count="912"/>
    <Channel name="what"/>
    <Channel name="butyes"/>
    <Channel name="aroom"/>
  </ul>
</div>
</template>

<script>
import Channel from './Channel.vue';

export default {
  components: {
    Channel,
  },
  data() {
return {
    usernames: ['bob', 'alice', 'jane'],
  };
},
  name: 'UserList',
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .search {
  height: 10pt;
  border: 0;
  width: 100%;
  margin-right: 6pt;
  outline: none;
  }
  
  
.user-list {
    background: white;
    color: black;
    padding: 0;
    height: 100vh;    
    margin: 0;
    overflow-y: auto;
    overflow-x: hidden;
    user-select: none;    
}

h2 {
    color: white;
    margin-top: 6pt;
    margin-bottom: 6pt;
    padding-bottom: 6pt;
    font-size: 10pt;
    padding-left: 6pt;
    padding-right: 6pt;    
    border-bottom: 1px solid #ddd;
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
