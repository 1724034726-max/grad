/** vxe-column formatter 参数（按需取用） */
export type BuffColumnFormatter = (params: {
  cellValue?: unknown
  row: Record<string, unknown>
  column?: unknown
}) => string | number

/** 列展示：默认文本/formatter；slot 用具名插槽；checkbox 多选列 */
export type BuffColumnShowType = 'default' | 'slot' | 'checkbox'

export interface BuffTableColumn {
  /** 列唯一键，不传则用 field + title */
  colId?: string | number
  /** 对应行数据字段；checkbox 列可不填 */
  field?: string
  title: string
  width?: number | string
  minWidth?: number | string
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  showOverflow?: boolean | 'tooltip' | 'title' | 'ellipsis'
  /** default / slot / checkbox（多选列需在 BuffTable 上开启 showCheckboxColumn） */
  showType?: BuffColumnShowType
  /** showType 为 slot 时插槽名，默认取 field */
  slotName?: string
  /** 透传给 vxe-column 的 formatter */
  formatter?: BuffColumnFormatter
}
