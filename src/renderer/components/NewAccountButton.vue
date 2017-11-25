<template>
  <v-btn role="button" @click="go">New</v-btn>
</template>

<script>
  export default {
    props: ['accountType'],
    methods: {
      go() {
        this.$router.push({
          name: 'newAccount',
          params: {
            accountId: 'new',
            accountType: this.accountType,
          },
        });
      },
    },
  };
</script>

