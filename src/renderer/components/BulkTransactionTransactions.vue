<template>
  <VDataTable
    :headers="headers"
    :items="transactions"
    :search="search"
    :footer-props="{ itemsPerPageOptions }"
  >
    <template v-slot:item="props">
      <tr @click="$emit('transaction-click', props.item)">
        <td>{{ accountName(props.item.from) }}</td>
        <td>{{ accountName(props.item.to) }}</td>
        <td>{{ props.item.note }}</td>
        <td class="text-right">{{ props.item.value | currency }}</td>
      </tr>
    </template>
    <template v-slot:body.append>
      <tr>
        <td />
        <td />
        <td />
        <td class="text-right font-weight-medium">{{ total | currency }}</td>
      </tr>
    </template>
  </VDataTable>
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
        {
          text: 'From',
          value: 'from',
          align: 'left'
        },
        {
          text: 'To',
          value: 'to',
          align: 'left'
        },
        {
          text: 'Note',
          value: 'note',
          align: 'left'
        },
        {
          text: 'Amount',
          value: 'value',
          align: 'right'
        }
      ],
      itemsPerPageOptions: [10, 20, 50]
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
