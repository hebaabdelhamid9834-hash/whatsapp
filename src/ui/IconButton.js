import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

export default function IconButton({
  icon,
  onPress,
  size = "medium", // small | medium | large
  color,
  variant = "default", // default | contained | outlined
  disabled = false,
  style,
  ...props
}) {
  const { theme, colorMode } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { containerSize: 32, iconSize: 18 };
      case "large":
        return { containerSize: 48, iconSize: 28 };
      default:
        return { containerSize: 40, iconSize: 24 };
    }
  };

  const sizeStyles = getSizeStyles();
  const iconColor = color || theme.textPrimary;

  const getVariantStyles = () => {
    switch (variant) {
      case "contained":
        return {
          bg: theme.primary,
          iconColor: "#FFFFFF",
        };
      case "outlined":
        return {
          bg: "transparent",
          borderWidth: 1.5,
          borderColor: theme.border,
          iconColor: iconColor,
        };
      default:
        return {
          bg: "transparent",
          iconColor: iconColor,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      style={[
        {
          width: sizeStyles.containerSize,
          height: sizeStyles.containerSize,
          borderRadius: sizeStyles.containerSize / 2,
          backgroundColor: variantStyles.bg,
          borderWidth: variantStyles.borderWidth || 0,
          borderColor: variantStyles.borderColor,
          justifyContent: "center",
          alignItems: "center",
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      {...props}
    >
      <Ionicons
        name={icon}
        size={sizeStyles.iconSize}
        color={variantStyles.iconColor}
      />
    </TouchableOpacity>
  );
}
