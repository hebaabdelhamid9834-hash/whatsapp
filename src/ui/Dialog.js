import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  ScrollView,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import Typography from "./Typography";
import Button from "./Button";
import { VStack, HStack } from "./Stack";
import IconButton from "./IconButton";
import Icon from "./Icon";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Dialog({
  visible = false,
  title,
  content,
  children,
  actions = [],
  onClose,
  closeButton = true,
  maxHeight = "80%",
  width = "90%",
  fullScreen = false,
  style,
  titleIcon,
  titleIconSize = 25,
  darker = false,
  position = "center", // "center" | "top" | "bottom"
  noPadding = false,
  ...props
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;

    if (visible) {
      setIsModalVisible(true);
      if (!fullScreen && position !== "center") {
        slideAnim.setValue(
          position === "bottom" ? SCREEN_HEIGHT * 0.5 : -SCREEN_HEIGHT * 0.5
        );
        overlayAnim.setValue(0);

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
      } else {
        slideAnim.setValue(0);
        overlayAnim.setValue(1);
      }
    } else {
      if (!fullScreen && position !== "center") {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue:
              position === "bottom"
                ? SCREEN_HEIGHT * 0.5
                : -SCREEN_HEIGHT * 0.5,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(overlayAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (mounted) setIsModalVisible(false);
        });
      } else {
        if (mounted) setIsModalVisible(false);
      }
    }

    return () => {
      mounted = false;
    };
  }, [visible, position, fullScreen]);

  const renderContent = () => (
    <>
      {/* Header */}
      {(title || closeButton) && (
        <HStack
          justifyContent="space-between"
          alignItems="center"
          px={20}
          py={16}
          style={{
            borderBottomWidth: 1,
            borderBottomColor: theme.action.hover,
          }}
        >
          <HStack space={10} alignItems="center">
            {titleIcon && <Icon size={titleIconSize} name={titleIcon} />}
            <Typography variant="h6" fontWeight="600" numberOfLines={1}>
              {title}
            </Typography>
          </HStack>

          {closeButton && (
            <IconButton icon="close" onPress={onClose} size="small" />
          )}
        </HStack>
      )}

      {/* Content */}
      <ScrollView
        style={fullScreen ? { flex: 1 } : {}}
        contentContainerStyle={{
          padding: noPadding ? 0 : 20,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {content ? (
          <Typography variant="body1" color={theme.textSecondary}>
            {content}
          </Typography>
        ) : (
          children
        )}
      </ScrollView>

      {/* Actions */}
      {actions.length > 0 && (
        <HStack
          space={12}
          justifyContent="flex-end"
          alignItems="center"
          px={20}
          py={16}
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.border,
            minHeight: 64,
          }}
        >
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "text"}
              color={action.color || "primary"}
              onPress={action.onPress}
            >
              {action.label}
            </Button>
          ))}
        </HStack>
      )}
    </>
  );

  if (!isModalVisible) return null;

  return (
    <Modal
      visible={isModalVisible}
      transparent={!fullScreen}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      {...props}
    >
      {fullScreen ? (
        // --- FULLSCREEN DIALOG ---
        <View
          style={{
            flex: 1,
            backgroundColor: darker ? theme.background : theme.surface,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          {renderContent()}
        </View>
      ) : position === "center" ? (
        // --- CENTERED DIALOG ---
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Backdrop touch area */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={onClose}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Content area - isolated from touch bubbling */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={[
              {
                width: width,
                maxHeight: maxHeight,
                backgroundColor: darker ? theme.background : theme.surface,
                borderRadius: 16,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 10,
              },
              style,
            ]}
          >
            {renderContent()}
          </TouchableOpacity>
        </View>
      ) : (
        // --- TOP / BOTTOM SHEET DIALOG ---
        <View style={{ flex: 1 }}>
          {/* Backdrop */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={onClose}
            style={StyleSheet.absoluteFillObject}
          >
            <Animated.View
              style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                opacity: overlayAnim,
              }}
            />
          </TouchableOpacity>

          {/* Sheet */}
          <Animated.View
            style={{
              position: "absolute",
              top: position === "top" ? 0 : undefined,
              bottom: position === "bottom" ? 0 : undefined,
              left: 0,
              right: 0,
              height: SCREEN_HEIGHT * 0.5,
              backgroundColor: darker ? theme.background : theme.surface,
              borderTopLeftRadius: position === "bottom" ? 16 : 0,
              borderTopRightRadius: position === "bottom" ? 16 : 0,
              borderBottomLeftRadius: position === "top" ? 16 : 0,
              borderBottomRightRadius: position === "top" ? 16 : 0,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: position === "bottom" ? -8 : 8,
              },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 10,
              paddingTop: position === "top" ? insets.top : 0,
              paddingBottom: position === "bottom" ? insets.bottom : 0,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Prevent touch bubbling */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={{ flex: 1 }}
            >
              {renderContent()}
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </Modal>
  );
}
