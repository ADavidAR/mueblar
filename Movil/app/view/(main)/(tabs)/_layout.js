import { Tabs } from "expo-router";
import { COLORS } from "../../../../constants/theme";
import { ArIcon, CatalogIcon, EmptyHeartIcon } from "../../../../components/Icons";
import { useTheme } from "../../../../hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout () {
    const { isDark } = useTheme()
    const insets = useSafeAreaInsets()

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.copper,
                tabBarInactiveTintColor: COLORS.iconMuted,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "600",
                    letterSpacing: 1.5,
                    marginTop: 2,
                },
                tabBarItemStyle: {
                    paddingVertical: 8,
                },
                tabBarStyle: {
                    backgroundColor: isDark ? COLORS.surface2 : COLORS.sand2,
                    borderRadius: 28,
                    borderTopWidth: 0,
                    borderWidth: isDark ? 0 : 1,
                    borderColor: "rgba(120,113,108,0.15)",
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: isDark ? 0.4 : 0.12,
                    shadowRadius: 12,
                    elevation: 8,
                    position: 'absolute',
                    bottom: insets.bottom,
                    left: 20,
                    right: 20,
                    height: 74,
                    paddingBottom: 10,
                },
            }}
        >
            <Tabs.Screen
                name="ar"
                options={{
                    title: "VISTA AR",
                    tabBarIcon: ({ color, size }) => <ArIcon color={color} size={size} />
                }}
            />

            <Tabs.Screen
                name="collections"
                options={{
                    title: "COLECCIONES",
                    tabBarIcon: ({ color, size }) => <EmptyHeartIcon color={color} size={size} />
                }}
            />

            <Tabs.Screen
                name="catalog"
                options={{
                    title: "CATÁLOGO",
                    tabBarIcon: ({ color, size }) => <CatalogIcon color={color} size={size} />
                }}
            />
        </Tabs>
    )
}
