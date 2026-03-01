import { View, Text } from "react-native";
import React from "react";
import {
  Box,
  Button,
  Divider,
  HStack,
  IconButton,
  TextField,
  Typography,
  VStack,
} from "../../../ui";
import { useGlobal } from "../../../contexts/GlobalContext";
import randomstring from "randomstring";
import OneInstance from "./QrInstance/OneInstance";

export default function QrInstance({ t }) {
  const { apiCall, userData } = useGlobal();
  const [instanceList, setInstanceList] = React.useState([]);
  const [state, setState] = React.useState({
    addDevice: false,
    title: "",
    uniqueId: `${userData?.uid}_${randomstring.generate(8)}`,
  });

  async function getInstanceList(params) {
    const res = await apiCall("/api/qr/get_all", {
      method: "GET",
      showLoading: false,
    });
    if (res.success) {
      setInstanceList(res.data);
    }
  }

  async function genQr(params) {
    const res = await apiCall("/api/qr/gen_qr", {
      method: "POST",
      data: state,
    });
    if (res.success) {
      setState({
        ...state,
        title: "",
        uniqueId: randomstring.generate(8),
        addDevice: false,
      });
      getInstanceList();
    }
  }

  React.useEffect(() => {
    getInstanceList(); // Fetch initially

    const interval = setInterval(() => {
      getInstanceList();
    }, 3000); // Fetch every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <Box p={10}>
      <Box mb={20}>
        <VStack alignItems="center">
          <HStack space={10} alignItems="center">
            <HStack space={5} alignItems="center">
              <Box borderRadius={"50%"} bg="#9E9E9E" p={5} />
              <Typography variant="caption">{t("inactive")}</Typography>
            </HStack>

            <HStack space={5} alignItems="center">
              <Box borderRadius={"50%"} bg="#FFA726" p={5} />
              <Typography variant="caption">{t("waitingQrScan")}</Typography>
            </HStack>

            <HStack space={5} alignItems="center">
              <Box borderRadius={"50%"} bg="#25D366" p={5} />
              <Typography variant="caption">{t("active")}</Typography>
            </HStack>
          </HStack>
        </VStack>
      </Box>

      <VStack space={15}>
        {[...instanceList]?.reverse()?.map((i, key) => (
          <OneInstance i={i} key={key} t={t} />
        ))}
      </VStack>

      <Box mt={15}>
        <TextField
          value={state.title}
          onChangeText={(e) => setState({ ...state, title: e })}
          variant="whatsapp"
          borderRadius={10}
          placeholder={t("enterTitle")}
          rightIconPress={genQr}
          rightIcon={"add-circle"}
          helperText={t("addNewWhatsApp")}
          leftIcon={"logo-whatsapp"}
        />
      </Box>
    </Box>
  );
}
