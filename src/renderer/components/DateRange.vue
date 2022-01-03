<template>
  <VMenu
    ref="dateRangeMenu"
    v-model="dateRangeMenu"
    :close-on-content-click="false"
    :return-value.sync="dateRange"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template v-slot:activator="{ on, attrs }">
      <VTextField
        v-model="dateRangeText"
        label="Date range"
        prepend-icon="mdi-calendar"
        readonly
        :hide-details="slim"
        :single-line="slim"
        v-on="on"
        v-bind="attrs"
        class="input mr-3 pt-0"
      />
    </template>
    <VDatePicker v-model="dateRange" range no-title :type="type" />
  </VMenu>
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
      if (!open) this.$refs.dateRangeMenu.save(this.dateRange);
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
