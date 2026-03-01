import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useGlobal } from "../contexts/GlobalContext";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";

import { useTheme } from "../contexts/ThemeContext";
import { InboxProvider, useInbox } from "../contexts/InboxContext";
import SettingNavigation from "../screens/settings/SettingNavigation";
import { Badge, Snackbar, Typography } from "../ui";
import GetDataBeforein from "../contexts/GetDataBeforein";
import { useTranslate } from "../contexts/TranslateContext";
import ChatScreen from "../screens/ChatScreen";
import ConversationScreen from "../screens/chat/conversationScreen/ConversationScreen";
import ChatDetails from "../screens/chat/chatDetails/ChatDetails";
import ChatDetailsComp from "../screens/chat/chatDetails/components/ChatDetailsComp";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useTranslate();
  const { chatList } = useInbox();

  const unreadCountArr = chatList?.map((x) => x.unread_count) || [];
  const sum = unreadCountArr.reduce((a, b) => a + b, 0);

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: theme.background,
        borderTopColor: theme.border,
        borderTopWidth: 1,
        paddingBottom: insets.bottom, // Apply safe area padding
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        // Icon rendering
        let iconName;
        const color = isFocused ? theme.primary : theme.textSecondary;
        const size = 24;

        if (route.name === "Inbox") {
          iconName = isFocused ? "chatbubbles" : "chatbubbles-outline";
        } else if (route.name === "Settings") {
          iconName = isFocused ? "cog" : "cog-outline";
        }

        return (
          <View
            key={route.key}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 8,
            }}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onTouchStart={onPress}
            onLongPress={onLongPress}
          >
            {route.name === "Inbox" ? (
              <Badge variant="standard" content={sum}>
                <Ionicons name={iconName} size={size} color={color} />
              </Badge>
            ) : (
              <Ionicons name={iconName} size={size} color={color} />
            )}
            <Text
              style={{
                color: color,
                fontSize: 12,
                fontWeight: "500",
                marginTop: 4,
              }}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function TabNavigator() {
  const { theme } = useTheme();
  const { t } = useTranslate();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Inbox"
        component={ChatScreen}
        options={{ tabBarLabel: t("inbox") }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: t("settings") }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator (includes both tabs and chat screen)
function MainStackNavigator() {
  const { data, setData } = useGlobal();
  return (
    <InboxProvider
      userData={data?.userData}
      uid={data?.userData?.uid}
      userToken={data?.userToken}
      agent={data?.userData?.role === "agent" ? true : false}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Tab Navigator as the main screen */}
        <Stack.Screen name="MainTabs" component={TabNavigator} />

        <Stack.Screen
          name="SettingNavigation"
          component={SettingNavigation}
          options={{
            presentation: "card",
            animation: "slide_from_right",
          }}
        />

        <Stack.Screen
          name="ConversationScreen"
          component={ConversationScreen}
          options={{
            presentation: "card",
            animation: "slide_from_right",
          }}
        />

        <Stack.Screen
          name="ChatDetails"
          component={ChatDetails}
          options={{
            presentation: "card",
            animation: "slide_from_right",
          }}
        />

        <Stack.Screen
          name="ChatDetailsComp"
          component={ChatDetailsComp}
          options={{
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
      </Stack.Navigator>
    </InboxProvider>
  );
}

// ✅ Loading Screen Component (used during initialization)
function LoadingScreen() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 8 }}>
        Loading...
      </Text>
    </View>
  );
}

// ✅ Global Loading Overlay (for async operations)
function GlobalLoadingOverlay() {
  const { data } = useGlobal();
  const { theme } = useTheme();

  if (!data.loading) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.background + "B3",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
}

export default function AppNavigator() {
  const { data, setData } = useGlobal();
  if (!data.isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {data.isAuthenticated ? (
          <Stack.Screen name="Main" component={MainStackNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>

      <Snackbar
        visible={data.snack}
        message={data.snack_msg}
        isSuccess={data.snack_success}
        onDismiss={() => setData((prev) => ({ ...prev, snack: false }))}
        position="top"
      />

      <GlobalLoadingOverlay />
      <GetDataBeforein />
    </NavigationContainer>
  );
}
