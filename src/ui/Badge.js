import React from "react";
import { View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import Typography from "./Typography";

export default function Badge({
  children,
  content,
  variant = "standard", // standard | dot
  color = "error", // primary | secondary | error | success
  max = 99,
  showZero = false,
  invisible = false,
  anchorOrigin = { vertical: "top", horizontal: "right" },
  style,
  ...props
}) {
  const { theme } = useTheme();

  const getColorValue = () => {
    switch (color) {
      case "primary":
        return theme.primary;
      case "secondary":
        return theme.secondary || "#9c27b0";
      case "success":
        return theme.success;
      default:
        return theme.error;
    }
  };

  const badgeColor = getColorValue();

  const getAnchorStyles = () => {
    const { vertical, horizontal } = anchorOrigin;
    return {
      [vertical]: -4,
      [horizontal]: -4,
    };
  };

  const displayContent =
    typeof content === "number" && content > max ? `${max}+` : content;
  const shouldShow = !invisible && (showZero || content !== 0);

  if (!shouldShow) {
    return <>{children}</>;
  }

  return (
    <View style={[{ position: "relative" }, style]} {...props}>
      {children}

      {variant === "dot" ? (
        <View
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: badgeColor,
            ...getAnchorStyles(),
          }}
        />
      ) : (
        <View
          style={{
            position: "absolute",
            minWidth: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: badgeColor,
            paddingHorizontal: 6,
            justifyContent: "center",
            alignItems: "center",
            ...getAnchorStyles(),
          }}
        >
          <Typography
            variant="caption"
            fontWeight="600"
            color="#FFFFFF"
            fontSize={11}
          >
            {displayContent}
          </Typography>
        </View>
      )}
    </View>
  );
}
