<template>
<Header :name="this.$route.params.id/editor">
  <splitpanes class="default-theme">
    <pane min-size="50" size="70" max-size="80">
      <p>A codemirror editor!</p>
    </pane>
    <pane size="20">
      <p>Here is the output</p>
    </pane>
  </splitpanes>
</Header>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Header from '@/components/Header.vue';

export default {
  computed: {
    ...mapState(['transcripts', 'joinedUsers']),
  },

  data() {
    return {
      commandline: '',
    };
  },
  
  methods: {
    ...mapActions(['join',
    ]),

  },

  // Sometimes these are re-used, so between mounted and
  // beforeRouteUpdate we capture both possibilities
  beforeRouteUpdate(to, from, next) {
    this.join({ channel: to.params.id });
    next();
  },
  
  mounted() {
    return this.join({ channel: this.$route.params.id });
  },
  
  components: {
    Header,
  },
  name: 'Editor',
};

</script>

<style scoped lang="scss">
  .user-list {
  height: 100%;
  padding-left: 6pt;
  border-left: solid #aaa 1px;
  }
  
  .chat {
      height: 100%;
      padding: 0;
      margin: 0;
  display: flex;
  flex-direction: column;
    align-content: space-between;
  }
  
  div.transcript {
  flex-grow: 1;
  overflow-y: auto;
  user-select: text;
  }

  input.message:focus {
  border: 0;
  outline: none;
  }
  
  .message {
  border: 0;
  padding: 0pt;
  padding: 6pt;
  margin: 0;
  font-family: monospace;
  }
  
  h2 {
  height: 12pt;
    color: black;
    margin-top: 6pt;
    margin-bottom: 6pt;
    padding-bottom: 6pt;
    font-size: 10pt;
    padding-left: 6pt;
  border-bottom: 1px solid #eee;
  user-select: none;    
}
</style>
