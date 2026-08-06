import GenericButton from './GenericButton'

const SOLID_COLORS = {
    copper: '#b5745a',
    terracotta: '#A74331',
}

/**
 * Variantes:
 *  - "solid"   → relleno cobre.
 *  - "outline" → solo borde.
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
    const containerBase = isSolid ? 'shadow-lg' : 'border border-stone-300 dark:border-stone-700'
    const containerStyle = isSolid
        ? { backgroundColor: SOLID_COLORS[color] ?? SOLID_COLORS.copper }
        : undefined
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
            containerStyle={containerStyle}
            textColor={textColor}
        />
    )
}
