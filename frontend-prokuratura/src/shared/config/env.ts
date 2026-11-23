export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string | undefined,
  useMock: (import.meta.env.VITE_USE_MOCK as string | undefined) === 'true',
}

