<template>
  <div class="header">
    <h2>{{ name }}</h2>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Header',
  props: {
    name: String,
  },
};
</script>

<style scoped lang="scss">
  h2 {
  height: 12pt;
    color: black;
    margin-top: 6pt;
    margin-bottom: 0pt;
    padding-bottom: 6pt;
    font-size: 10pt;
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
  padding: 6pt;
}

</style>
