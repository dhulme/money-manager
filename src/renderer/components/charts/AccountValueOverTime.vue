<script>
  import { Line } from 'vue-chartjs';

  export default {
    extends: Line,
    props: {
      account: {
        required: true,
        type: Object
      }
    },
    computed: {
      data() {
        return this.account.transactionIds
          .map(transactionId => {
            const transaction = this.$store.getters['project/transaction'](
              transactionId
            );
            if (transaction.date) {
              return {
                y: this.$store.getters['project/accountBalance'](
                  this.account,
                  transactionId
                ),
                x: new Date(transaction.date)
              };
            }
            return null;
          })
          .filter(_ => Boolean(_));
      }
    },
    watch: {
      transactions: 'render'
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
                borderColor: '#1976d2'
              }
            ]
          },
          {
            responsive: true,
            scales: {
              xAxes: [
                {
                  type: 'time'
                }
              ]
            }
          }
        );
      }
    }
  };
</script>
