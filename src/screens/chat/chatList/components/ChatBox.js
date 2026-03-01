import { TouchableOpacity } from "react-native";
import React, { memo, useMemo, useCallback } from "react";
import { Avatar, Badge, Box, Typography, VStack } from "../../../../ui";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useGlobal } from "../../../../contexts/GlobalContext";
import ChatOriginAndTags from "./ChatOriginAndTags";
import TimeStamp from "./TimeStamp";
import PreviewMsg from "./PreviewMsg";
import { useTranslate } from "../../../../contexts/TranslateContext";
import MoreOptions from "./MoreOptions";
import { useInbox } from "../../../../contexts/InboxContext";
import { useNavigation } from "@react-navigation/native";

const ChatBox = memo(
  ({ i, setGlobalState, gloablState }) => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { maskNumber, parseJson } = useGlobal();
    const { t } = useTranslate();
    const { agent, loadConversation } = useInbox();

    const profileImage = useMemo(() => {
      try {
        const profile = JSON.parse(i?.profile) || "";
        return profile?.profileImage || "";
      } catch (err) {
        return "";
      }
    }, [i?.profile]);

    const parsedLastMessage = useMemo(() => {
      return parseJson(i?.last_message);
    }, [i?.last_message, parseJson]);

    const displayName = useMemo(() => {
      return (
        i?.phonebook?.name || `+${maskNumber(i?.sender_mobile, "*", 3, 2)}`
      );
    }, [i?.phonebook?.name, i?.sender_mobile, maskNumber]);

    const unreadBadgeContent = useMemo(() => {
      return i?.unread_count > 0 ? i?.unread_count : 0;
    }, [i?.unread_count]);

    const onSelectChat = useCallback(() => {
      // Reset conversation filters when selecting a new chat
      loadConversation(i, {
        search: "",
        dateRange: { start: null, end: null },
        limit: 20,
        offset: 0,
      });
      navigation.navigate("ConversationScreen", {
        setGlobalState,
        gloablState,
      });
    }, [i, loadConversation, navigation, setGlobalState, gloablState]);

    return (
      <Box>
        {/* Main Container */}
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          {/* Left Section - Avatar */}
          <Box mr={10}>
            <Badge content={unreadBadgeContent}>
              <Avatar src={profileImage} size="large" name={displayName} />
            </Badge>
          </Box>

          {/* Middle Section - Content */}
          <Box flex={1}>
            <VStack space={2}>
              {/* Clickable area for name and preview */}
              <TouchableOpacity onPress={onSelectChat} activeOpacity={0.7}>
                <Typography variant="h5" numberOfLines={1}>
                  {displayName}
                </Typography>
                <PreviewMsg
                  unreadCount={i?.unread_count}
                  theme={theme}
                  i={parsedLastMessage}
                  t={t}
                />
              </TouchableOpacity>

              {/* Scrollable tags - NOT wrapped in TouchableOpacity */}
              <ChatOriginAndTags i={i} />
            </VStack>
          </Box>

          {/* Right Section - Time */}
          <Box ml={10} minWidth={50} alignItems="flex-end">
            <VStack
              space={10}
              alignItems="center"
              justifyContent="space-between"
            >
              <TimeStamp i={i} />
              {!agent && <MoreOptions i={i} />}
            </VStack>
          </Box>
        </Box>
      </Box>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.i.id === nextProps.i.id &&
      prevProps.i.chat_id === nextProps.i.chat_id &&
      prevProps.i.unread_count === nextProps.i.unread_count &&
      prevProps.i.last_message === nextProps.i.last_message &&
      prevProps.i.profile === nextProps.i.profile &&
      prevProps.i.phonebook?.name === nextProps.i.phonebook?.name &&
      prevProps.i.sender_mobile === nextProps.i.sender_mobile &&
      prevProps.i.chat_label === nextProps.i.chat_label &&
      prevProps.i.origin === nextProps.i.origin &&
      prevProps.i.origin_instance_id === nextProps.i.origin_instance_id
    );
  }
);

ChatBox.displayName = "ChatBox";

export default ChatBox;
