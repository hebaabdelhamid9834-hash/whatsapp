import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../../contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Loading, TextField, Typography } from "../../../ui";
import { useInbox } from "../../../contexts/InboxContext";
import { useTranslate } from "../../../contexts/TranslateContext";
import LeftIcon from "./chatInput/LeftIcon";
import RecordAudio from "./chatInput/RecordAudio";

export default function ChatInput({
  scrollToEndRef,
  gloablState,
  setGlobalState,
}) {
  const { t } = useTranslate();
  const { theme } = useTheme();
  const [message, setMessage] = useState("");
  const { sendToSocket, agent, userData, chatInfo, isSyncing } = useInbox();
  const quickReplyArr = gloablState?.quickReplyArr || [];
  const insets = useSafeAreaInsets();
  const [leftIconState, setLeftIconState] = useState({
    dialog: false,
  });

  // Filter quick replies based on message input
  const filteredQuickReplies = useMemo(() => {
    if (!message.startsWith("/")) return [];
    const searchTerm = message.slice(1).toLowerCase();
    return quickReplyArr.filter((reply) =>
      reply.msg.toLowerCase().includes(searchTerm)
    );
  }, [message, quickReplyArr]);

  const showQuickReplies =
    message.startsWith("/") && filteredQuickReplies.length > 0;

  function sendMessage(msgCon, type) {
    sendToSocket("send_chat_message", { type, msgCon, chatInfo });
    setMessage("");
    setLeftIconState({ ...leftIconState, dialog: false });
  }

  const handleSend = () => {
    if (message.trim().length === 0) return;
    sendMessage(
      {
        type: "text",
        text: {
          preview_url: true,
          body: agent ? `*${userData?.name}*:\n${message}` : message,
        },
      },
      "text"
    );
  };

  const handleQuickReplySelect = (reply) => {
    setMessage(reply.msg);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
      ]}
    >
      {/* Quick Replies List */}
      {showQuickReplies && (
        <View
          style={[
            styles.quickRepliesContainer,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <FlatList
            data={filteredQuickReplies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.quickReplyItem,
                  { borderBottomColor: theme.divider },
                ]}
                onPress={() => handleQuickReplySelect(item)}
                activeOpacity={0.7}
              >
                <Typography variant="body2" numberOfLines={2}>
                  {item.msg}
                </Typography>
              </TouchableOpacity>
            )}
            style={styles.quickRepliesList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      <TextField
        multiline
        size="small"
        variant="whatsapp"
        borderRadius={20}
        value={message}
        onChangeText={(e) => setMessage(e)}
        rightIcon={message ? "send" : "mic"}
        rightComponent={
          isSyncing ? (
            <ActivityIndicator size="small" />
          ) : (
            !message && (
              <RecordAudio
                onSend={(voiceData) => {
                  sendMessage(voiceData.msgContext, voiceData.type);
                }}
              />
            )
          )
        }
        leftIcon={"add"}
        placeholder={t("typeAMsg")}
        rightIconPress={!isSyncing && handleSend}
        leftIconPress={() =>
          setLeftIconState({ ...leftIconState, dialog: true })
        }
      />

      <LeftIcon
        onSend={(e) => {
          sendMessage(e.msgContext, e.type);
        }}
        leftIconState={leftIconState}
        setLeftIconState={setLeftIconState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  quickRepliesContainer: {
    maxHeight: 200,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  quickRepliesList: {
    flexGrow: 0,
  },
  quickReplyItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
