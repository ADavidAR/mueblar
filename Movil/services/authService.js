
import * as SecureStore from 'expo-secure-store';
const BASE_URL =  'http://192.168.0.3:8080'

async function saveSessionToken(token) {
  try {
    await SecureStore.setItemAsync('user_session', token);
    console.log('Session saved securely.');
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

export async function getSessionToken() {
  try {
    const token = await SecureStore.getItemAsync('user_session');
    if (token) {
      return token;
    } else {
      console.log('No session found.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

async function deleteSessionToken() {
  try {
    await SecureStore.deleteItemAsync('user_session');
    console.log('Session cleared.');
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}

export const request = async (path, options = {}) => {
    const { skipAuth = false, ...fetchOptions } = options
    const token = !skipAuth ? await getSessionToken() : null

    const res = await fetch(`${BASE_URL}${path}`, {
        ...fetchOptions,
        headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...fetchOptions.headers
        }
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

export const isAuthenticated = async () => ( await getSessionToken() )

export const loginUser = async (email, password) => {
  const data = await request('/api/auth/mobile/login', {
    skipAuth: true,
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  saveSessionToken(data.token)

  return data
}

export const logoutUser = async () => {
  await deleteSessionToken()
}

export const registerUser = (name, lastName, email, password) =>
  request('/api/auth/register', {
    skipAuth: true,
    method: 'POST',
    body: JSON.stringify({ name, lastName, email, password })
  })

export const recoveryEmail = (email) =>
  request('/api/auth/recovery-email', {
    skipAuth: true,
    method: 'POST',
    body: JSON.stringify({ email })
  })

export const resetPassword = (email, password) =>
  request('/api/auth/reset-password', {
    skipAuth: true,
    method: 'POST',
    body: JSON.stringify({ email, password })
  })

export const getPermitsForUrl = async (url) => {
  const { permits } = await request("/api/auth/permits", {
    skipAuth: false,
    method: "POST",
    body: JSON.stringify({url})
  })

  return {
    access: Boolean( permits & 8 ),
    create: Boolean( permits & 4 ),
    delete: Boolean( permits & 2 ),
    modify: Boolean( permits & 1 )
  }
}