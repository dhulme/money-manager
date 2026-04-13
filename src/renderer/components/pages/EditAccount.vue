<template>
  <div v-hotkey.close="goToAccounts">
    <v-card>
      <v-card-title>
        <div class="text-h6">{{ accountId ? 'Edit' : 'Add' }} Account</div>
      </v-card-title>
      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
          @submit.prevent="save"
        >
          <v-text-field v-model="accountCategory" label="Category" disabled />
          <v-text-field
            autofocus
            v-model="newAccount.name"
            label="Name"
            :rules="nameRules"
            class="required"
          />
          <v-text-field
            v-if="!account"
            v-model="newAccount.openingBalance"
            label="Opening balance"
            :prefix="$currencyPrefix"
            :rules="openingBalanceRules"
            class="required"
          />
          <v-select
            :items="importAccountTransactionsFormatItems"
            label="Transaction import format"
            v-model="newAccount.importTransactionsFormatId"
          />
          <v-btn type="submit" variant="text" color="primary">OK</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { importAccountTransactionsFormatItems } from '../../import-transactions';
export default {
  data() {
    return {
      newAccount: {
        name: '',
        openingBalance: '0',
        importTransactionsFormatId: null,
      },
      importAccountTransactionsFormatItems,
      valid: true,
      formClean: true,
      nameRules: [(value) => this.formClean || !!value || 'Name is required'],
      openingBalanceRules: [
        (value) => this.formClean || !!value || 'Opening balance is required',
      ],
    };
  },
  computed: {
    accountCategory() {
      return this.$route.params.accountCategory;
    },
    accountType() {
      return this.$route.params.accountType;
    },
    accountId() {
      const accountId = this.$route.params.accountId;
      return accountId !== 'new' ? accountId : null;
    },
    account() {
      return (
        this.accountId && this.$store.getters['project/account'](this.accountId)
      );
    },
  },
  mounted() {
    this.newAccount = { ...this.account };
  },
  watch: {
    'newAccount.name'(name) {
      this.$ipc.setTitle(name);
    },
  },
  created() {
    this.$ipc.setTitle();
  },
  methods: {
    async save() {
      this.formClean = false;
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        return;
      }
      if (this.accountId) {
        this.$store.dispatch('project/editAccount', {
          id: this.newAccount.id,
          name: this.newAccount.name,
          importTransactionsFormatId: this.newAccount
            .importTransactionsFormatId,
        });
      } else {
        this.$store.dispatch('project/addAccount', {
          name: this.newAccount.name,
          balance: this.newAccount.openingBalance,
          importTransactionsFormatId: this.newAccount
            .importTransactionsFormatId,
          category: this.accountCategory,
          type: this.accountType,
        });
      }

      this.resetForm();

      if (this.accountId) {
        this.goToAccount(this.account);
      } else {
        this.goToAccounts();
      }
    },
    resetForm() {
      this.name = '';
      this.openingBalance = '';
    },
    goToAccount(account) {
      if (!this.$store.state.dialog) {
        this.$router.push({
          name: 'account',
          params: {
            accountId: account.id,
            accountCategory: account.category,
          },
        });
      }
    },
    goToAccounts() {
      this.$router.push({
        name: 'accounts',
      });
    },
  },
};
</script>
