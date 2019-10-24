<template>
  <VCard>
    <VCardTitle class="headline">Import transactions</VCardTitle>
    <VCardText>
      <VDataTable :items="importedTransactions" :headers="headers" />
    </VCardText>
  </VCard>
</template>

<script>
export default {
  data() {
    return {
      headers: [
        {
          text: 'date',
          value: 'date'
        },
        {
          text: 'description',
          value: 'description'
        },
        {
          text: 'value',
          value: 'value'
        }
      ]
    };
  },
  computed: {
    importedTransactions() {
      return this.$store.state.importedTransactions;
    }
  }
};
</script>
