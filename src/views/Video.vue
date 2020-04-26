<template>
  <div class="jitsi">
    <Jitsi :room="roomName"
	   :password="password"
	   :name="this.nick"
	   :email="this.nick + '@rossprogram.org'"
	   @hangup="hangup"/>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Jitsi from '@/components/Jitsi';
import crypto from 'crypto';

export default {
  computed: {
    ...mapState(['nick']),

    roomName: {
      get() {
	const channel = this.$route.params.id;
	return `${channel.replace('#', '').replace(/#/g, '_')}.rossprogram.org`;
      },
    },

    password: {
      get() {
	const hash = crypto.createHash('sha256')
              .update(this.$route.params.id)
              .digest('base64');
	return hash;
      },
    },
  },

  data() {
    return {
      connection: undefined,
      room: undefined,
    };
  },
  
  methods: {
    ...mapActions([]),

    hangup() {
      console.log('HANGUIP');
      this.$router.push({
	name: 'chat',
	params: { id: this.$route.params.id }, 
      });
    },
  },

  created() {
  },
  
  mounted() {
  },
  
  components: {
    Jitsi,
  },
  name: 'Editor',
};

</script>

<style scoped lang="scss">
.jitsi {
    width: 100%;
    height: 100%;
}
</style>
