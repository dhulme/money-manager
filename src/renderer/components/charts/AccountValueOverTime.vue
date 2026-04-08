<template>
  <Line v-if="chartData" :data="chartData" :options="chartOptions" />
</template>

<script>
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { isAfter, isBefore, parseISO, isSameDay, format } from 'date-fns';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, TimeScale, Tooltip, Legend, Filler);

export default {
  components: { Line },
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

      return this.account.transactionIds
        .map((transactionId) => {
          const transaction =
            this.$store.getters['project/transaction'](transactionId);
          if (transaction.date) {
            return {
              y: Number(
                this.$store.getters['project/accountBalance'](
                  this.account,
                  transactionId
                )
              ),
              x: parseISO(transaction.date),
            };
          }
          return null;
        })
        .filter((point) => {
          if (!point) return false;
          if (this.dateRange.length === 1) {
            if (!isSameDay(point.x, this.dateRange[0])) return false;
          }
          if (this.dateRange.length === 2) {
            if (
              isBefore(point.x, this.dateRange[0]) ||
              isAfter(point.x, this.dateRange[1])
            )
              return false;
          }
          return true;
        });
    },
    chartData() {
      if (!this.data) return null;
      return {
        datasets: [
          {
            data: this.data,
            backgroundColor: 'transparent',
            borderColor: '#1976d2',
            stepped: true,
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
                const datum = this.data[items[0].dataIndex];
                return format(datum.x, this.$dateFormat);
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
