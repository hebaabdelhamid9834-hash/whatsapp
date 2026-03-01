import { View, Text, ScrollView } from "react-native";
import React from "react";
import {
  Box,
  Button,
  Container,
  HStack,
  IconButton,
  Typography,
  VStack,
} from "../ui";
import { useTranslate } from "../contexts/TranslateContext";
import ChatSearch from "./chat/search/ChatSearch";
import { useTheme } from "../contexts/ThemeContext";
import StartQrChat from "./chat/startQRChat/StartQrChat";
import ChatList from "./chat/chatList/ChatList";
import { useInbox } from "../contexts/InboxContext";
import ChatFilter from "./chat/chatFilter/ChatFilter";
import LeftTopMenu from "./chat/LeftTopMenu/LeftTopMenu";
import { useGlobal } from "../contexts/GlobalContext";
import NotificationGate from "../components/NotificationGate";

export default function ChatScreen() {
  const { t } = useTranslate();
  const { theme } = useTheme();
  const { addons } = useGlobal();
  const {
    chatList,
    loadChatList,
    userData,
    socketConnection,
    loadingChats,
    connectionInfo,
  } = useInbox();
  const [gloablState, setGlobalState] = React.useState({
    quickReplyArr: [],
  });

  React.useEffect(() => {
    if (!socketConnection || !connectionInfo) return; // wait for socket

    loadChatList();
  }, [socketConnection, connectionInfo]);

  return (
    <NotificationGate>
      <Container>
        <Box p={10}>
          <VStack space={8}>
            <HStack alignItems="center" justifyContent="space-between">
              <LeftTopMenu
                setGlobalState={setGlobalState}
                gloablState={gloablState}
              />
              <HStack alignItems="center">
                <ChatFilter t={t} theme={theme} />

                {addons?.includes("QR") && userData?.role === "agent" ? (
                  parseInt(userData?.allow_send_new_qr) < 1 ? null : (
                    <StartQrChat
                      setGlobalState={setGlobalState}
                      gloablState={gloablState}
                      t={t}
                      theme={theme}
                    />
                  )
                ) : (
                  addons?.includes("QR") && <StartQrChat t={t} theme={theme} />
                )}
              </HStack>
            </HStack>

            <Typography variant="h1">{t("inbox")}</Typography>

            <ChatSearch t={t} />

            <Box mt={10}>
              <ChatList
                setGlobalState={setGlobalState}
                gloablState={gloablState}
                t={t}
              />
            </Box>

            {chatList?.length > 19 && (
              <Button
                onPress={() => loadChatList({}, true)}
                startIcon={"refresh-outline"}
                color="success"
                size="small"
                variant="text"
              >
                {t("loadmoreChats")}
              </Button>
            )}
          </VStack>
        </Box>
      </Container>
    </NotificationGate>
  );
}
