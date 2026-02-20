import * as SecureStore from 'expo-secure-store'
import { API_BASE_URL } from '../config'

const TOKEN_KEY = 'wine_session_token'

export const getToken = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

export const setToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export const removeToken = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

interface RequestOptions {
  method?: string
  body?: Record<string, unknown>
  query?: Record<string, string | number | boolean | undefined>
}

export class ApiError extends Error {
  statusCode: number
  data: unknown

  constructor(statusCode: number, message: string, data?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.data = data
  }
}

const buildQueryString = (params: Record<string, string | number | boolean | undefined>): string => {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
  return entries.length > 0 ? `?${entries.join('&')}` : ''
}

export const apiFetch = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, query } = options
  const token = await getToken()

  const url = `${API_BASE_URL}${path}${query ? buildQueryString(query) : ''}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new ApiError(
      response.status,
      errorData?.message || `Request failed with status ${response.status}`,
      errorData,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}
