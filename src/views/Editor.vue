<template>
  <div id="content">
<splitpanes horizontal class="default-theme">
  <pane min-size="50" size="70" max-size="100">
    <splitpanes class="default-theme">
      <pane min-size="20" size="70" max-size="80">
	<div id="editor"  tabindex="-1" @keyup.enter="maybeCompile"></div>
      </pane>
      <pane class="viewer-pane">
	  <div id="toolbar">
	    <button :class='{ dirty: needsRecompile }'
		    id="compile" @click="compile"><font-awesome-icon icon="hammer" /> Compile</button>
	    <span id="zoom">
	      <label for="zoom">Zoom</label>
	      <input name="zoom" type="number" max="300" min="20" step="10" v-model="scalePercent"/>
	    </span>
	  </div>
	  <div id="viewer">
	    <Dvi :data="dvi" v-bind:style="{zoom: `${scalePercent}%`}"/>
	  </div>
      </pane>
    </splitpanes>
  </pane>
  <pane size="30">
    <div id="console"><pre>{{terminalOutput}}</pre></div>
  </pane>
</splitpanes>
</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Dvi from '@/components/Dvi.vue';
import ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-min-noconflict/theme-chrome';
import 'ace-builds/src-min-noconflict/mode-latex';
import DiffMatchPatch from 'diff-match-patch';
import { AceMultiCursorManager, AceMultiSelectionManager, AceRangeUtil } from '@convergencelabs/ace-collab-ext';
import '@convergencelabs/ace-collab-ext/css/ace-collab-ext.css';
import { debounce } from 'underscore';
import stringHash from 'string-hash';

const { getCurrentWindow } = require('electron').remote;
const { ipcRenderer } = require('electron');

const { Range } = ace;
const diffMatchPatch = new DiffMatchPatch();

// https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
function stringToColor(str) {
  const hash = stringHash(str);
  let colour = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xFF; // eslint-disable-line no-bitwise
    colour += (`00${value.toString(16)}`).substr(-2);
  }
  return colour;
}

export default {
  computed: {
    ...mapState(['documents', 'cursors', 'selections',
		 'texFiles',
		 'users', 'self', 'connected']),

    needsRecompile: {
      get() {
	return stringHash(this.document) !== this.compiledVersion;
      },
    },
    
    document: {
      get() {
	const result = this.documents[this.$route.params.id];
	if (result) return result;
	return '';
      },
    },
    documentCursors: {
      get() {
	return this.cursors[this.$route.params.id];
      },
    },
    documentSelections: {
      get() {
	return this.selections[this.$route.params.id];
      },
    },
  },

  data() {
    return {
      scalePercent: 100,
      contentBackup: '',
      terminalOutput: '',
      dvi: undefined,
      editor: undefined,
      cursorManager: undefined,
      resizeObserver: undefined,
      editorElement: undefined,
      compiledVersion: undefined,
    };
  },
  
  methods: {
    ...mapActions(['updateDocument', 'fetchDocument', 'who',
		   'updateDocumentCursor', 'updateDocumentSelection',
		   'getTexFiles',
		  ]),

    maybeCompile(e) {
      if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
	this.compile();
	e.preventDefault();
      }
    },
    
    compile() {
      this.terminalOutput = '';

      this.compiledVersion = stringHash(this.document);
      ipcRenderer.send('tex', this.document, this.texFiles);
    },

    destroy() {
      this.resizeObserver.observe(this.editorElement);
      this.editor.destroy();
    },

    leave() {
      const browserWindow = getCurrentWindow();
      browserWindow.close();
    },
  },
  
  // Sometimes these are re-used, so between mounted and
  // beforeRouteUpdate we capture both possibilities
  beforeRouteUpdate(to, from, next) {
    //this.join({ channel: to.params.id });
    next();
  },

  watch: {
    connected(isConnected) {
      this.editor.setReadOnly(!isConnected);
    },
    
    documentCursors: {
      deep: true,
      handler(value) {
	console.log('self=', this.self);
	console.log('state=', this.$store.state);

	Object.keys(value).forEach((userId) => {
	  if (userId !== this.self.id) {
	    const cursor = value[userId];
	    try {
	      this.cursorManager.setCursor(userId, cursor);
	    } catch (e) {
	      this.cursorManager.addCursor(userId,
					   this.users[userId].username,
					   stringToColor(this.users[userId].username),
					   cursor);
	    }
	  }
      });
      },
    },

    documentSelections: {
      deep: true,
      handler(value) {
	Object.keys(value).forEach((userId) => {
	  if (userId !== this.self.id) {
	    const range = value[userId];
	    try {
	      this.selectionManager.setSelection(userId,
						 [AceRangeUtil.fromJson(range)]);
	    } catch (e) {
	      this.selectionManager.addSelection(userId,
						 this.users[userId].username,
						 stringToColor(this.users[userId].username),
						 [AceRangeUtil.fromJson(range)]);
	    }
	  }
	});
      },
    },
    
    document() {
      console.log('watch document!');
      if (this.contentBackup === undefined) {
	this.editor.setValue(this.document, -1);
	this.contentBackup = this.document;
	return;
      }
      
      const doc = this.editor.getSession().getDocument();
      
      const patches = diffMatchPatch.patch_make(this.contentBackup, this.document);
      const results = diffMatchPatch.patch_apply(patches, this.editor.getValue());
      const diff = diffMatchPatch.diff_main(this.editor.getValue(), results[0], true);
      
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
      
      this.contentBackup = this.editor.getValue();
    },
  },
  
  mounted() {

    console.log('contentBackup', this.contentBackup === undefined);

    this.who();
    this.getTexFiles();
    this.fetchDocument(this.$route.params.id);
    
    ipcRenderer.on('dvi', (event, arg) => {
      console.log('getting compiled output');
      this.dvi = Buffer.from(arg);
      console.log(this.dvi.length);
    });

    ipcRenderer.on('latex-console', (event, arg) => {
      this.terminalOutput += arg;
      const container = this.$el.querySelector('#console');
      container.scrollTop = container.scrollHeight;
    });
    
    const browserWindow = getCurrentWindow();
    browserWindow.setTitle(`${this.$route.params.id} editor - Circle Z`);

    this.editorElement = this.$el.querySelector('#editor');
  
    this.editor = ace.edit('editor');
    this.editor.setTheme('ace/theme/chrome');
    this.editor.session.setMode('ace/mode/latex');
    this.editor.resize();
    this.editor.getSession().setUseWrapMode(true);
    this.editor.setShowPrintMargin(false);

    this.resizeObserver = new ResizeObserver(() => {
      this.editor.resize();
    });
    this.resizeObserver.observe(this.editorElement);
    
    this.contentBackup = undefined;
    
    this.editor.focus();
    
    this.cursorManager = new AceMultiCursorManager(this.editor.getSession());
    this.selectionManager = new AceMultiSelectionManager(this.editor.getSession());

    this.editor.on('change', debounce(() => {
      const content = this.editor.getValue();
      if (this.document !== content) {
	this.updateDocument({
	  id: this.$route.params.id,
	  text: content, 
	});
      }
      
      this.contentBackup = content;
    }, 51 /* milliseconds debounce */));

    // Emitted when the cursor position changes.
    this.editor.getSelection().on('changeCursor', debounce(() => {
      const cursor = this.editor.getSelection().getCursor();
      this.updateDocumentCursor({
	id: this.$route.params.id,
	cursor,
      });
    }, 53 /* milliseconds debounce */));

    // Emitted when the selection changes.
    this.editor.getSelection().on('changeSelection', debounce(() => {
      const range = this.editor.getSelection().getRange();
      this.updateDocumentSelection({
	id: this.$route.params.id,
	range,
      });
    }, 59 /* milliseconds debounce */));
  },

  beforeDestroy() {
    this.destroy();
  },
  
  components: {
    Dvi,
  },
  name: 'Editor',
};


</script>

<style scoped lang="scss">

#console {
    overflow-x: hidden;
    overflow-y: scroll;
    height: 100%;
    background: black;
}

#console pre {
    height: 100%;
    padding: 6pt;
    color: #eee;
}


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

  #content {
      overflow: hidden;
      padding: 0;
      margin: 0;
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-content: space-between;
      position: relative;
  }

  .viewer-pane {
      display: flex;
      flex-flow: column nowrap;
      align-items: stretch;
}
  
  #toolbar {
    padding: 3pt;
    box-shadow: 0px 0px 15px 5px rgba(0, 0, 0, 0.2);
    z-index: 100;
}


  #viewer {
      height: 100%;
      width: 100%;
      overflow-y: scroll;
      overflow-x: scroll;
  }
  
  button {
    padding: 0;
    margin: 0;
    margin-right: 6pt;
    vertical-align: top;
}

@keyframes shadow-pulse
{
     0% {
          box-shadow: 0 0 0 0px rgba(0, 0, 0, 0.3);
     }
     100% {
          box-shadow: 0 0 0 2pt rgba(0, 0, 0, 0);
     }
}

.dirty
{
     animation: shadow-pulse 1s infinite;
}
</style>
