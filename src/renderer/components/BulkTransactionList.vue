<template>
  <v-list two-line>
    <v-list-tile
      v-for="bulkTransaction in $store.getters['project/bulkTransactions']"
      :key="bulkTransaction.id"
      @click="openBulkTransaction(bulkTransaction.id)"
    >
      <v-list-tile-content>
        <v-list-tile-title>
          {{ bulkTransaction.name }}
        </v-list-tile-title>
        <v-list-tile-sub-title>
          {{ bulkTransaction.description }}
        </v-list-tile-sub-title>
      </v-list-tile-content>
    </v-list-tile>
  </v-list>
</template>

<script>
  export default {
    methods: {
      openBulkTransaction(id) {
        this.$router.push({
          name: 'bulkTransaction',
          params: {
            bulkTransactionId: id,
          },
        });
      },
    },
  };
</script>

<style lang="scss">

</style>