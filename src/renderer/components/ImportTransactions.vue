<template>
  <VCard>
    <VCardTitle class="headline">Import transactions</VCardTitle>
    <VCardText>
      <VDataTable :items="transactions" :headers="headers">
        <template slot-scope="props" slot="item">
          <tr>
            <td><VTextField v-model="props.item.date" /></td>
            <td><VTextField v-model="props.item.description" /></td>
            <td>
              <VAutocomplete
                :items="accounts"
                :rules="accountValidationRules"
                v-model="props.item.account"
                label="Account"
                required
              />
            </td>
            <td>
              <VTextField
                v-model="props.item.value"
                :prefix="$currencyPrefix"
              />
            </td>
          </tr>
        </template>
      </VDataTable>
      <VBtn @click="completeImport" color="primary">OK</VBtn>
      <VBtn @click="$emit('close')">Cancel</VBtn>
    </VCardText>
  </VCard>
</template>

<script>
import Vue from 'vue';

export default {
  props: {
    account: Object
  },
  data() {
    return {
      headers: [
        {
          text: 'Date',
          value: 'date'
        },
        {
          text: 'Description',
          value: 'description'
        },
        {
          text: 'Account',
          value: 'account'
        },
        {
          text: 'Value',
          value: 'value'
        }
      ],
      transactions: []
    };
  },
  computed: {
    importedTransactions() {
      const dateFilter = Vue.filter('date');
      return this.$store.state.importedTransactions.map(item => ({
        date: dateFilter(item.date),
        description: item.description,
        value: item.value.toFixed(2)
      }));
    },
    accounts() {
      return this.$store.getters['project/accountItems'].filter(
        account => account.value !== this.account.id
      );
    }
  },
  watch: {
    importedTransactions(value) {
      this.transactions = value;
    }
  },
  methods: {
    completeImport() {
      this.$store.dispatch('project/');
    }
  }
};
</script>
