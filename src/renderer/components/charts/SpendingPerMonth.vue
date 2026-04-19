<template>
  <div>
    <v-autocomplete
      v-model="excludedAccountIds"
      :items="accountItems"
      label="Exclude accounts"
      multiple
      chips
      closable-chips
      hide-details
      class="mb-3"
    />
    <div style="max-width: 400px; margin: 0 auto">
      <Pie v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script>
import { Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import Big from 'big.js';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import colors from 'vuetify/lib/util/colors.mjs';
import { useProjectStore } from '../../store/project';

ChartJS.register(ArcElement, Tooltip, Legend);

export default {
  components: { Pie },
  props: {
    date: Date,
  },
  setup() {
    return { projectStore: useProjectStore() };
  },
  data() {
    return {
      excludedAccountIds: [],
    };
  },
  computed: {
    accounts() {
      return this.projectStore.accountsByType('budget');
    },
    filteredAccounts() {
      return this.accounts.filter(
        (account) => !this.excludedAccountIds.includes(account.id)
      );
    },
    accountItems() {
      return this.accounts.map((account) => ({
        title: account.name,
        value: account.id,
      }));
    },
    data() {
      if (!this.date) {
        return null;
      }

      const start = startOfMonth(this.date);
      const end = endOfMonth(this.date);

      return this.filteredAccounts.map((account) => {
        return Number(
          account.transactionIds.reduce((total, transactionId) => {
            const transaction =
              this.projectStore.getTransaction(transactionId);
            if (
              transaction.date &&
              transaction.from === account.id &&
              isWithinInterval(parseISO(transaction.date), { start, end })
            ) {
              return total.plus(transaction.value);
            }
            return total;
          }, new Big(0))
        );
      });
    },
    dataSum() {
      return Number(
        this.data.reduce(
          (total, value) => new Big(total).plus(value),
          new Big(0)
        )
      );
    },
    chartData() {
      if (!this.data) return null;
      return {
        labels: this.filteredAccounts.map((account) => account.name),
        datasets: [
          {
            data: this.data,
            backgroundColor: [
              Object.values(colors.lightBlue),
              Object.values(colors.cyan),
              Object.values(colors.teal),
              Object.values(colors.lightGreen),
              Object.values(colors.lime),
            ].flat(),
          },
        ],
      };
    },
    chartOptions() {
      const dataSum = this.dataSum;
      return {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                return `${this.$currencyPrefix}${value} (${(
                  (value / dataSum) *
                  100
                ).toFixed(1)}%)`;
              },
              title: (items) => {
                if (!items.length) return '';
                return items[0].label;
              },
            },
          },
        },
      };
    },
  },
};
</script>
