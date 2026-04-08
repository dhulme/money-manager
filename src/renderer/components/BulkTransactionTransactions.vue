<template>
  <v-data-table
    :headers="headers"
    :items="transactions"
    :search="search"
    :items-per-page-options="itemsPerPageOptions"
  >
    <template v-slot:item="{ item }">
      <tr @click="$emit('transaction-click', item)">
        <td>{{ accountName(item.from) }}</td>
        <td>{{ accountName(item.to) }}</td>
        <td>{{ item.note }}</td>
        <td class="text-right">{{ $currency(item.value) }}</td>
      </tr>
    </template>
    <template v-slot:bottom>
      <tr>
        <td />
        <td />
        <td />
        <td class="text-right font-weight-medium">{{ $currency(total) }}</td>
      </tr>
    </template>
  </v-data-table>
</template>

<script>
import Big from 'big.js';

export default {
  props: {
    transactions: Array,
    search: String
  },
  data() {
    return {
      headers: [
        { title: 'From', key: 'from', align: 'start' },
        { title: 'To', key: 'to', align: 'start' },
        { title: 'Note', key: 'note', align: 'start' },
        { title: 'Amount', key: 'value', align: 'end' }
      ],
      itemsPerPageOptions: [
        { value: 10, title: '10' },
        { value: 20, title: '20' },
        { value: 50, title: '50' }
      ]
    };
  },
  computed: {
    total() {
      return this.transactions.reduce(
        (sum, transaction) => sum.plus(transaction.value),
        new Big(0)
      );
    }
  },
  methods: {
    accountName(accountId) {
      return this.$store.getters['project/account'](accountId).name;
    }
  }
};
</script>

<style lang="scss"></style>
