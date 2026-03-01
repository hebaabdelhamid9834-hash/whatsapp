import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import * as WebBrowser from "expo-web-browser";
import {
  Container,
  VStack,
  Typography,
  Box,
  HStack,
  Avatar,
  Switch,
  Icon,
  Divider,
  Button,
} from "../ui";
import { useTranslate } from "../contexts/TranslateContext";
import { useGlobal } from "../contexts/GlobalContext";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { baseUrl } from "../contexts/api";
import { useDialog } from "../contexts/DialogContext";

export default function SettingsScreen() {
  const { t } = useTranslate();
  const { data, handleLogout, addons } = useGlobal();
  const { setDialog, dialog } = useDialog();
  const { theme, colorMode, toggleColorMode } = useTheme();
  const navigation = useNavigation();

  const userData = data?.userData || {};

  const menuItem = [
    {
      icon: "logo-facebook",
      title: "metaApiKeys",
      path: "meta-api-keys",
    },
    {
      divider: true,
    },
    {
      icon: "person-outline",
      title: "profile",
      path: "profile",
    },

    ...(addons?.includes("QR")
      ? [
          {
            divider: true,
          },
          {
            icon: "qr-code-outline",
            title: "qrCodePlugin",
            path: "qr-plugin",
          },
        ]
      : []),
  ];

  const otherMenu = [
    {
      icon: "open-outline",
      title: "privacyPlicy",
      onPress: async () => {
        await WebBrowser.openBrowserAsync(`${baseUrl}/view/privacy-policy`);
      },
    },
    {
      divider: true,
    },
    {
      icon: "open-outline",
      title: "termsCondition",
      onPress: async () => {
        await WebBrowser.openBrowserAsync(
          `${baseUrl}/view/terms-and-conditions`
        );
      },
    },
  ];

  return (
    <Container>
      <Box p={10}>
        <VStack space={15}>
          <Typography variant="h1">{t("settings")}</Typography>

          <Box bg="action.hover" p={10} borderRadius={10}>
            <HStack space={10}>
              <Avatar variant="" size="large" name={userData?.name} />
              <VStack space={2}>
                <Typography variant="h5">{userData?.name}</Typography>
                <Typography variant="caption">
                  {userData?.mobile || userData?.mobile_with_country_code}
                </Typography>
              </VStack>
            </HStack>

            <Box mb={10} mt={10}>
              <Divider />
            </Box>

            <Box>
              <HStack justifyContent="space-between">
                <HStack space={10}>
                  <Icon
                    name={colorMode === "dark" ? "sunny" : "moon-outline"}
                    size={25}
                  />
                  <Typography>
                    {colorMode === "dark" ? t("lightMode") : t("darkMode")}
                  </Typography>
                </HStack>
                <Switch
                  value={colorMode === "dark"}
                  onValueChange={toggleColorMode}
                />
              </HStack>
            </Box>
          </Box>

          {userData?.role === "user" && (
            <Box bg="action.hover" p={10} borderRadius={10}>
              <VStack space={10}>
                {menuItem.map((i, key) => {
                  return i.divider ? (
                    <Divider key={key} />
                  ) : (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("SettingNavigation", {
                          i: i,
                        })
                      }
                      key={key}
                    >
                      <HStack justifyContent="space-between">
                        <HStack space={10}>
                          <Icon name={i.icon} size={25} />
                          <Typography>{t(i.title)}</Typography>
                        </HStack>
                        <Icon name="chevron-forward-outline" size={25} />
                      </HStack>
                    </TouchableOpacity>
                  );
                })}
              </VStack>
            </Box>
          )}

          <Box bg="action.hover" p={10} borderRadius={10}>
            <VStack space={10}>
              {otherMenu.map((i, key) => {
                return i.divider ? (
                  <Divider key={key} />
                ) : (
                  <TouchableOpacity onPress={i.onPress} key={key}>
                    <HStack justifyContent="space-between">
                      <HStack space={10}>
                        <Icon name={"earth-outline"} size={25} />
                        <Typography>{t(i.title)}</Typography>
                      </HStack>
                      <Icon name={i.icon} size={25} />
                    </HStack>
                  </TouchableOpacity>
                );
              })}
            </VStack>
          </Box>

          <HStack justifyContent="center">
            <Button
              onPress={() => {
                setDialog({
                  ...dialog,
                  title: "Logout?",
                  message: "Are you sure?",
                  fun: () => handleLogout(),
                  open: true,
                });
              }}
              startIcon={"log-out-outline"}
              color="error"
              variant="text"
            >
              {t("logout")}
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Container>
  );
}
