<template>
  <v-data-table
    :headers="headers"
    :items="searchableTransactions"
    :search="search"
    :items-per-page-options="itemsPerPageOptions"
  >
    <template v-slot:item="{ item }">
      <tr @click="$emit('transaction-click', item)">
        <td>{{ item.fromName }}</td>
        <td>{{ item.toName }}</td>
        <td>{{ item.note }}</td>
        <td class="text-right">{{ $currency(item.value) }}</td>
      </tr>
    </template>
    <template v-slot:tfoot>
      <tfoot>
        <tr>
          <td />
          <td />
          <td />
          <td class="text-right font-weight-bold">{{ $currency(total) }}</td>
        </tr>
      </tfoot>
    </template>
  </v-data-table>
</template>

<script>
import Big from 'big.js';

export default {
  props: { transactions: Array, search: String },
  data() {
    return {
      headers: [
        { title: 'From', key: 'fromName', align: 'start' },
        { title: 'To', key: 'toName', align: 'start' },
        { title: 'Note', key: 'note', align: 'start' },
        { title: 'Amount', key: 'value', align: 'end' },
      ],
      itemsPerPageOptions: [
        { value: 10, title: '10' },
        { value: 20, title: '20' },
        { value: 50, title: '50' },
      ],
    };
  },
  computed: {
    searchableTransactions() {
      return this.transactions.map((t) => ({
        ...t,
        fromName: this.accountName(t.from),
        toName: this.accountName(t.to),
      }));
    },
    total() {
      return this.transactions.reduce(
        (sum, transaction) => sum.plus(transaction.value),
        new Big(0),
      );
    },
  },
  methods: {
    accountName(accountId) {
      return this.$store.getters['project/account'](accountId).name;
    },
  },
};
</script>

<style lang="scss"></style>
