<template>
  <div>
    <table class="table table-hover">
      <thead>
        <tr>
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bulkTransaction in $project.bulkTransactions()" :key="bulkTransaction.id">
          <td>{{ bulkTransaction.name }}</td>
          <td>
            <button class="btn btn-default" @click="process(bulkTransaction)">Run</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  export default {
    methods: {
      process(bulkTransaction) {
        this.$project.addTransactions(bulkTransaction.transactions);
      },
    },
  };
</script>

<style lang="scss">

</style>