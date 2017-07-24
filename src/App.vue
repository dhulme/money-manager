<template>
  <div id="app">
    <div class="container">
      {{data}}
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  import data from '@/data';

  export default {
    name: 'app',
    computed: {
      async data() {
        return data.load();
      }
    }
  };
</script>

<style lang="scss">
  
</style>
