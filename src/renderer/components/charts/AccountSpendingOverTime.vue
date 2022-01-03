<script>
import { Bar } from 'vue-chartjs';
import moment from 'moment';
import Big from 'big.js';
import { isAfter, isBefore, parseISO, isSameDay } from 'date-fns';

export default {
  extends: Bar,
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
  },
  watch: {
    data: 'render',
  },
  mounted() {
    this.render();
  },
  methods: {
    render() {
      this.renderChart(
        {
          labels: Object.keys(this.data).map((_) =>
            moment(_, 'YYYY-MM').toDate()
          ),
          datasets: [
            {
              data: Object.values(this.data).map((_) => Number(_)),
              backgroundColor: '#1976d2',
              borderColor: '#1976d2',
            },
          ],
        },
        {
          responsive: true,
          legend: {
            display: false,
          },
          tooltips: {
            displayColors: false,
            callbacks: {
              title: ([point], config) => {
                return moment(point.label).format(this.$dateFormat);
              },
              label: (point) => {
                return this.$currencyPrefix + point.yLabel;
              },
            },
          },
          scales: {
            xAxes: [
              {
                type: 'time',
                scaleLabel: {
                  labelString: 'Time',
                },
                time: {
                  unit: 'month',
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  callback: (value) => {
                    return this.$currencyPrefix + value;
                  },
                },
              },
            ],
          },
        }
      );
    },
  },
};
</script>
