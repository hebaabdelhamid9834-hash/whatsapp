import React from "react";
import { View, TouchableOpacity, StatusBar, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import Typography from "./Typography";
import { HStack } from "./Stack";
import Avatar from "./Avatar";

export default function AppBar({
  title,
  subtitle,
  avatar,
  leftIcon = "arrow-back",
  rightIcons = [],
  onLeftPress,
  onRightPress,
  onTitlePress,
  variant = "default", // default | chat
  style,
  ...props
}) {
  const { theme, colorMode } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          backgroundColor: theme.surface,
          paddingTop:
            Platform.OS === "ios" ? insets.top : StatusBar.currentHeight || 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        style,
      ]}
      {...props}
    >
      <HStack
        space={12}
        alignItems="center"
        justifyContent="space-between"
        px={variant === "chat" ? 8 : 16}
        py={12}
      >
        {/* Left Section */}
        <HStack
          space={variant === "chat" ? 8 : 16}
          alignItems="center"
          flex={1}
        >
          {leftIcon && (
            <TouchableOpacity
              onPress={onLeftPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name={leftIcon} size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          )}

          {variant === "chat" && avatar && (
            <TouchableOpacity onPress={onTitlePress} activeOpacity={0.7}>
              <Avatar src={avatar} name={title} size="small" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onTitlePress}
            activeOpacity={onTitlePress ? 0.7 : 1}
            style={{ flex: 1 }}
          >
            {subtitle ? (
              <View>
                <Typography
                  variant="subtitle1"
                  fontWeight="600"
                  numberOfLines={1}
                >
                  {title}
                </Typography>
                <Typography
                  variant="caption"
                  color={theme.textSecondary}
                  numberOfLines={1}
                >
                  {subtitle}
                </Typography>
              </View>
            ) : (
              <Typography variant="h6" fontWeight="600" numberOfLines={1}>
                {title}
              </Typography>
            )}
          </TouchableOpacity>
        </HStack>

        {/* Right Section */}
        {rightIcons.length > 0 && (
          <HStack space={16} alignItems="center">
            {rightIcons.map((icon, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onRightPress?.(icon, index)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name={icon} size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            ))}
          </HStack>
        )}
      </HStack>
    </View>
  );
}
