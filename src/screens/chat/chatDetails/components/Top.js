import { View, Text } from "react-native";
import React from "react";
import { Avatar, Typography, VStack } from "../../../../ui";
import { useInbox } from "../../../../contexts/InboxContext";
import { useTheme } from "../../../../contexts/ThemeContext";

function fetchProfileImg(chat) {
  try {
    const profile = JSON.parse(chat?.profile) || "";
    return profile?.profileImage || "";
  } catch (err) {
    return "";
  }
}

export default function Top() {
  const { theme } = useTheme();
  const { maskNumber, chatInfo } = useInbox();
  return (
    <VStack alignItems="center" space={10}>
      <Avatar
        size="xxlarge"
        src={fetchProfileImg(chatInfo)}
        name={chatInfo?.contactData?.name || chatInfo?.sender_mobile}
      />
      <VStack alignItems="center" space={2}>
        <Typography variant="h3">
          {chatInfo?.contactData?.name || `+${chatInfo?.sender_mobile}`}
        </Typography>
        {chatInfo?.contactData?.name && (
          <Typography color={theme.textDisabled}>
            +{maskNumber(chatInfo?.sender_mobile, "*", 3, 2)}
          </Typography>
        )}
      </VStack>
    </VStack>
  );
}
