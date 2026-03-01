import React, { useRef, useEffect, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import ConversationBubble from "./ConversationBubble";

export default function ChatList({ messages, scrollToEnd }) {
  const flatListRef = useRef(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);

  // Auto scroll when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Expose scroll function to parent
  useEffect(() => {
    if (scrollToEnd) {
      scrollToEnd(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [scrollToEnd]);

  const scrollToMessage = (metaChatId) => {
    let index = messages.findIndex((msg) => msg.metaChatId === metaChatId);

    if (index === -1) {
      index = messages.findIndex((msg) => msg.id === metaChatId);
    }

    if (index !== -1 && flatListRef.current) {
      setHighlightedMessageId(metaChatId);

      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.3,
      });

      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2500);
    }
  };

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={({ item }) => (
        <ConversationBubble
          message={item.message}
          isMe={item.isMe}
          timestamp={item.timestamp}
          msg={item}
          scrollToMessage={scrollToMessage}
          highlightedMessageId={highlightedMessageId}
        />
      )}
      contentContainerStyle={styles.messageList}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() =>
        flatListRef.current?.scrollToEnd({ animated: true })
      }
      style={styles.transparent}
      // ✅ REMOVE getItemLayout - it causes issues with variable height items
      // getItemLayout={(data, index) => ({
      //   length: 100,
      //   offset: 100 * index,
      //   index,
      // })}
      onScrollToIndexFailed={(info) => {
        const wait = new Promise((resolve) => setTimeout(resolve, 500));
        wait.then(() => {
          flatListRef.current?.scrollToIndex({
            index: info.index,
            animated: true,
            viewPosition: 0.5,
          });
        });
      }}
      // ✅ ADD these props for better scrolling behavior
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
      windowSize={10}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={20}
      removeClippedSubviews={true}
    />
  );
}

const styles = StyleSheet.create({
  messageList: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    flexGrow: 1, // ✅ Changed from default
  },
  transparent: {
    backgroundColor: "transparent",
  },
});
