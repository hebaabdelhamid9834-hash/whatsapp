// src/ui/Switch.js
import React from "react";
import { Switch as RNSwitch, Platform } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export default function Switch({
  value,
  onValueChange,
  disabled = false,
  trackColor,
  thumbColor,
  ios_backgroundColor,
  style,
  ...props
}) {
  const { theme, colorMode } = useTheme();

  // 🎨 WhatsApp iOS Style Colors
  const defaultTrackColor = {
    false: colorMode === "dark" ? "#39393D" : "#E9E9EA", // iOS style
    true: theme.primary,
  };

  const defaultThumbColor = Platform.select({
    ios: "#FFFFFF",
    android: value ? "#FFFFFF" : "#F4F3F4",
  });

  const defaultIosBackgroundColor =
    colorMode === "dark" ? "#39393D" : "#E9E9EA";

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={trackColor || defaultTrackColor}
      thumbColor={thumbColor || defaultThumbColor}
      ios_backgroundColor={ios_backgroundColor || defaultIosBackgroundColor}
      style={[
        {
          transform: Platform.select({
            ios: [{ scaleX: 0.9 }, { scaleY: 0.9 }], // iOS standard size
            android: [{ scaleX: 1.1 }, { scaleY: 1.1 }], // Slightly bigger on Android
          }),
        },
        style,
      ]}
      {...props}
    />
  );
}
