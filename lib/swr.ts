// lib/swr.ts
export const swrFetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed: ${res.status}`
    throw new Error(msg)
  }
  return data
}
