<template>
    <span class="channel">
      <span class="full-name">
	<span class="hash-and-name">
	  <span class="hashes">
	    <font-awesome-icon icon="hashtag"
			       v-for="n in this.name.replace(/[^#]/g,'').length" v-bind:key="n" />
	  </span>
	  <span v-bind:class="{ 'channel-name': true, unread: this.count > 0 }">{{
	    this.name.replace(/#/g,'') }} 	    {{ }}</span>
	</span>
	<span class="counter" v-if="this.count > 0">{{ this.count }}</span>            
      </span>
    </span>
</template>

<script>
export default {
  name: 'Channel',
  props: {
    name: String,
    count: Number,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.channel {
cursor: pointer;
}

  .unread {
      font-weight: bold;
  }

  
.full-name {
white-space: nowrap;
justify-content: space-between;
  display: flex;

}

  .channel-name {
  margin-left: 2pt;
}
  
.counter {
font-weight: bold;
   text-align: right;
  background: #999;
  font-size: 6pt;
border-radius: 8pt;
margin: 1pt;
padding: 2pt;
padding-right: 4pt;
padding-left: 4pt;
}
  
.hashes {
    letter-spacing: -1pt;
    color: #aaa;
}

</style>
