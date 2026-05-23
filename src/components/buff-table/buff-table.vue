<template>
  <div class="buff-table">
    <vxe-table
      ref="xTableRef"
      class="buff-table__grid"
      :data="displayRecords"
      :loading="loading"
      border
      stripe
      :show-overflow="showOverflow"
      :row-class-name="rowClassName"
      :row-config="{ keyField: rowKeyField }"
      :column-config="columnConfigResolved"
      :checkbox-config="showCheckboxColumn && checkboxReserve ? { reserve: true } : undefined"
    >
      <vxe-column
        v-for="(col, idx) in renderedColumns"
        :key="columnKey(col, idx)"
        :type="vxeColumnType(col)"
        :field="vxeField(col)"
        :title="col.title"
        :width="col.width"
        :min-width="col.minWidth"
        :align="col.align"
        :fixed="col.fixed"
        :show-overflow="col.showOverflow ?? undefined"
        :formatter="resolveFormatter(col)"
      >
        <template v-if="col.showType === 'slot'" #default="scope">
          <slot :name="resolveSlotName(col)" v-bind="scope" />
        </template>
      </vxe-column>
    </vxe-table>

    <div v-if="showPagination" class="buff-table__pager">
      <el-pagination
        v-model:current-page="pageNumber"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        :layout="paginationLayout"
        background
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { get } from '@/utils/http'
  import { ElMessage } from 'element-plus'
  import { computed, ref, watch } from 'vue'
  import type { BuffTableColumn } from './types'

  const props = withDefaults(
    defineProps<{
      /** GET 请求地址（含 path，不含 origin 时走 axios baseURL） */
      url: string
      columns: BuffTableColumn[]
      /** 与分页参数合并的查询条件 */
      query?: Record<string, unknown>
      /** 分页页码 query 字段名 */
      pageNumberField?: string
      /** 每页条数 query 字段名 */
      pageSizeField?: string
      /** 接口 data 内列表字段名 */
      recordsField?: string
      /** 接口 data 内总条数字段名 */
      totalField?: string
      /** 行主键字段，用于稳定渲染 */
      rowKeyField?: string
      showPagination?: boolean
      pageSizes?: number[]
      paginationLayout?: string
      /** vxe-table 默认 show-overflow */
      showOverflow?: boolean | 'tooltip' | 'title' | 'ellipsis'
      /** 是否展示多选列（columns 里 showType 为 checkbox 的列仅在为 true 时渲染） */
      showCheckboxColumn?: boolean
      /** 勾选保留跨页（仅 showCheckboxColumn 为 true 时生效） */
      checkboxReserve?: boolean
      /** 是否允许拖动表头调整列宽（vxe-table column-config.resizable） */
      columnResizable?: boolean
      /** 透传合并到 column-config（如 minWidth 等） */
      columnConfig?: Record<string, unknown>
      /** vxe-table row-class-name */
      rowClassName?: string | ((params: { row: Record<string, unknown> }) => string)
      /** 请求完成后对当前页数据做排序/加工 */
      sortRecords?: (rows: Record<string, unknown>[]) => Record<string, unknown>[]
    }>(),
    {
      query: () => ({}),
      pageNumberField: 'pageNumber',
      pageSizeField: 'pageSize',
      recordsField: 'items',
      totalField: 'totalCount',
      rowKeyField: 'id',
      showPagination: true,
      pageSizes: () => [10, 20, 50],
      paginationLayout: 'total, sizes, prev, pager, next, jumper',
      showOverflow: 'tooltip',
      showCheckboxColumn: false,
      checkboxReserve: false,
      columnResizable: true,
      columnConfig: () => ({}),
    }
  )

  const columnConfigResolved = computed(() => ({
    resizable: props.columnResizable,
    ...props.columnConfig,
  }))

  /** 按 showCheckboxColumn 过滤掉多选列 */
  const renderedColumns = computed(() => {
    if (props.showCheckboxColumn) {
      return props.columns
    }
    return props.columns.filter((c) => c.showType !== 'checkbox')
  })

  interface ApiEnvelope {
    code: number
    msg: string
    data: Record<string, unknown>
  }

  const loading = ref(false)
  const records = ref<Record<string, unknown>[]>([])
  const total = ref(0)
  const pageNumber = ref(1)
  const pageSize = ref(10)

  const xTableRef = ref<{ clearCheckboxRow?: () => void } | null>(null)

  const displayRecords = computed(() => {
    const rows = records.value as Record<string, unknown>[]
    if (props.sortRecords) {
      return props.sortRecords([...rows]) as Record<string, unknown>[]
    }
    return rows
  })

  function columnKey(col: BuffTableColumn, idx: number) {
    return col.colId ?? col.field ?? `${col.title}-${idx}`
  }

  function vxeColumnType(col: BuffTableColumn) {
    return col.showType === 'checkbox' ? 'checkbox' : undefined
  }

  function vxeField(col: BuffTableColumn) {
    if (col.showType === 'checkbox') return undefined
    return col.field
  }

  function resolveFormatter(col: BuffTableColumn) {
    if (col.showType === 'slot' || col.showType === 'checkbox' || !col.formatter) {
      return undefined
    }
    const fn = col.formatter
    return (params: { cellValue?: unknown; row: Record<string, unknown>; column?: unknown }) => {
      const v = fn(params)
      return v == null ? '' : v
    }
  }

  function resolveSlotName(col: BuffTableColumn) {
    return col.slotName ?? col.field ?? 'default'
  }

  async function load() {
    loading.value = true
    try {
      const params: Record<string, string | number | undefined> = {
        [props.pageNumberField]: pageNumber.value,
        [props.pageSizeField]: pageSize.value,
      }
      const q = props.query ?? {}
      for (const [k, v] of Object.entries(q)) {
        if (v === undefined || v === null || v === '') continue
        params[k] = v as string | number
      }
      const body = await get<ApiEnvelope>(props.url, { params })
      if (body.code !== 0) {
        throw new Error(body.msg || '请求失败')
      }
      const pageData = body.data ?? {}
      const list = pageData[props.recordsField]
      const t = pageData[props.totalField]
      records.value = Array.isArray(list) ? (list as Record<string, unknown>[]) : []
      total.value = typeof t === 'number' ? t : Number(t) || 0
    } catch (e) {
      records.value = []
      total.value = 0
      ElMessage.error(e instanceof Error ? e.message : '加载失败')
    } finally {
      loading.value = false
    }
  }

  watch(
    () => props.query,
    () => {
      if (pageNumber.value !== 1) {
        pageNumber.value = 1
      }
    },
    { deep: true }
  )

  watch(
    () => ({
      url: props.url,
      query: props.query,
      pn: pageNumber.value,
      ps: pageSize.value,
    }),
    () => {
      void load()
    },
    { deep: true, immediate: true }
  )

  defineExpose({
    reload: load,
    /** vxe 表格实例 */
    getTable: () => xTableRef.value,
  })
</script>

<style scoped lang="scss">
  .buff-table {
    width: 100%;
  }

  .buff-table__grid {
    width: 100%;
  }

  .buff-table__pager {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
</style>
