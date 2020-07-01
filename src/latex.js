import path from 'path';
import fs from 'fs';
import {
 ipcMain,
} from 'electron';
import { fork } from 'child_process';
import { unzip } from 'zlib';
import * as library from './library';

import texCorePath from '../tex/core.4b580e5b16c4.dump.gz';
import texBinaryPath from '../tex/out.8c3fe3450cb5.wasm';
import rossClassPath from '../tex/ross.cls';

const pages = 1500;

/*
const p = fork(require.resolve('./child.js'), ['args'], {
  stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
});
*/

////////////////////////////////////////////////////////////////

let rossClass;

fs.readFile(path.join(__dirname, rossClassPath), (err, data) => {
  if (err) {
    throw err;
  } else {
    rossClass = data;
  }
});

////////////////////////////////////////////////////////////////

let compiled;

fs.readFile(path.join(__dirname, texBinaryPath), (err, texBinary) => {
  if (err) {
    throw err;  
  } else {
    console.log('Loaded texBinary with', texBinary.length, 'bytes');
    compiled = new WebAssembly.Module(texBinary);
  }
});

////////////////////////////////////////////////////////////////

let coredump;

fs.readFile(path.join(__dirname, texCorePath), (err, texCoreGzipped) => {
  if (err) {
    throw err;
  } else {
    unzip(texCoreGzipped, (err, texCore) => {
      if (err) {
        throw err;
      } else {
        console.log('Loaded texCore with', texCore.length, 'bytes');
        coredump = texCore;
      }
    });
  }
});

function copy(src) {
  const dst = new Uint8Array(src.length);
  dst.set(src);
  return dst;
}

function runTex() {
  return new Promise(async (resolve, reject) => {
    const memory = new WebAssembly.Memory({ initial: pages, maximum: pages });
  
    const buffer = new Uint8Array(memory.buffer, 0, pages * 65536);
    buffer.set(copy(coredump));
  
    library.setMemory(memory.buffer);

    library.setDirectory('');
  
    //library.setInput(` \\PassOptionsToClass{web}{ximera}\\PassOptionsToPackage{margin=1in,paperwidth=${(e.data.paperwidth + 144).toString()}pt,paperheight=100in}{geometry}\n\\input{${path.basename(filename)}}\n\\end\n`);
    library.setInput(' texput.tex');
    
  
    library.setCallback(() => {
      const filename = 'texput.dvi';
      //let data = library.readFileSync( filename )
      const data = library.readFileSync('texput.dvi');
      //self.postMessage({ dvi: data }, [data.buffer]);
      console.log('**** DONE');
      resolve(data.buffer);
    });
  
    let instance;

    try {
      instance = await WebAssembly.instantiate(compiled, {
        library,
        env: { memory },
      });
    } catch (err) {
      reject(err);
    }
    
    const wasmExports = instance.exports;
    library.setWasmExports(wasmExports);
    
    wasmExports.main();
  });
}


ipcMain.on('tex', async (event, document, texmf) => {
  console.log('Launching TeX...');

  if (rossClass) texmf['ross.cls'] = rossClass;

  const cleanedDocument = document
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');
  
  library.deleteEverything();
  library.setTexput(cleanedDocument);
  library.setTexmfExtra(texmf);

  library.setConsoleWriter((x) => {
    event.reply('latex-console', x);
  });
  
  const dvi = await runTex();
  
  event.reply('dvi', dvi);
 
});
