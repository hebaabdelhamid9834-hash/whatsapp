import { View, Text } from "react-native";
import React from "react";
import {
  Box,
  Button,
  Dialog,
  HStack,
  IconButton,
  TextField,
  VStack,
} from "../../../../ui";
import { useTranslate } from "../../../../contexts/TranslateContext";
import { useInbox } from "../../../../contexts/InboxContext";

export default function ConvoFilter() {
  const { conversationFilters, loadConversation, currentChat } = useInbox();
  const { t } = useTranslate();
  const [state, setState] = React.useState({
    dialog: false,
    search: "",
  });

  const handleApplyFilters = () => {
    if (currentChat) {
      loadConversation(currentChat, {
        search: state.search,
        dateRange: {
          start: null,
          end: null,
        },
      });
    }
    setState({ ...state, dialog: false });
  };

  const handleResetFilters = () => {
    setState({ ...state, search: "", dialog: false });

    if (currentChat) {
      loadConversation(currentChat, {
        search: "",
        dateRange: {
          start: null,
          end: null,
        },
      });
    }
  };

  return (
    <Box>
      <IconButton
        onPress={() => setState({ ...state, dialog: true })}
        icon={"search-outline"}
      />

      <Dialog
        visible={state.dialog}
        onClose={() => setState({ ...state, dialog: false })}
        darker
        title={t("searchMsg")}
      >
        <VStack space={10}>
          <TextField
            onChangeText={(e) => setState({ ...state, search: e })}
            placeholder={t("searchInConvo")}
          />

          <HStack space={10} justifyContent="flex-end">
            <Button
              startIcon={"refresh-outline"}
              color="secondary"
              variant="text"
              onPress={handleResetFilters}
            >
              {t("reset")}
            </Button>
            <Button
              onPress={handleApplyFilters}
              startIcon={"search"}
              variant="text"
            >
              {t("search")}
            </Button>
          </HStack>
        </VStack>
      </Dialog>
    </Box>
  );
}
