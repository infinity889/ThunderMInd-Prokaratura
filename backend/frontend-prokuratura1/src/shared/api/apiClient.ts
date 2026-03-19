import { env } from '../config/env'

export type ApiError = {
  status: number
  message: string
  details?: unknown
}

async function readBodySafe(res: Response) {
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    try {
      return await res.json()
    } catch {
      return null
    }
  }
  try {
    return await res.text()
  } catch {
    return null
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = env.apiBaseUrl?.replace(/\/+$/, '') ?? ''
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  const token = localStorage.getItem('token')
  const res = await fetch(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await readBodySafe(res)
    const message =
      typeof body === 'string'
        ? body
        : (body as { message?: string } | null)?.message ?? res.statusText
    const err: ApiError = { status: res.status, message, details: body }
    throw err
  }

  const body = await readBodySafe(res)
  return body as T
}
