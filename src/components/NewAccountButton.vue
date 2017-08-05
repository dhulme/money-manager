<template>
  <button class="btn btn-default" role="button" @click="go">New</button>
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

