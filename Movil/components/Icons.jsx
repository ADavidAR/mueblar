import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS } from '../constants/theme'

import * as React from "react"
import Svg, { Path } from "react-native-svg"

export const CatalogIcon = ({ size = 20, color= COLORS.iconMuted, ...props }) => {
    return (
        <Svg
            width={17}
            height={17}
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            fontSize={size}
            color={color}
            {...props}
        >
            <Path
                d="M0 7.5V0h7.5v7.5H0zM0 17V9.5h7.5V17H0zm9.5-9.5V0H17v7.5H9.5zm0 9.5V9.5H17V17H9.5zm-8-11H6V1.5H1.5V6zM11 6h4.5V1.5H11V6zm0 9.5h4.5V11H11v4.5zm-9.5 0H6V11H1.5v4.5z"
                fill={color}
            />
        </Svg>
    )
}
export const ArIcon = ({ size = 20, color= COLORS.iconMuted, ...props }) => {
    return (
        <Svg
            width={18}
            height={18}
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            fontSize={size}
            color={color}
            {...props}
        >
            <Path
                d="M8.1 15.727L3.6 13.14a1.763 1.763 0 01-.664-.664 1.772 1.772 0 01-.236-.889V6.413c0-.314.079-.61.236-.888.158-.278.379-.499.664-.664l4.5-2.588a1.77 1.77 0 01.9-.247c.315 0 .615.083.9.248l4.5 2.587c.285.165.506.386.664.664.157.277.236.574.236.888v5.176c0 .315-.079.61-.236.888a1.762 1.762 0 01-.664.664l-4.5 2.587a1.77 1.77 0 01-.9.248 1.77 1.77 0 01-.9-.248zM0 4.5V1.8C0 1.305.176.881.529.529A1.733 1.733 0 011.8 0h2.7v1.8H1.8v2.7H0zM4.5 18H1.8c-.495 0-.919-.176-1.271-.529A1.733 1.733 0 010 16.2v-2.7h1.8v2.7h2.7V18zm9 0v-1.8h2.7v-2.7H18v2.7c0 .495-.176.919-.529 1.271A1.733 1.733 0 0116.2 18h-2.7zm2.7-13.5V1.8h-2.7V0h2.7c.495 0 .919.176 1.271.529.353.352.529.776.529 1.271v2.7h-1.8zM5.445 5.872l-.945.54v1.013l3.6 2.093v4.14l.9.517.9-.518v-4.14l3.6-2.092V6.412l-.945-.54L9 7.965 5.445 5.872z"
                fill={color}
            />
        </Svg>
    )
}

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

// --- Iconos de categorías del filtro lateral ---
export const CouchIcon = ({ size = 18, color = COLORS.iconMuted, ...props }) => (
    <FontAwesome6 name="couch" size={size} color={color} {...props} />
)

export const BuildingIcon = ({ size = 18, color = COLORS.iconMuted, ...props }) => (
    <FontAwesome6 name="building" size={size} color={color} {...props} />
)

export const TreeIcon = ({ size = 18, color = COLORS.iconMuted, ...props }) => (
    <FontAwesome6 name="tree" size={size} color={color} {...props} />
)

export const LampIcon = ({ size = 18, color = COLORS.iconMuted, ...props }) => (
    <FontAwesome6 name="lightbulb" size={size} color={color} {...props} />
)

export const BedIcon = ({ size = 18, color = COLORS.iconMuted, ...props }) => (
    <FontAwesome6 name="bed" size={size} color={color} {...props} />
)

export const ChairIcon = ({ size = 18, color = COLORS.iconMuted, ...props }) => (
    <FontAwesome6 name="chair" size={size} color={color} {...props} />
)

export const TableIcon = ({ size = 18, color = COLORS.iconMuted, ...props }) => (
    <FontAwesome6 name="table" size={size} color={color} {...props} />
)

export const UtensilsIcon = ({ size = 18, color = COLORS.iconMuted, ...props }) => (
    <FontAwesome6 name="utensils" size={size} color={color} {...props} />
)

export const BoxIcon = ({ size = 18, color = COLORS.iconMuted, ...props }) => (
    <FontAwesome6 name="box" size={size} color={color} {...props} />
)

// --- Detalle de producto ---
export const LeafIcon = ({ size = 16, color = COLORS.copper, ...props }) => (
    <FontAwesome6 name="leaf" size={size} color={color} {...props} />
)

export const CubeIcon = ({ size = 18, color = '#ffffff', ...props }) => (
    <FontAwesome6 name="cube" size={size} color={color} {...props} />
)

export const UserIcon = ({ size = 16, color = COLORS.copper, ...props }) => (
    <FontAwesome6 name="user" size={size} color={color} {...props} />
)

export const SlidersIcon = ({ size = 18, color = COLORS.copper, ...props }) => (
    <FontAwesome6 name="sliders" size={size} color={color} {...props} />
)

export const PlusIcon = ({ size = 16, color = COLORS.copper, ...props }) => (
    <FontAwesome6 name="plus" size={size} color={color} {...props} />
)

export const TrashIcon = ({ size = 16, color = '#ef4444', ...props }) => (
    <FontAwesome6 name="trash-can" size={size} color={color} {...props} />
)

export const RotateIcon = ({ size = 18, color = '#ffffff', ...props }) => (
    <FontAwesome6 name="arrows-rotate" size={size} color={color} {...props} />
)

export const MoveIcon = ({ size = 18, color = '#ffffff', ...props }) => (
    <FontAwesome6 name="up-down-left-right" size={size} color={color} {...props} />
)

export const XIcon = ({ size = 18, color = '#ffffff', ...props }) => (
    <FontAwesome6 name="xmark" size={size} color={color} {...props} />
)

// --- Radios (sección Estilos) ---
export const CircleIcon = ({ size = 18, color = COLORS.iconMuted, ...props }) => (
    <FontAwesome6 name="circle" size={size} color={color} {...props} />
)

export const CircleDotIcon = ({ size = 18, color = COLORS.copper, ...props }) => (
    <FontAwesome6 name="circle-dot" size={size} color={color} {...props} />
)