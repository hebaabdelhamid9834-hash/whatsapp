import { View, Text } from "react-native";
import React from "react";
import { Box, CustomHeader, Divider } from "../../../ui";
import ChatBox from "./components/ChatBox";
import { useTheme } from "../../../contexts/ThemeContext";
import { useInbox } from "../../../contexts/InboxContext";
import { useGlobal } from "../../../contexts/GlobalContext";

export default function ChatList({ t, setGlobalState, gloablState }) {
  const { theme } = useTheme();
  const { chatList } = useInbox();
  const { parseJson, maskNumber } = useGlobal();

  // Sort chats by the numeric timestamp (descending order).
  const sortedChats = [...chatList].sort((a, b) => {
    const aMsg = parseJson(a?.last_message);
    const bMsg = parseJson(b?.last_message);
    const aTimestamp = aMsg?.timestamp || 0;
    const bTimestamp = bMsg?.timestamp || 0;
    return bTimestamp - aTimestamp;
  });

  return (
    <Box>
      {sortedChats.map((i, key) => {
        return (
          <Box key={key}>
            <ChatBox
              setGlobalState={setGlobalState}
              gloablState={gloablState}
              i={i}
            />
            <Box pl={65} pb={8} pt={8}>
              <Divider />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
