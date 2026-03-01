// src/ui/Box.js
import React from "react";
import { View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

// 🎯 Helper function to resolve nested color paths
const resolveColor = (colorPath, theme) => {
  if (!colorPath) return undefined;

  // If it's a direct color value (hex, rgb, etc.)
  if (colorPath.startsWith("#") || colorPath.startsWith("rgb")) {
    return colorPath;
  }

  // Handle nested paths like "action.hover" or "grey.500"
  const parts = colorPath.split(".");
  let value = theme;

  for (const part of parts) {
    value = value?.[part];
    if (value === undefined) return undefined;
  }

  return value;
};

export default function Box({
  children,
  bg,
  p,
  px,
  py,
  pt,
  pb,
  pl,
  pr,
  m,
  mx,
  my,
  mt,
  mb,
  ml,
  mr,
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  borderRadius,
  borderWidth,
  borderColor,
  flex,
  flexDirection,
  justifyContent,
  alignItems,
  alignSelf,
  position,
  top,
  right,
  bottom,
  left,
  zIndex,
  overflow,
  opacity,
  shadow,
  style,
  ...props
}) {
  const { theme } = useTheme();

  // 🎯 Resolve background color (supports nested paths)
  const backgroundColor = resolveColor(bg, theme);
  const resolvedBorderColor = resolveColor(borderColor, theme);

  // Shadow styles
  const shadowStyles = shadow
    ? {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: shadow,
        elevation: shadow,
      }
    : {};

  return (
    <View
      style={[
        {
          backgroundColor,
          padding: p,
          paddingHorizontal: px,
          paddingVertical: py,
          paddingTop: pt,
          paddingBottom: pb,
          paddingLeft: pl,
          paddingRight: pr,
          margin: m,
          marginHorizontal: mx,
          marginVertical: my,
          marginTop: mt,
          marginBottom: mb,
          marginLeft: ml,
          marginRight: mr,
          width,
          height,
          minWidth,
          minHeight,
          maxWidth,
          maxHeight,
          borderRadius,
          borderWidth,
          borderColor: resolvedBorderColor,
          flex,
          flexDirection,
          justifyContent,
          alignItems,
          alignSelf,
          position,
          top,
          right,
          bottom,
          left,
          zIndex,
          overflow,
          opacity,
          ...shadowStyles,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
