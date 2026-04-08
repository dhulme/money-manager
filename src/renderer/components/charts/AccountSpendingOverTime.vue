<template>
  <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
</template>

<script>
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import Big from 'big.js';
import { isAfter, isBefore, parseISO, isSameDay, parse } from 'date-fns';

ChartJS.register(BarElement, CategoryScale, LinearScale, TimeScale, Tooltip, Legend);

export default {
  components: { Bar },
  props: {
    account: {
      type: Object,
      default: null,
    },
    dateRange: Array,
  },
  computed: {
    data() {
      if (!this.account) {
        return null;
      }

      return this.account.transactionIds.reduce(
        (monthlyTotals, transactionId) => {
          const transaction =
            this.$store.getters['project/transaction'](transactionId);

          if (transaction.date && transaction.from === this.account.id) {
            const date = parseISO(transaction.date);
            if (this.dateRange.length === 1) {
              if (!isSameDay(date, this.dateRange[0])) return monthlyTotals;
            }
            if (this.dateRange.length === 2) {
              if (
                isBefore(date, this.dateRange[0]) ||
                isAfter(date, this.dateRange[1])
              )
                return monthlyTotals;
            }
            const dateKey = transaction.date.substring(0, 7);
            const total = monthlyTotals[dateKey] || new Big(0);
            monthlyTotals[dateKey] = total.plus(transaction.value);
          }
          return monthlyTotals;
        },
        {}
      );
    },
    chartData() {
      if (!this.data) return null;
      return {
        labels: Object.keys(this.data).map((_) =>
          parse(_, 'yyyy-MM', new Date())
        ),
        datasets: [
          {
            data: Object.values(this.data).map((_) => Number(_)),
            backgroundColor: '#1976d2',
            borderColor: '#1976d2',
          },
        ],
      };
    },
    chartOptions() {
      return {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            displayColors: false,
            callbacks: {
              title: (items) => {
                if (!items.length) return '';
                return items[0].label;
              },
              label: (context) => {
                return this.$currencyPrefix + context.parsed.y;
              },
            },
          },
        },
        scales: {
          x: {
            type: 'time',
            title: { display: true, text: 'Time' },
            time: { unit: 'month' },
          },
          y: {
            ticks: {
              callback: (value) => this.$currencyPrefix + value,
            },
          },
        },
      };
    },
  },
};
</script>
