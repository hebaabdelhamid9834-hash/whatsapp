import { View, Text } from "react-native";
import React from "react";
import {
  Box,
  Chip,
  Dialog,
  Divider,
  HStack,
  IconButton,
  Loading,
  TextField,
  Typography,
  VStack,
} from "../../../ui";
import { useTranslate } from "../../../contexts/TranslateContext";
import { useGlobal } from "../../../contexts/GlobalContext";
import { useInbox } from "../../../contexts/InboxContext";
import { useTheme } from "../../../contexts/ThemeContext";

export default function LeftTopMenu({ setGlobalState, gloablState }) {
  const { theme } = useTheme();
  const { apiCall, loading } = useGlobal();
  const { agent } = useInbox();
  const { t } = useTranslate();
  const [quickR, setQuickR] = React.useState([]);
  const [state, setState] = React.useState({
    dialog: false,
    msg: "",
  });

  async function getAllQuickReply(params) {
    const res = await apiCall(
      `/api/${agent ? "agent" : "user"}/get_all_quick_reply`,
      {
        method: "GET",
      }
    );
    if (res.success) {
      setQuickR(res.data);
      setGlobalState({ ...gloablState, quickReplyArr: res.data || [] });
      setState({ ...state, dialog: true });
    }
  }

  async function addMsg(params) {
    const res = await apiCall("/api/user/add_quick_reply", {
      method: "POST",
      data: { msg: state.msg },
    });

    if (res.success) {
      getAllQuickReply();
      setState({ ...state, msg: "" });
    }
  }

  async function delQuickRep(id) {
    const res = await apiCall("/api/user/del_quick_r", {
      method: "POST",
      data: { id },
    });

    if (res.success) {
      getAllQuickReply();
    }
  }

  return (
    <Box>
      <IconButton
        onPress={getAllQuickReply}
        size="small"
        variant="outlined"
        icon={"chatbubble-ellipses-outline"}
      />

      <Dialog
        titleIcon="chatbubble-ellipses-outline"
        fullScreen
        visible={state.dialog}
        onClose={() => setState({ ...state, dialog: false })}
        title={t("quickReply")}
      >
        <VStack space={10}>
          {!agent && (
            <TextField
              value={state.msg}
              onChangeText={(e) => setState({ ...state, msg: e })}
              variant="whatsapp"
              rightIcon={!loading && "add-circle"}
              rightIconPress={addMsg}
              placeholder={t("message")}
            />
          )}
          {!agent && <Divider />}

          <VStack space={15}>
            {quickR.map((i, key) => {
              return (
                <HStack
                  key={key}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography numberOfLines={1}>{i.msg}</Typography>
                  {!agent && (
                    <IconButton
                      onPress={() => delQuickRep(i.id)}
                      size="small"
                      icon={"trash-outline"}
                    />
                  )}
                </HStack>
              );
            })}
          </VStack>
        </VStack>
      </Dialog>
    </Box>
  );
}
