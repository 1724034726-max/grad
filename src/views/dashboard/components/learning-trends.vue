<template>
  <el-card class="learning-trends" shadow="hover">
    <div class="header">
      <div class="title">学习趋势（近7天正确率）</div>
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

const xData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const yData = [72, 80, 76, 88, 83, 90, 78]

function cssVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace('#', '').trim()
  if (h.length === 3) {
    const r = parseInt(h.slice(0, 1).repeat(2), 16)
    const g = parseInt(h.slice(1, 2).repeat(2), 16)
    const b = parseInt(h.slice(2, 3).repeat(2), 16)
    return { r, g, b }
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return { r, g, b }
  }
  return null
}

function withAlpha(color: string, alpha: number) {
  const rgb = color.startsWith('#') ? hexToRgb(color) : null
  if (!rgb) return color
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`
}

function render() {
  if (!chart) return

  const primary = cssVar('--el-color-primary', '#409EFF')
  const areaTop = cssVar('--el-color-primary-light-9', withAlpha(primary, 0.16))
  const areaBottom = withAlpha(primary, 0)

  chart.setOption(
    {
      tooltip: {
        trigger: 'axis',
        valueFormatter: (v: unknown) => `${v}%`,
      },
      grid: { left: 40, right: 16, top: 20, bottom: 30 },
      xAxis: {
        type: 'category',
        data: xData,
        boundaryGap: false,
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 60,
        max: 100,
        axisLabel: { formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(0,0,0,0.08)' } },
      },
      series: [
        {
          name: '正确率',
          type: 'line',
          data: yData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          lineStyle: { width: 3, color: primary },
          itemStyle: { color: primary },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: areaTop },
              { offset: 0.8, color: areaBottom },
              { offset: 1, color: areaBottom },
            ]),
          },
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
.learning-trends {
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
