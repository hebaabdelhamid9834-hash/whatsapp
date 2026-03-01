import React, { useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

import {
  useFonts,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from "@expo-google-fonts/outfit";

import { GlobalProvider } from "./src/contexts/GlobalContext";
import { TranslateProvider } from "./src/contexts/TranslateContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { DialogProvider } from "./src/contexts/DialogContext";
import AppNavigator from "./src/navigation/AppNavigator";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) await SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <TranslateProvider>
            <GlobalProvider>
              <DialogProvider>
                <StatusBar style="auto" />
                <AppNavigator />
              </DialogProvider>
            </GlobalProvider>
          </TranslateProvider>
        </View>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
