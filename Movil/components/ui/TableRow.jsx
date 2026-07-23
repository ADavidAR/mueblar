import { Text, View } from "react-native";

export default function TableRow ({
    label,
    content,
    labelClassName,
    contentClassName,
    rowClassName = ""
}) {
    return (
        <View className={`flex-row w-full items-center px-4 py-4 ${rowClassName}`}>
            <View className="w-[38%] pr-2">
                <Text className={labelClassName}>
                    {label}
                </Text>
            </View>
            <View className="flex-1">
                { content?.map ?
                    content.map((item, index) => (
                        <Text key={index} className={`${contentClassName} ${index > 0 ? "mt-1" : ""}`}>
                            {item}
                        </Text>
                    ))
                    : null
                }
            </View>
        </View>
    )
}