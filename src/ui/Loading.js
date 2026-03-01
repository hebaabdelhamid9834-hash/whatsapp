import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import Typography from "./Typography";
import { VStack } from "./Stack";

export default function Loading({
  size = "large", // small | large
  color,
  text,
  fullScreen = false,
  overlay = false,
  style,
  ...props
}) {
  const { theme } = useTheme();

  const content = (
    <VStack space={16} alignItems="center" justifyContent="center">
      <ActivityIndicator
        size={size}
        color={color || theme.primary}
        {...props}
      />
      {text && (
        <Typography variant="body2" color={theme.textSecondary}>
          {text}
        </Typography>
      )}
    </VStack>
  );

  if (fullScreen || overlay) {
    return (
      <View
        style={[
          {
            position: overlay ? "absolute" : "relative",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: overlay ? "rgba(0, 0, 0, 0.5)" : theme.background,
            zIndex: overlay ? 9999 : 1,
          },
          style,
        ]}
      >
        {content}
      </View>
    );
  }

  return <View style={style}>{content}</View>;
}
