import { Tabs } from "expo-router";
import { COLORS } from "../../../../constants/theme";
import { ArIcon, CatalogIcon, EmptyHeartIcon } from "../../../../components/Icons";

export default function TabsLayout () {

    return (
        <Tabs
            
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.copper,
                tabBarInactiveTintColor: COLORS.iconMuted,
                tabBarStyle: {
                    backgroundColor: COLORS.surfaceLessDark,
                    borderRadius: 25,
                    borderTopWidth: 0,   
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 1,
                    shadowRadius: 6,
                    opacity: 0.98,
                    position: 'absolute',
                    bottom: 0,
                    left: 20,
                    right: 20,
                    height: 80
                },
            }}
        >
            <Tabs.Screen
                name="ar"
                options={{
                    title: "VISTA AR",
                }}
            />
            
            <Tabs.Screen
                name="collection"
                options={{
                    title: "COLECCIONES",
                    tabBarIcon: ({ color, size }) => <EmptyHeartIcon color={color} size={size} /> 
                }}
            />

            <Tabs.Screen
                name="catalog"
                options={{
                    title: "CATALOGO",
                }}
                
            />
        </Tabs>
    )
}