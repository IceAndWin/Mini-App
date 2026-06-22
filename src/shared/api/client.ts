import axios, { type InternalAxiosRequestConfig } from 'axios'
import { getToken } from '@/shared/lib/token'

const envUrl: unknown = import.meta.env.VITE_API_URL
const apiBaseUrl = typeof envUrl === 'string' && envUrl.length > 0 ? envUrl : ''

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
