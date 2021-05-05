<template>
  <div class="chatitem-wrapper comment">
    <div class="comment admin">
      <div class="icon-wrapper">
        <img :src="icon" alt="" />
        <div class="admin-badge">運 営</div>
      </div>
      <ChartLine
        :chart-data="chartData"
        :options="chartOption"
        :styles="chartStyles"
      />
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { ChartData, ChartOptions } from 'chart.js'
import ChartLine from '~/utils/ChartLine'

// Data型
type DataType = {
  chartData: ChartData
  chartOption: ChartOptions
  chartStyles: any
  icon: any
}

export default Vue.extend({
  name: 'ChatRoom',
  components: {
    ChartLine,
  },
  data(): DataType {
    return {
      chartData: {
        // 横軸のラベル
        labels: ['0', '1', '2', '3', '4'],
        // データのリスト
        datasets: [
          {
            // データのラベル
            label: 'コメント数',
            // データの値。labelsと同じサイズ
            data: [1, 5, 3, 4, 3],
            backgroundColor: 'rgba(0, 0, 255, 0.3)',
            hoverRadius: 10,
          },
          {
            label: 'いいね数',
            data: [10, 50, 30, 40, 30],
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            hoverRadius: 10,
          },
        ],
      },
      // チャートのオプション
      chartOption: {
        title: {
          display: true,
          text: '解析グラフ',
        },
      },
      // チャートのスタイル: <canvas>のstyle属性として設定
      chartStyles: {
        height: 'auto',
        width: '80%',
      },
      icon: require('@/assets/img/tea.png'),
    }
  },
})
</script>
