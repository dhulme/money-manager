<template>
  <VDialog v-model="dialog" max-width="600" persistent no-click-animation>
    <VCard>
      <VCardTitle>Preferences</VCardTitle>
      <VCardText>
        <VForm ref="form" v-model="valid" lazy-validation>
          <p>
            Note: These changes will only be visible when the app is restarted.
          </p>
          <VTextField
            label="Currency format"
            v-model="settings.currencyPrefix"
            required
            :rules="currencyPrefixRules"
          />
          <VTextField
            label="Date format"
            v-model="settings.dateFormat"
            required
            :rules="dateFormatRules"
          />
          <VLabel>Example date: {{ exampleDate }}</VLabel>
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
import moment from 'moment';

export default {
  data() {
    return {
      settings: {},
      currencyPrefixRules: [value => !!value || 'Currency format is required'],
      dateFormatRules: [value => !!value || 'Date format is required'],
      valid: true
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
    },
    exampleDate() {
      return (
        this.settings.dateFormat && moment().format(this.settings.dateFormat)
      );
    }
  },
  methods: {
    save() {
      if (this.$refs.form.validate()) {
        this.$ipc.saveSettings(this.settings);
        this.dialog = false;
      }
    }
  }
};
</script>
