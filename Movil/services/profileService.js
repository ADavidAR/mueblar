import { request } from "./authService"

export const updateUserData = async (name, lastName, email, newPassword, currentPassword) => 
    await request("/api/profile", {
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


export const fetchProfileData = async () => 
    await request("/api/profile", {
        skipAuth: false,
        method: "GET"
    })
