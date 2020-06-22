<template>
<span @click="openPrivateMessages">
  <span :class="{ user: true, staff: user.isStaff }"
	>@</span><span>{{ user.username }}<sup v-if="user.isStaff"><font-awesome-icon icon="star"/></sup>
  </span>
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
	  name: 'user',
	  params: { id: this.userId }, 
	},
      );
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

sup {
    font-size: 40%;
    opacity: 0.25;
}

.staff {
}
</style>
