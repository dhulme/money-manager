<template>
  <VCard>
    <VCardTitle class="headline">Import transactions</VCardTitle>
    <VCardText>
      <VDataTable
        dense
        :items="transactions"
        :headers="headers"
        class="import-transactions-table"
      >
        <template v-slot:item="props">
          <tr>
            <td>
              <VTextField hide-details v-model="props.item.date" />
            </td>
            <td>
              <VTextField hide-details v-model="props.item.description" />
            </td>
            <td>
              <VAutocomplete
                :items="accounts"
                v-model="props.item.account"
                required
                hide-details
                :ref="'account' + props.index"
                @change="accountChange(props.index)"
              />
            </td>
            <td>
              <VSelect
                hide-details
                :items="transactionTypeItems"
                v-model="props.item.type"
              />
            </td>
            <td>
              <VTextField
                hide-details
                v-model="props.item.value"
                :prefix="$currencyPrefix"
              />
            </td>
          </tr>
        </template>
      </VDataTable>
      <VBtn @click="completeImport" color="primary" class="mr-2">OK</VBtn>
      <VBtn @click="$emit('close')">Cancel</VBtn>
    </VCardText>
  </VCard>
</template>

<script>
import Vue from 'vue';
import moment from 'moment';
import { getId } from '../util';

export default {
  props: {
    account: Object
  },
  data() {
    return {
      headers: [
        {
          text: 'Date',
          value: 'date',
          width: 150
        },
        {
          text: 'Description',
          value: 'description'
        },
        {
          text: 'Account',
          value: 'account',
          width: 300
        },
        {
          text: 'In/Out',
          value: 'type',
          width: 100
        },
        {
          text: 'Value',
          value: 'value',
          width: 170
        }
      ],
      transactions: [],
      transactionTypeItems: [
        {
          text: 'In',
          value: 'in'
        },
        {
          text: 'Out',
          value: 'out'
        }
      ]
    };
  },
  computed: {
    importedTransactions() {
      const dateFilter = Vue.filter('date');
      return this.$store.state.importedTransactions.map(item => ({
        date: dateFilter(item.date),
        description: item.description,
        value: item.value.toFixed(2),
        type: item.type
      }));
    },
    accounts() {
      return this.$store.getters['project/accountItems'].filter(
        account => account.value !== this.account.id
      );
    }
  },
  watch: {
    importedTransactions: {
      immediate: true,
      handler(value) {
        this.transactions = value;
      }
    }
  },
  methods: {
    completeImport() {
      this.$store.dispatch(
        'project/addDualTransactions',
        this.transactions.map(uiTransaction => {
          const transaction = {
            description: uiTransaction.description,
            note: uiTransaction.note,
            date: moment(uiTransaction.date, this.$dateFormat),
            id: getId(),
            value: uiTransaction.value
          };

          const transactionAccount = this.$store.getters['project/account'](
            uiTransaction.account
          );
          const inTransaction = uiTransaction.type === 'in';
          const isDualTransaction =
            transactionAccount.type !== this.account.type;

          return {
            primary: isDualTransaction
              ? {
                  ...transaction,
                  expense: uiTransaction.account,
                  from: inTransaction ? 'none' : this.account.id,
                  to: inTransaction ? this.account.id : 'none'
                }
              : {
                  ...transaction,
                  from: inTransaction ? uiTransaction.account : this.account.id,
                  to: inTransaction ? this.account.id : uiTransaction.account
                },
            ...(isDualTransaction && {
              secondary: {
                ...transaction,
                expense: this.account.id,
                from: inTransaction ? 'none' : uiTransaction.account,
                to: inTransaction ? uiTransaction.account : 'none',
                id: getId()
              }
            })
          };
        })
      );
    },
    accountChange(index) {
      const nextAccountSelect = this.$refs['account' + (index + 1)];
      // $refs.accounts[props.item.index + 1].focus()
      if (nextAccountSelect) {
        nextAccountSelect.focus();
        nextAccountSelect.activateMenu();
      }
    }
  }
};
</script>

<style lang="scss">
/* .theme--light.v-data-table tbody tr:not(:last-child) td:last-child, .theme--light.v-data-table tbody tr:not(:last-child) td:not(.v-data-table__mobile-row) { */
.import-transactions-table td {
  border-bottom: none !important;
}

.import-transactions-table .v-data-footer {
  margin-top: 0.5rem;
}
</style>
