//
//  Initialize the MathJax startup code
//
require('mathjax-full/components/src/startup/lib/startup.js');

//
//  Get the loader module and indicate the modules that
//  will be loaded by hand below
//
const { Loader } = require('mathjax-full/js/components/loader.js');

Loader.preLoad(
  'loader',
  'startup',
  'core',
  'input/tex-base',
  '[tex]/ams',
  '[tex]/newcommand',
  '[tex]/configMacros',
  //'output/svg', 'output/svg/fonts/tex.js',
  'output/svg', 'output/svg/fonts/tex.js',
  // 'ui/menu',
);

//
// Load the components that we want to combine into one component
//   (the ones listed in the preLoad() call above)
//
require('mathjax-full/components/src/core/core.js');

require('mathjax-full/components/src/input/tex-base/tex-base.js');
require('mathjax-full/components/src/input/tex/extensions/ams/ams.js');
require('mathjax-full/components/src/input/tex/extensions/newcommand/newcommand.js');
require('mathjax-full/components/src/input/tex/extensions/config_macros/configMacros.js');

require('mathjax-full/components/src/output/svg/svg.js');
require('mathjax-full/components/src/output/svg/fonts/tex/tex.js');

// require('mathjax-full/components/src/ui/menu/menu.js');

//
// Update the configuration to include any updated values
//
const { insert } = require('mathjax-full/js/util/Options.js');

insert(window.MathJax.config, {
  tex: {
    packages: { '[+]': ['ams', 'newcommand', 'configMacros'] },
  },
});

//
// Loading this component will cause all the normal startup
//   operations to be performed
//
require('mathjax-full/components/src/startup/startup.js');

console.log('Loaded mathjax.');

const { MathJax } = window;

/*
 * Tiny tokenizer
 * from https://gist.github.com/borgar/451393/7698c95178898c9466214867b46acb2ab2f56d68
 *
 * - Accepts a subject string and an object of regular expressions for parsing
 * - Returns an array of token objects
 *
 * tokenize('this is text.', { word:/\w+/, whitespace:/\s+/, punctuation:/[^\w\s]/ }, 'invalid');
 * result => [{ token="this", type="word" },{ token=" ", type="whitespace" }, 
 *   Object { token="is", type="word" }, ... ]
 *
 */
function tokenize(ss, parsers, deftok) {
  const tokens = []; let s = ss;
  
  while (s) {
    let t = null;
    let m = s.length;
    let l = 0;
    const sss = s.toString();
    Object.keys(parsers).forEach((key) => {
      const r = parsers[key].exec(sss);
      // try to choose the best match if there are several
      // where "best" is the closest to the current starting point
      // and then the longest
      if (r && ((r.index < m) || ((r.index === m) && (r[0].length > l)))) {
        t = {
          token: r[0],
          type: key,
          matches: r.slice(1),
        };
        m = r.index;
        l = r[0].length;
      }
    });
    if (m) {
      // there is text between last token and currently 
      // matched token - push that out as default or "unknown"
      tokens.push({
        token: s.substr(0, m),
        type: deftok || 'unknown',
      });
    }
    if (t) {
      // push current token onto sequence
      tokens.push(t); 
    }
    s = s.substr(m + (t ? t.token.length : 0));
  }
  return tokens;
}


function tokenizeTex(s) {
  const tokens = tokenize(s, {
    beginEnvironment: /\\begin\s*\{[A-z]+\}/,
    endEnvironment: /\\end\s*\{[A-z]+\}/,
    beginMath: /\\\(/,
    endMath: /\\\)/,
    mathShift: /\$/,
    beginDisplayMath: /\\\[/,
    endDisplayMath: /\\\]/,    
    displayMathShift: /\$\$/,
    beginGroup: /\{/,
    endGroup: /\}/,
    beginOptionGroup: /\[/,
    endOptionGroup: /\]/,    
    command: /\\[A-Za-z]+/,
    whitespace: /\s+/,
  }, 'text');
  
  return tokens;
}

function parseMath(tokenizer, output, display) {
  let done = false;
  let content = '';
  
  while (!done) {
    const token = tokenizer.next();

    if (token === undefined) {
      done = true;
      break;
    }
    
    if ((token.type === 'endMath')
        || (token.type === 'endDisplayMath')
        || (token.type === 'mathShift')
        || (token.type === 'displayMathShift')) {
      done = true;
      break;
    }

    content += token.token;
  }
  
  const options = { display };

  const html = MathJax.tex2svg(content, options);
  output(html);
}

function parseText(tokenizer, output) {
  let done = false;
  
  while (!done) {
    const token = tokenizer.next();

    if (token === undefined) {
      done = true;
      break;
    }

    if (token.type === 'beginMath') {
      parseMath(tokenizer, output, false);
    } else if (token.type === 'mathShift') {
      parseMath(tokenizer, output, false);
    } else if (token.type === 'beginDisplayMath') {
      parseMath(tokenizer, output, true);
    } else if (token.type === 'displayMathShift') {
      parseMath(tokenizer, output, true);
    } else {
      output(document.createTextNode(token.token));
    }
  }
  
}

export default {
  name: 'Tex',

  data() {
    return {
      sourceData: this.source,
      theNode: undefined,
    };
  },

  render() {
  },
  
  mounted() {
    const tokens = tokenizeTex(this.sourceData);
    let position = 0;
    
    const tokenizer = {
      next() {
        if (position >= tokens.length) return undefined;
        const token = tokens[position];
        position += 1;
        return token;
      },
    };

    const node = document.createElement('div');
    this.theNode = node;
    
    parseText(tokenizer, (el) => {
      node.appendChild(el);
    });

    this.$el.parentNode.appendChild(node);
    
    const sheet = document.querySelector('#MJX-SVG-styles');
    if (sheet) sheet.parentNode.removeChild(sheet);
    
    if (MathJax.svgStylesheet) document.head.appendChild(MathJax.svgStylesheet());
  },
  
  beforeMount() {
    if (this.$slots.default) {
      this.sourceData = this.$slots.default.map((slot) => slot.text).join('');
    }
    
    this.$watch('source', () => {
      this.sourceData = this.source;
      this.$forceUpdate();
    });
  },

  beforeDestroy() {
    this.theNode.parentNode.removeChild(this.theNode);
  },
};
