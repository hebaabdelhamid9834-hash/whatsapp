import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import {
  Box,
  Dialog,
  HStack,
  IconButton,
  Typography,
  VStack,
} from "../../../../ui";
import { useTranslate } from "../../../../contexts/TranslateContext";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useInbox } from "../../../../contexts/InboxContext";

export default function MoreOptions({ i }) {
  const [state, setState] = React.useState({ dialog: false });
  const { t } = useTranslate();
  const { theme } = useTheme();
  const { sendToSocket, setChatInfo } = useInbox();

  const options = [
    {
      title: t("delChat"),
      icon: "trash-outline",
      color: theme.error,
      onPress: () => console.log("Delete Chat"),
    },
  ];

  const handleDeleteChat = () => {
    sendToSocket("delete_chat", {
      type: "delete",
      chatId: i?.chat_id,
    });

    setChatInfo(null);
    setState({ ...state, dialog: false });
  };

  return (
    <Box>
      <IconButton
        onPress={() => setState({ ...state, dialog: true })}
        size="small"
        icon={"ellipsis-vertical-outline"}
      />

      <Dialog
        titleIcon={"ellipsis-vertical-outline"}
        titleIconSize={20}
        visible={state.dialog}
        title={t("convoOp")}
        onClose={() => setState({ ...state, dialog: false })}
      >
        <VStack space={10}>
          {options.map((op, key) => {
            return (
              <TouchableOpacity key={key} onPress={handleDeleteChat}>
                <HStack
                  alignItems="center"
                  justifyContent="space-between"
                  space={10}
                >
                  <Typography
                    color={op.color}
                    fontWeight="700"
                    numberOfLines={1}
                  >
                    {op.title}
                  </Typography>
                  <IconButton
                    color={op.color}
                    size="small"
                    icon={"trash-outline"}
                  />
                </HStack>
              </TouchableOpacity>
            );
          })}
        </VStack>
      </Dialog>
    </Box>
  );
}
