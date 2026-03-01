import React, { useState } from "react";
import { TextInput, TouchableOpacity, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { HStack } from "./Stack";
import IconButton from "./IconButton";

export default function MessageInput({
  value,
  onChangeText,
  onSend,
  onAttach,
  onCamera,
  onVoice,
  placeholder = "Message",
  disabled = false,
  style,
  ...props
}) {
  const { theme, colorMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleSend = () => {
    if (value?.trim()) {
      onSend?.(value.trim());
    }
  };

  const showSendButton = value?.trim().length > 0;

  return (
    <View
      style={[
        {
          backgroundColor: theme.background,
          paddingHorizontal: 8,
          paddingVertical: 8,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        },
        style,
      ]}
    >
      <HStack space={8} alignItems="flex-end">
        {/* Input Container */}
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "flex-end",
            backgroundColor: colorMode === "dark" ? "#1C1C1E" : "#F2F2F7",
            borderRadius: 24,
            paddingHorizontal: 12,
            paddingVertical: Platform.OS === "ios" ? 8 : 4,
            minHeight: 40,
            maxHeight: 120,
          }}
        >
          {/* Emoji Button */}
          <TouchableOpacity
            style={{ paddingBottom: 8, paddingRight: 8 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="happy-outline"
              size={24}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            multiline
            maxLength={5000}
            editable={!disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
              flex: 1,
              color: theme.textPrimary,
              fontSize: 16,
              fontFamily: "Outfit_400Regular",
              paddingTop: Platform.OS === "ios" ? 8 : 6,
              paddingBottom: Platform.OS === "ios" ? 8 : 6,
              maxHeight: 100,
            }}
            placeholderTextColor={colorMode === "dark" ? "#8E8E93" : "#C7C7CC"}
            {...props}
          />

          {/* Attach Button */}
          {!showSendButton && (
            <TouchableOpacity
              onPress={onAttach}
              style={{ paddingBottom: 8, paddingLeft: 8 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="attach" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Camera Button */}
          {!showSendButton && (
            <TouchableOpacity
              onPress={onCamera}
              style={{ paddingBottom: 8, paddingLeft: 8 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="camera-outline"
                size={24}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Send or Voice Button */}
        {showSendButton ? (
          <IconButton
            icon="send"
            onPress={handleSend}
            variant="contained"
            size="medium"
            style={{
              backgroundColor: theme.primary,
              width: 40,
              height: 40,
            }}
          />
        ) : (
          <IconButton
            icon="mic-outline"
            onPress={onVoice}
            variant="contained"
            size="medium"
            style={{
              backgroundColor: theme.primary,
              width: 40,
              height: 40,
            }}
          />
        )}
      </HStack>
    </View>
  );
}
