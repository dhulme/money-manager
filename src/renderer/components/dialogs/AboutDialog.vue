<template>
  <v-dialog v-model="dialog" max-width="400" persistent no-click-animation>
    <v-card>
      <v-card-title>About</v-card-title>
      <v-card-text class="text-center">
        <p>Created by David Hulme</p>
        <p>
          <a href="https://github.com/dhulme/money-manager"
            >github.com/dhulme/money-manager</a
          ><br />
          <a href="https://dhulme.uk">dhulme.uk</a><br />
          <a href="https://twitter.com/hulmed">@hulmed</a>
        </p>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" @click="dialog = null">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { useRootStore } from '../../store/root';

export default {
  setup() {
    return { rootStore: useRootStore() };
  },
  computed: {
    dialog: {
      get() {
        return this.rootStore.dialog === 'about';
      },
      set(value) {
        this.rootStore.setDialog(value ? 'about' : null);
      }
    }
  }
};
</script>
