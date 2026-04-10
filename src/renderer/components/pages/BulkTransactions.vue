<template>
  <v-card v-hotkey.add="newBulkTransaction">
    <v-card-title>
      <v-row class="ma-1">
        <span class="text-subtitle-1">Bulk Transactions</span>
        <v-spacer />
        <v-btn variant="text" color="primary" @click="newBulkTransaction"
          >Add</v-btn
        >
      </v-row>
    </v-card-title>
    <BulkTransactionList />
  </v-card>
</template>

<script>
import BulkTransactionList from '../BulkTransactionList.vue';

export default {
  components: { BulkTransactionList },
  created() {
    this.$ipc.setTitle();
  },
  methods: {
    newBulkTransaction() {
      this.$store.commit('setNewBulkTransaction');
      this.$router.push({ name: 'newBulkTransaction' });
    },
  },
};
</script>

<style lang="scss" scoped>
header {
  display: flex;
  justify-content: space-between;
}
</style>
