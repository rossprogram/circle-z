<template>
  <div id="content">
    <div id="toolbar">
      <button @click="openFile"><font-awesome-icon icon="file-pdf" /> Open PDF&hellip;</button>
      
      <button :disabled="pdfDocument === undefined"
	      @click="eraseBackground"><font-awesome-icon icon="chalkboard" /> Close PDF</button>

      <button @click="erase"><font-awesome-icon icon="eraser" /> Erase board</button>

      <span id="zoom">
	<label for="zoom">Zoom</label>
	<input name="zoom" type="number" max="300" min="20" step="10" v-model="scalePercent"/>
      </span>
      
      <span id="page-change">
	<button :disabled="(pdfDocument === undefined) || (pageNumber === 1)"
		:style="{'margin-right': '3pt'}"
		@click="previousPage"><font-awesome-icon icon="step-backward" /></button>
	<span :hidden="pdfDocument === undefined"
	      ><input type="number" :max="pageCount" :min="1" v-model="pageNumber"/>
	  of {{ pageCount }}</span>
	<button :disabled="(pdfDocument === undefined) || (pageNumber === pageCount)"
		:style="{'margin-left': '3pt'}"		
		@click="nextPage"><font-awesome-icon icon="step-forward" /></button>
      </span>
    </div>
    <div id="desktop">
      <canvas @mousedown='mousedown' id="canvas"/>
      <div class="pointer" v-for="id in blackboardUsers" :key="id"
	   :style="blackboardPointerStyle(id)">
	<span class="username" :style="{background: stringToColor(id)}">{{ users[id].username }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { throttle } from 'underscore';
import fs from 'fs';
import pdfjs from 'pdfjs-dist/webpack';
import { v4 as uuidv4 } from 'uuid';
import stringHash from 'string-hash';

const { dialog } = require('electron').remote;

function showErrorBox(e) {
  dialog.showMessageBox({
    type: 'error',
    message: e,
    buttons: ['OK'],
  });
}


export default {
  computed: {
    ...mapState(['users', 'connected', 'blackboards', 'pointers']),
    
    blackboard() {
      return this.blackboards[this.$route.params.id];
    },

    pdfBuffer() {
      if (this.blackboard) return this.blackboard.pdf;
      return Buffer.alloc(0);
    },

    ink() {
      if (this.blackboard) return this.blackboard.ink;
      return [];
    },

    inkCount() {
      if (this.blackboard) return this.blackboard.ink.length;
      return 0;
    },

    pageNumber: {
      get() {
	if (this.blackboard) return this.blackboard.page;
	return 0;
      },
      set(n) {
	this.updateBlackboardPage({
	  id: this.$route.params.id,
	  page: parseInt(n, 10),
	}); 
      },
    },

    viewport() {
      if (this.page) return this.page.getViewport({ scale: this.scale });
      const viewBox = [0, 0, 8.5 * 72, 11 * 72];
      return {
	viewBox,
	scale: this.scale,
	rotation: 0,
	offsetX: 0,
	offsetY: 0,
	width: this.scale * viewBox[2],
	height: this.scale * viewBox[3],
      };
    },

    pageCount() {
      if (this.pdfDocument) {
	return this.pdfDocument.numPages;
      } return 1;
    },
    
    blackboardPointers() {
      if (this.pointers[this.$route.params.id]) return this.pointers[this.$route.params.id];
      return {};
    },

    blackboardUsers() {
      return Object.keys(this.blackboardPointers);
    },

    scale() {
      return this.scalePercent / 100.0;
    },
  },
  
  data() {
    return {
      pdfDocument: undefined,      
      page: undefined,
      scalePercent: 100,
      
      drawnInk: {},
      
      previousX: 0,
      previousY: 0,
      currentX: 0,
      currentInk: undefined,
      currentY: 0,
      
      canvas: undefined,
      overlay: undefined,
      ctx: undefined,
    };
  },
  
  methods: {
    ...mapActions(['fetchBlackboard',
		   'updateBlackboardPointer',
		   'setBlackboardPdf',
		   'clearBlackboardInk',
		   'clearBlackboardPdf',
		   'addBlackboardInk',
		   'updateBlackboardPage',
		   'who',
		  ]),

    // https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
    stringToColor(str) {
      const hash = stringHash(str);
      let colour = '#';
      for (let i = 0; i < 3; i += 1) {
	const value = (hash >> (i * 8)) & 0xFF; // eslint-disable-line no-bitwise
	colour += (`00${value.toString(16)}`).substr(-2);
      }
      return colour;
    },
    
    blackboardPointerStyle(id) {
      let x = this.blackboardPointers[id].x * this.scale;
      let y = this.blackboardPointers[id].y * this.scale;

      const dpr = window.devicePixelRatio || 1;

      if (this.canvas) {
	const rect = this.canvas.getBoundingClientRect();
	const scaleX = this.canvas.width / rect.width;
	const scaleY = this.canvas.height / rect.height;


	x = (x * dpr) / scaleX + rect.left;
	y = (y * dpr) / scaleY + rect.top;
      }

      const background = this.stringToColor(id);
      
      return {
	left: `${x}px`, 
	top: `${y}px`,
	background,
      };
    },
    
    erase() {
      this.clearBlackboardInk({
	id: this.$route.params.id,
      });
    },

    eraseBackground() {
      this.clearBlackboardPdf({
	id: this.$route.params.id,
      });
    },
    
    openFile() {
      dialog.showOpenDialog({
	properties: ['openFile'],
      }).then((result) => {
	if (result.canceled === false) {
	  const filePath = result.filePaths[0];
	  
	  fs.readFile(filePath, (err, data) => {
	    if (err) {
	      showErrorBox(err.toString());
	    } else if (data.length > 1024 * 1024) {
		showErrorBox('Your PDF file must be under 1 megabyte; large files result in a suboptimal multi-user experience.');
	      } else {
		const loadingTask = pdfjs.getDocument(data);
		loadingTask.promise.then(() => {
		  this.setBlackboardPdf({
		    id: this.$route.params.id,
		    pdf: data, 
		  });
		}).catch((e) => {
		  showErrorBox(e.toString());
		});
	      }
	  });
	}
      }).catch((err) => {
	showErrorBox(err.toString());
      });
    },

    drawPage() {
      if (this.page) {
	const renderContext = {
	  canvasContext: this.ctx,
	  viewport: this.viewport,
	};
	const renderTask = this.page.render(renderContext);
	
	console.log('starting render...');
	renderTask.promise.then(() => {
	  console.log('render done');
	  this.drawnInk = {};
	  this.drawInk();
	});
      } else {
	this.ctx.fillStyle = 'white';
	this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	this.drawnInk = {};
	this.drawInk();
      }
    },

    drawInk() {
      this.ink.forEach((path) => {
	if (!this.drawnInk[path.uuid]) {
	  this.drawnInk[path.uuid] = true;

	  if (path.points) {
            this.ctx.beginPath();
            this.ctx.moveTo(path.points[0].x * this.scale,
			    path.points[0].y * this.scale);
	    for (let i = 1; i < path.points.length; i += 1) {
              this.ctx.lineTo(path.points[i].x * this.scale,
			      path.points[i].y * this.scale);
	    }
	    this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = this.scale;
            this.ctx.stroke();
            this.ctx.closePath();
	  } else {
	    console.log('bad path', path);
	  }
	}
      });
    },

    // https://pspdfkit.com/blog/2019/using-getcoalescedevents/
    handleDrawing(mode, e) {
      this.previousX = this.currentX;
      this.previousY = this.currentY;

      const dpr = window.devicePixelRatio || 1;
      
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      if (e.touches && e.touches.length === 1) {
	this.currentX = ((e.touches[0].clientX - rect.left) * scaleX) / dpr;
	this.currentY = ((e.touches[0].clientY - rect.top) * scaleY) / dpr;
      } else {
	this.currentX = ((e.clientX - rect.left) * scaleX) / dpr;
	this.currentY = ((e.clientY - rect.top) * scaleY) / dpr;
      }

      this.currentX /= this.scale;
      this.currentY /= this.scale;
      
      if (e.type === 'mousedown' || e.type === 'touchstart') {
	this.currentInk = [{ x: this.currentX, y: this.currentY }];
      }
      
      if (e.type === 'mouseup' || e.type === 'mouseout' || e.type === 'touchend') {
	// send ink!
	if (this.currentInk) {
	  const uuid = uuidv4();
	  this.addBlackboardInk({
	    id: this.$route.params.id,
	    uuid,
	    points: this.currentInk, 
	  });
	  this.drawnInk[uuid] = true;
	  this.currentInk = undefined;
	}
      }
      
      if (e.type === 'mousemove' || e.type === 'touchmove') {
	if (this.currentInk) {
	  this.currentInk.push({ x: this.currentX, y: this.currentY });
          this.ctx.beginPath();
          this.ctx.moveTo(this.previousX * this.scale, this.previousY * this.scale);
          this.ctx.lineTo(this.currentX * this.scale, this.currentY * this.scale);
	  this.ctx.strokeStyle = 'black';
	  this.ctx.lineWidth = this.scale;
          this.ctx.stroke();
          this.ctx.closePath();
	} else {
	  this.updateMousePosition(this, { x: this.currentX, y: this.currentY });
	}
      }
    },
    
    mousedown(e) {
      this.handleDrawing('mousedown', e);
    },

    mouseup(e) {
      this.handleDrawing('mouseup', e);
    },

    updateMousePosition: throttle((self, position) => {
      self.updateBlackboardPointer({
	id: self.$route.params.id,
	position,
      });
    }, 100), // this is pretty slow
    
    mousemove(e) {
      this.handleDrawing('mousemove', e);
    },
    
    touchend(e) {
      this.handleDrawing('touchend', e);
    },
    
    touchstart(e) {
      console.log(e);
      this.handleDrawing('touchstart', e);
    },

    touchmove(e) {
      this.handleDrawing('touchmove', e);
    },
    
    handleResize() {
      const dpr = window.devicePixelRatio || 1;

      this.canvas.width = this.viewport.width * dpr;
      this.canvas.height = this.viewport.height * dpr;

      this.canvas.style.width = `${(this.viewport.width / dpr)}pt`;
      this.canvas.style.height = `${(this.viewport.height / dpr)}pt`;
      

      // Scale all drawing operations by the dpr, so you
      // don't have to worry about the difference.
      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);

      this.drawPage();
    },

    previousPage(e) {
      if (!(e.ctrlKey || e.shiftKey || e.altKey || e.metaKey)) {
	this.erase();
      }
      
      if (this.pdfDocument) {
	if (this.pageNumber > 1) {
	  this.pageNumber -= 1;
	}
      }
    },

    nextPage(e) {
      if (!(e.ctrlKey || e.shiftKey || e.altKey || e.metaKey)) {
	this.erase();
      }

      if (this.pdfDocument) {
	if (this.pageNumber < this.pageCount) {
	  this.pageNumber += 1;
	}
      }
    },

  },
  
  watch: {
    blackboardPointers: {
      deep: true,
      handler() {
	console.log(this.blackboardPointers);
	
      },
    },
    
    viewport() {
      this.handleResize();
    },
    
    pageNumber() {
      if (this.pdfDocument) {
	this.pdfDocument.getPage(this.pageNumber).then((page) => {
	  this.page = page;
	});
      } else {
	this.page = undefined;
      }
    },
    
    pdfDocument() {
      if (this.pdfDocument) {
	this.pdfDocument.getPage(this.pageNumber).then((page) => {
	  this.page = page;
	});
      } else {
	this.page = undefined;
      }
    },

    page() {
      this.drawPage();
    },
    
    inkCount() {
      if (this.inkCount < Object.keys(this.drawnInk).length) {
	this.drawPage();
      }
      
      this.drawInk();
    },
    
    pdfBuffer: {
      immediate: true,
      handler() {
	if (this.pdfBuffer.length > 0) {
	  const loadingTask = pdfjs.getDocument(this.pdfBuffer);
	  loadingTask.promise.then((pdf) => {
	    this.pdfDocument = pdf;
	  });
	} else {
	  this.pdfDocument = undefined;
	}
      },
    },

    //connected(isConnected) {
      // this.editor.setReadOnly(!isConnected);
    //},
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mouseup', this.mouseup);
    window.removeEventListener('mousemove', this.mousemove);
    window.removeEventListener('touchstart', this.touchstart);
    window.removeEventListener('touchend', this.touchend);
    window.removeEventListener('touchmove', this.touchmove);
  },
  
  mounted() {
    this.who();
    this.fetchBlackboard(this.$route.params.id);

    this.canvas = document.getElementById('canvas');

    this.ctx = this.canvas.getContext('2d');

    window.addEventListener('mouseup', this.mouseup);
    window.addEventListener('mousemove', this.mousemove);
    window.addEventListener('touchend', this.touchend);
    window.addEventListener('touchmove', this.touchmove);
    window.addEventListener('touchstart', this.touchstart);
    
    window.addEventListener('resize', this.handleResize);

    this.handleResize();
  },

  name: 'Blackboard',
};

</script>

<style scoped lang="scss">
#zoom {
margin-left: 2em;
}

#zoom label {
margin-right: 6pt;
}

#page-change {
float: right;
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
  
canvas {
  background: white;
  box-shadow: 0px 0px 15px 5px #222;
  touch-action: none;
}

#desktop {
  text-align: center;
  overflow: scroll;
  width: 100%;
  height: 100%;
  background: #555;
  display: flex; 
  align-items: center;
  justify-content: center;
}

#toolbar {
    padding: 3pt;
    box-shadow: 0px 0px 15px 5px rgba(0, 0, 0, 0.2);
    z-index: 100;
}

button {
    padding: 0;
    margin: 0;
    margin-right: 6pt;
    vertical-align: top;
}

.pointer {
    position: absolute;
    opacity: 0.5;
    pointer-events: none;
    //height: 16pt;
    width: 2pt;
    text-align: center;
}

.username {
    display: inline-block;
    text-align: center;
    margin-left: 50%;
    transform: translateX(-50%);
    margin-top: 12pt;
    padding: 2pt;
}

</style>
