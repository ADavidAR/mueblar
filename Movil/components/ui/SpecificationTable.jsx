import { Text, View } from "react-native";
import TableRow from "./TableRow";

export default function SpecificationTable ({ materials, dimensions, color }) {

    const data = [
        {
            label: "Material",
            content: materials,
        },
        {
            label: "Color",
            content: color,
        },
        {
            label: "Dimensiones",
            content: dimensions,
        },
    ]

    return (
        <View className="w-full">
            <Text className="mb-4 text-xs font-semibold uppercase tracking-[3px] text-stone-500 dark:text-stone-400">
                Especificaciones
            </Text>
            <View className="rounded-2xl border border-stone-200 dark:border-white/10 overflow-hidden">
                {data.map(({ label, content }, index) => (
                    <TableRow
                        key={label}
                        label={label}
                        labelClassName="text-base font-medium text-stone-500 dark:text-stone-400"
                        content={content}
                        contentClassName="text-base text-stone-800 dark:text-stone-100"
                        rowClassName={
                            index < data.length - 1
                                ? "border-b border-stone-200 dark:border-white/10"
                                : ""
                        }
                    />
                ))}
            </View>
        </View>
    )
}
