<template>
  <div>
    <back-button name="dashboard"></back-button>

    <h1>New {{ accountTypeName }}</h1>
    <form @submit="addAccount">
      <div class="form-group">
        <label>Name</label>
        <input type="text" class="form-control" v-model="name">
      </div>
      <div class="form-group">
        <label>Opening balance</label>
        <input type="text" class="form-control" v-model="openingBalance">
      </div>
      <button type="submit" class="btn btn-default">Submit</button>
    </form>
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
        openingBalance: '',
      };
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
    methods: {
      addAccount(event) {
        event.preventDefault();
        const account = this.$project.addAccount({
          name: this.name,
          balance: this.openingBalance,
          type: this.$route.params.accountType,
        });

        this.resetForm();
        // this.goToAccount(account);
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
            accountType: account.type,
          },
        });
      },
    },
  };
</script>
