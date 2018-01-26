<template>
  <div>
    <v-card>
      <v-card-title>
        <span class="headline">New {{ accountTypeName }}</span>
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
      accountTypeName() {
        return {
          asset: 'Asset',
          liability: 'Liability',
          budget: 'Budget',
        }[this.$route.params.accountType];
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
        this.$project.addAccount({
          name: this.name,
          balance: this.openingBalance,
          type: this.$route.params.accountType,
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
            accountType: account.type,
          },
        });
      },
    },
  };
</script>
