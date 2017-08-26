<template>
  <div v-if="$store.state.summaryBalance !== '0'" class="alert alert-danger">
    Your budget and accounts don't match! {{ $store.state.summaryBalance | currency }}
  </div>
</template>

<script>
  export default {
  };
</script>

<style>
  
</style>
