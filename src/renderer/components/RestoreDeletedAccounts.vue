<template>
  <VCard>
    <VCardTitle>Restore Deleted Accounts</VCardTitle>
    <VCardText>
      <VList>
        <VListItem
          v-for="account in deletedAccounts"
          :key="account.id"
          @click="restore(account)"
        >
          {{ account.name }}
          <VSpacer />
          <VIcon>restore_from_trash</VIcon>
        </VListItem>
      </VList>
      <p v-if="!deletedAccounts.length">No deleted accounts</p>
    </VCardText>
    <VCardActions>
      <VBtn color="primary" text @click="close">Close</VBtn>
    </VCardActions>
  </VCard>
</template>

<script>
export default {
  computed: {
    deletedAccounts() {
      return this.$store.getters['project/deletedAccounts'];
    }
  },
  methods: {
    restore(account) {
      this.$store.dispatch('project/restoreDeletedAccount', account.id);
    },
    close() {
      if (!this.$store.state.dialog) {
        this.$emit('close');
      }
    }
  }
};
</script>
