<template>
  <div>
    <v-card-text v-if="!bulkTransactions.length" class="none-message"
      ><em>No bulk transactions</em></v-card-text
    >
    <v-list v-if="bulkTransactions.length" lines="two">
      <v-list-item
        v-for="bulkTransaction in bulkTransactions"
        :key="bulkTransaction.id"
        @click="openBulkTransaction(bulkTransaction.id)"
      >
        <v-list-item-title>
          {{ bulkTransaction.name }}
        </v-list-item-title>
        <v-list-item-subtitle class="d-flex">
          <span>{{ bulkTransaction.description }}</span>
          <v-spacer />
          <span v-if="bulkTransaction.lastModified" class="text-body-2"
            >Updated {{ $date(bulkTransaction.lastModified) }}</span
          >
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import { useProjectStore } from '../store/project';

export default {
  setup() {
    return { projectStore: useProjectStore() };
  },
  computed: {
    bulkTransactions() {
      return this.projectStore.sortedBulkTransactions;
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
