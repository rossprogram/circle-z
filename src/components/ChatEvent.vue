<template>
  <div>
    <span class="actor"><span class="actor-name">{{ this.actor }}</span></span>
    <span class="message">
      <span v-if="this.timestamp" class="timestamp">{{ this.timestamp | moment }}</span>    
      <Tex>{{ this.message }}</Tex>
    </span>
  </div>
</template>

<script>
import Tex from '@/components/Tex';
import moment from 'moment';

export default {
  name: 'ChatEvent',
  props: {
    actor: String,
    message: String,
    timestamp: Date,
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
    width: 15%;
    text-align: right;
    vertical-align: baseline;
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
    width: 85%;
    display: inline-block;
    vertical-align: text-top;
    }
</style>
