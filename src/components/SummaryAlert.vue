<template>
  <div v-if="balance === 0" class="alert alert-success">
    Your budget and accounts match :)
  </div>
  <div v-else-if="balance < 0" class="alert alert-danger">
    Your budget and accounts don't match!
  </div>
  <div v-else-if="balance > 0" class="alert alert-info">
    You have more in your accounts than your budget!
  </div>
</template>

<script>
  export default {
    computed: {
      balance() {
        return this.$project.summary.balance;
      }
    }
  }
</script>

<style>
  
</style>
