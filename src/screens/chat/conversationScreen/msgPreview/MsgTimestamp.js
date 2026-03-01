import { View, StyleSheet } from "react-native";
import { Typography } from "../../../../ui";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../../contexts/ThemeContext";
import moment from "moment";

const getFormattedTimestamp = (timestamp) => {
  const now = moment();
  const today = moment().startOf("day");
  const yesterday = moment().subtract(1, "day").startOf("day");
  const messageTime = moment.unix(timestamp);

  if (messageTime.isSame(today, "d")) {
    return messageTime.format("hh:mm A");
  } else if (messageTime.isSame(yesterday, "d")) {
    return "Yesterday";
  } else if (messageTime.isAfter(moment().subtract(7, "days"))) {
    return messageTime.format("dddd");
  } else {
    return messageTime.format("DD/MM/YY");
  }
};

const renderStatusIcon = (status, color, timestampColor) => {
  switch (status) {
    case "sent":
      return (
        <Ionicons
          name="checkmark"
          size={16}
          color={timestampColor}
          style={styles.icon}
        />
      );
    case "delivered":
      return (
        <Ionicons
          name="checkmark-done"
          size={16}
          color={timestampColor}
          style={styles.icon}
        />
      );
    case "read":
      return (
        <Ionicons
          name="checkmark-done"
          size={16}
          color="#53BDEB" // WhatsApp blue for read
          style={styles.icon}
        />
      );
    case "failed":
      return (
        <Ionicons
          name="alert-circle-outline"
          size={16}
          color="#FF3B30"
          style={styles.icon}
        />
      );
    case "deleted":
      return (
        <Ionicons
          name="alert-circle-outline"
          size={16}
          color={timestampColor}
          style={styles.icon}
        />
      );
    default:
      return null;
  }
};

export default function MsgTimestamp({ msg }) {
  const { theme, colorMode } = useTheme();

  const isIncoming = msg?.route === "INCOMING";
  const time = msg?.timestamp ? getFormattedTimestamp(msg.timestamp) : "";

  const timestampColor = isIncoming
    ? theme.textSecondary
    : colorMode === "dark"
    ? "rgba(233, 237, 239, 0.6)"
    : "rgba(61, 61, 61, 0.8)";

  return (
    <View style={styles.container}>
      <Typography fontSize={10} color={timestampColor} style={styles.time}>
        {time}
      </Typography>

      {!isIncoming && msg?.status && (
        <View style={styles.statusIcon}>
          {renderStatusIcon(msg.status, theme, timestampColor)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 2,
    marginLeft: 8,
    gap: 3,
  },
  time: {
    lineHeight: 15,
  },
  statusIcon: {
    marginLeft: 2,
  },
  icon: {
    marginTop: -1,
  },
});
