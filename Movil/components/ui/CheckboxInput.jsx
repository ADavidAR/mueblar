import { Pressable } from 'react-native'

import Checkbox from './Checkbox'

export default function CheckboxInput({ checked, onChange }) {
  

  const toggle = () => {
    const next = !checked
    onChange?.(next)
  }

  return (
    <Pressable onPress={toggle} hitSlop={8} className="active:opacity-70">
      <Checkbox checked={checked}/>
    </Pressable>
  )
}
