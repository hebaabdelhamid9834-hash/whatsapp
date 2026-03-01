import { View, Text } from "react-native";
import React from "react";
import { Typography } from "../../../../ui";
import moment from "moment";

export default function TimeStamp({ i }) {
  // Extract timestamp with improved error handling
  const timestamp = React.useMemo(() => {
    if (!i?.last_message) return null;

    try {
      const parsed = JSON.parse(i.last_message);
      return parsed.timestamp || null;
    } catch (err) {
      console.error("Error parsing timestamp:", err);
      return null;
    }
  }, [i?.last_message]);

  // Format timestamp with enhanced formatting
  const formattedTime = React.useMemo(() => {
    if (!timestamp) return "No timestamp";

    try {
      const now = moment();
      const today = moment().startOf("day");
      const yesterday = moment().subtract(1, "day").startOf("day");
      const messageTime = moment.unix(timestamp);

      // Check if timestamp is valid
      if (!messageTime.isValid()) {
        return "Invalid date";
      }

      // Determine relative time display
      if (messageTime.isSame(today, "d")) {
        // Today - show time with AM/PM - ensure it's on one line
        return messageTime.format("h:mm A"); // This ensures AM/PM is on same line
      } else if (messageTime.isSame(yesterday, "d")) {
        // Yesterday
        return "Yesterday";
      } else if (messageTime.isAfter(moment().subtract(7, "days"))) {
        // Within the last 7 days - show day name
        return messageTime.format("ddd");
      } else if (messageTime.isSame(now, "year")) {
        // This year but more than a week ago - show month and day
        return messageTime.format("MMM D");
      } else {
        // Different year - show date with year
        return messageTime.format("MM/DD/YY");
      }
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Error";
    }
  }, [timestamp]);

  if (!timestamp) {
    return null;
  }

  return <Typography variant="caption">{formattedTime}</Typography>;
}
