import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import Typography from "./Typography";
import { VStack, HStack } from "./Stack";

export default function ChatBubble({
  message,
  timestamp,
  isSent = false,
  isRead = false,
  isDelivered = false,
  showTail = true,
  onPress,
  onLongPress,
  style,
  ...props
}) {
  const { theme, colorMode } = useTheme();

  const bubbleColor = isSent
    ? theme.primary
    : colorMode === "dark"
    ? "#1C1C1E"
    : "#FFFFFF";

  const textColor = isSent ? "#FFFFFF" : theme.textPrimary;

  const getStatusIcon = () => {
    if (!isSent) return null;
    if (isRead) return "checkmark-done";
    if (isDelivered) return "checkmark-done";
    return "checkmark";
  };

  const getStatusColor = () => {
    if (isRead) return "#34B7F1"; // WhatsApp blue
    return textColor;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={[
        {
          alignSelf: isSent ? "flex-end" : "flex-start",
          maxWidth: "80%",
          marginVertical: 2,
        },
        style,
      ]}
      {...props}
    >
      <View
        style={{
          backgroundColor: bubbleColor,
          borderRadius: 8,
          borderBottomRightRadius: isSent && showTail ? 0 : 8,
          borderBottomLeftRadius: !isSent && showTail ? 0 : 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <VStack space={4}>
          <Typography variant="body1" color={textColor}>
            {message}
          </Typography>

          <HStack space={4} alignItems="center" justifyContent="flex-end">
            <Typography
              variant="caption"
              fontSize={11}
              color={textColor}
              style={{ opacity: 0.7 }}
            >
              {timestamp}
            </Typography>

            {isSent && (
              <Ionicons
                name={getStatusIcon()}
                size={16}
                color={getStatusColor()}
                style={{ opacity: 0.7 }}
              />
            )}
          </HStack>
        </VStack>
      </View>
    </TouchableOpacity>
  );
}
