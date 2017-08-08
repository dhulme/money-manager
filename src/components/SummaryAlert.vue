<template>
  <div v-if="!$project.summaryBalanceZero()" class="alert alert-danger">
    Your budget and accounts don't match! {{ $project.summaryBalance() | currency }}
  </div>
</template>

<script>
  export default {
  }
</script>

<style>
  
</style>
