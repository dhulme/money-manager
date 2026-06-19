<template>
  <v-dialog v-model="dialog" max-width="600" persistent no-click-animation>
    <v-card>
      <v-card-title>Preferences</v-card-title>
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="save">
        <v-card-text>
          <p>
            Note: These changes will only be visible when the app is restarted.
          </p>
          <div class="text-h6">Formats</div>
          <v-text-field
            label="Currency format"
            v-model="settings.currencyPrefix"
            class="required"
            :rules="currencyPrefixRules"
          />
          <v-text-field
            label="Date format"
            v-model="settings.dateFormat"
            class="required"
            :rules="dateFormatRules"
          />
          <div class="text-caption">Example date: {{ exampleDate }}</div>

          <div class="text-h6 mt-8">Import transactions</div>
          <v-combobox
            multiple
            clearable
            chips
            label="Transactions descriptions with Gift Aid"
            v-model="settings.importTransactionsDescriptionsGiftAided"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn type="submit" variant="text" color="primary">Ok</v-btn>
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { format } from 'date-fns';
import { useRootStore } from '../../store/root';

export default {
  setup() {
    return { rootStore: useRootStore() };
  },
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
    const settings = await this.$ipc.getSettings();
    // Convert legacy moment.js tokens to date-fns tokens
    settings.dateFormat = settings.dateFormat
      .replace(/YYYY/g, 'yyyy')
      .replace(/DD/g, 'dd');
    this.settings = settings;
  },
  computed: {
    dialog: {
      get() {
        return this.rootStore.dialog === 'settings';
      },
      set(value) {
        this.rootStore.setDialog(value ? 'settings' : null);
      },
    },
    exampleDate() {
      try {
        return (
          this.settings.dateFormat && format(new Date(), this.settings.dateFormat)
        );
      } catch {
        return 'Invalid format';
      }
    },
  },
  methods: {
    async save() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        // Create a plain object to avoid IPC cloning issues with Vue reactivity
        const settingsToSave = {
          projectPath: this.settings.projectPath,
          lastBackupDates: this.settings.lastBackupDates,
          currencyPrefix: this.settings.currencyPrefix,
          dateFormat: this.settings.dateFormat,
          importTransactionsDescriptionsGiftAided: this.settings.importTransactionsDescriptionsGiftAided,
        };
        // Deeply serialize to remove Vue proxy wrappers
        this.$ipc.saveSettings(JSON.parse(JSON.stringify(settingsToSave)));
        this.dialog = false;
      }
    },
  },
};
</script>
