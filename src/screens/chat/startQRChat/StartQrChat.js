import React from "react";
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Select,
  TextField,
  Typography,
  VStack,
} from "../../../ui";
import { useGlobal } from "../../../contexts/GlobalContext";
import { useInbox } from "../../../contexts/InboxContext";

export default function StartQrChat({ t, theme, setGlobalState, gloablState }) {
  const { apiCall } = useGlobal();
  const { agent, chatInfo, sendToSocket } = useInbox();
  const [instanceList, setInstanceList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [state, setState] = React.useState({
    dialog: false,
    instance: {},
    number: "",
    message: "",
  });

  async function getInstances(params) {
    const res = await apiCall(
      agent ? `/api/qr/get_all_agent` : `/api/qr/get_all`,
      {
        method: "GET",
      }
    );
    if (res.success) {
      setState({ ...state, dialog: true });
      const arr = res.data || [];
      const activeOne = arr?.filter((x) => x.status === "ACTIVE");
      setInstanceList(activeOne);
    }
  }

  function handleSendMsg() {
    setLoading(true);
    // Simulate loading for better UX
    setTimeout(() => {
      sendToSocket("send_new_message", {
        ...state,
        chatid: chatInfo?.chat_id,
      });
      setLoading(false);
      setState({ ...state, dialog: false, message: "", number: "" });
    }, 600);
  }

  return (
    <Box>
      <IconButton
        onPress={getInstances}
        icon={"add-circle-outline"}
        color={theme.primary}
      />
      <Dialog
        titleIcon={"logo-whatsapp"}
        title={t("startNewQrWhatsapp")}
        visible={state.dialog}
        onClose={() => setState({ ...state, dialog: false })}
      >
        <VStack space={10}>
          <Select
            value={state?.instance?.title}
            onChange={(e, newValue) =>
              setState({ ...state, instance: newValue })
            }
            options={instanceList.map((i) => {
              return {
                ...i,
                label: i.title,
                value: i.title,
                id: i.id,
              };
            })}
            variant="outlined"
            size="medium"
            placeholder={t("from")}
          />

          <TextField
            type="number"
            leftComponent={<Typography>+</Typography>}
            onChangeText={(e) => setState({ ...state, number: e })}
            placeholder={"1234567890"}
            value={state.number}
          />

          <TextField
            rows={2}
            multiline
            type="text"
            onChangeText={(e) => setState({ ...state, message: e })}
            placeholder={t("typeMsg")}
            value={state.message}
          />

          <Button
            loading={loading}
            onPress={handleSendMsg}
            disabled={state.number && state.message ? false : true}
            variant="text"
          >
            {t("sendMsg")}
          </Button>
        </VStack>
      </Dialog>
    </Box>
  );
}
