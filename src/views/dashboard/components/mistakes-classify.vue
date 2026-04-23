<template>
  <el-card class="mistakes-classify" shadow="hover">
    <div class="header">
      <div class="title">错题分类</div>
    </div>

    <div ref="chartEl" class="chart" />
  </el-card>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'

const chartEl = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
let ro: ResizeObserver | null = null

function cssVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

const mock = [
  { name: '概念不清', value: 12 },
  { name: '粗心', value: 9 },
  { name: '审题不仔细', value: 7 },
  { name: '计算错误', value: 6 },
  { name: '方法不熟', value: 5 },
]

function render() {
  if (!chart) return

  const colors = [
    cssVar('--el-color-primary', '#409EFF'),
    cssVar('--el-color-success', '#67C23A'),
    cssVar('--el-color-warning', '#E6A23C'),
    cssVar('--el-color-danger', '#F56C6C'),
    cssVar('--el-color-info', '#909399'),
  ]

  chart.setOption(
    {
      color: colors,
      tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 题（{d}%）' },
      legend: {
        type: 'scroll',
        bottom: 0,
        left: 'center',
        icon: 'circle',
        textStyle: { color: cssVar('--el-text-color-regular', '#606266') },
      },
      series: [
        {
          name: '错题分类',
          type: 'pie',
          radius: '70%',
          center: ['50%', '44%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderColor: cssVar('--el-bg-color-overlay', '#fff'),
            borderWidth: 2,
          },
          label: { formatter: '{b}\n{d}%', color: cssVar('--el-text-color-primary', '#303133') },
          labelLine: { length: 10, length2: 10 },
          data: mock,
        },
      ],
    },
    { notMerge: true }
  )
}

onMounted(() => {
  if (!chartEl.value) return
  chart = echarts.init(chartEl.value)
  render()

  ro = new ResizeObserver(() => chart?.resize())
  ro.observe(chartEl.value)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  chart?.dispose()
  chart = null
})
</script>

<style scoped lang="scss">
.mistakes-classify {
  border-radius: 12px;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  padding: 12px 12px 10px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.chart {
  width: 100%;
  height: 260px;
}
</style>
