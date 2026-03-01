import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import {
  Box,
  Button,
  Chip,
  CustomHeader,
  Dialog,
  HStack,
  Icon,
  IconButton,
  TextField,
  Typography,
  VStack,
} from "../../../../ui";
import { useTranslate } from "../../../../contexts/TranslateContext";
import { useInbox } from "../../../../contexts/InboxContext";
import { useGlobal } from "../../../../contexts/GlobalContext";
import { useTheme } from "../../../../contexts/ThemeContext";
import ColorPicker from "../../../../common/ColorPicker";

export default function ChatLabel() {
  const { labelData, sendToSocket, chatInfo } = useInbox();
  const { alpha } = useGlobal();
  const { t } = useTranslate();
  const { theme } = useTheme();
  const [state, setState] = React.useState({
    dialog: false,
    title: "",
    hex: "#6366F1", // A nice indigo color as default
  });

  // Parse current labels as array
  const currentLabels = React.useMemo(() => {
    if (chatInfo?.id && chatInfo?.chat_label) {
      try {
        const parsed = JSON.parse(chatInfo?.chat_label);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (error) {
        console.error("Error parsing chat labels:", error);
        return [];
      }
    }
    return [];
  }, [chatInfo?.chat_label]);

  const ids = currentLabels?.map((x) => x.id);

  function removeChatLabel(labelId) {
    sendToSocket("remove_chat_label", { labelId, chatId: chatInfo?.id });
  }

  function setChatLabel(labelData) {
    sendToSocket("set_chat_label", { labelData, chatIdRow: chatInfo?.id });
  }

  function addLabel() {
    if (!state.title) return;
    sendToSocket("add_label", { label: state.title, hex: state.hex });
    setState({ ...state, title: "" });
  }

  function delLabel(labelId) {
    sendToSocket("on_label_delete", { labelId: labelId });
  }

  return (
    <Box>
      <CustomHeader title={t("labelChat")} />
      <Box px={10} mt={5}>
        <VStack space={10}>
          <TextField
            onChangeText={(e) => setState({ ...state, title: e })}
            leftComponent={
              <TouchableOpacity
                onPress={() => setState({ ...state, dialog: true })}
                style={{
                  padding: 10,
                  borderRadius: "50%",
                  backgroundColor: state.hex,
                }}
              ></TouchableOpacity>
            }
            rightComponent={
              <TouchableOpacity
                onPress={addLabel}
                disabled={state.title && state.hex ? false : true}
              >
                <Icon color={theme.primary} name="add-circle" />
              </TouchableOpacity>
            }
            variant="whatsapp"
            placeholder={t("addLabeles")}
          />

          <Dialog
            titleIcon="color-palette-outline"
            visible={state.dialog}
            onClose={() => setState({ ...state, dialog: false })}
            title={t("chooseColorCode")}
          >
            <ColorPicker
              defaultColor={state.hex}
              onColorChange={(e) => setState({ ...state, hex: e })}
            />
          </Dialog>

          {labelData?.map((i, key) => {
            return (
              <Box borderRadius={10} p={5} key={key}>
                <HStack justifyContent="space-between" alignItems="center">
                  <TouchableOpacity
                    onPress={() => {
                      ids?.includes(i.id)
                        ? removeChatLabel(i.id)
                        : setChatLabel(i);
                    }}
                  >
                    <HStack space={10} alignItems="center">
                      {ids?.includes(i.id) ? (
                        <Icon
                          color={theme.success}
                          size={20}
                          name="checkmark-circle"
                        />
                      ) : (
                        <Icon
                          color={alpha(i.hex, 0.8)}
                          size={20}
                          name="pricetag-outline"
                        />
                      )}

                      <Typography
                        fontWeight={ids?.includes(i.id) ? "500" : null}
                      >
                        {i.title}
                      </Typography>
                    </HStack>
                  </TouchableOpacity>

                  <IconButton
                    onPress={() => delLabel(i.id)}
                    size="small"
                    icon={"trash"}
                    variant="outlined"
                  />
                </HStack>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </Box>
  );
}
