<template>
  <div>
    <span :class="{ actor: true, action: this.action, part: this.part, join: this.join}">
      <span class="actor-name">{{ username }}</span></span>
    <span :class="{ message: true, action: this.action, part: this.part, join: this.join}">
      <span v-if="this.timestamp" class="timestamp">{{ new Date(this.timestamp) | moment }}</span>
      <Tex>{{ this.message ? this.message : this.action }}</Tex>
    </span>
  </div>
</template>

<script>
import Tex from '@/components/Tex';
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
    action: String,    
    timestamp: String,
    part: Boolean,
    join: Boolean,
  },
  components: {
    Tex,
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
    font-size: 80%;
    width: 20%;
    text-align: right;
    vertical-align: baseline;
}

.action {
    font-weight: bold;
    font-family: "Computer Modern Serif";
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
    float: right;
    font-size: 70%;
    font-family: "Computer Modern Sans";
    margin-left: 1em;
    margin-right: 0.5em;
    opacity: 0.4;
    user-select: none;
}

.actor-name {
    padding-right: 6pt;
}

.message {
    font-family: "Computer Modern Serif";
    width: 80%;
    display: inline-block;
    vertical-align: text-top;
    }

</style>
