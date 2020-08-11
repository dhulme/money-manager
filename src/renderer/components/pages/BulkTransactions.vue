<template>
  <VCard v-hotkey.add="newBulkTransaction">
    <VCardTitle>
      <span class="title">Bulk Transactions</span>
      <VSpacer />
      <VBtn text color="primary" @click="newBulkTransaction">Add</VBtn>
    </VCardTitle>
    <BulkTransactionList />
  </VCard>
</template>

<script>
import BulkTransactionList from '../BulkTransactionList.vue';

export default {
  components: {
    BulkTransactionList
  },
  created() {
    this.$ipc.setTitle();
  },
  methods: {
    newBulkTransaction() {
      this.$store.commit('setNewBulkTransaction');
      this.$router.push({
        name: 'newBulkTransaction'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
header {
  display: flex;
  justify-content: space-between;
}
</style>
