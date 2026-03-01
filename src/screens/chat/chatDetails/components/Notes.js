import { View, Text, ScrollView } from "react-native";
import React from "react";
import {
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
} from "../../../../ui";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useTranslate } from "../../../../contexts/TranslateContext";
import { useInbox } from "../../../../contexts/InboxContext";
import moment from "moment";

export default function Notes({}) {
  const { chatNote, sendToSocket, chatInfo } = useInbox();
  const [cn, setCn] = React.useState("");
  const [rating, setRating] = React.useState(0);
  const { theme } = useTheme();
  const { t } = useTranslate();

  function saveNotes() {
    sendToSocket("save_chat_note", {
      chatNote: cn,
      id: chatInfo?.id,
      rating: rating,
    });
    setCn("");
    setRating(0);
  }

  function delNotes(chatNoteId, chatRealId) {
    sendToSocket("delete_chat_note", { chatNoteId, chatRealId });
  }

  // Handle star press - each star = 1 rating point
  const handleStarPress = (starIndex) => {
    const newRating = starIndex + 1;
    setRating(newRating);
  };

  // Render star based on rating
  const renderStar = (starIndex) => {
    const starValue = starIndex + 1;
    const isFilled = rating >= starValue;

    return (
      <Icon
        key={starIndex}
        onPress={() => handleStarPress(starIndex)}
        size={20}
        name={isFilled ? "star" : "star-outline"}
        color={isFilled ? "#FFD700" : theme.textSecondary}
      />
    );
  };

  // Render stars for display only (non-interactive)
  const renderDisplayStars = (noteRating) => {
    return (
      <HStack space={3}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((starIndex) => {
          const isFilled = noteRating >= starIndex + 1;
          return (
            <Icon
              key={starIndex}
              size={14}
              name={isFilled ? "star" : "star-outline"}
              color={isFilled ? "#FFD700" : theme.textSecondary}
            />
          );
        })}
      </HStack>
    );
  };

  return (
    <Box>
      <CustomHeader
        endComp={
          <Button
            disabled={!cn || !rating}
            size="small"
            variant="text"
            onPress={saveNotes}
          >
            {t("save")}
          </Button>
        }
        title={t("chatNotes")}
      />

      <Box px={10} mt={5}>
        <VStack space={15}>
          <TextField
            value={cn}
            onChangeText={(e) => setCn(e)}
            rows={2}
            variant="whatsapp"
            multiline
            placeholder={t("enterText")}
          />

          <HStack space={10}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((starIndex) =>
              renderStar(starIndex)
            )}
          </HStack>

          {/* Optional: Show rating value */}
          {rating > 0 && (
            <Typography variant="caption" color={theme.textSecondary}>
              {t("chatRatings")}: {rating}/10
            </Typography>
          )}

          <Divider />

          {/* Notes List */}
          <ScrollView style={{ maxHeight: 200, width: "100%" }}>
            {chatNote?.length > 0 ? (
              <VStack space={10}>
                {[...chatNote]?.reverse().map((note, index) => {
                  return (
                    <Box
                      key={index}
                      p={10}
                      borderRadius={8}
                      backgroundColor={
                        theme.primaryLight || `${theme.primary}15`
                      }
                      mb={5}
                    >
                      <HStack
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <VStack space={6} flex={1}>
                          {/* Name and Email */}
                          <Typography
                            variant="body2"
                            fontWeight="500"
                            color={theme.text}
                          >
                            {note.name} ({note.email}):
                          </Typography>

                          {/* Note Text */}
                          <Typography
                            variant="body2"
                            color={theme.textSecondary}
                          >
                            {note.note}
                          </Typography>

                          {/* Rating */}
                          {note.rating > 0 && (
                            <HStack space={8} alignItems="center">
                              <Typography
                                variant="caption"
                                color={theme.textSecondary}
                              >
                                {t("chatRatings")}:
                              </Typography>
                              {renderDisplayStars(note.rating)}
                              <Typography
                                variant="caption"
                                color={theme.textSecondary}
                              >
                                ({note.rating}/10)
                              </Typography>
                            </HStack>
                          )}

                          {/* Timestamp */}
                          <Typography
                            variant="caption"
                            color={theme.textSecondary}
                          >
                            {moment.unix(note.craetedAt).fromNow()}
                          </Typography>
                        </VStack>

                        {/* Delete Button */}
                        <Icon
                          name="trash-outline"
                          size={20}
                          color={theme.error || "#ff0000"}
                          onPress={() => delNotes(note.id, chatInfo?.id)}
                        />
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            ) : (
              <Typography variant="body2" color={theme.textSecondary}>
                {t("noDataAvai")}
              </Typography>
            )}
          </ScrollView>
        </VStack>
      </Box>
    </Box>
  );
}
