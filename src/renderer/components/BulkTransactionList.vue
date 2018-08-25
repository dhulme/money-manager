<template>
  <div>
    <v-card-text
      v-if="!bulkTransactions.length"
      class="none-message"
    ><em>No bulk transactions</em></v-card-text>
    <v-list
      v-if="bulkTransactions.length"
      two-line
    >
      <v-list-tile
        v-for="bulkTransaction in bulkTransactions"
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