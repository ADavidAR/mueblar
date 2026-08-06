import { Pressable, ScrollView, Text, View } from "react-native";
import SerifText from "../ui/SerifText";
import UnderlineField from "../ui/UnderlineField";
import { useProfileForm } from "../../hooks/useProfileForm";
import { useEffect, useState } from "react";
import { fetchProfileData } from "../../services/profileService";
import { Controller } from "react-hook-form";
import { VALIDATION } from "../../constants/authErrors";
import PasswordField from "../ui/PasswordField";
import PrimaryButton from "../ui/PrimaryButton";
import CustomColorButton from "../ui/CustomColorButton";
import Checkbox from "../ui/Checkbox";
import ConfirmModal from "../modals/ConfirmModal";
import { logoutUser } from "../../services/authService";
import { useRouter } from "expo-router";

const LABEL_CLASS = "text-copper dark:text-copper-light"

export default function ProfileForm () {

    const router = useRouter()
    // Campos de edición.
    const [ currentProfileData, setCurrentProfileData ] = useState({
        firstName: "",
        lastName: "",
        email: "",
    })
    const [ shouldLoadUserData, setShouldLoadUserData ] = useState(true)
    const [ enableEdit, setEnableEdit ] = useState(false)
    // Decide si el usuario quiere tocar la contraseña en este modo edición;
    // si está apagado, los campos de contraseña ni se muestran ni se validan.
    const [ changePassword, setChangePassword ] = useState(false)
    const [ showConfirm, setShowConfirm ] = useState(false)
    const {
        form : { control, reset, formState: { errors } },
        requestError,
        clearServerError,
        submit,
        updateFormDefaults,
        isSubmitting,
    } = useProfileForm(currentProfileData, changePassword, () => setShouldLoadUserData(false))

    useEffect(() => {
        if(shouldLoadUserData) {
            const initializeProfileData = async () => {
                const newCurrentProfileData = await fetchProfileData()
                setCurrentProfileData(newCurrentProfileData)
                setShouldLoadUserData(false)
                updateFormDefaults( newCurrentProfileData )
            }
    
            initializeProfileData()
        }
    }, [shouldLoadUserData, updateFormDefaults])

    const handleEditToggle = () => {
        setEnableEdit( prev => {
            if (prev) {
                reset()
                setChangePassword(false)
                return false
            }
            return true
        })
    }

    const handleLogout = () => {
        logoutUser()
        router.navigate("/view/login")
    }

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        >
            {/* Cabecera de usuario */}
            <View className="items-center mt-2 mb-10">
                <SerifText className="text-3xl font-bold text-stone-900 dark:text-stone-50">
                    {`${currentProfileData.firstName} ${currentProfileData.lastName}`}
                </SerifText>
            </View>

            {/* Campos de perfil */}
            <View className="gap-y-7">
                <Controller
                    control={control}
                    name="firstName"
                    rules={VALIDATION.name}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <UnderlineField
                            label="Nombre"
                            editable={enableEdit}
                            autoCapitalize="words"
                            labelClassName={LABEL_CLASS}
                            value={value}
                            onBlur={onBlur}
                            onChangeText={(t) => {
                                onChange(t)
                                clearServerError("firstName")
                            }}
                            error={errors.firstName?.message || requestError?.firstName?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="lastName"
                    rules={VALIDATION.lastName}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <UnderlineField
                            label="Apellido"
                            editable={enableEdit}
                            autoCapitalize="words"
                            labelClassName={LABEL_CLASS}
                            value={value}
                            onBlur={onBlur}
                            onChangeText={(t) => {
                                onChange(t)
                                clearServerError("lastName")
                            }}
                            error={errors.lastName?.message || requestError?.lastName?.message}
                        />
                    )}
                />

                <Controller 
                    control={control}
                    name="email"
                    rules={VALIDATION.email}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <UnderlineField
                            label="Correo electrónico"
                            editable={enableEdit}
                            labelClassName={LABEL_CLASS}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={(t) => {
                                onChange(t)
                                clearServerError("email")
                            }}
                            error={errors.email?.message || requestError?.email?.message}
                        />
                    )}
                />

                { enableEdit ? (
                    <>
                    <Pressable
                        onPress={() => setChangePassword((v) => !v)}
                        className="flex-row items-center gap-x-3"
                    >
                        <Checkbox checked={changePassword} />
                        <Text className="text-sm text-stone-700 dark:text-stone-200">
                            Quiero cambiar mi contraseña
                        </Text>
                    </Pressable>

                    { changePassword ? (
                    <>
                    <Controller
                        control={control}
                        name="currentPassword"
                        rules={VALIDATION.password}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <PasswordField
                                label="Contraseña actual"
                                labelClassName={LABEL_CLASS}
                                value={value}
                                onBlur={onBlur}
                                onChangeText={(t) => {
                                    onChange(t)
                                    clearServerError("currentPassword")
                                }}
                                error={errors.currentPassword?.message || requestError?.currentPassword?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="newPassword"
                        rules={VALIDATION.password}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <PasswordField
                                label="Contraseña nueva"
                                labelClassName={LABEL_CLASS}
                                value={value}
                                onBlur={onBlur}

                                onChangeText={(t) => {
                                    onChange(t)
                                    clearServerError("newPassword")
                                }}
                                error={errors.newPassword?.message || requestError?.newPassword?.message}
                            />
                        )}
                    />
                    </>
                    ) : null }
                    </>
                )
                : (
                    <CustomColorButton
                        label={"Cerrar Sesión"}
                        onPress={handleLogout}
                        className={"mt-10"}
                        color={"terracotta"}
                    />
                ) }

            </View>

            <View className="flex-1" />

            { enableEdit ? (
                <>
                {requestError?.server ? (
                    <Text className="text-sm text-red-500">{requestError.server.message}</Text>
                ) : null}
    
                <PrimaryButton
                    label="Guardar cambios"
                    onPress={() => setShowConfirm(true)}
                    loading={isSubmitting}
                    className="mt-10"
                />
                </>
            ) :null}
            <CustomColorButton
                label={enableEdit ? "Cancelar"  : "Editar Perfil"}
                onPress={handleEditToggle}
                className={"mt-10"}
                color={enableEdit ? "terracotta" : "copper"}
            />

            <ConfirmModal
                visible={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={submit}
                title="Confirmar cambios"
                message={
                    changePassword
                        ? "¿Seguro que querés guardar los cambios en tu perfil, incluida la contraseña nueva?"
                        : "¿Seguro que querés guardar los cambios en tu perfil?"
                }
                confirmLabel="Guardar"
            />
        </ScrollView>
    )
}