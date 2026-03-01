import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { HStack } from "./Stack";

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  onFocus,
  onBlur,
  onCancel,
  showCancel = false,
  autoFocus = false,
  style,
  ...props
}) {
  const { theme, colorMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleClear = () => {
    onChangeText("");
  };

  return (
    <HStack space={8} alignItems="center" style={style}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          height: 40,
          backgroundColor: colorMode === "dark" ? "#1C1C1E" : "#F2F2F7",
          borderRadius: 10,
          paddingHorizontal: 12,
          borderWidth: isFocused ? 1.5 : 0,
          borderColor: isFocused ? theme.primary : "transparent",
        }}
      >
        <Ionicons
          name="search"
          size={18}
          color={theme.textSecondary}
          style={{ marginRight: 8 }}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          style={{
            flex: 1,
            color: theme.textPrimary,
            fontSize: 16,
            fontFamily: "Outfit_400Regular",
            paddingVertical: 0,
          }}
          placeholderTextColor={colorMode === "dark" ? "#8E8E93" : "#C7C7CC"}
          returnKeyType="search"
          {...props}
        />

        {value?.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {(showCancel || isFocused) && (
        <TouchableOpacity onPress={onCancel}>
          <Typography variant="body1" color={theme.primary} fontWeight="500">
            Cancel
          </Typography>
        </TouchableOpacity>
      )}
    </HStack>
  );
}
