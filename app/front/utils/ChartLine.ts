import Vue, { PropOptions } from "vue"
import { ChartData, ChartOptions } from "chart.js"
import { Line, mixins } from "vue-chartjs"

export default Vue.extend({
  name: "ChartLine",
  mixins: [Line, mixins.reactiveProp],
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
