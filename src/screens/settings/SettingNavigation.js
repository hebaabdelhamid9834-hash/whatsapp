import { View, Text } from "react-native";
import React from "react";
import { Box, Container, CustomHeader, Typography } from "../../ui";
import { useTranslate } from "../../contexts/TranslateContext";
import MetApiKeys from "./components/MetApiKeys";
import Subscription from "./components/Subscription";
import Profile from "./components/Profile";
import QrInstance from "./components/QrInstance";

export default function SettingNavigation({ route }) {
  const { t } = useTranslate();
  const path = route?.params?.i?.path;

  const components = {
    "meta-api-keys": <MetApiKeys t={t} />,
    subscription: <Subscription t={t} />,
    profile: <Profile t={t} />,
    "qr-plugin": <QrInstance t={t} />,
  };

  return (
    <Container>
      <CustomHeader title={t(route?.params?.i?.title)} />
      {components[path] || <Text>Not found</Text>}
    </Container>
  );
}
