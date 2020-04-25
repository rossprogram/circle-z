<template>
  <div class="header">
    <h2><span class="name">{{ name }} </span>
      <span class="button-group" v-if="buttons">
	<button v-for="name in Object.keys(buttons)"
		v-bind:key="name"
		@click="$emit(name.toLowerCase());">
	  <font-awesome-icon :icon="buttons[name]" /> {{ name }}
	</button>
      </span>
    </h2>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Header',
  props: {
    refreshButton: Boolean,
    name: String,
    buttons: Object,
  },
};
</script>

<style scoped lang="scss">
  .name {
  }
  
  button {
  padding: 0;
  margin: 0;
  margin-right: 6pt;
  vertical-align: top;
  }

  .button-group {
  padding: 0;
  margin: 0;
  vertical-align: top;
  }
  
  h2 {
  white-space: nowrap;
  justify-content: space-between;
  display: flex;

  height: 16pt;
  color: black;
  margin-top: 6pt;
  margin-bottom: 0pt;
  padding-bottom: 6pt;
  font-size: 14pt;
  padding-left: 6pt;
  border-bottom: 1px solid #eee;
  user-select: none;    
}

  
.header {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-content: space-between;
}
  
.content {
  flex-grow: 1;
  overflow-y: auto;
  height: 100%;
  padding: 6pt;
}

</style>
