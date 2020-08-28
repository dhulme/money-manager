<template>
  <VCard v-hotkey.close="close">
    <VCardTitle class="headline">
      {{ transaction.id ? 'Edit' : 'Add' }} Transaction
    </VCardTitle>
    <VForm ref="form" v-model="valid" lazy-validation @submit.prevent="save">
      <VCardText>
        <VTextField
          v-model="newTransaction.value"
          label="Amount"
          :prefix="$currencyPrefix"
          class="required"
          :rules="valueRules"
        />
        <VAutocomplete
          :items="accounts"
          v-model="newTransaction.from"
          label="From"
          prepend-icon="account_balance"
          class="required"
          :rules="fromRules"
        />
        <VAutocomplete
          :items="accounts"
          v-model="newTransaction.to"
          label="To"
          prepend-icon="account_balance"
          class="required"
          :rules="toRules"
        />
        <VTextField
          v-model="newTransaction.note"
          label="Note"
          prepend-icon="note"
        />
      </VCardText>
      <VCardActions>
        <VBtn text @click="close">Close</VBtn>
        <VBtn v-if="transaction.id" text @click="_delete" color="error"
          >Delete</VBtn
        >
        <VBtn type="submit" color="primary" text>{{
          transaction.id ? 'Update' : 'Add'
        }}</VBtn>
      </VCardActions>
    </VForm>
  </VCard>
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
