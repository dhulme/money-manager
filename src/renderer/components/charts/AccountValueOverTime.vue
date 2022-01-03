<script>
import { Line } from 'vue-chartjs';
import moment from 'moment';
import { isAfter, isBefore, parseISO, isSameDay } from 'date-fns';

export default {
  extends: Line,
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
          datasets: [
            {
              data: this.data,
              backgroundColor: 'transparent',
              borderColor: '#1976d2',
              steppedLine: true,
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
                const datum =
                  config.datasets[point.datasetIndex].data[point.index];
                return moment(datum.x).format(this.$dateFormat);
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
