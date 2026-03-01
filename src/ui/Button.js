// src/ui/Button.js
import React from "react";
import { TouchableOpacity, ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import Typography from "./Typography";

export default function Button({
  children,
  onPress,
  variant = "contained", // contained | outlined | text
  color = "primary", // primary | secondary | success | error | warning
  size = "medium", // small | medium | large
  fullWidth = false,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  style,
  ...props
}) {
  const { theme, colorMode } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { height: 36, px: 16, fontSize: 14, iconSize: 16 };
      case "large":
        return { height: 56, px: 24, fontSize: 17, iconSize: 22 };
      default:
        return { height: 48, px: 20, fontSize: 16, iconSize: 20 };
    }
  };

  const getColorValue = () => {
    switch (color) {
      case "secondary":
        return theme.secondary || "#9c27b0";
      case "success":
        return theme.success;
      case "error":
        return theme.error;
      case "warning":
        return theme.warning || "#ff9800";
      default:
        return theme.primary;
    }
  };

  const mainColor = getColorValue();
  const sizeStyles = getSizeStyles();

  const getVariantStyles = () => {
    if (disabled) {
      return {
        bg: colorMode === "dark" ? "#1C1C1E" : "#F2F2F7",
        textColor: colorMode === "dark" ? "#636366" : "#C7C7CC",
        borderWidth: 0,
      };
    }

    switch (variant) {
      case "outlined":
        return {
          bg: "transparent",
          textColor: mainColor,
          borderWidth: 1.5,
          borderColor: mainColor,
        };
      case "text":
        return {
          bg: "transparent",
          textColor: mainColor,
          borderWidth: 0,
        };
      default: // contained
        return {
          bg: mainColor,
          textColor: "#FFFFFF",
          borderWidth: 0,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        {
          backgroundColor: variantStyles.bg,
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.px,
          borderRadius: 8,
          borderWidth: variantStyles.borderWidth,
          borderColor: variantStyles.borderColor,
          justifyContent: "center",
          alignItems: "center",
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? "100%" : "auto",
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.textColor} size="small" />
      ) : (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {startIcon && (
            <Ionicons
              name={startIcon}
              size={sizeStyles.iconSize}
              color={variantStyles.textColor}
              style={{ marginRight: 8 }}
            />
          )}

          <Typography
            variant="body1"
            fontWeight="600"
            color={variantStyles.textColor}
            fontSize={sizeStyles.fontSize}
            style={{
              lineHeight: sizeStyles.fontSize * 1.2, // Tight line height
              includeFontPadding: false, // Android: Remove extra padding
              textAlignVertical: "center", // Android: Vertical alignment
            }}
          >
            {children}
          </Typography>

          {endIcon && (
            <Ionicons
              name={endIcon}
              size={sizeStyles.iconSize}
              color={variantStyles.textColor}
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
