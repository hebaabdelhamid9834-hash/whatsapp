import { View, Text, ScrollView } from "react-native";
import React from "react";
import { Box, Chip, HStack } from "../../../../ui";
import { useTranslate } from "../../../../contexts/TranslateContext";

export default function ChatOriginAndTags({ i }) {
  const { t } = useTranslate();
  const isMeta = i?.origin === "meta";

  function extractPhoneNumber(str) {
    if (!str) return "Unknown";
    const match = str.match(/^(\d+)(?=[:@])/);
    return match ? match[1] : "Unknown";
  }

  let chatOther = null;
  if (i?.origin_instance_id) {
    try {
      chatOther = JSON.parse(i?.origin_instance_id);
    } catch (error) {
      console.error("Invalid origin_instance_id JSON", error);
    }
  }

  // Determine the label to display based on the showName state
  const getDisplayLabel = () => {
    if (isMeta) {
      return t("meta");
    } else {
      return `${extractPhoneNumber(chatOther?.id)}`;
    }
  };

  // Safely parse chat_label JSON
  let chatTags = [];
  if (i?.chat_label) {
    try {
      const parsed = JSON.parse(i.chat_label);
      // Handle both array and single object formats
      chatTags = Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error("Invalid chat_label JSON", error);
      chatTags = [];
    }
  }

  return (
    <Box mt={2}>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <HStack space={5}>
          <Chip
            icon={isMeta ? "logo-facebook" : "logo-whatsapp"}
            size="small"
            label={getDisplayLabel()}
            variant="outlined"
            style={{
              borderRadius: 8,
            }}
          />

          {chatTags?.length
            ? chatTags?.map((tag, index) => {
                return (
                  <Chip
                    color={tag.hex}
                    key={index}
                    label={tag.title}
                    variant="outlined"
                    size="small"
                    style={{
                      borderRadius: 8,
                    }}
                  />
                );
              })
            : null}
        </HStack>
      </ScrollView>
    </Box>
  );
}
