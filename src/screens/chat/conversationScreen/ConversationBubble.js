import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useTheme } from "../../../contexts/ThemeContext";
import MsgPreview from "./msgPreview/MsgPreview";
import MsgTimestamp from "./msgPreview/MsgTimestamp";
import { Box, Typography } from "../../../ui";
import { useInbox } from "../../../contexts/InboxContext";
import { useTranslate } from "../../../contexts/TranslateContext";
import { useRef, useEffect } from "react";

export default function ConversationBubble({
  message,
  isMe,
  timestamp,
  msg,
  scrollToMessage,
  highlightedMessageId, // ✅ NEW: Receive highlighted message ID
}) {
  const { theme, colorMode } = useTheme();
  const { t } = useTranslate();
  const { conversation } = useInbox();

  // Animation for highlight effect
  const highlightAnim = useRef(new Animated.Value(0)).current;

  // ✅ Check if THIS message should be highlighted
  const shouldHighlight =
    highlightedMessageId &&
    (msg.metaChatId === highlightedMessageId ||
      msg.id === highlightedMessageId);

  // ✅ Trigger highlight animation when this message is highlighted
  useEffect(() => {
    if (shouldHighlight) {
      // Reset and start animation
      highlightAnim.setValue(0);

      Animated.sequence([
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.delay(1500),
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [shouldHighlight, highlightedMessageId]);

  const handleContextClick = (msg) => {
    let referencedMessage = null;

    // Method 1: Try to find by context text
    const contextText = msg.context?.conversation;

    if (contextText) {
      // Search for message containing this text
      referencedMessage = conversation.find((m) => {
        const textBody = m.msgContext?.text?.body;
        const imageCaption = m.msgContext?.image?.caption;
        const interactiveText = m.msgContext?.interactive?.body?.text;
        const videoCaption = m.msgContext?.video?.caption;
        const documentCaption = m.msgContext?.document?.caption;

        return (
          textBody === contextText ||
          imageCaption === contextText ||
          interactiveText === contextText ||
          videoCaption === contextText ||
          documentCaption === contextText ||
          textBody?.includes(contextText) ||
          imageCaption?.includes(contextText) ||
          interactiveText?.includes(contextText)
        );
      });
    }

    // Method 2: If context has stanzaId or participant
    if (!referencedMessage && msg.context?.stanzaId) {
      referencedMessage = conversation.find(
        (m) => m.metaChatId === msg.context.stanzaId
      );
    }

    // Method 3: If context has quoted message ID
    if (!referencedMessage && msg.context?.quotedMessageId) {
      referencedMessage = conversation.find(
        (m) => m.metaChatId === msg.context.quotedMessageId
      );
    }

    // Method 4: Search by timestamp proximity
    if (!referencedMessage && contextText) {
      const currentIndex = conversation.findIndex((m) => m.id === msg.id);

      if (currentIndex > 0) {
        for (let i = currentIndex - 1; i >= 0; i--) {
          const m = conversation[i];
          const textBody = m.msgContext?.text?.body;
          const imageCaption = m.msgContext?.image?.caption;

          if (
            textBody?.includes(contextText) ||
            imageCaption?.includes(contextText)
          ) {
            referencedMessage = m;
            break;
          }
        }
      }
    }

    if (referencedMessage) {
      // ✅ Scroll to the message with its ID
      if (scrollToMessage) {
        scrollToMessage(referencedMessage.metaChatId || referencedMessage.id);
      }
    } else {
    }
  };

  // Background color interpolation for highlight
  const backgroundColor = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isMe
        ? colorMode === "dark"
          ? theme.surfaceVariant
          : theme.grey[100]
        : colorMode === "dark"
        ? theme.surface
        : "#FFFFFF",
      colorMode === "dark"
        ? "rgba(255, 235, 59, 0.3)"
        : "rgba(255, 235, 59, 0.5)",
    ],
  });

  return (
    <View
      style={[styles.container, isMe ? styles.myMessage : styles.theirMessage]}
    >
      <Animated.View
        style={[
          styles.bubble,
          {
            backgroundColor, // ✅ This will animate when THIS message is highlighted
            borderRadius: 12,
            borderBottomRightRadius: isMe ? 12 : 4,
            borderBottomLeftRadius: isMe ? 4 : 12,
          },
        ]}
      >
        {/* Render referenced context if present */}
        {msg.context && (
          <TouchableOpacity
            onPress={() => handleContextClick(msg)}
            activeOpacity={0.7}
          >
            <Box
              style={{
                borderLeftWidth: 3,
                borderLeftColor: "#9e9e9e",
                paddingLeft: 12,
                marginVertical: 8,
                borderRadius: 4,
                backgroundColor: "rgba(0,0,0,0.03)",
                paddingVertical: 6,
              }}
            >
              <Typography
                style={{
                  fontWeight: "500",
                  color: theme.textSecondary,
                  fontSize: 12,
                  marginBottom: 2,
                }}
              >
                {t("replyTo") || "Reply to"}
              </Typography>
              <Typography
                style={{
                  fontSize: 14,
                  color: theme.textSecondary,
                  overflow: "hidden",
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {msg.context.conversation || "Referenced message"}
              </Typography>
            </Box>
          </TouchableOpacity>
        )}

        {/* Message content */}
        <View style={msg.context ? { marginTop: 4 } : {}}>
          <MsgPreview msg={msg} />
          <MsgTimestamp msg={msg} isMe={isMe} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    marginHorizontal: 8,
  },
  myMessage: {
    alignItems: "flex-end",
  },
  theirMessage: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "85%",
    minWidth: 100,
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
});
