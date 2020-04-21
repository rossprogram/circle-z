<template>
<Header name="Room List">
  <button @click='refresh'>Refresh</button>
  <div v-for="channel in channels" v-bind:key="channel">
    {{ channel }}
    
    {{ userCounts[channel] }} users

    {{ topics[channel] }}
  </div>
  
</Header>
</template>

<script>
import Header from '@/components/Header.vue';
import { mapActions, mapState } from 'vuex';

export default {
  name: 'RoomList',
  components: {
    Header,
  },
  computed: {
    ...mapState(['channels', 'userCounts', 'topics']),
  },
  methods: {
    ...mapActions(['list']),

    refresh() {
      this.list();
    },
  },

  mounted() {
    return this.list();
  },

};
</script>
