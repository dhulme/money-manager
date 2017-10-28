<template>
  <div>
    <header>
      <h3>{{ bulkTransaction.name }}</h3>
      <v-btn @click="process">Run</v-btn>
    </header>

    <p>{{ bulkTransaction.description }}</p>

    <table class="table">
      <thead>
        <tr>
          <td>From</td>
          <td>To</td>
          <td>Amount</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(transaction, index) in bulkTransaction.transactions" :key="index">
          <td>{{ accountName(transaction.from) }}</td>
          <td>{{ accountName(transaction.to) }}</td>
          <td>{{ transaction.value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  import BackButton from '@/components/BackButton';

  export default {
    components: {
      BackButton,
    },
    data() {
      return {
        name: '',
        transactions: [{}],
        description: '',
      };
    },
    computed: {
      bulkTransaction() {
        return this.$project.bulkTransaction(this.$route.params.bulkTransactionId);
      },
    },
    methods: {
      accountName(accountId) {
        return this.$project.account(accountId).name;
      },
      process() {
        this.$project.addTransactions(this.bulkTransaction.transactions);
      },
    },
  };
</script>

<style lang="scss" scoped>
  header {
    display: flex;
    justify-content: space-between;
  }
</style>
