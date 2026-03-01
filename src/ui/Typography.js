import React from "react";
import { Text } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export default function Typography({
  children,
  variant = "body1", // h1, h2, h3, h4, h5, h6, subtitle1, subtitle2, body1, body2, caption, overline
  color,
  fontSize,
  fontWeight,
  textAlign = "left",
  numberOfLines,
  ellipsizeMode = "tail",
  style,
  ...props
}) {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case "h1":
        return {
          fontSize: 32,
          fontWeight: "700",
          fontFamily: "Outfit_700Bold",
        };
      case "h2":
        return {
          fontSize: 28,
          fontWeight: "700",
          fontFamily: "Outfit_700Bold",
        };
      case "h3":
        return {
          fontSize: 24,
          fontWeight: "600",
          fontFamily: "Outfit_600SemiBold",
        };
      case "h4":
        return {
          fontSize: 20,
          fontWeight: "600",
          fontFamily: "Outfit_600SemiBold",
        };
      case "h5":
        return {
          fontSize: 18,
          fontWeight: "500",
          fontFamily: "Outfit_500Medium",
        };
      case "h6":
        return {
          fontSize: 16,
          fontWeight: "500",
          fontFamily: "Outfit_500Medium",
        };
      case "subtitle1":
        return {
          fontSize: 16,
          fontWeight: "500",
          fontFamily: "Outfit_500Medium",
        };
      case "subtitle2":
        return {
          fontSize: 14,
          fontWeight: "500",
          fontFamily: "Outfit_500Medium",
        };
      case "body1":
        return {
          fontSize: 16,
          fontWeight: "400",
          fontFamily: "Outfit_400Regular",
        };
      case "body2":
        return {
          fontSize: 14,
          fontWeight: "400",
          fontFamily: "Outfit_400Regular",
        };
      case "caption":
        return {
          fontSize: 12,
          fontWeight: "400",
          fontFamily: "Outfit_400Regular",
          color: theme.textSecondary,
        };
      case "overline":
        return {
          fontSize: 10,
          fontWeight: "500",
          fontFamily: "Outfit_500Medium",
          textTransform: "uppercase",
          letterSpacing: 1.5,
        };
      default:
        return {
          fontSize: 16,
          fontWeight: "400",
          fontFamily: "Outfit_400Regular",
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Text
      style={[
        {
          color: color || variantStyles.color || theme.textPrimary,
          fontSize: fontSize || variantStyles.fontSize,
          fontWeight: fontWeight || variantStyles.fontWeight,
          fontFamily: fontWeight ? "Outfit_700Bold" : variantStyles.fontFamily,
          textAlign,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      {...props}
    >
      {children}
    </Text>
  );
}
