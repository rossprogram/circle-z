<template>
<div @click="openPrivateMessages">
  <span>{{ this.nick }}</span>
</div>
</template>

<script>


export default {
  name: 'User',
  props: {
    nick: String,
  },

  methods: {
    openPrivateMessages() {
      this.$router.push(
	{
 name: 'chat',
	  params: { id: this.nick }, 
},
);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">


</style>
