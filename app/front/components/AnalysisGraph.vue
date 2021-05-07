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
import Vue, { PropOptions } from 'vue'
import { Topic, ChatItem } from '@/models/contents'
import { ChartData, ChartOptions } from 'chart.js'
import ChartLine from '~/utils/ChartLine'

// Data型
type DataType = {
  chartData: ChartData
  chartOption: ChartOptions
  chartStyles: any
  icon: any
}

type ChatDataPropType = {
  topic: Topic
  message: ChatItem[]
}

export default Vue.extend({
  name: 'ChatRoom',
  components: {
    ChartLine,
  },
  props: {
    chatData: {
      type: Object,
      required: true,
    } as PropOptions<ChatDataPropType>,
  },
  data(): DataType {
    return {
      chartData: {
        // データのリスト
        datasets: [
          {
            // データのラベル
            label: 'コメント数',
            // データの値。labelsと同じサイズ
            data: [],
            borderColor: 'rgba(0, 0, 255, 0.3)',
            backgroundColor: 'rgba(0, 0, 255, 0.3)',
          },
          {
            label: 'いいね数',
            data: [],
            borderColor: 'rgba(255, 0, 0, 0.3)',
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
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
  watch: {
    // グラフの描画
    drawGraph() {},
  },
})
</script>
