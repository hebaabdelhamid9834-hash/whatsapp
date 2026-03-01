import { View, Text } from "react-native";
import React from "react";
import {
  Box,
  Chip,
  Dialog,
  Divider,
  HStack,
  IconButton,
  VStack,
  Select,
  Badge,
} from "../../../ui";
import { useInbox } from "../../../contexts/InboxContext";

export default function ChatFilter({ t, theme }) {
  const { agent, chatFilters, loadChatList, agentData } = useInbox();
  const [state, setState] = React.useState({
    dialog: false,
  });

  const originOption = [
    {
      label: t("all"),
      value: "all",
      icon: null,
    },
    {
      label: t("whatsappQr"),
      value: "qr",
      icon: "logo-whatsapp",
    },
    {
      label: t("metaCloud"),
      value: "meta",
      icon: "logo-facebook",
    },
  ];

  const handleOriginFilter = (value, selectedOption) => {
    loadChatList({
      originFilter: value || "all",
      origin: value === "all" ? "" : value,
      offset: 0,
    });
  };

  const handleAgentFilter = (value, selectedAgent) => {
    loadChatList({
      agentFilter: value === "all" ? "" : value,
      offset: 0,
    });
  };

  const activeFilterCount = [
    chatFilters.statusFilter !== "all",
    chatFilters.originFilter &&
      chatFilters.originFilter !== "all" &&
      chatFilters.originFilter !== "",
    chatFilters.agentFilter &&
      chatFilters.agentFilter !== "all" &&
      chatFilters.agentFilter !== null &&
      chatFilters.agentFilter !== "",
    chatFilters.starredOnly === true,
    chatFilters.hasNote === true,
    !!(chatFilters.dateRange?.start || chatFilters.dateRange?.end),
  ].filter(Boolean).length;

  // ✅ Build agent options properly
  const agentOptions = React.useMemo(() => {
    return [
      {
        label: t("all"),
        value: "all",
      },
      ...agentData.map((agent) => ({
        label: agent.name,
        value: agent.name, // ✅ Ensure string
        id: agent.id,
        ...agent,
      })),
    ];
  }, [agentData, t]);

  return (
    <Box>
      <Badge color="primary" content={activeFilterCount}>
        <IconButton
          onPress={() => setState({ ...state, dialog: true })}
          icon={"filter-circle-outline"}
          color={theme.primary}
        />
      </Badge>
      <Dialog
        titleIcon={"filter-circle-outline"}
        title={t("filterConveration")}
        visible={state.dialog}
        onClose={() => setState({ ...state, dialog: false })}
      >
        <VStack space={10}>
          {!agent && (
            <Select
              label={t("origin") || "Select Origin"}
              value={chatFilters?.originFilter ?? "all"}
              onChange={handleOriginFilter}
              options={originOption}
              variant="outlined"
              size="medium"
              placeholder={t("origin") || "Select origin"}
            />
          )}

          <Divider />

          {!agent && (
            <Select
              label={t("assignedAgent")}
              value={chatFilters.agentFilter || "all"} // ✅ Changed from ?? to ||
              onChange={handleAgentFilter}
              options={agentOptions}
              variant="outlined"
              size="medium"
              placeholder={t("assignedAgent") || "Select agent"}
            />
          )}
        </VStack>
      </Dialog>
    </Box>
  );
}
