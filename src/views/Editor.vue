<template>
<Header :name="`${this.$route.params.id}/editor`"
	@leave='leave'
	:buttons="{ Leave: 'sign-out-alt' }">
  <splitpanes class="default-theme">
    <pane min-size="50" size="70" max-size="80">
      <div id="editor"></div>
    </pane>
    <pane size="20">
      <div class="wysiwyg">
      </div>
    </pane>
  </splitpanes>
</Header>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Header from '@/components/Header.vue';
import ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-min-noconflict/theme-chrome';
import 'ace-builds/src-min-noconflict/mode-latex';
import DiffMatchPatch from 'diff-match-patch';
import { AceMultiCursorManager } from '@convergencelabs/ace-collab-ext';
import '@convergencelabs/ace-collab-ext/css/ace-collab-ext.css';
import { debounce } from 'underscore';

const { Range } = ace;
const diffMatchPatch = new DiffMatchPatch();

export default {
  computed: {
    ...mapState(['documents']),

    document: {
      get() {
	return this.documents[this.$route.params.id];
      },
    },
  },

  data() {
    return {
      contentBackup: '',
      editor: undefined,
      cursorManager: undefined,
    };
  },
  
  methods: {
    ...mapActions(['updateDocument', 'fetchDocument',
    ]),

    destroy() {
      this.editor.destroy();
    },

    leave() {
      this.$router.push({ name: 'rooms' });
    },
  },
  
  // Sometimes these are re-used, so between mounted and
  // beforeRouteUpdate we capture both possibilities
  beforeRouteUpdate(to, from, next) {
    //this.join({ channel: to.params.id });
    next();
  },

  watch: {
    document() {
      if (this.editor) {
	//console.log('oldval', oldval);
	//console.log('newval', newval);
	//this.contentBackup = this.editor.getSession().getValue();
	//console.log('contentBAckup=', this.contentBackup);
	console.log('document=', this.document);
	const diff = diffMatchPatch.diff_main(this.contentBackup, this.document, true);

	const doc = this.editor.getSession().getDocument();
	console.log('diff=', diff);
	// https://stackoverflow.com/questions/25083183/how-can-i-get-and-patch-diffs-in-ace-editor
	let offset = 0;
	diff.forEach((chunk) => {
	  const op = chunk[0];
	  const text = chunk[1];
	  
	  if (op === 0) {
            offset += text.length;
	  } else if (op === -1) {
            doc.remove(Range.fromPoints(
              doc.indexToPosition(offset),
              doc.indexToPosition(offset + text.length),
            ));
	  } else if (op === 1) {
            doc.insert(doc.indexToPosition(offset), text);
            offset += text.length;
	  }
	});
	  
	this.contentBackup = this.document;
	//this.contentBackup = this.editor.getSession().getValue();
	  // FIXME: figure out if the changes were before or after the cursor position
	//const position = this.editor.getCursorPosition();
	//this.editor.setValue(this.document, 1);
	//this.editor.moveCursorToPosition(position);
	  
	//console.log(this.editor.getValue(), this.document);
      }
    },
  },
  
  mounted() {
    window.Range = Range;
    
    this.fetchDocument(this.$route.params.id);
    
    this.editor = ace.edit('editor');
    this.editor.setTheme('ace/theme/chrome');
    this.editor.session.setMode('ace/mode/latex');
    this.editor.resize();

    this.editor.setValue(this.document, -1);
    this.contentBackup = this.document;
    this.editor.focus();
    
    this.cursorManager = new AceMultiCursorManager(this.editor.getSession());

    // Add a new remote cursor with an id of "uid1", and a color of orange.
    this.cursorManager.addCursor('uid1', 'User 1', 'orange', { row: 0, column: 0 });
    console.log(this.cursorManager);
    
    this.editor.on('change', debounce((e) => {
      console.log('change', e);
      
      const content = this.editor.getValue();
      console.log('content', content);
      if (this.document !== content) {
	this.updateDocument({
	  id: this.$route.params.id,
	  text: content, 
	});
      }
      
      this.contentBackup = content;
    }, 10));

  },

  beforeDestroy() {
    this.destroy();
  },
  
  components: {
    Header,
  },
  name: 'Editor',
};

</script>

<style scoped lang="scss">

  #editor {
  height: 100% !important;
  width: 100%;
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
