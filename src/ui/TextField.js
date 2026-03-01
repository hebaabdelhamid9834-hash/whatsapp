import React, { useState } from "react";
import {
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import Typography from "./Typography";
import { VStack } from "./Stack";
import Box from "./Box";

export default function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  secureTextEntry = false,
  keyboardType = "default",
  leftIcon,
  leftIconPress = () => {},
  leftComponent,
  rightIcon,
  rightIconPress = () => {},
  rightComponent,
  multiline = false,
  numberOfLines = 1,
  rows, // ✅ NEW: rows prop
  disabled = false,
  editable = true, // ✅ NEW: editable prop (default true)
  loading = false,
  variant = "outlined", // outlined | filled | whatsapp | standard
  size = "medium", // small | medium | large
  type = "text", // text | password | email | number | phone
  style,
  borderRadius = 8,
  ...props
}) {
  const { theme, colorMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Handle rows prop - if rows is provided, enable multiline
  const isMultiline = multiline || (rows && rows > 1);
  const lineCount = rows || numberOfLines;

  // Auto-detect keyboard type and secure entry based on type
  const getInputProps = () => {
    switch (type) {
      case "password":
        return { secureTextEntry: true, keyboardType: "default" };
      case "email":
        return { keyboardType: "email-address", autoCapitalize: "none" };
      case "number":
        return { keyboardType: "numeric" };
      case "phone":
        return { keyboardType: "phone-pad" };
      default:
        return { keyboardType, secureTextEntry };
    }
  };

  const inputProps = getInputProps();
  const isPassword = type === "password" || secureTextEntry;

  // ✅ Determine if input should be editable
  // disabled = completely disabled (grayed out, no interaction)
  // editable = controls only text editing (icons still work)
  const canEdit = !disabled && editable && !loading;

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { height: 40, fontSize: 14, px: 12 };
      case "large":
        return { height: 56, fontSize: 17, px: 16 };
      default:
        return { height: 48, fontSize: 16, px: 14 };
    }
  };

  const sizeStyles = getSizeStyles();

  const getVariantStyles = () => {
    if (variant === "standard") {
      return {
        backgroundColor: "transparent",
        borderWidth: 0,
        borderBottomWidth: 1,
        borderBottomColor: error
          ? theme.error
          : isFocused
          ? theme.primary
          : colorMode === "dark"
          ? "#3A3A3C"
          : "#C7C7CC",
        borderRadius: 0,
        paddingHorizontal: 0,
      };
    }
    if (variant === "whatsapp") {
      return {
        backgroundColor: colorMode === "dark" ? "#1C1C1E" : "#FFFFFF",
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        borderColor: colorMode === "dark" ? "#2C2C2E" : "#E5E5EA",
        borderRadius: borderRadius,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.action.hover,
      };
    }
    if (variant === "filled") {
      return {
        backgroundColor: colorMode === "dark" ? "#1C1C1E" : "#F2F2F7",
        borderWidth: 0,
        borderBottomWidth: 2,
        borderBottomColor: error
          ? theme.error
          : isFocused
          ? theme.primary
          : "transparent",
        borderRadius: borderRadius,
      };
    }
    // outlined (default)
    return {
      backgroundColor: colorMode === "dark" ? "#1C1C1E" : "#FFFFFF",
      borderWidth: 1.5,
      borderColor: error
        ? theme.error
        : isFocused
        ? theme.primary
        : theme.border,
      borderRadius: borderRadius,
    };
  };

  const variantStyles = getVariantStyles();

  // ✅ Render left side content (custom component or icon)
  const renderLeftContent = () => {
    // Priority: leftComponent > leftIcon
    if (leftComponent) {
      return <View style={{ marginRight: 10 }}>{leftComponent}</View>;
    }

    if (leftIcon) {
      return (
        <TouchableOpacity
          onPress={leftIconPress}
          disabled={disabled || loading} // ✅ Icons work when editable=false
        >
          <Ionicons
            name={leftIcon}
            size={20}
            color={
              disabled || loading ? theme.textDisabled : theme.textSecondary
            }
            style={{ marginRight: 10, marginTop: isMultiline ? 2 : 0 }}
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  // ✅ Render right side content (custom component, loading, password toggle, or icon)
  const renderRightContent = () => {
    // Priority: rightComponent > loading > password toggle > rightIcon
    if (rightComponent) {
      return <View style={{ marginLeft: 12 }}>{rightComponent}</View>;
    }

    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={theme.primary}
          style={{ marginLeft: 12 }}
        />
      );
    }

    if (isPassword) {
      return (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={{ marginLeft: 12, padding: 4 }}
          disabled={disabled || loading} // ✅ Password toggle works when editable=false
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color={
              disabled || loading ? theme.textDisabled : theme.textSecondary
            }
          />
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      return (
        <TouchableOpacity
          onPress={rightIconPress}
          disabled={disabled || loading} // ✅ Icons work when editable=false
          style={{ marginLeft: 12 }}
        >
          <Ionicons
            name={rightIcon}
            size={20}
            color={
              disabled || loading ? theme.textDisabled : theme.textSecondary
            }
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  // WhatsApp Variant (Different Structure)
  if (variant === "whatsapp") {
    return (
      <VStack space={0} style={style}>
        <Box
          style={{
            flexDirection: "row",
            alignItems: "center",
            ...variantStyles,
            opacity: disabled || loading ? 0.5 : 1, // ✅ Only disabled/loading affects opacity
          }}
        >
          {renderLeftContent()}

          <Box style={{ flex: 1 }}>
            {label && (
              <Typography
                fontSize={13}
                color={theme.textSecondary}
                style={{ marginBottom: 4 }}
              >
                {label}
              </Typography>
            )}
            <TextInput
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              secureTextEntry={isPassword && !showPassword}
              keyboardType={inputProps.keyboardType}
              multiline={isMultiline}
              numberOfLines={lineCount}
              editable={canEdit} // ✅ Uses combined editable logic
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={{
                fontSize: 16,
                color:
                  !editable && !disabled
                    ? theme.textSecondary
                    : theme.textPrimary, // ✅ Different color when not editable
                padding: 0,
                fontFamily: "Outfit_400Regular",
                minHeight: isMultiline ? lineCount * 20 : undefined,
                textAlignVertical: isMultiline ? "top" : "center",
              }}
              placeholderTextColor={theme.textDisabled}
              {...props}
            />
          </Box>

          {renderRightContent()}
        </Box>

        {(error || helperText) && (
          <Box style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <Typography
              fontSize={13}
              color={error ? theme.error : theme.textSecondary}
            >
              {error || helperText}
            </Typography>
          </Box>
        )}
      </VStack>
    );
  }

  // Default Variants (outlined | filled | standard)
  return (
    <VStack space={variant === "standard" ? 2 : 4} style={style}>
      {label && (
        <Typography
          variant="body2"
          fontWeight="500"
          color={
            error
              ? theme.error
              : isFocused && variant === "standard"
              ? theme.primary
              : theme.textSecondary
          }
        >
          {label}
        </Typography>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: isMultiline ? "flex-start" : "center",
          minHeight: isMultiline
            ? sizeStyles.height * lineCount
            : sizeStyles.height,
          paddingHorizontal: variant === "standard" ? 0 : sizeStyles.px,
          paddingVertical: isMultiline ? 12 : variant === "standard" ? 8 : 0,
          opacity: disabled || loading ? 0.5 : 1, // ✅ Only disabled/loading affects opacity
          ...variantStyles,
        }}
      >
        {renderLeftContent()}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={inputProps.keyboardType}
          autoCapitalize={inputProps.autoCapitalize}
          multiline={isMultiline}
          numberOfLines={lineCount}
          editable={canEdit} // ✅ Uses combined editable logic
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            flex: 1,
            color:
              !editable && !disabled ? theme.textSecondary : theme.textPrimary, // ✅ Different color when not editable
            fontSize: sizeStyles.fontSize,
            fontFamily: "Outfit_400Regular",
            paddingVertical: isMultiline ? 0 : 0,
            textAlignVertical: isMultiline ? "top" : "center",
          }}
          placeholderTextColor={theme.textDisabled}
          {...props}
        />

        {renderRightContent()}
      </View>

      {(error || helperText) && (
        <Typography
          variant="caption"
          color={error ? theme.error : theme.textSecondary}
        >
          {error || helperText}
        </Typography>
      )}
    </VStack>
  );
}
