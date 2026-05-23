import { post } from '@/utils/http'

export interface LoginParams {
  account: string
  password: string
}

export interface LoginTokenData {
  access_token: string
  token_type: string
}

export interface ApiEnvelope<T> {
  code: number
  msg: string
  data: T
}

/** POST /api/user/login */
export async function loginApi(params: LoginParams): Promise<LoginTokenData> {
  const res = await post<ApiEnvelope<LoginTokenData>>('/api/user/login', params)
  if (res.code !== 0) {
    throw new Error(res.msg || '登录失败')
  }
  return res.data
}
