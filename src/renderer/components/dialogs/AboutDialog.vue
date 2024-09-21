<template>
  <VDialog v-model="dialog" max-width="400" persistent no-click-animation>
    <VCard>
      <VCardTitle>About</VCardTitle>
      <VCardText class="text-center">
        <p>Created by David Hulme</p>
        <p>
          <a href="https://github.com/dhulme/money-manager"
            >github.com/dhulme/money-manager</a
          ><br />
          <a href="https://dhulme.uk">dhulme.uk</a><br />
          <a href="https://twitter.com/hulmed">@hulmed</a>
        </p>
        <p>Version {{ version }}</p>
      </VCardText>
      <VCardActions>
        <VBtn text @click="dialog = null">Close</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script>
import { mapStores } from 'pinia';
import { appStore } from '../../store/app';

export default {
  data() {
    return {
      version: 1, //process.env.PACKAGE_VERSION
    };
  },
  computed: {
    ...mapStores(appStore),
    dialog: {
      get() {
        return this.appStore.dialog === 'about';
      },
      set(value) {
        return this.appStore.setDialog(value ? 'about' : null);
      },
    },
  },
};
</script>
