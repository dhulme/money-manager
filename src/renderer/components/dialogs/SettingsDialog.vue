<template>
  <VDialog v-model="dialog" max-width="600" persistent no-click-animation>
    <VCard>
      <VCardTitle>Preferences</VCardTitle>
      <VForm ref="form" v-model="valid" lazy-validation @submit.prevent="save">
        <VCardText>
          <p>
            Note: These changes will only be visible when the app is restarted.
          </p>
          <div class="text-h6">Formats</div>
          <VTextField
            label="Currency format"
            v-model="settings.currencyPrefix"
            class="required"
            :rules="currencyPrefixRules"
          />
          <VTextField
            label="Date format"
            v-model="settings.dateFormat"
            class="required"
            :rules="dateFormatRules"
          />
          <div class="text-caption">Example date: {{ exampleDate }}</div>

          <div class="text-h6 mt-8">Import transactions</div>
          <VCombobox
            multiple
            clearable
            deletable-chips
            chips
            label="Transactions descriptions with Gift Aid"
            v-model="settings.importTransactionsDescriptionsGiftAided"
          />
        </VCardText>
        <VCardActions>
          <VBtn type="submit" text color="primary">Ok</VBtn>
          <VBtn text @click="dialog = false">Cancel</VBtn>
        </VCardActions>
      </VForm>
    </VCard>
  </VDialog>
</template>

<script>
import moment from 'moment';

export default {
  data() {
    return {
      settings: {},
      currencyPrefixRules: [
        (value) => !!value || 'Currency format is required',
      ],
      dateFormatRules: [(value) => !!value || 'Date format is required'],
      valid: true,
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
      },
    },
    exampleDate() {
      return (
        this.settings.dateFormat && moment().format(this.settings.dateFormat)
      );
    },
  },
  methods: {
    save() {
      if (this.$refs.form.validate()) {
        this.$ipc.saveSettings(this.settings);
        this.dialog = false;
      }
    },
  },
};
</script>
