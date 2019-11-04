<template>
  <VDialog v-model="dialog" max-width="600">
    <VCard>
      <VCardTitle>Preferences</VCardTitle>
      <VCardText>
        <VForm>
          <VTextField
            label="Currency format"
            v-model="settings.currencyPrefix"
          />
          <VTextField label="Date format" v-model="settings.dateFormat" />
        </VForm>
      </VCardText>
      <VCardActions>
        <VBtn text color="primary" @click="save">Ok</VBtn>
        <VBtn text @click="dialog = false">Cancel</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script>
export default {
  data() {
    return {
      settings: {}
    };
  },
  async created() {
    this.settings = await this.$ipc.getSettings();
  },
  computed: {
    dialog: {
      get() {
        return this.$store.state.dialog === 'settings';
      },
      set(value) {
        return this.$store.commit('setDialog', value ? 'settings' : null);
      }
    }
  },
  methods: {
    save() {
      this.$ipc.saveSettings(this.settings);
      this.dialog = false;
    }
  }
};
</script>
