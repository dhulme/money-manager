<template>
  <div v-hotkey.close="goToAccounts">
    <VCard>
      <VCardTitle>
        <div class="headline">{{ accountId ? 'Edit' : 'Add' }} Account</div>
      </VCardTitle>
      <VCardText>
        <VForm @submit="save">
          <VTextField v-model="accountCategory" label="Category" disabled />
          <VTextField autofocus v-model="newAccount.name" label="Name" />
          <VTextField
            v-if="!account"
            v-model="newAccount.openingBalance"
            label="Opening balance"
            :prefix="$currencyPrefix"
          />
          <VSelect
            :items="importTransactionsFormatItems"
            label="Transaction import format"
            v-model="newAccount.importTransactionsFormatId"
          />
          <VBtn type="submit" color="primary">OK</VBtn>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<script>
import { importTransactionsFormatItems } from '../../import-transactions';
export default {
  data() {
    return {
      newAccount: {
        name: '',
        openingBalance: '0',
        importTransactionsFormatId: null
      },
      importTransactionsFormatItems
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
      return this.$route.params.accountId;
    },
    account() {
      return (
        this.accountId && this.$store.getters['project/account'](this.accountId)
      );
    }
  },
  mounted() {
    this.newAccount = { ...this.account };
  },
  watch: {
    'newAccount.name'(name) {
      this.$ipc.setTitle(name);
    }
  },
  created() {
    this.$ipc.setTitle();
  },
  methods: {
    save(event) {
      event.preventDefault();

      if (this.accountId) {
        this.$store.dispatch('project/editAccount', {
          id: this.newAccount.id,
          name: this.newAccount.name,
          importTransactionsFormatId: this.newAccount.importTransactionsFormatId
        });
      } else {
        this.$store.dispatch('project/addAccount', {
          name: this.newAccount.name,
          balance: this.newAccount.openingBalance,
          importTransactionsFormatId: this.newAccount
            .importTransactionsFormatId,
          category: this.accountCategory,
          type: this.accountType
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
            accountCategory: account.category
          }
        });
      }
    },
    goToAccounts() {
      this.$router.push({
        name: 'accounts'
      });
    }
  }
};
</script>
