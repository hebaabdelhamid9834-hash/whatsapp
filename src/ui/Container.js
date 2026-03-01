import React from "react";
import { ScrollView, View, Platform, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";

export default function Container({
  children,
  scrollable = true,
  safeArea = true,
  keyboardAware = false,
  edges = ["top", "left", "right"],
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
  style,
  px = 0,
  py = 0,
  ...props
}) {
  const { theme } = useTheme();

  const containerStyles = {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: px,
    paddingVertical: py,
  };

  const Wrapper = safeArea ? SafeAreaView : View;

  // Content rendering
  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          contentContainerStyle={[
            {
              flexGrow: 1,
              paddingHorizontal: px,
              paddingVertical: py,
            },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          scrollEventThrottle={16}
          {...props}
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View style={[containerStyles, contentContainerStyle]} {...props}>
        {children}
      </View>
    );
  };

  // Keyboard wrapper
  const renderWithKeyboard = (content) => {
    if (keyboardAware) {
      return (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          {content}
        </KeyboardAvoidingView>
      );
    }
    return content;
  };

  return (
    <Wrapper
      style={[{ flex: 1, backgroundColor: theme.background }, style]}
      edges={edges}
    >
      {renderWithKeyboard(renderContent())}
    </Wrapper>
  );
}
