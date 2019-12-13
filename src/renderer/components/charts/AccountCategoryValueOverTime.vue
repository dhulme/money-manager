<script>
import { Line } from 'vue-chartjs';
import moment from 'moment';
import Big from 'big.js';

// This chart doesn't seem quite right..
export default {
  extends: Line,
  props: {
    category: String
  },
  computed: {
    data() {
      if (!this.category) {
        return null;
      }

      const accounts = this.$store.getters['project/accountsByCategory'](
        this.category
      );
      const balanceByDate = {};
      accounts.forEach(account => {
        const usedDateKeys = [];
        account.transactionIds.forEach(transactionId => {
          const transaction = this.$store.getters['project/transaction'](
            transactionId
          );
          if (!transaction.date) {
            return;
          }

          const dateKey = transaction.date.substring(0, 7);
          if (!usedDateKeys.includes(dateKey)) {
            usedDateKeys.push(dateKey);
            balanceByDate[dateKey] = balanceByDate[dateKey] || {};
            const balance = this.$store.getters['project/accountBalance'](
              account,
              transactionId
            );
            balanceByDate[dateKey][account.id] = balance;
          }
        });
      });
      const previousBalances = {};

      return Object.keys(balanceByDate)
        .sort()
        .map(date => {
          const balances = balanceByDate[date];
          return {
            y: Number(
              accounts.reduce((total, account) => {
                const value =
                  balances[account.id] || (previousBalances[account.id] || '0');
                if (balances[account.id]) {
                  previousBalances[account.id] = value;
                }
                return total.plus(value);
              }, new Big(0))
            ),
            x: moment(date, 'YYYY-MM').toDate()
          };
        });
    }
  },
  watch: {
    data: 'render'
  },
  mounted() {
    this.render();
  },
  methods: {
    render() {
      const currencyPrefix = this.$currencyPrefix;
      const dateFormat = this.$dateFormat;
      this.renderChart(
        {
          datasets: [
            {
              data: this.data,
              backgroundColor: 'transparent',
              borderColor: '#1976d2'
            }
          ]
        },
        {
          responsive: true,
          legend: {
            display: false
          },
          tooltips: {
            displayColors: false,
            callbacks: {
              title([point], config) {
                const datum =
                  config.datasets[point.datasetIndex].data[point.index];
                return moment(datum.x).format(dateFormat);
              },
              label(point) {
                return currencyPrefix + point.yLabel;
              }
            }
          },
          scales: {
            xAxes: [
              {
                type: 'time',
                scaleLabel: {
                  labelString: 'Time'
                }
              }
            ],
            yAxes: [
              {
                ticks: {
                  callback(value) {
                    return currencyPrefix + value;
                  }
                }
              }
            ]
          }
        }
      );
    }
  }
};
</script>
