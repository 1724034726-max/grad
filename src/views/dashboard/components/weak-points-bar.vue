<template>
  <el-card class="weak-points" shadow="hover">
    <div class="header">
      <div class="title">学科薄弱点分析（柱状图）</div>
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
    { name: '导数', value: 65 },
    { name: '函数', value: 72 },
    { name: '积分', value: 40 },
    { name: '立体几何', value: 60 },
  ]

  function render() {
    if (!chart) return

    const primary = cssVar('--el-color-primary', '#409EFF')
    const text = cssVar('--el-text-color-regular', '#606266')
    const bg = cssVar('--el-fill-color-light', 'rgba(0,0,0,0.04)')

    const yData = mock.map((i) => i.name)
    const xData = mock.map((i) => i.value)

    chart.setOption(
      {
        grid: { left: 56, right: 40, top: 10, bottom: 10 },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          valueFormatter: (v: unknown) => `${v}%`,
        },
        xAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          splitLine: { show: false },
        },
        yAxis: {
          type: 'category',
          data: yData,
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: { color: text },
        },
        series: [
          {
            type: 'bar',
            data: xData,
            barWidth: 18,
            barCategoryGap: '55%',
            showBackground: true,
            backgroundStyle: {
              color: bg,
              borderRadius: 6,
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: cssVar('--el-color-primary-light-5', primary) },
                { offset: 1, color: primary },
              ]),
              borderRadius: 6,
            },
            label: {
              show: true,
              position: 'right',
              color: text,
              formatter: '{c}%',
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
  .weak-points {
    width: 100%;
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
    height: 170px;
  }
</style>
