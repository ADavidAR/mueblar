import GenericButton from './GenericButton'

/**
 * Variantes:
 *  - "solid"   → relleno cobre (acción primaria, ej. REGISTRARSE).
 *  - "outline" → solo borde (acción secundaria, ej. CANCELAR).
 */
export default function CustomColorButton({
    label,
    onPress,
    loading = false,
    disabled = false,
    variant = 'solid',
    icon = null,
    className = '',
    color = "copper"
}) {
    const isSolid = variant === 'solid'
    const containerBase = isSolid
        ? `bg-${color} shadow-lg shadow-${color}/40`
        : 'border border-stone-300 dark:border-stone-700'
    const textColor = isSolid ? 'text-white' : 'text-stone-500 dark:text-stone-300'

    return (
        <GenericButton 
            label={label}
            onPress={onPress}
            loading={loading}
            disabled={disabled}
            variant={variant}
            icon={icon}
            className={className}
            containerBase={containerBase}
            textColor={textColor}
        />
    )
}
