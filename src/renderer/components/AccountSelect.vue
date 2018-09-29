<template>
  <v-autocomplete 
    :value="value" 
    :items="accounts"
    label="Account"
    @input="$emit('input', $event)"
  />
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: null
    }
  },
  computed: {
    accounts() {
      return this.$store.state.project.accounts.map(account => ({
        text: account.name,
        value: account.id
      }));
    }
  }
};
</script>

<style lang="scss">
</style>