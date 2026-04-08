<template>
  <v-card v-hotkey.close="close">
    <v-card-title class="text-h6">
      {{ transaction.id ? 'Edit' : 'Add' }} Transaction
    </v-card-title>
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="save">
      <v-card-text>
        <v-text-field
          v-model="newTransaction.value"
          label="Amount"
          :prefix="$currencyPrefix"
          class="required"
          :rules="valueRules"
        />
        <v-autocomplete
          :items="accounts"
          v-model="newTransaction.from"
          label="From"
          prepend-icon="mdi-bank"
          class="required"
          :rules="fromRules"
          auto-select-first
        />
        <v-autocomplete
          :items="accounts"
          v-model="newTransaction.to"
          label="To"
          prepend-icon="mdi-bank"
          class="required"
          :rules="toRules"
          auto-select-first
        />
        <v-text-field
          v-model="newTransaction.note"
          label="Note"
          prepend-icon="mdi-note"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" @click="close">Close</v-btn>
        <v-btn v-if="transaction.id" variant="text" @click="_delete" color="error"
          >Delete</v-btn
        >
        <v-btn type="submit" color="primary" variant="text">{{
          transaction.id ? 'Update' : 'Add'
        }}</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import { getId, validateInputValue } from '../util';

export default {
  props: {
    transaction: {
      type: Object,
      required: true,
    },
    bulkTransaction: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      newTransaction: {},
      valid: true,
      formClean: true,
      valueRules: [
        (value) => this.formClean || !!value || 'Amount is required',
        (value) => this.formClean || validateInputValue(value),
      ],
      fromRules: [
        (value) => this.formClean || !!value || 'From account is required',
      ],
      toRules: [
        (value) => this.formClean || !!value || 'To account is required',
      ],
    };
  },
  computed: {
    accounts() {
      return this.$store.getters['project/accountItems'];
    },
  },
  watch: {
    transaction: {
      handler(transaction) {
        this.newTransaction = {
          id: getId(),
          ...transaction,
        };
        this.formClean = true;
        this.valid = true;
      },
      immediate: true,
    },
  },
  methods: {
    save() {
      this.formClean = false;
      if (!this.$refs.form.validate()) {
        return;
      }

      this.$emit('saved', this.newTransaction);
    },
    close() {
      if (!this.$store.state.dialog) {
        this.$emit('close');
      }
    },
    _delete() {
      this.$emit('deleted', this.newTransaction);
    },
  },
};
</script>

<style></style>
