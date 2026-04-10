<template>
  <v-date-input
    v-model="dateRange"
    label="Date range"
    prepend-icon="mdi-calendar"
    multiple="range"
    :hide-details="slim"
    :single-line="slim"
    class="input mr-3 pt-0"
  />
</template>

<script>
import { VDateInput } from 'vuetify/labs/VDateInput';

export default {
  components: { VDateInput },
  props: {
    type: {
      type: String,
      default: 'date',
    },
    slim: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    dateRangeParsed() {
      this.$emit('dateRange', this.dateRangeParsed);
    },
  },
  data() {
    return {
      dateRange: [],
    };
  },
  computed: {
    dateRangeParsed() {
      return this.dateRange;
    },
  },
};
</script>
