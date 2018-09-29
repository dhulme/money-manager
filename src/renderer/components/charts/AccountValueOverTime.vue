<script>
  import { Line } from 'vue-chartjs';
  import moment from 'moment';

  export default {
    extends: Line,
    props: {
      account: {
        type: Object,
        default: null
      }
    },
    computed: {
      data() {
        if (!this.account) {
          return null;
        }

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
      data: 'render'
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
                steppedLine: true
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
                const datum = config.datasets[point.datasetIndex].data[point.index];
                return moment(datum.x).format('Do MMMM YYYY')
              },
              label(point) {
                return `£${point.yLabel}`
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
                      return `£${value}`;
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
