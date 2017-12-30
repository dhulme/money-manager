<template>
  <v-card>
    <v-card-title class="headline">
      {{ isNewTransaction ? 'Add' : 'Edit' }} Transaction
    </v-card-title>
    <v-card-text>
      <v-text-field
        v-model="transaction.date"
        label="Date"
      />
      <v-text-field
        v-model="transaction.description"
        label="Description"
      />
      <v-text-field
        v-model="transaction.note"
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
        v-model="transaction.account"
        label="Account"
        autocomplete
        item-text="name"
        item-value="id"
      />
      <v-text-field
        v-model="transaction.valueIn"
        label="In" 
      />
      <v-text-field
        v-model="transaction.valueOut"
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
      }
    },
    data() {
      return {
        newTransaction: {
          ...transaction
        }
      };
    },
    computed: {
      isNewTransaction() {
        return Object.keys(this.transaction).length === 0;
      }
    }
  };
</script>
