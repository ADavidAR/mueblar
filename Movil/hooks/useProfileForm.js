import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateUserData } from "../services/profileService";
import { loginUser } from "../services/authService";
import { mapUpdateUserError } from "../constants/authErrors";

export function useProfileForm({ name, lastName, email }, changePassword, triggerReload) {
    const [requestError, setRequestError] = useState({
        name: null,
        lastName: null,
        email: null,
        currentPassword: null,
        newPassword: null,
        server: null,
    })

    const form = useForm({
        defaultValues: {
            name,
            lastName,
            email,
            currentPassword: "",
            newPassword: "",
        },
    })

    // Limpia el error de servidor en cuanto el usuario vuelve a escribir.
    const clearServerError = (field= "") => {
        if (requestError) {
            if (field) {
                if ( ["name", "lastName", "email", "currentPassword", "newPassword"].includes(field)
                ) {
                    setRequestError((prev) => ({
                        ...prev,
                        [field]: null
                    }))
                }
                setRequestError((prev) => ({
                    ...prev,
                    server: null
                }))
            }
        }
    }

    // Actualizar datos por defecto de perfil
    const updateFormDefaults = ({ name, lastName, email }) => {
        form.reset((prev) => ({
            ...prev,
            name,
            lastName,
            email
        }))
    }

    const submit = form.handleSubmit(async ({ name, lastName, email, newPassword, currentPassword }) => {
        setRequestError({
            name: null,
            lastName: null,
            email: null,
            currentPassword: null,
            newPassword: null,
            server: null,
        })

        try {
            await updateUserData(
                name,
                lastName,
                email,
                changePassword ? newPassword : undefined,
                changePassword ? currentPassword : undefined,
            )
            if (changePassword) {
                await loginUser(email, newPassword)
            }
            triggerReload()
        } catch (err) {
            setRequestError(mapUpdateUserError(err))
        }
    })

    return {
        form,
        requestError,
        clearServerError,
        updateFormDefaults,
        submit, 
        isSubmitting: form.formState.isSubmitting
    }

}