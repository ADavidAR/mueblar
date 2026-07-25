const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export default async function request(path, options = {}) {
  const token = localStorage.getItem('token')

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    let message = `Error ${res.status}`
    try {
      const parsed = JSON.parse(text)
      message = parsed?.message ?? parsed?.errors?.[0]?.message ?? message
    } catch {
      message = text || message
    }
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  const text = await res.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return text }
}
