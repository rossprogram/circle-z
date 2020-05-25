<template>
<Header :name="`${this.$route.params.id}/editor`">
  <splitpanes class="default-theme">
    <pane min-size="50" size="70" max-size="80">
      <textarea ref="textarea"></textarea>
    </pane>
    <pane size="20">
      <div class="wysiwyg">
	<Tex :key="content">{{ content }}</Tex>
      </div>
    </pane>
  </splitpanes>
</Header>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Header from '@/components/Header.vue';
import CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/lib/codemirror.css';
import Tex from '@/components/Tex';
import { connectAutomergeDoc } from 'automerge-codemirror';
import Automerge from 'automerge';

// Make CodeMirror available globally so the modes' can register themselves.
window.CodeMirror = CodeMirror;
const stex = import('codemirror/mode/stex/stex'); // eslint-disable-line no-unused-vars

export default {
  computed: {
    ...mapState(['transcripts', 'joinedUsers']),
  },

  data() {
    return {
      content: '',
      codemirror: undefined,
      commandline: '',
      document: undefined,
      disconnectCodeMirror: undefined,
    };
  },
  
  methods: {
    ...mapActions(['join',
    ]),

    connectCodeMirror() {
      let options = {};
      options = {
	lineNumbers: true,
	mode: 'stex',
	matchBrackets: true,
      };

      this.codemirror =	CodeMirror.fromTextArea(this.$refs.textarea,
						options);
      
      this.codemirror.setSize('100%', '100%');
      
      //this.codemirror.on('change', (cm) => {
      //this.content = cm.getValue();
      //});
      this.document = Automerge.change(Automerge.init(), (doc) => {
	doc.text = new Automerge.Text();
      });
	
      const watchableDoc = new Automerge.WatchableDoc(this.document);
      watchableDoc.registerHandler((x) => {
	const currentDoc = Automerge.init();
	const newDoc = x;
	const changes = Automerge.getChanges(currentDoc, newDoc);

	console.log(JSON.stringify(x));
	console.log(JSON.stringify(changes));
      });
      
      // Create a connect function linked to an Automerge document
      const connectCodeMirror = connectAutomergeDoc(watchableDoc);


      // Connect a CodeMirror instance
      const getText = (doc) => doc.text;
      this.disconnectCodeMirror = connectCodeMirror(this.codemirror, getText);
    },

    destroy() {
      // garbage cleanup
      const element = this.codemirror.doc.cm.getWrapperElement();
      return element && element.remove && element.remove();
    },
  },
  
  // Sometimes these are re-used, so between mounted and
  // beforeRouteUpdate we capture both possibilities
  beforeRouteUpdate(to, from, next) {
    this.join({ channel: to.params.id });
    next();
  },
  
  mounted() {
    this.connectCodeMirror();
    
    return this.join({ channel: this.$route.params.id });
  },

  beforeDestroy() {
    this.disconnectCodeMirror();
    this.destroy();
  },
  
  components: {
    Tex,
    Header,
  },
  name: 'Editor',
};

</script>

<style scoped lang="scss">

.CodeMirror {
  height: 100% !important;
}

.wysiwyg {
font-family: "Computer Modern Serif";
}  

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
