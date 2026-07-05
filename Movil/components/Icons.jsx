import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS } from '../constants/theme'

export const EyeIcon = ({ size = 20, color = COLORS.iconMuted, ...props }) => (
    <FontAwesome6 name="eye" size={size} color={color} {...props} />
)

export const EyeSlashedIcon = ({ size = 20, color = COLORS.iconMuted, ...props }) => (
    <FontAwesome6 name="eye-slash" size={size} color={color} {...props} />
)

export const CheckIcon = ({ size = 12, color = '#ffffff', ...props }) => (
    <FontAwesome6 name="check" size={size} color={color} {...props} />
)

export const CircleCheckIcon = ({ size = 12, color = '#ffffff', ...props }) => (
    <FontAwesome6 name="circle-check" size={size} color={color} {...props} />
)

export const SunIcon = ({ size = 20, color = COLORS.copper, ...props }) => (
    <FontAwesome6 name="sun" size={size} color={color} {...props} />
)

export const MoonIcon = ({ size = 18, color = COLORS.copper, ...props }) => (
    <FontAwesome6 name="moon" size={size} color={color} {...props} />
)

export const ArrowLeftIcon = ({ size = 18, color = COLORS.copper, ...props }) => (
    <FontAwesome6 name="arrow-left" size={size} color={color} {...props} />
)

export const ArrowRightIcon = ({ size = 18, color = COLORS.copper, ...props }) => (
    <FontAwesome6 name="arrow-right" size={size} color={color} {...props} />
)

export const ChevronDownIcon = ({ size = 14, color = COLORS.iconMuted, ...props }) => (
    <FontAwesome6 name="chevron-down" size={size} color={color} {...props} />
)

export const ChevronUpIcon = ({ size = 14, color = COLORS.iconMuted, ...props }) => (
    <FontAwesome6 name="chevron-up" size={size} color={color} {...props} />
)

export const ShieldKeyIcon = ({ size = 20, color = COLORS.copper, ...props }) => (
    <FontAwesome6 name="shield-halved" size={size} color={color} {...props} />
)

export const SearchIcon = ({ size = 20, color = COLORS.copper, ...props }) => (
    <FontAwesome6 name="magnifying-glass" size={size} color={color} {...props} />
)

export const EmptyHeartIcon = ({ size = 20, color = COLORS.copper, ...props }) => (
    <FontAwesome name="heart-o" size={size} color={color} {...props} />
)

export const FilledHeartIcon = ({ size = 20, color = COLORS.copper, ...props }) => (
    <FontAwesome name="heart" size={size} color={color} {...props} />
)