// src/ui/Icon.js
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

export default function Icon({ name, size = 24, color, style, ...props }) {
  const { theme } = useTheme();

  // ✅ Use theme color if no color is provided
  const iconColor = color || theme.textPrimary;

  return (
    <Ionicons
      name={name}
      size={size}
      color={iconColor}
      style={style}
      {...props}
    />
  );
}
