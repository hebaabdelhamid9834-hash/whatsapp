// src/contexts/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme, StatusBar, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

// 🎨 Light Theme with Semantic Colors
const lightTheme = {
  // Base colors - WhatsApp Colors
  primary: "#2DD4BF", // Brighter Emerald Green ✨
  secondary: "#128C7E", // Dark Green
  success: "#34C759",
  error: "#FF3B30",
  warning: "#FF9500",
  info: "#5AC8FA",

  // Background colors
  background: "#FFFFFF",
  backgroundSecondary: "#F2F2F7",
  surface: "#FFFFFF",
  surfaceVariant: "#F2F2F7",

  // Text colors
  textPrimary: "#000000",
  textSecondary: "#3C3C43",
  textDisabled: "#C7C7CC",

  // Border colors
  border: "#C6C6C8",
  divider: "#E5E5EA",

  // 🎯 Action colors (MUI-style)
  action: {
    active: "rgba(0, 0, 0, 0.54)",
    hover: "rgba(0, 0, 0, 0.04)",
    hoverOpacity: 0.04,
    selected: "rgba(0, 0, 0, 0.08)",
    selectedOpacity: 0.08,
    disabled: "rgba(0, 0, 0, 0.26)",
    disabledBackground: "rgba(0, 0, 0, 0.12)",
    disabledOpacity: 0.38,
    focus: "rgba(0, 0, 0, 0.12)",
    focusOpacity: 0.12,
    activatedOpacity: 0.12,
  },

  // 🎯 Grey palette (MUI-style)
  grey: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
    A100: "#F5F5F5",
    A200: "#EEEEEE",
    A400: "#BDBDBD",
    A700: "#616161",
  },

  // Shadow
  shadow: "rgba(0, 0, 0, 0.1)",

  // Status bar style
  statusBarStyle: "dark-content", // Dark icons for light background
};

// 🌙 Dark Theme with Semantic Colors
const darkTheme = {
  // Base colors - WhatsApp Colors
  primary: "#10B981", // Emerald Green (Dark Mode) ✨
  secondary: "#008069", // Dark Green
  success: "#32D74B",
  error: "#FF453A",
  warning: "#FF9F0A",
  info: "#64D2FF",

  // Background colors
  background: "#000000",
  backgroundSecondary: "#1C1C1E",
  surface: "#141415ff",
  surfaceVariant: "#2C2C2E",

  // Text colors
  textPrimary: "#FFFFFF",
  textSecondary: "#EBEBF5",
  textDisabled: "#636366",

  // Border colors
  border: "#38383A",
  divider: "#38383A",

  // 🎯 Action colors (MUI-style)
  action: {
    active: "rgba(255, 255, 255, 0.56)",
    hover: "rgba(255, 255, 255, 0.08)",
    hoverOpacity: 0.08,
    selected: "rgba(255, 255, 255, 0.16)",
    selectedOpacity: 0.16,
    disabled: "rgba(255, 255, 255, 0.3)",
    disabledBackground: "rgba(255, 255, 255, 0.12)",
    disabledOpacity: 0.38,
    focus: "rgba(255, 255, 255, 0.12)",
    focusOpacity: 0.12,
    activatedOpacity: 0.24,
  },

  // 🎯 Grey palette (MUI-style)
  grey: {
    50: "#1C1C1E",
    100: "#2C2C2E",
    200: "#3A3A3C",
    300: "#48484A",
    400: "#636366",
    500: "#8E8E93",
    600: "#AEAEB2",
    700: "#C7C7CC",
    800: "#D1D1D6",
    900: "#E5E5EA",
    A100: "#2C2C2E",
    A200: "#3A3A3C",
    A400: "#636366",
    A700: "#AEAEB2",
  },

  // Shadow
  shadow: "rgba(0, 0, 0, 0.3)",

  // Status bar style
  statusBarStyle: "light-content", // Light icons for dark background
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [colorMode, setColorMode] = useState(systemColorScheme || "dark");

  useEffect(() => {
    loadColorMode();
  }, []);

  // 🔥 Update status bar when theme changes
  useEffect(() => {
    const theme = colorMode === "light" ? lightTheme : darkTheme;
    StatusBar?.setBarStyle(theme.statusBarStyle, true);
    Platform.OS === "android" &&
      StatusBar?.setBackgroundColor(theme.background, true); // Android only
  }, [colorMode]);

  const loadColorMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem("colorMode");
      if (savedMode) {
        setColorMode(savedMode);
      }
    } catch (error) {
      console.error("Failed to load color mode:", error);
    }
  };

  const toggleColorMode = async () => {
    const newMode = colorMode === "light" ? "dark" : "light";
    setColorMode(newMode);
    try {
      await AsyncStorage.setItem("colorMode", newMode);
    } catch (error) {
      console.error("Failed to save color mode:", error);
    }
  };

  const theme = colorMode === "light" ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, colorMode, toggleColorMode }}>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.background}
        translucent={false}
      />
      {children}
    </ThemeContext.Provider>
  );
};
