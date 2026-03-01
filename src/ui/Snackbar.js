import React, { useEffect, useRef } from "react";
import {
  Animated,
  Vibration,
  Platform,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import Typography from "./Typography";

export default function Snackbar({
  visible = false,
  message,
  action,
  onActionPress,
  onDismiss,
  duration = 4000,
  position = "bottom",
  isSuccess = true,
  style,
  ...props
}) {
  const { theme, colorMode } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(
    new Animated.Value(
      position === "bottom" ? 100 : position === "top" ? -100 : 0
    )
  ).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      if (Platform.OS === "ios") {
        Vibration.vibrate(10);
      } else if (Platform.OS === "android") {
        Vibration.vibrate(50);
      }

      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      translateY.setValue(
        position === "bottom" ? 100 : position === "top" ? -100 : 0
      );
      opacity.setValue(0);
      scale.setValue(0.95);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === "bottom" ? 100 : position === "top" ? -100 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  const getStyles = () => {
    const isDark = colorMode === "dark";

    if (isSuccess) {
      return {
        bg: isDark ? "#0A2E1F" : "#E8F5E9",
        borderColor: isDark ? "#1B5E3A" : "#4CAF50",
        iconColor: isDark ? "#4ADE80" : "#2E7D32",
        iconName: "checkmark-circle",
      };
    } else {
      return {
        bg: isDark ? "#2E0A0A" : "#FFEBEE",
        borderColor: isDark ? "#5E1B1B" : "#F44336",
        iconColor: isDark ? "#F87171" : "#C62828",
        iconName: "close-circle",
      };
    }
  };

  const variantStyles = getStyles();

  const getPositionStyle = () => {
    switch (position) {
      case "top":
        return { top: insets.top + 12 };
      case "center":
        return { top: "50%", marginTop: -24 };
      case "bottom":
      default:
        return { bottom: insets.bottom + 16 };
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
        getPositionStyle(),
        style,
      ]}
      {...props}
    >
      <View
        style={[
          styles.snackbar,
          {
            backgroundColor: variantStyles.bg,
            borderColor: variantStyles.borderColor,
            shadowColor:
              colorMode === "dark" ? "#000" : variantStyles.borderColor,
            shadowOpacity: colorMode === "dark" ? 0.6 : 0.2,
          },
        ]}
      >
        <View style={styles.content}>
          {/* Icon + Message */}
          <View style={styles.messageContainer}>
            <Ionicons
              name={variantStyles.iconName}
              size={20}
              color={variantStyles.iconColor}
              style={styles.icon}
            />
            <Typography
              variant="body2"
              style={styles.message}
              numberOfLines={2}
            >
              {message}
            </Typography>
          </View>

          {/* Action + Close */}
          <View style={styles.actionsContainer}>
            {action && (
              <TouchableOpacity
                onPress={onActionPress}
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <Typography
                  variant="body2"
                  fontWeight="600"
                  color={variantStyles.iconColor}
                  style={styles.actionText}
                >
                  {action}
                </Typography>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleDismiss}
              style={styles.closeButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 10000,
  },
  snackbar: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  icon: {
    marginRight: 10,
  },
  message: {
    flex: 1,
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
  },
  actionText: {
    fontSize: 13,
  },
  closeButton: {
    padding: 2,
  },
});
