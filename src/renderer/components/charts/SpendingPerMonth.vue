<script>
import { Pie } from 'vue-chartjs';
import moment from 'moment';
import Big from 'big.js';
import colors from 'vuetify/lib/util/colors';

export default {
  extends: Pie,
  props: {
    date: Object
  },
  computed: {
    accounts() {
      return this.$store.getters['project/accountsByType']('budget');
    },
    data() {
      if (!this.date) {
        return null;
      }

      const startMonth = moment(this.date).startOf('month');
      const endMonth = moment(this.date).endOf('month');

      return this.accounts.map(account => {
        return Number(
          account.transactionIds.reduce((total, transactionId) => {
            const transaction = this.$store.getters['project/transaction'](
              transactionId
            );
            if (
              transaction.date &&
              transaction.from === account.id &&
              moment(transaction.date).isBetween(startMonth, endMonth)
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
      this.renderChart(
        {
          labels: this.accounts.map(account => account.name),
          datasets: [
            {
              data: this.data,
              backgroundColor: [
                Object.values(colors.lightBlue),
                Object.values(colors.cyan),
                Object.values(colors.teal),
                Object.values(colors.lightGreen),
                Object.values(colors.lime)
              ].flat()
            }
          ]
        },
        {
          responsive: true,
          legend: {
            display: false
          },
          tooltips: {
            callbacks: {
              label: (point, data) => {
                const value = data.datasets[0].data[point.index];
                return `${this.$currencyPrefix}${value} (${(
                  (value / this.dataSum) *
                  100
                ).toFixed(1)}%)`;
              },
              title([point], data) {
                return data.labels[point.index];
              }
            }
          }
        }
      );
    }
  }
};
</script>
