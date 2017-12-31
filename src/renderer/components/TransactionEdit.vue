<template>
  <v-card>
    <v-card-title class="headline">
      {{ isNewTransaction ? 'Add' : 'Edit' }} Transaction
    </v-card-title>
    <v-card-text>
      <v-menu
        lazy
        :close-content-on-click="false"
        v-model="dateMenu"
        transition="scale-transition"
        offset-y
        full-width
        :nudge-right="40"
        max-width="290px"
        min-width="290px"
      >
        <v-text-field
          slot="activator"
          label="Picker in menu"
          v-model="newTransaction.prettyDate"
          prepend-icon="event"
          readonly
        />
        <v-date-picker v-model="newTransaction.prettyDate" no-title scrollable actions>
          <template slot-scope="{ save, cancel }">
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn flat color="primary" @click="cancel">Cancel</v-btn>
              <v-btn flat color="primary" @click="save">OK</v-btn>
            </v-card-actions>
          </template>
        </v-date-picker>
      </v-menu>
      <v-text-field
        v-model="newTransaction.description"
        label="Description"
      />
      <v-text-field
        v-model="newTransaction.note"
        label="Note"
      />
      <v-select
        :items="transactionTypes"
        v-model="transaction.type"
        label="Type"
        item-text="name"
        item-value="id"
      />
      <v-select
        :items="accounts"
        v-model="newTransaction.account"
        label="Account"
        autocomplete
        item-text="name"
        item-value="id"
      />
      <v-text-field
        v-model="newTransaction.valueIn"
        label="In" 
      />
      <v-text-field
        v-model="newTransaction.valueOut"
        label="Out"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" flat>{{ isNewTransaction ? 'Add' : 'Update' }}</v-btn>
      <v-btn flat @click="$emit('close')">Cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  export default {
    props: {
      transaction: {
        type: Object,
        default: {}
      },
      account: Object
    },
    data() {
      return {
        newTransaction: {},
        dateMenu: false,
        transactionTypes: this.$project.transactionTypes().map(transactionType => ({
          name: this.$t(`transactionTypes.${transactionType}`),
          id: transactionType,
        })),
      };
    },
    watch: {
      transaction(transaction) {
        this.newTransaction = {
          ...transaction,
          prettyDate: this.$options.filters.date(transaction.date)
        };
      },
    },
    computed: {
      isNewTransaction() {
        return Object.keys(this.transaction).length === 0;
      },
      accounts() {
        return this.$project.sortAccounts(this.$project.accounts().filter(account => account.id !== this.account.id));
      },
    }
  };
</script>
