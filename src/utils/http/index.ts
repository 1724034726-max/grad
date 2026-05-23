import router from '@/router'
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { ElMessage } from 'element-plus'

type ApiBody = { code?: number; msg?: string }

const baseURL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''

/** 原始 Axios 实例，需自行取 `response.data` 时用 */
export const http: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  }
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function handleUnauthorized(msg?: string) {
  localStorage.removeItem('token')
  if (router.currentRoute.value.path !== '/login') {
    ElMessage.warning(msg || '登录已过期，请重新登录')
    router.replace({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath },
    })
  }
}

http.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data as ApiBody | undefined
    if (data && typeof data === 'object' && data.code === 401) {
      handleUnauthorized(data.msg)
      return Promise.reject(new Error(data.msg || '未登录'))
    }
    return response
  },
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const data = error.response.data as ApiBody | undefined
      handleUnauthorized(data?.msg)
    }
    return Promise.reject(error)
  }
)

async function unwrap<T>(p: Promise<AxiosResponse<T>>): Promise<T> {
  const res = await p
  return res.data
}

export function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return unwrap(http.get<T>(url, config))
}

export function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return unwrap(http.post<T>(url, data, config))
}

export function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return unwrap(http.put<T>(url, data, config))
}

export function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return unwrap(http.delete<T>(url, config))
}
