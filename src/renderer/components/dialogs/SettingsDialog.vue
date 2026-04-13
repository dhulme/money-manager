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
        this.$ipc.saveSettings(this.settings);
        this.dialog = false;
      }
    },
  },
};
</script>
