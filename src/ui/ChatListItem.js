import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import Typography from "./Typography";
import Avatar from "./Avatar";
import Badge from "./Badge";
import { HStack, VStack } from "./Stack";
import Box from "./Box";

export default function ChatListItem({
  avatar,
  name,
  lastMessage,
  timestamp,
  unreadCount = 0,
  isOnline = false,
  isMuted = false,
  isPinned = false,
  isTyping = false,
  onPress,
  onLongPress,
  style,
  ...props
}) {
  const { theme, colorMode } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      style={[
        {
          backgroundColor: isPinned
            ? colorMode === "dark"
              ? "#1C1C1E"
              : "#F8F8F8"
            : "transparent",
        },
        style,
      ]}
      {...props}
    >
      <HStack space={12} alignItems="center" px={16} py={12}>
        {/* Avatar with online status */}
        <Box position="relative">
          <Badge
            variant="dot"
            color="success"
            invisible={!isOnline}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Avatar src={avatar} name={name} size="large" />
          </Badge>
        </Box>

        {/* Chat Info */}
        <VStack space={4} flex={1}>
          <HStack justifyContent="space-between" alignItems="center">
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color={theme.textPrimary}
              numberOfLines={1}
              style={{ flex: 1 }}
            >
              {name}
            </Typography>

            <HStack space={4} alignItems="center">
              {isPinned && (
                <Ionicons name="pin" size={14} color={theme.textSecondary} />
              )}
              <Typography variant="caption" color={theme.textSecondary}>
                {timestamp}
              </Typography>
            </HStack>
          </HStack>

          <HStack justifyContent="space-between" alignItems="center">
            <HStack space={4} alignItems="center" flex={1}>
              {isMuted && (
                <Ionicons
                  name="volume-mute"
                  size={16}
                  color={theme.textSecondary}
                />
              )}

              {isTyping ? (
                <Typography
                  variant="body2"
                  color={theme.primary}
                  fontWeight="500"
                >
                  typing...
                </Typography>
              ) : (
                <Typography
                  variant="body2"
                  color={theme.textSecondary}
                  numberOfLines={1}
                  style={{ flex: 1 }}
                >
                  {lastMessage}
                </Typography>
              )}
            </HStack>

            {unreadCount > 0 && (
              <Badge content={unreadCount} color="primary" max={999} />
            )}
          </HStack>
        </VStack>
      </HStack>
    </TouchableOpacity>
  );
}
