<template>
  <div class="chatitem-wrapper">
    <div class="comment admin">
      <ChartLine
        :chart-data="chartData"
        :options="chartOption"
        :styles="chartStyles"
      />
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { ChartData, ChartOptions } from "chart.js"
import ChartLine from "~/utils/ChartLine"
import { ChatItemStore } from "~/store"

// Data型
type DataType = {
  chartData: ChartData
  chartOption: ChartOptions
  chartStyles: any
  icon: string
}

export default Vue.extend({
  name: "ChatRoom",
  components: {
    ChartLine,
  },
  props: {
    topicTitle: {
      type: String,
      required: true,
    },
    topicId: {
      type: Number,
      required: true,
    },
  },
  data(): DataType {
    return {
      chartData: {
        labels: [],
        datasets: [],
      },
      // チャートのオプション
      chartOption: {
        title: {
          display: true,
          text: this.topicTitle + "の盛り上がり度",
        },
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true, // ラベルの表示・非表示
                labelString: "時間(/10秒)",
              },
            },
          ],
          yAxes: [
            {
              display: false,
            },
          ],
        },
        tooltips: {
          mode: undefined,
        },
      },
      // チャートのスタイル: <canvas>のstyle属性として設定
      chartStyles: {
        height: "auto",
        width: "100%",
      },
      icon: require("@/assets/img/tea.png"),
    }
  },
  // グラフの描画: 10秒ごとに分けて値をカウント→値を描画する。
  mounted() {
    this.fillData()
  },
  methods: {
    // タイムスタンプを辞書式にカウント
    toCountStamp(array: Array<number>, m: number) {
      const dict: { [key: number]: number } = {}
      // 0埋め
      for (let i = 0; i <= m; i++) {
        dict[i] = 0
      }
      for (const key of array) {
        dict[key] = array.filter(function (x) {
          return x === key
        }).length
      }
      return dict
    },
    // 運営を弾いたコメント数といいね数のデータを埋める
    fillData() {
      const commentStamp: Array<number> = ChatItemStore.chatItems
        .filter(({ iconId }) => iconId !== 0)
        .filter(({ topicId }) => topicId === this.topicId)
        .map((message) => Math.floor((message.timestamp as number) / 10000))
      const maxStamp: number = Math.max(...commentStamp)
      const commentNum: { [key: number]: number } = this.toCountStamp(
        commentStamp,
        maxStamp,
      )
      this.chartData = {
        labels: Object.keys(commentNum),
        // データのリスト
        datasets: [
          {
            // データのラベル
            label: "コメント",
            // データの値。labelsと同じサイズ
            data: Object.values(commentNum),
            borderColor: "rgba(0, 0, 255, 0.3)",
            backgroundColor: "rgba(0, 0, 255, 0.3)",
          },
          // {
          //   label: 'いいね',
          //   data: [],
          //   borderColor: 'rgba(255, 0, 0, 0.3)',
          //   backgroundColor: 'rgba(255, 0, 0, 0.3)',
          // },
        ],
      }
    },
  },
})
</script>
