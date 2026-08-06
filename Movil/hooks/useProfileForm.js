import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateUserData } from "../services/profileService";
import { loginUser } from "../services/authService";
import { mapUpdateUserError } from "../constants/authErrors";

export function useProfileForm({ firstName, lastName, email }, changePassword, triggerReload) {
    const [requestError, setRequestError] = useState({
        firstName: null,
        lastName: null,
        email: null,
        currentPassword: null,
        newPassword: null,
        server: null,
    })

    const form = useForm({
        defaultValues: {
            firstName,
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
                if ( ["firstName", "lastName", "email", "currentPassword", "newPassword"].includes(field)
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
    const updateFormDefaults = ({ firstName, lastName, email }) => {
        form.reset((prev) => ({
            ...prev,
            firstName,
            lastName,
            email
        }))
    }

    // Devuelve si el guardado tuvo éxito: react-hook-form no reenvía el
    // valor de retorno del callback a través de handleSubmit(), así que se
    // captura acá para que quien llama a submit() sepa si puede salir del
    // modo edición o si debe quedarse mostrando el error.
    const submit = async () => {
        let success = false

        await form.handleSubmit(async ({ firstName, lastName, email, newPassword, currentPassword }) => {
            setRequestError({
                firstName: null,
                lastName: null,
                email: null,
                currentPassword: null,
                newPassword: null,
                server: null,
            })

            try {
                await updateUserData(
                    firstName,
                    lastName,
                    email,
                    changePassword ? newPassword : undefined,
                    changePassword ? currentPassword : undefined,
                )
                if (changePassword) {
                    await loginUser(email, newPassword)
                }
                triggerReload()
                success = true
            } catch (err) {
                setRequestError(mapUpdateUserError(err))
            }
        })()

        return success
    }

    return {
        form,
        requestError,
        clearServerError,
        updateFormDefaults,
        submit, 
        isSubmitting: form.formState.isSubmitting
    }

}