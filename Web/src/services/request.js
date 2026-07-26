const BASE_URL = import.meta.env.VITE_API_URL ?? ''

// El backend exige un bit de permiso distinto según el método HTTP
// (JwtAuthenticationFilter.urlHasEnoughPermissionsAPI): GET→acceso, POST→creación,
// PUT→modificación, DELETE→eliminación. Sirve como mensaje de respaldo cuando el
// backend responde 403 sin "message" (Spring omite ese campo salvo que se configure
// server.error.include-message=always).
const PERMISSION_LABEL_BY_METHOD = {
  GET: 'de acceso',
  POST: 'de creación',
  PUT: 'de modificación',
  DELETE: 'de eliminación',
}

export default async function request(path, options = {}) {
  const { skipAuth = false, ...fetchOptions } = options
  const token = !skipAuth ? localStorage.getItem('token') : null

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    // DEBUG TEMPORAL: se muestra el status + cuerpo crudo del backend, sin el
    // mensaje "traducido" de PERMISSION_LABEL_BY_METHOD, para ver el error real.
    const message = `Error ${res.status}: ${text || '(sin cuerpo en la respuesta)'}`

    const err = new Error(message)
    err.status = res.status
    throw err
  }

  const text = await res.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return text }
}
