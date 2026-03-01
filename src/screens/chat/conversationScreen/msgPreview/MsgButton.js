import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../../contexts/ThemeContext";
import { VStack, HStack, Typography } from "../../../../ui";

const MsgButton = ({ msg }) => {
  const { theme, colorMode } = useTheme();

  const handleButtonPress = (button) => {
    console.log("Button pressed:", button.reply.title);
    // Handle button action here
  };

  const isDark = colorMode === "dark";
  const buttons = msg?.msgContext?.interactive?.action?.buttons || [];
  const bodyText = msg?.msgContext?.interactive?.body?.text;

  return (
    <VStack space={0} style={styles.container}>
      {/* Message text */}
      {bodyText && (
        <Typography variant="body1" style={styles.messageText}>
          {bodyText}
        </Typography>
      )}

      {/* Buttons */}
      <VStack
        space={10}
        style={[styles.buttonsContainer, bodyText && styles.withMargin]}
      >
        {buttons.map((button, index) => (
          <HStack
            key={index}
            space={8}
            alignItems="center"
            justifyContent="center"
          >
            <Typography
              variant="body2"
              color="#2481CC"
              fontWeight="500"
              style={styles.buttonText}
            >
              {button.reply.title}
            </Typography>
            <Ionicons name="arrow-undo" size={16} color="#2481CC" />
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: { minWidth: 280 },
  messageText: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    lineHeight: 20,
  },
  buttonsContainer: {
    marginTop: 4,
  },
  withMargin: {
    marginTop: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
  },
});

export default MsgButton;
