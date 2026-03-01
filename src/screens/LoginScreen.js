import React, { useState, useEffect } from "react";
import {
  Image,
  TouchableOpacity,
  Linking,
  View,
  StyleSheet,
} from "react-native";
import { useGlobal } from "../contexts/GlobalContext";
import { useTranslate } from "../contexts/TranslateContext";
import { useTheme } from "../contexts/ThemeContext";
import { baseUrl } from "../contexts/api";
import {
  Container,
  VStack,
  HStack,
  Typography,
  TextField,
  Button,
  Icon,
  Box,
} from "../ui";
import * as WebBrowser from "expo-web-browser";
import SignupScreen from "./SignupScreen";

export default function LoginScreen() {
  const { data, login, toggleColorMode, apiCall, showSnack } = useGlobal();
  const { t } = useTranslate();
  const { theme, colorMode } = useTheme();
  const [web, setWeb] = useState({});
  const [state, setState] = useState({
    email: "",
    password: "",
    loginType: "user",
  });

  const getWebPublic = async () => {
    try {
      const response = await apiCall("/api/web/get_web_public", {
        method: "GET",
      });
      if (response.success) {
        setWeb(response.data);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handleLogin = async () => {
    if (!state.email || !state.password) {
      showSnack("Please enter email and password", false);
      return;
    }
    await login(state.email, state.password, state.loginType);
  };

  const openLink = async (path) => {
    await WebBrowser.openBrowserAsync(`${baseUrl}/${path}`, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
      controlsColor: theme.primary,
    });
  };

  useEffect(() => {
    getWebPublic();
  }, []);

  return (
    <Container edges={["top", "left", "right", "bottom"]}>
      <View style={styles.container}>
        {/* Main Content */}
        <View style={styles.content}>
          <VStack alignItems="flex-start" space={20}>
            {web.logo ? (
              <Box p={1} borderRadius={10} bg={"action.hover"}>
                <Image
                  source={{ uri: `${baseUrl}/media/${web.logo}` }}
                  style={{ width: 100, height: 100, resizeMode: "contain" }}
                />
              </Box>
            ) : (
              <Box
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: theme.primary,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon name="chatbubbles" size={50} color="#FFFFFF" />
              </Box>
            )}
          </VStack>

          <VStack style={{ paddingTop: 10 }} space={20}>
            <Typography variant="h3" fontSize={30}>
              {t("userLoginMsg")}
            </Typography>

            {web?.id && (
              <HStack
                space={8}
                alignItems="center"
                justifyContent="center"
                p={2}
                borderRadius={10}
                bg={theme.bgSecondary}
              >
                {(parseInt(web?.other) === 1
                  ? ["user"]
                  : ["user", "agent"]
                ).map((type) => {
                  const isActive = state.loginType === type;

                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setState({ ...state, loginType: type })}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        backgroundColor: isActive
                          ? theme.primary + "20"
                          : "transparent",
                      }}
                    >
                      <Typography
                        color={isActive ? theme.primary : theme.textSecondary}
                        fontWeight={isActive ? "bold" : "normal"}
                      >
                        {type === "user" ? t("user") : t("agent")}
                      </Typography>

                      {isActive && (
                        <Box
                          mt={1}
                          height={2}
                          bg={theme.primary}
                          borderRadius={2}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </HStack>
            )}

            <TextField
              placeholder={t("yourEmail")}
              value={state.email}
              onChangeText={(text) =>
                setState((prev) => ({ ...prev, email: text }))
              }
              type="email"
              variant="whatsapp"
              leftIcon="mail-outline"
              borderRadius={0}
            />

            <TextField
              placeholder={t("password")}
              value={state.password}
              onChangeText={(text) =>
                setState((prev) => ({ ...prev, password: text }))
              }
              type="password"
              variant="whatsapp"
              leftIcon="lock-closed-outline"
              borderRadius={0}
            />

            <Button
              onPress={handleLogin}
              loading={data.loading}
              color="success"
              fullWidth
              startIcon={"log-in-outline"}
              style={{
                borderRadius: 0,
              }}
            >
              {t("login")}
            </Button>

            {state.loginType === "user" && (
              <TouchableOpacity
                onPress={() => openLink("user/forgot-password")}
              >
                <Typography textAlign="right">{t("forgotPass")}</Typography>
              </TouchableOpacity>
            )}
          </VStack>

          {/* {state.loginType === "user" && <SignupScreen theme={theme} t={t} />} */}
        </View>

        {/* Bottom Footer - Fixed */}
        <View style={styles.footer}>
          <VStack space={16}>
            {/* Footer Links */}
            <HStack justifyContent="center" space={8} alignItems="center">
              <TouchableOpacity onPress={() => openLink("view/privacy-policy")}>
                <Typography variant="caption" color={theme.textSecondary}>
                  {t("privacyPlicy")}
                </Typography>
              </TouchableOpacity>
              <Typography variant="caption" color={theme.textSecondary}>
                •
              </Typography>
              <TouchableOpacity
                onPress={() => openLink("view/terms-and-conditions")}
              >
                <Typography variant="caption" color={theme.textSecondary}>
                  {t("termsCondition")}
                </Typography>
              </TouchableOpacity>
            </HStack>

            {/* Theme Toggle */}
            <TouchableOpacity
              onPress={toggleColorMode}
              style={{ alignSelf: "center" }}
            >
              <Icon
                name={colorMode === "dark" ? "sunny-outline" : "moon-outline"}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </VStack>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingVertical: 20,
    paddingBottom: 10,
  },
});
