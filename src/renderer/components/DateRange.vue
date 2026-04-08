<template>
  <v-menu
    ref="dateRangeMenu"
    v-model="dateRangeMenu"
    :close-on-content-click="false"
    transition="scale-transition"
    min-width="auto"
  >
    <template v-slot:activator="{ props }">
      <v-text-field
        v-model="dateRangeText"
        label="Date range"
        prepend-icon="mdi-calendar"
        readonly
        :hide-details="slim"
        :single-line="slim"
        v-bind="props"
        class="input mr-3 pt-0"
      />
    </template>
    <v-date-input v-model="dateRange" />
  </v-menu>
</template>

<script>
import { parse } from 'date-fns';

export default {
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
    dateRangeMenu(open) {
      if (!open) {
        this.$emit('dateRange', this.dateRangeParsed);
      }
    },
    dateRangeParsed() {
      this.$emit('dateRange', this.dateRangeParsed);
    },
  },
  data() {
    return {
      dateRangeMenu: false,
      dateRange: [],
      today: new Date(),
    };
  },
  computed: {
    dateRangeText() {
      return this.dateRange.join(' - ');
    },
    dateRangeParsed() {
      return this.dateRange.map((dateString) =>
        parse(
          dateString,
          dateString.length === 7 ? 'yyyy-MM' : 'yyyy-MM-dd',
          this.today
        )
      );
    },
  },
};
</script>
