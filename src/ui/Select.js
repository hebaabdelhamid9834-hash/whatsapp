import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import Typography from "./Typography";
import { VStack, HStack } from "./Stack";
import Box from "./Box";
import Divider from "./Divider";
import Button from "./Button";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Select({
  label,
  value,
  onChange,
  options = [], // [{ label: "Option 1", value: "1", icon: "icon-name" }] or ["Option 1", "Option 2"]
  placeholder = "Select an option",
  error,
  helperText,
  disabled = false,
  variant = "outlined", // outlined | filled | standard
  size = "medium", // small | medium | large
  multiple = false, // Allow multiple selection
  leftIcon,
  renderValue, // Custom render for selected value
  style,
  bottomSheet = true, // ✅ Enable bottom sheet style
  ...props
}) {
  const { theme, colorMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // Normalize options to { label, value } format
  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  // Get selected option(s)
  const getSelectedOption = () => {
    if (multiple) {
      return normalizedOptions.filter((opt) =>
        Array.isArray(value) ? value.includes(opt.value) : false
      );
    }
    return normalizedOptions.find((opt) => opt.value === value);
  };

  const selectedOption = getSelectedOption();

  // Display value
  const displayValue = () => {
    if (renderValue && selectedOption) {
      return renderValue(selectedOption);
    }

    if (
      multiple &&
      Array.isArray(selectedOption) &&
      selectedOption.length > 0
    ) {
      return selectedOption.map((opt) => opt.label).join(", ");
    }

    if (selectedOption && !multiple) {
      return selectedOption.label;
    }

    return placeholder;
  };

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : value !== undefined && value !== null && value !== "";

  // Size styles
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

  // Variant styles
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
        borderRadius: 8,
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
      borderRadius: 8,
    };
  };

  const variantStyles = getVariantStyles();

  // Open bottom sheet
  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    setIsFocused(true);

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Close bottom sheet
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
      setIsFocused(false);
    });
  };

  // Handle option selection
  const handleSelect = (option) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(option.value)
        ? currentValues.filter((v) => v !== option.value)
        : [...currentValues, option.value];

      const selectedObjects = normalizedOptions.filter((opt) =>
        newValues.includes(opt.value)
      );

      onChange?.(newValues, selectedObjects); // ✅ Pass both value array and objects
    } else {
      onChange?.(option.value, option); // ✅ Pass both value and full object
      handleClose();
    }
  };

  // Check if option is selected
  const isSelected = (option) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(option.value);
    }
    return value === option.value;
  };

  // Render option item
  const renderOption = ({ item }) => {
    const selected = isSelected(item);
    return (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: selected
            ? colorMode === "dark"
              ? "rgba(10, 132, 255, 0.15)"
              : "rgba(10, 132, 255, 0.08)"
            : "transparent",
        }}
      >
        <HStack justifyContent="space-between" alignItems="center">
          <HStack space={12} alignItems="center" style={{ flex: 1 }}>
            {/* Icon support */}
            {item.icon && (
              <Ionicons
                name={item.icon}
                size={22}
                color={selected ? theme.primary : theme.textSecondary}
              />
            )}
            <Typography
              variant="body1"
              color={selected ? theme.primary : theme.textPrimary}
              fontWeight={selected ? "600" : "400"}
              style={{ flex: 1 }}
            >
              {item.label}
            </Typography>
          </HStack>
          {selected && (
            <Ionicons name="checkmark" size={24} color={theme.primary} />
          )}
        </HStack>
      </TouchableOpacity>
    );
  };

  return (
    <VStack space={variant === "standard" ? 2 : 4} style={style}>
      {/* Label */}
      {label && (
        <Typography
          variant="body2"
          //   fontWeight="500"
          color={
            error
              ? theme.error
              : isFocused && variant === "standard"
              ? theme.primary
              : theme.textSecondary
          }
          style={{
            marginBottom: 5,
          }}
        >
          {label}
        </Typography>
      )}

      {/* Select Input */}
      <TouchableOpacity
        onPress={handleOpen}
        disabled={disabled}
        style={{
          flexDirection: "row",
          alignItems: "center",
          height: sizeStyles.height,
          paddingHorizontal: variant === "standard" ? 0 : sizeStyles.px,
          opacity: disabled ? 0.5 : 1,
          ...variantStyles,
        }}
        {...props}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={theme.textSecondary}
            style={{ marginRight: 10 }}
          />
        )}

        <Typography
          variant="body1"
          fontSize={sizeStyles.fontSize}
          color={hasValue ? theme.textPrimary : theme.textSecondary}
          style={{ flex: 1 }}
          numberOfLines={1}
        >
          {displayValue()}
        </Typography>

        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.textSecondary}
        />
      </TouchableOpacity>

      {/* Helper Text */}
      {(error || helperText) && (
        <Typography
          variant="caption"
          color={error ? theme.error : theme.textSecondary}
        >
          {error || helperText}
        </Typography>
      )}

      {/* Bottom Sheet Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <View style={{ flex: 1 }}>
          {/* Overlay */}
          <TouchableWithoutFeedback onPress={handleClose}>
            <Animated.View
              style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                opacity: overlayAnim,
              }}
            />
          </TouchableWithoutFeedback>

          {/* Bottom Sheet */}
          <Animated.View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: theme.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: SCREEN_HEIGHT * 0.7,
              paddingBottom: insets.bottom,
              transform: [{ translateY: slideAnim }],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 20,
            }}
          >
            {/* Handle Bar */}
            <View
              style={{
                alignItems: "center",
                paddingVertical: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 5,
                  backgroundColor: colorMode === "dark" ? "#3A3A3C" : "#C7C7CC",
                  borderRadius: 3,
                }}
              />
            </View>

            {/* Header */}
            <HStack
              justifyContent="space-between"
              alignItems="center"
              px={20}
              py={12}
              style={{
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
              }}
            >
              <Typography variant="h6" fontWeight="600">
                {label || "Select Option"}
              </Typography>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={28} color={theme.textPrimary} />
              </TouchableOpacity>
            </HStack>

            {/* Options List */}
            <FlatList
              data={normalizedOptions}
              keyExtractor={(item, index) =>
                item.value?.toString() || index.toString()
              }
              renderItem={renderOption}
              ItemSeparatorComponent={() => <Divider />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />

            {/* Footer (for multiple selection) */}
            {multiple && (
              <HStack
                justifyContent="space-between"
                alignItems="center"
                px={20}
                py={16}
                style={{
                  borderTopWidth: 1,
                  borderTopColor: theme.border,
                }}
              >
                <Typography variant="body2" color={theme.textSecondary}>
                  {Array.isArray(value) ? value.length : 0} selected
                </Typography>
                <Button onPress={handleClose} variant="contained" size="medium">
                  Done
                </Button>
              </HStack>
            )}
          </Animated.View>
        </View>
      </Modal>
    </VStack>
  );
}
