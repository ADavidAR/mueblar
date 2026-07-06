import { Text, View } from "react-native";

export default function TableRow ({
    label,
    content,
    labelClassName,
    contentClassName,
    rowClassName = ""
}) {
    return (
        <View className={`flex-row w-[100%] ${rowClassName}`}>
            <View className="w-[40%] p-2">
                <Text className={labelClassName}>
                    {label}
                </Text>
            </View>
            <View className="w-[60%] p-2">
                { content?.map ?
                    content.map((item, index) => (
                        <Text key={index} className={contentClassName}>
                            {item}
                        </Text>
                    ))
                    : null
                }
            </View>
        </View>
    )
}