// src/ui/Divider.js
import React from "react";
import { View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import Typography from "./Typography";

export default function Divider({
  orientation = "horizontal", // horizontal | vertical
  variant = "fullWidth", // fullWidth | inset | middle
  textAlign = "center", // left | center | right
  children,
  style,
  ...props
}) {
  const { theme, colorMode } = useTheme();

  // ✅ More subtle divider color based on theme
  const dividerColor =
    colorMode === "dark"
      ? "rgba(255, 255, 255, 0.12)" // Subtle white in dark mode
      : "rgba(0, 0, 0, 0.08)"; // Very subtle black in light mode

  const getInsetStyles = () => {
    if (orientation === "vertical") return {};

    switch (variant) {
      case "inset":
        return { marginLeft: 16 };
      case "middle":
        return { marginHorizontal: 16 };
      default:
        return {};
    }
  };

  if (children) {
    // Divider with text
    return (
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            ...getInsetStyles(),
          },
          style,
        ]}
        {...props}
      >
        {textAlign !== "left" && (
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: dividerColor, // ✅ Use subtle color
            }}
          />
        )}

        <Typography
          variant="caption"
          color={theme.textSecondary}
          style={{ marginHorizontal: 12 }}
        >
          {children}
        </Typography>

        {textAlign !== "right" && (
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: dividerColor, // ✅ Use subtle color
            }}
          />
        )}
      </View>
    );
  }

  // Simple divider
  if (orientation === "vertical") {
    return (
      <View
        style={[
          {
            width: 1,
            height: "100%",
            backgroundColor: dividerColor, // ✅ Use subtle color
          },
          style,
        ]}
        {...props}
      />
    );
  }

  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor: dividerColor, // ✅ Use subtle color
          ...getInsetStyles(),
        },
        style,
      ]}
      {...props}
    />
  );
}
