import { View } from "react-native";
import React from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  VStack,
} from "../../../ui";
import { useGlobal } from "../../../contexts/GlobalContext";

export default function MetApiKeys({ t }) {
  const [apiKeys, setApiKeys] = React.useState({
    ha: "Ham",
  });
  const { apiCall } = useGlobal();

  const menuItem = [
    {
      title: "waBAID",
      value: apiKeys?.waba_id,
      icon: "apps-outline",
      onChange: (e) => setApiKeys({ ...apiKeys, waba_id: e }),
    },
    {
      title: "businessAcID",
      value: apiKeys?.business_account_id,
      icon: "apps",
      onChange: (e) => setApiKeys({ ...apiKeys, business_account_id: e }),
    },
    {
      title: "MetaAccessToken",
      value: apiKeys?.access_token,
      icon: "medical-outline",
      onChange: (e) => setApiKeys({ ...apiKeys, access_token: e }),
    },
    {
      title: "metaWaPhoneID",
      value: apiKeys?.business_phone_number_id,
      icon: "apps",
      onChange: (e) => setApiKeys({ ...apiKeys, business_phone_number_id: e }),
    },
    {
      title: "appId",
      value: apiKeys?.app_id,
      icon: "apps",
      onChange: (e) => setApiKeys({ ...apiKeys, app_id: e }),
    },
  ];

  async function getKeys() {
    const res = await apiCall("/api/user/get_meta_keys", {
      method: "GET",
    });

    if (res.success) {
      setApiKeys({ ...res.data });
    }
  }

  async function updateApi(params) {
    const res = await apiCall("/api/user/update_meta", {
      method: "POST",
      data: apiKeys,
    });
    console.log(res);
  }

  React.useEffect(() => {
    getKeys();
  }, []);

  return (
    <Box p={10}>
      <VStack space={10}>
        {menuItem.map((i, key) => {
          return (
            <TextField
              key={key}
              variant="standard"
              label={t(i.title)}
              value={i.value}
              onChangeText={i.onChange}
            />
          );
        })}

        <Button onPress={updateApi} startIcon={"save-outline"}>
          {t("save")}
        </Button>
      </VStack>
    </Box>
  );
}
