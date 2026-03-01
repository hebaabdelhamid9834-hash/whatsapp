import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../../../contexts/ThemeContext";
import { formatWhatsAppText } from "../../../../components/formatWhatsAppText"; // ✅ Import the formatter

export default function MsgText({ msg }) {
  const { theme, colorMode } = useTheme();
  const text = msg?.msgContext?.text?.body || msg?.text || "";

  // ✅ Determine text color based on message direction and theme
  const textColor =
    msg?.isMe || msg?.route === "OUTGOING"
      ? colorMode === "dark"
        ? "#E9EDEF"
        : "#000000"
      : theme.textPrimary;

  return (
    <View style={styles.container}>
      {formatWhatsAppText({
        text,
        theme: {
          ...theme,
          textPrimary: textColor, // ✅ Override textPrimary with calculated textColor
        },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingRight: 4,
  },
});
