<template>
  <div class="event">

    <span :class="{ actor: true, action: this.action, part: this.part, join: this.join}">
      <span class="actor-name">
	<User v-bind:key="actor" :userId="actor"/>
      </span>
    </span><span v-if="image"><img :src="image"/></span>
    <span v-else :class="{ message: true, action: this.action, part: this.part, join: this.join}">
      <span v-if="this.timestamp" class="timestamp">{{ new Date(this.timestamp) | moment }}</span>
    
      <Tex>{{ this.message ? this.message : this.action }}</Tex>
    </span>
    
  </div>
</template>

<script>
import Tex from '@/components/Tex';
import User from '@/components/User.vue';
import moment from 'moment';
import { mapState } from 'vuex';

export default {
  name: 'ChatEvent',
  computed: {
    ...mapState(['users']),

    username: {
      get() {
	if (this.users[this.actor]) return this.users[this.actor].username;
	return 'unknown';
      },
    },
  },
	       
  props: {
    actor: String,
    message: String,
    image: String,
    action: String,    
    timestamp: String,
    part: Boolean,
    join: Boolean,
  },
  components: {
    Tex,
    User,
  },
  filters: {
    moment(date) {
      return moment(date).format('HH:mm:ss');
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  
.actor {
    display: inline-block;
    color: #888;
    text-align: right;
    vertical-align: top;
    overflow: hidden;
    width: 1in;
}

.action {
    font-family: "Computer Modern Sans"  !important;
    color: black;
    font-size: 100%;
}

.part {
    color: red;
}
.join {
    color: green;
}


.timestamp {
    color: black;
    float: right;
    font-size: 70%;
    font-family: "Computer Modern Sans";
    margin-left: 1em;
    margin-right: 0.5em;
    opacity: 0.4;
    user-select: none;
}

.actor-name {
    //padding-right: 6pt;
}

.actor-name::after {
  content: "\00a0";
}

.message {
    font-family: "Computer Modern Serif";
    display: inline-block;
    vertical-align: text-top;
    width: calc(100% - 1in);
}

.message div {
    display: inline-block;
}

img {
    max-width: 100%;
}

</style>
