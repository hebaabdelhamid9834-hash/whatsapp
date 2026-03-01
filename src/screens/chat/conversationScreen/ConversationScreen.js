import React, { useState, useRef, useEffect } from "react";
import { Platform, StyleSheet, View, Keyboard, Animated } from "react-native";
import { useTheme } from "../../../contexts/ThemeContext";
import { useInbox } from "../../../contexts/InboxContext";
import { Box, Button, Container } from "../../../ui";
import HeaderComp from "./HeaderComp";
import ChatList from "./ChatList";
import ChatInput from "./ChatInput";

export default function ConversationScreen({ route }) {
  const { theme, colorMode } = useTheme();
  const {
    conversation,
    currentChat,
    hasMoreMessages,
    loadingConversation,
    loadConversation,
  } = useInbox();
  const scrollToEndRef = useRef(null);
  const { setGlobalState, gloablState } = route?.params;

  const [messages, setMessages] = useState([]);
  const keyboardHeight = useRef(new Animated.Value(0)).current; // ✅ Animated keyboard height

  React.useEffect(() => {
    setMessages(
      conversation.map((c) => {
        return {
          ...c,
          isMe: c?.route === "INCOMING" ? false : true,
          message: JSON.stringify(c.msgContext),
          id: c?.id,
          metaChatId: c?.metaChatId || c?.id,
        };
      })
    );
  }, [conversation]);

  // ✅ Listen to keyboard events
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: e.duration || 250,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: e.duration || 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleLoadMore = () => {
    if (currentChat && hasMoreMessages && !loadingConversation) {
      loadConversation(currentChat, {}, true);
    }
  };

  return (
    <Container edges={["top", "left", "right", "bottom"]} scrollable={false}>
      <View style={styles.container}>
        <HeaderComp />

        <View
          style={[
            styles.chatWrapper,
            {
              backgroundColor:
                colorMode === "dark"
                  ? theme.background
                  : theme.backgroundSecondary,
            },
          ]}
        >
          <ChatList
            messages={messages}
            scrollToEnd={(fn) => (scrollToEndRef.current = fn)}
          />
        </View>

        {/* ✅ Animated view that moves up with keyboard */}
        <Animated.View
          style={{
            paddingBottom: keyboardHeight,
          }}
        >
          <ChatInput
            gloablState={gloablState}
            setGlobalState={setGlobalState}
            scrollToEndRef={scrollToEndRef}
          />
        </Animated.View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  chatWrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
});
