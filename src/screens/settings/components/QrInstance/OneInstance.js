import { View, Text, Image } from "react-native";
import React from "react";
import {
  Box,
  Divider,
  HStack,
  Icon,
  IconButton,
  Typography,
  VStack,
} from "../../../../ui";
import { useGlobal } from "../../../../contexts/GlobalContext";
import { useDialog } from "../../../../contexts/DialogContext";

export default function OneInstance({ i, t }) {
  const { apiCall } = useGlobal();
  const { setDialog, dialog } = useDialog();
  function returnColor(status) {
    switch (status) {
      case "INACTIVE":
        return { icon: "#9E9E9E" }; // Gray

      case "GENERATING":
        return { icon: "#FFA726" }; // Orange/Yellow

      case "ACTIVE":
        return { icon: "#25D366" }; // WhatsApp Green
    }
  }

  async function delIns(uniqueId) {
    const res = await apiCall("/api/qr/del_instance", {
      method: "POST",
      data: {
        uniqueId,
      },
      showLoading: false,
    });
  }

  return (
    <Box>
      <HStack space={10} justifyContent="space-between" alignItems="center">
        <HStack space={10} alignItems="center">
          <Icon
            size={40}
            name="logo-whatsapp"
            color={returnColor(i?.status).icon}
          />

          <VStack space={2}>
            <Typography variant="h4">{i?.title}</Typography>

            {i?.number && (
              <Typography color={"gray"} variant="caption">
                +{i?.number}
              </Typography>
            )}
          </VStack>
        </HStack>
        <IconButton
          onPress={() => {
            setDialog({
              ...dialog,
              title: t("delInstance"),
              message: t("AUS"),
              fun: () => delIns(i.uniqueId),
              open: true,
            });
          }}
          color={"red"}
          icon="power-outline"
          size="medium"
        />
      </HStack>

      {i?.status === "GENERATING" && i.qr && (
        <Box mt={13}>
          <VStack space={10} alignItems="center">
            <Typography>{t("scanWa")}</Typography>
            <Image
              source={{ uri: i.qr }}
              style={{
                width: 200,
                height: 200,
                borderRadius: 8,
              }}
              resizeMode="contain"
            />
          </VStack>
        </Box>
      )}

      <Box mt={13}>
        <Divider />
      </Box>
    </Box>
  );
}
