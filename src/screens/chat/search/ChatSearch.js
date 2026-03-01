import { View, Text } from "react-native";
import React from "react";
import { Box, SearchBar, TextField, Typography } from "../../../ui";
import { useInbox } from "../../../contexts/InboxContext";

export default function ChatSearch({ t }) {
  const [searchText, setSearchText] = React.useState("");
  const { loadChatList, chatFilters } = useInbox();

  const clearSearch = () => {
    setSearchText("");
    loadChatList({ search: "", offset: 0 });
  };

  const resetFilters = () => {
    setSearchText("");
    loadChatList({
      search: "",
      origin: "",
      unreadOnly: false,
      assignedOnly: false,
      statusFilter: "all",
      originFilter: "all",
      agentFilter: null,
      starredOnly: false,
      hasNote: false,
      dateRange: { start: null, end: null },
      offset: 0,
    });
  };

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText !== chatFilters.search) {
        loadChatList({ search: searchText, offset: 0 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  return (
    <Box>
      <TextField
        value={searchText}
        onChangeText={(e) => setSearchText(e)}
        placeholder={t("any")}
        variant="whatsapp"
        rightIcon={searchText ? "close-circle-outline" : null}
        rightIconPress={() => {
          setSearchText("");
          loadChatList({ search: "", offset: 0 });
        }}
      />
    </Box>
  );
}
