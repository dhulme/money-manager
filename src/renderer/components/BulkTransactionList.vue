<template>
  <div>
    <VCardText v-if="!bulkTransactions.length" class="none-message"
      ><em>No bulk transactions</em></VCardText
    >
    <VList v-if="bulkTransactions.length" two-line>
      <VListItem
        v-for="bulkTransaction in bulkTransactions"
        :key="bulkTransaction.id"
        @click="openBulkTransaction(bulkTransaction.id)"
      >
        <VListItemContent>
          <VListItemTitle>
            {{ bulkTransaction.name }}
          </VListItemTitle>
          <VListItemSubtitle class="d-flex">
            <span>{{ bulkTransaction.description }}</span>
            <VSpacer />
            <span v-if="bulkTransaction.lastModified" class="body-2"
              >Updated {{ bulkTransaction.lastModified | date }}</span
            >
          </VListItemSubtitle>
        </VListItemContent>
      </VListItem>
    </VList>
  </div>
</template>

<script>
export default {
  computed: {
    bulkTransactions() {
      return this.$store.getters['project/bulkTransactions'];
    }
  },
  methods: {
    openBulkTransaction(id) {
      this.$router.push({
        name: 'bulkTransaction',
        params: {
          bulkTransactionId: id
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.none-message {
  text-align: center;
}
</style>
