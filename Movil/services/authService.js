
import * as SecureStore from 'expo-secure-store';
const BASE_URL =  process.env.EXPO_PUBLIC_BACKEND_ADDRESS

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

// Wrapper central de fetch: agrega el Bearer token (salvo skipAuth) y
// normaliza los errores del backend a un solo formato { message, details }.
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

    const text = await res.text()

    // fetch no lanza excepción por status HTTP de error (400/401/500...),
    // solo por fallas de red. Hay que revisar res.ok explícitamente para
    // que los errores del backend efectivamente lleguen al catch de quien
    // llama a request().
    if (res.ok) {
        if (!text) return null
        try { return JSON.parse(text) } catch { return text }
    }

    let message = `Error ${res.status}`
    let details = null

    try {
        const parsed = JSON.parse(text)
        if (parsed?.errors && typeof(parsed.errors) === "object" && !Array.isArray(parsed.errors)) {
            details = parsed.errors
            message = ""
        } else {
            message = parsed?.message ?? parsed?.errors?.[0]?.message ?? message
        }
    } catch {
        message = text || message
    }

    const err = new Error(message)
    err.status = res.status
    err.details = details
    throw err
}

export const isAuthenticated = async () => 
    await getSessionToken()

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

    // `permits` es una máscara de bits: 8=acceso, 4=crear, 2=eliminar, 1=modificar.
    return {
        access: Boolean( permits & 8 ),
        create: Boolean( permits & 4 ),
        delete: Boolean( permits & 2 ),
        modify: Boolean( permits & 1 )
    }
}