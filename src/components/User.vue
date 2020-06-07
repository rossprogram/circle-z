<template>
<span @click="openPrivateMessages">
  <span>@{{ user.username }}</span>
</span>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['users']),

    user() {
      return this.users[this.userId];
    },
  },
      
  name: 'User',
  props: {
    userId: String,
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
