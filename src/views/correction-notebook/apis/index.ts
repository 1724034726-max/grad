import { get, post } from '@/utils/http'

export interface ApiEnvelope<T> {
  code: number
  msg: string
  data: T
}

export interface QuestionCreateJson {
  subject: string
  knowledgePointIds: string[]
  difficulty: number
  qtype: string
  stem: string
  options: Record<string, string>
  answer: string
}

export interface KnowledgePointItem {
  id: string
  name: string
}

export interface ParseImageData {
  rawText: string
  userId: number
  questionId: string
  createJson: QuestionCreateJson
  knowledgePoints: KnowledgePointItem[]
}

/** POST /api/question/parse-image，multipart 字段名 file */
export async function parseQuestionImage(file: File): Promise<ParseImageData> {
  const body = new FormData()
  body.append('file', file)
  const res = await post<ApiEnvelope<ParseImageData>>('/api/question/parse-image', body, {
    timeout: 120_000,
  })
  if (res.code !== 0) {
    throw new Error(res.msg || '图片解析失败')
  }
  return res.data
}

/** POST /api/question 创建题目 */
export async function createQuestion(dto: QuestionCreateJson): Promise<void> {
  const res = await post<ApiEnvelope<unknown>>('/api/question', dto)
  if (res.code !== 0) {
    throw new Error(res.msg || '保存题目失败')
  }
}

export interface TrendDayPoint {
  dateIso: string
  correctRate: number
}

export interface QuestionListItem {
  id: number
  subject: string
  summary: string
  trendLast7Days: TrendDayPoint[]
  correctCount: number
  errorCount: number
  attemptCount: number
  masteryPercent: number
  redWarning: boolean
}

export interface QuestionListPage {
  items: QuestionListItem[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
}

/** GET /api/question 分页查询我的题目 */
export async function fetchMyQuestions(params: {
  pageNumber: number
  pageSize: number
  subject?: string
}): Promise<QuestionListPage> {
  const query: Record<string, string | number> = {
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
  }
  if (params.subject) {
    query.subject = params.subject
  }
  const res = await get<ApiEnvelope<QuestionListPage>>('/api/question', { params: query })
  if (res.code !== 0) {
    throw new Error(res.msg || '加载题目列表失败')
  }
  return res.data
}
