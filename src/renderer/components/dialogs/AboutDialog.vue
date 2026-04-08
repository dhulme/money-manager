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
export default {
  computed: {
    dialog: {
      get() {
        return this.$store.state.dialog === 'about';
      },
      set(value) {
        return this.$store.commit('setDialog', value ? 'about' : null);
      }
    }
  }
};
</script>
