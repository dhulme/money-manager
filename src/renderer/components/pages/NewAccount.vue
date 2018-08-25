<template>
  <div v-hotkey.close="goToAccounts">
    <v-card>
      <v-card-title>
        <div class="headline">New Account</div>
      </v-card-title>
      <v-card-text>
        <form @submit="addAccount">
          <v-text-field
            v-model="accountCategory"
            label="Category"
            disabled
          />
          <v-text-field
            v-focus
            v-model="name"
            label="Name"
          />
          <v-text-field
            v-model="openingBalance"
            label="Opening balance"
            prefix="£"
          />
          <v-btn
            type="submit"
            color="primary"
          >Ok</v-btn>
        </form>
      </v-card-text>
    </v-card>
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
