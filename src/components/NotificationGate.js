import React, { useEffect, useState } from "react";
import { View, Platform, PermissionsAndroid } from "react-native";

import { getApp } from "@react-native-firebase/app";
import {
  getMessaging,
  requestPermission,
  AuthorizationStatus,
  getToken,
  getAPNSToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  onTokenRefresh,
} from "@react-native-firebase/messaging";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobal } from "../contexts/GlobalContext";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslate } from "../contexts/TranslateContext";
import { HStack, VStack, Typography, Button, Box } from "../ui";

const messaging = getMessaging(getApp());

function parseJson(data) {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export default function NotificationGate({ children }) {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const { userData, apiCall } = useGlobal();

  const [askedOnce, setAskedOnce] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isChecking, setIsChecking] = useState(true); // Add loading state

  async function updateTokenOnServer({ token, other }) {
    if (!token || !userData?.role) return;

    await apiCall(`/api/${userData.role}/update_fcm_token`, {
      method: "POST",
      data: { token, other },
    });

    await AsyncStorage.setItem("fcm_token", token);
  }

  async function requestNotifications() {
    setIsRequesting(true);

    try {
      // ---------- iOS ----------
      if (Platform.OS === "ios") {
        const authStatus = await requestPermission(messaging);
        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          setAskedOnce(true);
          await AsyncStorage.setItem("notification_asked", "true"); // Save
          return;
        }

        const apnsToken = await getAPNSToken(messaging);
        if (!apnsToken) {
          setAskedOnce(true);
          await AsyncStorage.setItem("notification_asked", "true");
          return;
        }

        const token = await getToken(messaging);
        await updateTokenOnServer({
          token,
          other: { platform: "iOS", apnsToken },
        });

        setPermissionGranted(true);
        setAskedOnce(true);
        await AsyncStorage.setItem("notification_granted", "true"); // Save
        return;
      }

      // ---------- ANDROID ----------
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setAskedOnce(true);
          await AsyncStorage.setItem("notification_asked", "true");
          return;
        }
      }

      const token = await getToken(messaging);
      await updateTokenOnServer({
        token,
        other: { platform: "Android" },
      });

      setPermissionGranted(true);
      setAskedOnce(true);
      await AsyncStorage.setItem("notification_granted", "true");
    } catch (err) {
      console.error("Notification permission error:", err);
      setAskedOnce(true);
      await AsyncStorage.setItem("notification_asked", "true");
    } finally {
      setIsRequesting(false);
    }
  }

  // Check permission status on mount
  useEffect(() => {
    async function checkPermissionStatus() {
      try {
        const granted = await AsyncStorage.getItem("notification_granted");
        const asked = await AsyncStorage.getItem("notification_asked");

        if (granted === "true") {
          setPermissionGranted(true);
          setAskedOnce(true);
        } else if (asked === "true") {
          setAskedOnce(true);
        }
      } catch (err) {
        console.error("Error checking permission status:", err);
      } finally {
        setIsChecking(false);
      }
    }

    checkPermissionStatus();
  }, []);

  useEffect(() => {
    // Listeners are fine even if permission is off
    const unsubscribeMessage = onMessage(messaging, async () => {});
    const unsubscribeOpened = onNotificationOpenedApp(messaging, () => {});
    getInitialNotification(messaging);
    const unsubscribeRefresh = onTokenRefresh(messaging, async (newToken) => {
      if (permissionGranted) {
        await updateTokenOnServer({
          token: newToken,
          other: { platform: Platform.OS },
        });
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeOpened();
      unsubscribeRefresh();
    };
  }, [permissionGranted]);

  // Don't show banner while checking stored permission
  if (isChecking) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      {/* Optional soft banner */}
      {!permissionGranted && !askedOnce && !isRequesting && (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          p={10}
          borderRadius={12}
          bg={"action.hover"}
          shadow={2}
        >
          <VStack space={3}>
            <Typography fontWeight="bold">{t("notiReqTitle")}</Typography>

            <Typography>{t("notiReqDes")}</Typography>

            <HStack justifyContent="flex-end" space={8}>
              <Button
                startIcon={"notifications-off-outline"}
                size="small"
                variant="outlined"
                onPress={async () => {
                  setAskedOnce(true);
                  await AsyncStorage.setItem("notification_asked", "true");
                }}
              >
                {t("notNow")}
              </Button>

              <Button
                startIcon={"notifications-outline"}
                size="small"
                onPress={requestNotifications}
              >
                {t("enable")}
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}
    </>
  );
}
