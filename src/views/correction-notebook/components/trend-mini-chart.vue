<template>
  <div ref="hostEl" class="trend-mini-chart" />
</template>

<script setup lang="ts">
  import * as echarts from 'echarts'
  import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import type { TrendDayPoint } from '../apis'

  const props = withDefaults(
    defineProps<{
      points: TrendDayPoint[]
      /** 折线或柱状（近 7 天正确率趋势） */
      variant?: 'line' | 'bar'
    }>(),
    { variant: 'line' }
  )

  const hostEl = ref<HTMLDivElement | null>(null)
  let chart: echarts.ECharts | null = null
  let ro: ResizeObserver | null = null

  function cssVar(name: string, fallback: string) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    return v || fallback
  }

  function normalizeRate(v: number) {
    return v <= 1 ? v * 100 : v
  }

  function buildOption() {
    const raw = props.points ?? []
    const list =
      raw.length > 0
        ? raw
        : Array.from({ length: 7 }, (_, i) => ({
            dateIso: `2000-01-${String(i + 1).padStart(2, '0')}`,
            correctRate: 0,
          }))
    const xData = list.map((d) => {
      const s = d.dateIso
      const m = s.slice(5, 7)
      const day = s.slice(8, 10)
      return `${m}-${day}`
    })
    const yData = list.map((d) => normalizeRate(d.correctRate))
    const primary = cssVar('--el-color-primary', '#409eff')

    const axisCommon = {
      type: 'category' as const,
      data: xData,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    }

    if (props.variant === 'bar') {
      return {
        animation: false,
        grid: { left: 2, right: 2, top: 4, bottom: 2, containLabel: false },
        tooltip: {
          trigger: 'axis',
          appendToBody: true,
          valueFormatter: (v: unknown) => `${Number(v).toFixed(0)}%`,
        },
        xAxis: { ...axisCommon, boundaryGap: true },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
        },
        series: [
          {
            type: 'bar',
            data: yData,
            barMaxWidth: 10,
            itemStyle: { color: primary, borderRadius: [2, 2, 0, 0] },
          },
        ],
      }
    }

    return {
      animation: false,
      grid: { left: 2, right: 2, top: 4, bottom: 2, containLabel: false },
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        valueFormatter: (v: unknown) => `${Number(v).toFixed(0)}%`,
      },
      xAxis: { ...axisCommon, boundaryGap: false },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
      series: [
        {
          type: 'line',
          data: yData,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: primary },
          areaStyle: { color: primary, opacity: 0.12 },
        },
      ],
    }
  }

  function render() {
    if (!chart) return
    chart.setOption(buildOption(), { notMerge: true })
    chart.resize()
  }

  onMounted(async () => {
    await nextTick()
    if (!hostEl.value) return
    chart = echarts.init(hostEl.value, undefined, { renderer: 'canvas' })
    render()
    ro = new ResizeObserver(() => chart?.resize())
    ro.observe(hostEl.value)
  })

  watch(
    () => [props.points, props.variant] as const,
    () => {
      render()
    },
    { deep: true }
  )

  onBeforeUnmount(() => {
    ro?.disconnect()
    ro = null
    chart?.dispose()
    chart = null
  })
</script>

<style scoped lang="scss">
  .trend-mini-chart {
    width: 100%;
    height: 44px;
    min-width: 72px;
  }
</style>
