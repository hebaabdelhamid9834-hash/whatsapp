import React from "react";
import { View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import Typography from "./Typography";

export default function Avatar({
  src,
  name,
  size = "medium", // small | medium | large | xlarge | xxlarge
  variant = "circular", // circular | rounded | square
  icon,
  style,
  showBgColorByName = false,
  ...props
}) {
  const { theme, colorMode } = useTheme();

  const sizeMap = {
    small: 32,
    medium: 40,
    large: 56,
    xlarge: 80,
    xxlarge: 120,
  };

  const sizeValue = sizeMap[size] || sizeMap.medium;

  const getBorderRadius = () => {
    switch (variant) {
      case "rounded":
        return 8;
      case "square":
        return 0;
      default:
        return sizeValue / 2;
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getWhatsAppColors = (name) => {
    const lightColors = [
      { bg: "#DFF5E8", text: "#0A8754" },
      { bg: "#E3F2FD", text: "#1976D2" },
      { bg: "#FFF3E0", text: "#E65100" },
      { bg: "#F3E5F5", text: "#7B1FA2" },
      { bg: "#FCE4EC", text: "#C2185B" },
      { bg: "#E0F2F1", text: "#00796B" },
      { bg: "#FFF9C4", text: "#F57F17" },
      { bg: "#FFEBEE", text: "#C62828" },
      { bg: "#E8EAF6", text: "#283593" },
      { bg: "#F1F8E9", text: "#558B2F" },
    ];

    const darkColors = [
      { bg: "#0A8754", text: "#FFFFFF" },
      { bg: "#1E88E5", text: "#FFFFFF" },
      { bg: "#FB8C00", text: "#FFFFFF" },
      { bg: "#8E24AA", text: "#FFFFFF" },
      { bg: "#D81B60", text: "#FFFFFF" },
      { bg: "#00897B", text: "#FFFFFF" },
      { bg: "#FDD835", text: "#000000" },
      { bg: "#E53935", text: "#FFFFFF" },
      { bg: "#3949AB", text: "#FFFFFF" },
      { bg: "#7CB342", text: "#FFFFFF" },
    ];

    const colors = colorMode === "dark" ? darkColors : lightColors;

    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const avatarColors = getWhatsAppColors(name);

  return (
    <View
      style={[
        {
          width: sizeValue,
          height: sizeValue,
          borderRadius: getBorderRadius(),
          backgroundColor: src
            ? theme.grey[200]
            : showBgColorByName
            ? avatarColors.bg
            : theme.action.hover,
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          borderWidth: colorMode === "light" ? 0.5 : 0,
          borderColor: "rgba(0, 0, 0, 0.05)",
        },
        style,
      ]}
      {...props}
    >
      {src ? (
        <Image
          source={{ uri: src }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          cachePolicy="memory-disk"
        />
      ) : icon ? (
        <Ionicons
          name={icon}
          size={sizeValue * 0.5}
          color={avatarColors.text}
        />
      ) : (
        <Typography
          variant="body1"
          fontWeight="600"
          color={avatarColors.text}
          fontSize={sizeValue * 0.35}
          style={{
            lineHeight: sizeValue * 0.35 * 1.2,
            includeFontPadding: false,
            textAlignVertical: "center",
          }}
        >
          {getInitials(name)}
        </Typography>
      )}
    </View>
  );
}
