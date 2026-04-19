<template>
  <v-card>
    <v-card-title>Restore Deleted Accounts</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item
          v-for="account in deletedAccounts"
          :key="account.id"
          @click="restore(account)"
        >
          <v-list-item-title>{{ account.name }}</v-list-item-title>
          <template v-slot:append>
            <v-icon>mdi-delete-restore</v-icon>
          </template>
        </v-list-item>
      </v-list>
      <p v-if="!deletedAccounts.length">No deleted accounts</p>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" variant="text" @click="close">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { useProjectStore } from '../store/project';
import { useRootStore } from '../store/root';

export default {
  setup() {
    return { projectStore: useProjectStore(), rootStore: useRootStore() };
  },
  computed: {
    deletedAccounts() {
      return this.projectStore.deletedAccounts;
    }
  },
  methods: {
    restore(account) {
      this.projectStore.restoreDeletedAccount(account.id);
    },
    close() {
      if (!this.rootStore.dialog) {
        this.$emit('close');
      }
    }
  }
};
</script>
