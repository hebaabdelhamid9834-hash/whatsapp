// src/ui/Chip.js
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import Typography from "./Typography";
import Avatar from "./Avatar";

export default function Chip({
  label,
  onPress,
  onDelete,
  icon,
  avatar,
  variant = "filled", // filled | outlined
  color = "default", // default | primary | secondary | success | error | hex color (e.g., #F54927)
  size = "medium", // small | medium
  disabled = false,
  style,
  iconColor = null,
  ...props
}) {
  const { theme, colorMode } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          height: 24,
          px: 8,
          fontSize: 12,
          iconSize: 14,
          avatarSize: 20,
        };
      default:
        return {
          height: 32,
          px: 12,
          fontSize: 14,
          iconSize: 18,
          avatarSize: 24,
        };
    }
  };

  // Helper function to check if color is a hex code
  const isHexColor = (str) => {
    return /^#([0-9A-F]{3}){1,2}$/i.test(str);
  };

  // Helper function to lighten a hex color
  const lightenColor = (hex, percent = 30) => {
    // Remove # if present
    hex = hex.replace("#", "");

    // Convert to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Lighten
    r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
    g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
    b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

    // Convert back to hex
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  const getColorValue = () => {
    // Check if it's a custom hex color
    if (isHexColor(color)) {
      return color;
    }

    // Otherwise use preset colors
    switch (color) {
      case "primary":
        return theme.primary;
      case "secondary":
        return theme.secondary || "#9c27b0";
      case "success":
        return theme.success;
      case "error":
        return theme.error;
      default:
        return colorMode === "dark" ? "#2C2C2E" : "#E5E5EA";
    }
  };

  const mainColor = getColorValue();
  const sizeStyles = getSizeStyles();
  const isCustomColor = isHexColor(color);

  const getVariantStyles = () => {
    if (variant === "outlined") {
      return {
        bg: "transparent",
        textColor:
          color === "default" && !isCustomColor ? theme.textPrimary : mainColor,
        borderWidth: 1.5,
        borderColor: isCustomColor ? lightenColor(mainColor, 40) : mainColor,
      };
    }
    // filled
    return {
      bg: mainColor,
      textColor:
        color === "default" && !isCustomColor ? theme.textPrimary : "#FFFFFF",
      borderWidth: 0,
    };
  };

  const variantStyles = getVariantStyles();
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        {
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.px,
          paddingLeft: avatar ? 4 : sizeStyles.px,
          borderRadius: sizeStyles.height / 2,
          backgroundColor: variantStyles.bg,
          borderWidth: variantStyles.borderWidth,
          borderColor: variantStyles.borderColor,
          opacity: disabled ? 0.5 : 1,
          justifyContent: "center",
        },
        style,
      ]}
      {...props}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {avatar && (
          <Avatar
            src={avatar}
            size="small"
            style={{
              width: sizeStyles.avatarSize,
              height: sizeStyles.avatarSize,
              marginRight: 6,
            }}
          />
        )}

        {icon && !avatar && (
          <Ionicons
            name={icon}
            size={sizeStyles.iconSize}
            color={iconColor || variantStyles.textColor}
            style={{ marginRight: 6 }}
          />
        )}

        <Typography
          variant="body2"
          fontWeight="500"
          color={variantStyles.textColor}
          fontSize={sizeStyles.fontSize}
          style={{
            lineHeight: sizeStyles.fontSize * 1.2,
            includeFontPadding: false,
            textAlignVertical: "center",
          }}
        >
          {label}
        </Typography>

        {onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ marginLeft: 6 }}
          >
            <Ionicons
              name="close-circle"
              size={sizeStyles.iconSize}
              color={variantStyles.textColor}
            />
          </TouchableOpacity>
        )}
      </View>
    </Wrapper>
  );
}
