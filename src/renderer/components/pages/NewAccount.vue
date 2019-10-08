<template>
  <div v-hotkey.close="goToAccounts">
    <VCard>
      <VCardTitle>
        <div class="headline">New Account</div>
      </VCardTitle>
      <VCardText>
        <form @submit="addAccount">
          <VTextField
            v-model="accountCategory"
            label="Category"
            disabled
          />
          <VTextField
            v-focus
            v-model="name"
            label="Name"
          />
          <VTextField
            v-model="openingBalance"
            label="Opening balance"
            prefix="£"
          />
          <VBtn
            type="submit"
            color="primary"
          >Ok</VBtn>
        </form>
      </VCardText>
    </VCard>
  </div>
</template>

<script>
  import BackButton from '../BackButton';

  export default {
    components: {
      BackButton,
    },
    data() {
      return {
        name: '',
        openingBalance: '0',
      };
    },
    computed: {
      accountCategory() {
        return this.$route.params.accountCategory;
      },
      accountType() {
        return this.$route.params.accountType;
      },
    },
    watch: {
      name(name) {
        this.$ipc.setTitle(name);
      },
    },
    created() {
      this.$ipc.setTitle();
    },
    methods: {
      addAccount(event) {
        event.preventDefault();
        this.$store.dispatch('project/addAccount', {
          name: this.name,
          balance: this.openingBalance,
          category: this.accountCategory,
          type: this.accountType,
        });

        this.resetForm();
        this.goToAccounts();
      },
      resetForm() {
        this.name = '';
        this.openingBalance = '';
      },
      goToAccount(account) {
        this.$router.push({
          name: 'account',
          params: {
            accountId: account.id,
            accountCategory: account.category,
          },
        });
      },
      goToAccounts() {
        this.$router.push({
          name: 'accounts',
        });
      },
    },
  };
</script>
