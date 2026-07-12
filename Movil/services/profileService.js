import { request } from "./authService"

export const updateUserData = (name, lastName, email, newPassword, currentPassword) => {
    request("/api/profile", {
        skipAuth: false,
        method: "PUT",
        body: JSON.stringify({
            name,
            lastName,
            email,
            newPassword,
            currentPassword
        }),
    })
}

export const fetchProfileData = () => {
    request("/api/profile", {
        skipAuth: false,
        method: "GET"
    })
}