import Vue, { PropOptions } from 'vue'
import { ChartData, ChartOptions } from 'chart.js'
import { Line } from 'vue-chartjs'

export default Vue.extend({
  name: 'ChartLine',
  mixins: [Line],
  props: {
    chartData: {
      type: Object,
      required: true,
    } as PropOptions<ChartData>,
    options: {
      type: Object,
      required: true,
    } as PropOptions<ChartOptions>,
  },
  mounted() {
    // @ts-ignore
    this.renderChart(this.chartData, this.options)
  },
})
