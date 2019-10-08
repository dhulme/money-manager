<template>
  <div>
    <VCardText
      v-if="!bulkTransactions.length"
      class="none-message"
    ><em>No bulk transactions</em></VCardText>
    <v-list
      v-if="bulkTransactions.length"
      two-line
    >
      <VListTile
        v-for="bulkTransaction in bulkTransactions"
        :key="bulkTransaction.id"
        @click="openBulkTransaction(bulkTransaction.id)"
      >
        <VListTileContent>
          <VListTileTitle>
            {{ bulkTransaction.name }}
          </VListTileTitle>
          <VListTileSubTitle>
            {{ bulkTransaction.description }}
          </VListTileSubTitle>
        </VListTileContent>
      </VListTile>
    </v-list>
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