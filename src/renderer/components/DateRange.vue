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
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

function initialRange(type) {
  if (type === 'month') {
    const lastMonth = subMonths(new Date(), 1);
    return [startOfMonth(lastMonth), endOfMonth(lastMonth)];
  }
  return [];
}

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
    dateRangeParsed: {
      immediate: true,
      handler() {
        this.$emit('dateRange', this.dateRangeParsed);
      },
    },
  },
  data() {
    return {
      dateRange: initialRange(this.type),
    };
  },
  computed: {
    dateRangeParsed() {
      if (this.dateRange.length < 2) return this.dateRange;
      const sorted = [...this.dateRange].sort((a, b) => a - b);
      return [sorted[0], sorted[sorted.length - 1]];
    },
  },
};
</script>
