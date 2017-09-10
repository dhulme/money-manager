<template>
  <div>
    <back-button name="dashboard"></back-button>

    <h1>New Bulk Transaction</h1>
    <form @submit="addBulkTransaction">
      <div class="form-group">
        <label>Name</label>
        <input type="text" class="form-control" v-model="name">
      </div>
      <div class="form-group">
        <label>Description</label>
        <input type="text" class="form-control" v-model="description">
      </div>
      <div class="form-group form-inline">
        <label>Transactions</label><br>
        <div v-for="(transaction, index) in transactions" :key="index">
          Transfer
          <input type="text" class="form-control" v-model="transaction.value">

          from
          <select :v-model="transaction.from" class="form-control" v-model="transaction.from">
            <option v-for="account in $project.accounts()" :key="account.id" :value="account.id">
              {{ account.name }}
            </option>
          </select>

          to
          <select :v-model="transaction.to" class="form-control" v-model="transaction.to">
            <option v-for="account in $project.accounts()" :key="account.id" :value="account.id">
              {{ account.name }}
            </option>
          </select>


        </div>
        <button class="btn btn-default" @click.prevent="addTransaction">Add transaction</button>
      </div>
      <button type="submit" class="btn btn-default">Submit</button>
    </form>
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
    },
    methods: {
      addTransaction() {
        this.transactions.push({});
      },
      addBulkTransaction() {
        this.$project.addBulkTransaction({
          name: this.name,
          transactions: this.transactions,
          description: this.description,
        });

        this.$router.push({
          name: 'bulkTransactions',
        });
      },
    },
  };
</script>
