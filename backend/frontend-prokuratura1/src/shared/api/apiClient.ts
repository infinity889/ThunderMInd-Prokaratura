import { env } from '../config/env'

export type ApiError = {
  status: number
  message: string
  details?: unknown
}

type MockHandler = (path: string, init?: RequestInit) => unknown | undefined

const mockHandler: MockHandler = (path, init) => {
  if (!env.useMock) return undefined

  // Auth mocks
  if (path === '/users/login/' && init?.method === 'POST') {
    return { token: 'demo-token', username: 'demo', is_admin: true }
  }
  if (path === '/users/register/' && init?.method === 'POST') {
    return { id: 1, username: 'demo' }
  }

  // Map mocks
  if (path === '/map-data/crimes/') return []
  if (path === '/map-data/cameras/') return []
  if (path === '/map-data/social-objects/') return []
  if (path === '/map-data/districts/')
    return []

  return undefined
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
  const mock = mockHandler(path, init)
  if (mock !== undefined) return mock as T

  const base = env.apiBaseUrl?.replace(/\/+$/, '') ?? ''
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  let res: Response
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })
  } catch (e) {
    // If backend is offline during demo, avoid noisy console errors.
    const fallback = mockHandler(path, init)
    if (fallback !== undefined) return fallback as T
    const err: ApiError = { status: 0, message: 'NetworkError', details: e }
    throw err
  }

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

