<template>
  <div id="app">
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  import data from '@/data';

 

  export default {
    
    computed: {
      data() {
        return data.getData();
      }
    }
  };
</script>

<style lang="scss">
  
</style>
