import React, { useEffect, useRef } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import {
  Avatar,
  Box,
  HStack,
  IconButton,
  Typography,
  VStack,
} from "../../../ui";
import { TouchableOpacity, Animated } from "react-native";
import { useInbox } from "../../../contexts/InboxContext";
import MetaChatTimer from "../chatDetails/components/MetaChatTimer";
import ConvoFilter from "./convertFilter/ConvoFilter";

function fetchProfileImg(chat) {
  try {
    const profile = JSON.parse(chat?.profile) || "";
    return profile?.profileImage || "";
  } catch (err) {
    return "";
  }
}

export default function HeaderComp() {
  const { theme } = useTheme();
  const { chatInfo, maskNumber, cdTimer } = useInbox();
  const isMeta = chatInfo?.origin === "meta";
  const hasTimer = isMeta && cdTimer?.timezone && cdTimer?.timestamp;
  const navigation = useNavigation();

  return (
    <Box pb={5}>
      <HStack space={10} alignItems="center" justifyContent="space-between">
        <HStack space={10} alignItems="center">
          <IconButton
            onPress={() => navigation.goBack()}
            icon={"chevron-back-outline"}
            color={theme.primary}
          />
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ChatDetails", {
                // i: i,
              })
            }
          >
            <HStack alignItems="center" space={8}>
              <Avatar
                src={fetchProfileImg(chatInfo)}
                name={chatInfo?.contactData?.name || chatInfo?.sender_mobile}
              />

              {hasTimer ? (
                <AnimatedContactInfo
                  chatInfo={chatInfo}
                  maskNumber={maskNumber}
                  theme={theme}
                />
              ) : (
                <VStack>
                  <Typography fontWeight={"500"}>
                    {chatInfo?.contactData?.name ||
                      `+${chatInfo?.sender_mobile}`}
                  </Typography>
                  {chatInfo?.contactData?.name && (
                    <Typography variant="caption">
                      +{maskNumber(chatInfo?.sender_mobile, "*", 3, 2)}
                    </Typography>
                  )}
                </VStack>
              )}
            </HStack>
          </TouchableOpacity>
        </HStack>

        <ConvoFilter />
      </HStack>
    </Box>
  );
}

// ✅ Shows Timer for 3 seconds, then permanently shows Contact Info
const AnimatedContactInfo = ({ chatInfo, maskNumber, theme }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [showTimer, setShowTimer] = React.useState(true);

  useEffect(() => {
    // After 3 seconds, fade out timer and show contact info
    const timeout = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowTimer(false);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 3000); // Show timer for 3 seconds

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <VStack>
        {showTimer ? (
          <MetaChatTimer color="secondary" variant="text" />
        ) : (
          <>
            <Typography fontWeight={"500"}>
              {chatInfo?.contactData?.name || `+${chatInfo?.sender_mobile}`}
            </Typography>
            {chatInfo?.contactData?.name && (
              <Typography variant="caption">
                +{maskNumber(chatInfo?.sender_mobile, "*", 3, 2)}
              </Typography>
            )}
          </>
        )}
      </VStack>
    </Animated.View>
  );
};
