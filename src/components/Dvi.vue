<script>
import { dvi2vdom } from 'dvi2html';
import '@/fonts/tex/tex.css';

export default {
  name: 'Dvi',

  render(createElement) {
    const vdoms = [];

    // This fixes how snabbdom handles svg
    const myCreateElement = function (tagName, options, children) {
      if (options && options.props && options.props.innerHTML) {
	return createElement(tagName,
		       {
			 ...options,
			 domProps: options.props, 
		       },
		       children);
      } 
	return createElement(tagName, options, children);
      
    };

    if (this.data) {
      dvi2vdom(this.data, myCreateElement,
	       (vdom) => {
		 vdoms.push(vdom);
		 console.log('vdom=', vdom);
	       });
    }

    return createElement('div', { class: { tex: true } }, vdoms);
  },
  
  props: {
    data: Buffer,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.tex {
    background-color: #666;
    white-space: nowrap;
    display: flex;  
    flex-wrap: wrap;
    min-width: 9.5in;
    flex-grow: 1;
    flex-basis:0;
}

.tex > div {
    flex: 0 0 6.5in;
    min-width: 0;
    display: inline-block;

    height: 9in !important;
    width: 6.5in !important;
    margin: 0.5in;
    margin-bottom: 0.25in;
    margin-top: 0.25in;
    border: solid white 1in;
    background-color: white;
    box-shadow: 0px 0px 15px 5px #222;
}


</style>
