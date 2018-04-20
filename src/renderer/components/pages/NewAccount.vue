<template>
  <div v-hotkey.close="goToAccounts">
    <v-card>
      <v-card-title>
        <span class="headline">New {{ accountCategory }}</span>
      </v-card-title>
      <v-card-text>
        <form @submit="addAccount">
          <v-text-field
            v-focus
            v-model="name"
            label="Name"
          />
          <v-text-field
            v-model="openingBalance"
            label="Opening Balance"
          />
          <v-btn
            type="submit"
            color="primary"
          >Submit</v-btn>
        </form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
  import BackButton from '@/components/BackButton';

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
        this.$store.dispatch('addAccount', {
          name: this.name,
          balance: this.openingBalance,
          category: this.accountCategory,
          type: this.accountType,
        });

        this.resetForm();
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
