<template>
  <div>
    <v-card>
      <v-card-title>
        <span class="headline">New {{ accountCategory }}</span>
      </v-card-title>
      <v-card-text>
        <form @submit="addAccount">
          <v-text-field
            v-model="name"
            ref="name"
            label="Name"
          />
          <v-text-field
            label="Opening Balance"
            v-model="openingBalance"
          />
          <v-btn type="submit" color="primary">Submit</v-btn>
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
    created() {
      this.$ipc.setTitle();
    },
    computed: {
      accountCategory() {
        return this.$route.params.accountCategory;
      },
    },
    watch: {
      name(name) {
        this.$ipc.setTitle(name);
      },
    },
    methods: {
      addAccount(event) {
        event.preventDefault();
        this.$store.dispatch('addAccount', {
          name: this.name,
          balance: this.openingBalance,
          type: this.$route.params.accountCategory,
        });

        this.resetForm();
      },
      resetForm() {
        this.name = '';
        this.openingBalance = '';
        this.$refs.name.focus();
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
    },
  };
</script>
