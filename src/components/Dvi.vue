<script>
import { dvi2vdom } from 'dvi2html';
import '@/fonts/tex/tex.css';

export default {
  name: 'Dvi',

  render(createElement) {
    const vdoms = [];

    if (this.data) {
      dvi2vdom(this.data, createElement,
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
    overflow-x: scroll;
    height: 100%;
    width: 100%;
    overflow-y: scroll;
}

</style>
