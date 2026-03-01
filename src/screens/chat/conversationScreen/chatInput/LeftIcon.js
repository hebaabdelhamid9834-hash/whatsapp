import { View, TouchableOpacity } from "react-native";
import React from "react";
import { Box, Dialog, Grid, VStack, Icon, Typography } from "../../../../ui";
import { useTranslate } from "../../../../contexts/TranslateContext";
import { useTheme } from "../../../../contexts/ThemeContext";
import SendImg from "./SendImg";
import SendVideo from "./SendVideo";
import SendAudio from "./SendAudio";
import SendDoc from "./SendDoc";
import SendLoc from "./SendLoc";

export default function LeftIcon({ leftIconState, setLeftIconState, onSend }) {
  const { t } = useTranslate();
  const { theme } = useTheme();

  const mediaOptions = [
    {
      component: <SendImg t={t} onSend={onSend} theme={theme} />,
    },
    {
      component: <SendVideo t={t} onSend={onSend} theme={theme} />,
    },
    {
      component: <SendAudio t={t} onSend={onSend} theme={theme} />,
    },
    {
      component: <SendDoc t={t} onSend={onSend} theme={theme} />,
    },
    {
      component: <SendLoc t={t} onSend={onSend} theme={theme} />,
    },
  ];

  return (
    <Dialog
      titleIcon="file-tray-full-outline"
      titleIconSize={20}
      visible={leftIconState.dialog}
      title={t("sendMediaMessage")}
      position="bottom"
      onClose={() => setLeftIconState({ ...leftIconState, dialog: false })}
    >
      <Grid.Container spacing={3} justifyContent="flex-start">
        {mediaOptions.map((option, index) => (
          <Grid.Item xs={4} key={index}>
            {option.component}
          </Grid.Item>
        ))}
      </Grid.Container>
    </Dialog>
  );
}
