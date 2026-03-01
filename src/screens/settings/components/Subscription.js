import { View, Text, Linking } from "react-native";
import React from "react";
import {
  Box,
  Button,
  Divider,
  HStack,
  Icon,
  Typography,
  VStack,
} from "../../../ui";
import { useGlobal } from "../../../contexts/GlobalContext";
import moment from "moment";
import { baseUrl } from "../../../contexts/api";

export default function Subscription({ t }) {
  const { userData, parseJson } = useGlobal();
  const plan = parseJson(userData?.plan);

  function openLink() {
    Linking.openURL(baseUrl);
  }

  const Item = ({ title, enable, icon, value }) => {
    return (
      <HStack alignItems="center" space={10} justifyContent="space-between">
        <HStack space={10} alignItems="center">
          <Icon size={25} name={icon} />
          <Typography variant="body1">{title}</Typography>
        </HStack>

        {value ? (
          <Typography variant="body1">{value}</Typography>
        ) : enable ? (
          <Icon name={"checkmark-circle-outline"} size={30} color={"green"} />
        ) : (
          <Icon name={"close-circle-outline"} size={30} color={"red"} />
        )}
      </HStack>
    );
  };

  return plan ? (
    <Box p={10}>
      <VStack space={15}>
        <Box bg={"action.hover"} p={15} borderRadius={10}>
          <HStack space={10} alignItems="center">
            <Icon name="diamond-outline" size={30} color={"#FFD700"} />
            <VStack space={5}>
              <Typography variant="h4">{plan.title}</Typography>
              <Typography variant="caption">{t("youHaveSubsTo")}</Typography>
            </VStack>
          </HStack>
        </Box>

        <Item
          title={t("chatTags")}
          icon={"chatbox-outline"}
          enable={plan?.allow_tag > 0}
        />

        <Item
          icon={"bookmark-outline"}
          title={t("chatNotes")}
          enable={plan?.allow_note > 0}
        />

        <Item
          icon={"chatbox-ellipses-outline"}
          title={t("autoChatbot")}
          enable={plan?.allow_chatbot > 0}
        />

        <Item
          icon={"book-outline"}
          title={t("phoneBookContactsLImit")}
          value={`${userData?.contact || 0}/${plan?.contact_limit}`}
        />

        <Item
          icon={"git-pull-request-outline"}
          title={t("apiAccess")}
          enable={plan?.allow_api > 0}
        />

        <Item
          icon={"card-outline"}
          title={t("planDuration")}
          value={plan?.plan_duration_in_days + " " + t("days")}
        />

        <Item
          icon={"calendar-outline"}
          title={
            userData?.plan_expire
              ? moment.unix(userData.plan_expire / 1000).isBefore(moment())
                ? t("planExpiredON")
                : t("planDaysLeft")
              : t("planExpiredON")
          }
          value={
            userData?.plan_expire
              ? moment.unix(userData?.plan_expire / 1000).fromNow()
              : "planExpired"
          }
        />

        <Divider />

        <Button
          variant="outlined"
          startIcon={"open-outline"}
          onPress={openLink}
        >
          {t("checkAllPlans")}
        </Button>
      </VStack>
    </Box>
  ) : (
    <Box
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <VStack alignItems="center" space={10}>
        <Icon name="airplane-outline" size={30} />
        <Typography>{t("noPlanFound")}</Typography>
        <Button
          variant="outlined"
          startIcon={"open-outline"}
          onPress={openLink}
        >
          {t("checkAllPlans")}
        </Button>
      </VStack>
    </Box>
  );
}
