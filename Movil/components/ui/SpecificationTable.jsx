import { Text, View } from "react-native";
import TableRow from "./TableRow";

export default function SpecificationTable ({ materials, dimensions, color }) { 
    
    const data = [
        {
            label: "Materiales: ",
            content: materials
        },
        {
            label: "Dimensiones:",
            content: dimensions
        },
        {
            label: "Color: ",
            content: color
        }
    ]
    return (
        <View className="flex-column items-start  w-[100%]">
            <Text 
                className="mb-4  text-stone-900 stone- dark:text-stone-100 text-sm font-semibold uppercase tracking-[4px]"
            >
                Especificaciones
            </Text>
            <View className="">
                {
                    data.map(({label, content}) => (
                        <TableRow key={label}
                            label={label}
                            labelClassName="color-copper-dark dark:color-copper-lighter  text-2xl"
                            content={content}
                            contentClassName="color-copper-dark dark:color-copper-lighter  text-2xl"
                        />

                    ))
                }
            </View>
        </View>
    )
}