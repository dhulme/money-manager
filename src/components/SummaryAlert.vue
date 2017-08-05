<template>
  <div v-if="balance !== 0" class="alert alert-danger">
    Your budget and accounts don't match! {{ balance | currency }}
  </div>
</template>

<script>
  export default {
    computed: {
      balance() {
        return this.$project.data.summary.balance;
      }
    }
  }
</script>

<style>
  
</style>
