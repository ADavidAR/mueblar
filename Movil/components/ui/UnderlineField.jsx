import { View, TextInput, Text } from 'react-native'

import { COLORS } from '../../constants/theme'
import FieldLabel from './FieldLabel'

export default function UnderlineField({
  label,
  error,
  className = '',
  inputClassName = '',
  labelClassName = '',
  ...inputProps
}) {
  return (
    <View className={`w-full ${className}`}>
      {label ? <FieldLabel className={labelClassName}>{label}</FieldLabel> : null}
      <TextInput
        placeholderTextColor={COLORS.placeholder}
        className={`border-b border-stone-300 pb-2 text-base text-stone-900 dark:border-stone-700 dark:text-stone-100 ${inputClassName}`}
        {...inputProps}
      />
      {error ? <Text className="mt-1.5 text-xsz text-red-500">{error}</Text> : null}
      {/* <Text className="mt-1.5 text-xs text-red-500">{error}</Text> */}
    </View>
  )
}
