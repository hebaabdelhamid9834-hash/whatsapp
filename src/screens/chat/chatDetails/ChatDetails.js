import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  CustomHeader,
  Divider,
  HStack,
  Icon,
  TextField,
  Typography,
  VStack,
} from "../../../ui";
import { useTranslate } from "../../../contexts/TranslateContext";
import { useInbox } from "../../../contexts/InboxContext";
import { useTheme } from "../../../contexts/ThemeContext";
import Top from "./components/Top";
import Notes from "./components/Notes";
import { useNavigation } from "@react-navigation/native";
import MetaChatTimer from "./components/MetaChatTimer";
import MediaComp from "./components/mediaComp/MediaComp";

export default function ChatDetails() {
  const { chatInfo, cdTimer, userData, agent } = useInbox();
  const isMeta = chatInfo?.origin === "meta";
  const hasTimer = isMeta && cdTimer?.timezone && cdTimer?.timestamp;

  const navigation = useNavigation();
  const { t } = useTranslate();
  const { theme } = useTheme();

  const menuItem = [
    ...(userData?.role === "user"
      ? [
          {
            title: t("contactDetails"),
            icon: "person-outline",
            endIcon: "chevron-forward-outline",
            id: "ContactDetails",
          },
          { type: "divider" },
        ]
      : parseInt(userData?.allow_save_contact) > 0
      ? [
          {
            title: t("contactDetails"),
            icon: "person-outline",
            endIcon: "chevron-forward-outline",
            id: "ContactDetails",
          },
          { type: "divider" },
        ]
      : []),
    {
      title: t("labelChat"),
      icon: "pricetag-outline",
      endIcon: "chevron-forward-outline",
      id: "ChatLabel",
    },
    { type: "divider" },
    ...(!agent
      ? [
          {
            title: t("assignChat"),
            icon: "people-circle-outline",
            endIcon: "chevron-forward-outline",
            id: "AsignAgent",
          },
          { type: "divider" },
        ]
      : []),
    {
      title: t("chatNotes"),
      icon: "chatbox-outline",
      endIcon: "chevron-forward-outline",
      id: "Notes",
    },
  ];

  return (
    <Container>
      <CustomHeader title={t("details")} />
      <Box px={10} mt={20}>
        <VStack space={15}>
          <Top />

          {hasTimer && <MetaChatTimer color="secondary" />}

          <Box borderRadius={10} bg={"action.hover"}>
            {menuItem.map((i, key) => {
              return i.type ? (
                <Box key={key} pl={50}>
                  <Divider />
                </Box>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("ChatDetailsComp", {
                      i: i,
                    });
                  }}
                  style={{
                    padding: 10,
                  }}
                  key={key}
                >
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={10} alignItems="center">
                      <Icon name={i.icon} />
                      <Typography numberOfLines={1}>{i.title}</Typography>
                    </HStack>
                    <Icon name={i.endIcon} />
                  </HStack>
                </TouchableOpacity>
              );
            })}
          </Box>

          <MediaComp />
        </VStack>
      </Box>
    </Container>
  );
}
