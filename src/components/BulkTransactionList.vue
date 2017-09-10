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
        <tr v-for="bulkTransaction in $project.bulkTransactions()" :key="bulkTransaction.id" @click="openBulkTransaction(bulkTransaction.id)">
          <td>{{ bulkTransaction.name }}</td>
          <td>
            <button class="btn btn-default" @click.stop="process(bulkTransaction)">Run</button>
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
      openBulkTransaction(id) {
        this.$router.push({
          name: 'bulkTransaction',
          params: {
            bulkTransactionId: id,
          },
        });
      },
    },
  };
</script>

<style lang="scss">

</style>