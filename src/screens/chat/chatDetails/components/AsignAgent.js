import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import {
  Box,
  CustomHeader,
  HStack,
  Icon,
  Typography,
  VStack,
} from "../../../../ui";
import { useTranslate } from "../../../../contexts/TranslateContext";
import { useInbox } from "../../../../contexts/InboxContext";
import { useTheme } from "../../../../contexts/ThemeContext";

export default function AsignAgent() {
  const { t } = useTranslate();
  const { theme } = useTheme();
  const { agentData, sendToSocket, chatInfo } = useInbox();

  // Format agent data with labels for the dropdown
  const formattedAgentOptions = React.useMemo(() => {
    return agentData.map((agent) => ({
      ...agent,
      label: `${agent?.email} (${agent?.name})`,
    }));
  }, [agentData]);

  // Get the currently assigned agents
  const assignedAgents = React.useMemo(() => {
    if (!chatInfo?.assigned_agent) return [];

    try {
      // Parse the assigned agents (handle both string and array)
      const parsedAgents =
        typeof chatInfo.assigned_agent === "string"
          ? JSON.parse(chatInfo.assigned_agent)
          : chatInfo.assigned_agent;

      // Ensure we always return an array
      const agentsArray = Array.isArray(parsedAgents)
        ? parsedAgents
        : [parsedAgents].filter(Boolean);

      // Map to our formatted options
      return agentsArray
        .map((agent) => {
          const found = formattedAgentOptions.find(
            (option) => option.uid === agent.uid
          );
          return found || null;
        })
        .filter(Boolean);
    } catch (e) {
      console.error("Error parsing assigned_agent:", e);
      return [];
    }
  }, [chatInfo?.assigned_agent, formattedAgentOptions]);

  const ids = assignedAgents?.map((x) => x.id);

  function assignChatToAgent({ chatId, agentUid, unAssign }) {
    sendToSocket("assign_agent_to_chat", { chatId, agentUid, unAssign });
  }

  return (
    <Box>
      <CustomHeader title={t("assignChat")} />
      <Box px={10} mt={5}>
        <VStack space={15}>
          {agentData?.map((i, key) => {
            return (
              <Box key={key}>
                <TouchableOpacity
                  onPress={() => {
                    ids?.includes(i.id)
                      ? assignChatToAgent({
                          chatId: chatInfo?.chat_id,
                          agentUid: i.uid,
                          unAssign: true,
                        })
                      : assignChatToAgent({
                          chatId: chatInfo?.chat_id,
                          agentUid: i.uid,
                          unAssign: false,
                        });
                  }}
                >
                  <HStack
                    space={10}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <HStack space={10} alignItems="center">
                      <Icon size={25} name="person-circle-outline" />
                      <VStack>
                        <Typography
                          numberOfLines={1}
                          fontWeight={ids?.includes(i.id) ? "500" : null}
                        >
                          {i.name}
                        </Typography>

                        <Typography
                          color={theme.textDisabled}
                          numberOfLines={1}
                          variant="caption"
                        >
                          {i.email}
                        </Typography>
                      </VStack>
                    </HStack>

                    {ids?.includes(i.id) ? (
                      <Icon color={theme.success} name="checkmark-circle" />
                    ) : (
                      <Icon name="checkmark-circle-outline" />
                    )}
                  </HStack>
                </TouchableOpacity>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </Box>
  );
}
