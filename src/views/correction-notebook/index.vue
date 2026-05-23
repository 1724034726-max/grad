<template>
  <div class="correction-notebook">
    <el-card class="list-card" shadow="hover">
      <div class="toolbar">
        <span class="toolbar-title">错题列表</span>
        <div class="toolbar-actions">
          <el-button type="primary" @click="onAdd">新增</el-button>
          <span class="filter-label">筛选</span>
          <el-select v-model="filterSubject" placeholder="全部" clearable style="width: 140px">
            <el-option label="全部" value="" />
            <el-option v-for="s in subjectOptions" :key="s" :label="s" :value="s" />
          </el-select>
          <el-button @click="cycleSort">排序</el-button>
        </div>
      </div>

      <BuffTable
        ref="buffTableRef"
        url="/api/question"
        :columns="buffColumns"
        :query="tableQuery"
        :sort-records="sortRecords"
        :row-class-name="warnRowClass"
      >
        <template #trend="{ row }">
          <TrendMiniChart
            :key="(row as QuestionListItem).id"
            :points="(row as QuestionListItem).trendLast7Days"
            variant="line"
          />
        </template>
        <template #mastery="{ row }">
          <span :class="{ 'mastery--warn': isMasteryWarn(row as QuestionListItem) }">
            {{ (row as QuestionListItem).masteryPercent }}%
          </span>
        </template>
        <template #actions>
          <el-button link type="primary">复习</el-button>
        </template>
      </BuffTable>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import BuffTable from '@/components/buff-table/buff-table.vue'
  import { computed, onActivated, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import type { BuffTableColumn } from '@/components/buff-table/types'
  import type { QuestionListItem } from './apis'
  import TrendMiniChart from './components/trend-mini-chart.vue'

  const router = useRouter()

  const SUBJECT_PRESETS = ['数学', '物理', '英语', '化学'] as const

  const filterSubject = ref<string | undefined>('')
  const sortMode = ref<'default' | 'errors' | 'mastery'>('default')

  const buffTableRef = ref<{ reload: () => void } | null>(null)

  const tableQuery = computed(() => ({
    subject: filterSubject.value || undefined,
  }))

  const subjectOptions = computed(() => [...SUBJECT_PRESETS])

  const buffColumns: BuffTableColumn[] = [
    { field: 'subject', title: '科目', width: 100 },
    { field: 'summary', title: '题目摘要', minWidth: 180, showOverflow: 'tooltip' },
    {
      title: '趋势图(近7天)',
      width: 140,
      minWidth: 120,
      align: 'center',
      showType: 'slot',
      slotName: 'trend',
      colId: 'col-trend',
    },
    {
      field: 'errorCount',
      title: '错误次数',
      width: 100,
      align: 'center',
      formatter: ({ row }) => `${(row as unknown as QuestionListItem).errorCount}次`,
    },
    {
      title: '掌握度',
      width: 120,
      align: 'center',
      showType: 'slot',
      slotName: 'mastery',
      colId: 'col-mastery',
    },
    {
      title: '操作',
      width: 100,
      align: 'center',
      fixed: 'right',
      showType: 'slot',
      slotName: 'actions',
      colId: 'col-actions',
    },
  ]

  function sortRecords(rows: Record<string, unknown>[]) {
    const list = [...rows] as unknown as QuestionListItem[]
    if (sortMode.value === 'errors') {
      list.sort((a, b) => b.errorCount - a.errorCount)
    } else if (sortMode.value === 'mastery') {
      list.sort((a, b) => a.masteryPercent - b.masteryPercent)
    }
    return list as unknown as Record<string, unknown>[]
  }

  function warnRowClass({ row }: { row: Record<string, unknown> }) {
    return isMasteryWarn(row as unknown as QuestionListItem) ? 'is-warning-row' : ''
  }

  function cycleSort() {
    const order: Array<'default' | 'errors' | 'mastery'> = ['default', 'errors', 'mastery']
    const i = order.indexOf(sortMode.value)
    sortMode.value = order[(i + 1) % order.length]!
  }

  function onAdd() {
    router.push('/correction-notebook/add')
  }

  function isMasteryWarn(row: QuestionListItem) {
    return row.redWarning || row.masteryPercent < 50
  }

  onActivated(() => {
    buffTableRef.value?.reload()
  })
</script>

<style scoped lang="scss">
  .correction-notebook {
    min-height: 100%;
  }

  .list-card {
    :deep(.el-card__body) {
      padding-top: 16px;
    }
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    gap: 12px;
    flex-wrap: wrap;
  }

  .toolbar-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .filter-label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .mastery--warn {
    color: var(--el-color-danger);
    font-weight: 600;
  }

  :deep(.vxe-body--row.is-warning-row) {
    background-color: var(--el-color-danger-light-9);
  }

  :deep(.vxe-body--row.is-warning-row:hover) {
    background-color: var(--el-color-danger-light-8) !important;
  }
</style>
