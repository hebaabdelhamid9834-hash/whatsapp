import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { Alert, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
import { useAudioPlayer } from "expo-audio";
import { baseUrl } from "./api";
import { useTheme } from "./ThemeContext";

const CHAT_LOAD_LIMIT = 20;
const CONVERSATION_LOAD_LIMIT = 20;

// Replace with your actual API URL
const SOCKET_SERVER_URL = baseUrl;

export const InboxContext = createContext(null);

export const useInbox = () => {
  const context = useContext(InboxContext);
  if (!context) {
    throw new Error("useInbox must be used within an InboxProvider");
  }
  return context;
};

// Helper function to format WhatsApp text
function formatWhatsAppText({
  text,
  options = {
    autoLinks: true,
    detectEmails: true,
    detectPhoneNumbers: true,
    detectMentions: true,
    detectHashtags: true,
    lists: true,
    detectEmojis: true,
  },
  theme = {},
  fontSize = 16,
}) {
  if (!text) return null;

  // Default options
  const defaults = {
    autoLinks: true,
    detectEmails: true,
    detectPhoneNumbers: true,
    detectMentions: true,
    detectHashtags: true,
    lists: true,
    detectEmojis: true,
  };

  const config = { ...defaults, ...options };

  // Default theme
  const defaultTheme = {
    textPrimary: "#212121",
    primary: "#1976d2",
  };
  const themeConfig = { ...defaultTheme, ...theme };

  // Helper: Convert text emoticons to emojis
  const convertEmoticons = (str) => {
    if (!config.detectEmojis) return str;

    const emojiMap = {
      ":)": "😊",
      ":(": "😞",
      ":D": "😃",
      ":P": "😛",
      ";P": "😜",
      ";)": "😉",
      ":O": "😮",
      ":'(": "😢",
      "<3": "❤️",
      "</3": "💔",
      ":|": "😐",
      ":o": "😮",
    };

    Object.keys(emojiMap).forEach((emoticon) => {
      str = str.split(emoticon).join(emojiMap[emoticon]);
    });

    return str;
  };

  // Parse inline formatting (bold, italic, links, etc.)
  const parseInlineFormatting = (text, config) => {
    const segments = [];
    let currentPos = 0;
    let segmentKey = 0;

    // Define all patterns with priority
    const patterns = [
      {
        name: "bold",
        regex: /(^|\s|\n)\*([^*\n]+)\*(?=[\s\n.,:;!?)]|$)/g,
        enabled: true,
      },
      {
        name: "italic",
        regex: /(^|\s|\n)_([^_\n]+)_(?=[\s\n.,:;!?)]|$)/g,
        enabled: true,
      },
      {
        name: "strike",
        regex: /(^|\s|\n)~([^~\n]+)~(?=[\s\n.,:;!?)]|$)/g,
        enabled: true,
      },
      {
        name: "url",
        regex: /(https?:\/\/[^\s]+)/g,
        enabled: config.autoLinks,
      },
      {
        name: "url-no-protocol",
        regex:
          /(^|\s)([a-zA-Z0-9-]+\.(com|org|net|io|co|us|uk|ca|au|in|gov|edu|me)[^\s]*)/g,
        enabled: config.autoLinks,
      },
      {
        name: "email",
        regex: /([\w.-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g,
        enabled: config.detectEmails,
      },
      {
        name: "phone",
        regex:
          /(\+\d{1,3}[-.\s]?)?(\(\d{2,3}\)|\d{2,3})[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
        enabled: config.detectPhoneNumbers,
      },
      {
        name: "mention",
        regex: /(^|\s)@(\w+)/g,
        enabled: config.detectMentions,
      },
      {
        name: "hashtag",
        regex: /(^|\s)#(\w+)/g,
        enabled: config.detectHashtags,
      },
    ];

    // Find all matches
    const matches = [];
    patterns.forEach((pattern) => {
      if (!pattern.enabled) return;

      let match;
      const regex = new RegExp(pattern.regex.source, "g");
      while ((match = regex.exec(text)) !== null) {
        const content = match[2] || match[1] || match[0];
        const prefix = match[1] || "";

        matches.push({
          type: pattern.name,
          start: match.index,
          end: regex.lastIndex,
          fullMatch: match[0],
          content: content,
          prefix: prefix,
        });
      }
    });

    // Sort by position
    matches.sort((a, b) => a.start - b.start);

    // Remove overlapping matches (keep first)
    const filteredMatches = [];
    let lastEnd = 0;
    matches.forEach((match) => {
      if (match.start >= lastEnd) {
        filteredMatches.push(match);
        lastEnd = match.end;
      }
    });

    // Build segments
    filteredMatches.forEach((match) => {
      // Add text before match
      if (match.start > currentPos) {
        segments.push({
          type: "text",
          content: text.substring(currentPos, match.start),
          key: segmentKey++,
        });
      }

      // Add formatted segment
      segments.push({
        type: match.type,
        content: match.content,
        fullMatch: match.fullMatch,
        prefix: match.prefix,
        key: segmentKey++,
      });

      currentPos = match.end;
    });

    // Add remaining text
    if (currentPos < text.length) {
      segments.push({
        type: "text",
        content: text.substring(currentPos),
        key: segmentKey++,
      });
    }

    // If no matches, return whole text
    if (segments.length === 0) {
      segments.push({
        type: "text",
        content: text,
        key: segmentKey++,
      });
    }

    return segments;
  };

  // Render a single segment
  const renderSegment = (segment, baseStyle) => {
    switch (segment.type) {
      case "bold":
        return (
          <Text
            key={segment.key}
            style={[
              baseStyle,
              { fontWeight: "700", fontFamily: "Outfit_700Bold" },
            ]}
          >
            {segment.content}
          </Text>
        );

      case "italic":
        return (
          <Text key={segment.key} style={[baseStyle, { fontStyle: "italic" }]}>
            {segment.content}
          </Text>
        );

      case "strike":
        return (
          <Text
            key={segment.key}
            style={[baseStyle, { textDecorationLine: "line-through" }]}
          >
            {segment.content}
          </Text>
        );

      case "url":
        return (
          <Text
            key={segment.key}
            style={[
              baseStyle,
              {
                color: themeConfig.primary,
                textDecorationLine: "underline",
                fontWeight: "500",
              },
            ]}
            onPress={() => Linking.openURL(segment.fullMatch.trim())}
          >
            {segment.content}
          </Text>
        );

      case "url-no-protocol":
        const url = segment.content.trim();
        return (
          <Text
            key={segment.key}
            style={[
              baseStyle,
              {
                color: themeConfig.primary,
                textDecorationLine: "underline",
                fontWeight: "500",
              },
            ]}
            onPress={() => Linking.openURL(`http://${url}`)}
          >
            {segment.prefix}
            {url}
          </Text>
        );

      case "email":
        return (
          <Text
            key={segment.key}
            style={[
              baseStyle,
              {
                color: themeConfig.primary,
                textDecorationLine: "underline",
              },
            ]}
            onPress={() => Linking.openURL(`mailto:${segment.content}`)}
          >
            {segment.content}
          </Text>
        );

      case "phone":
        return (
          <Text
            key={segment.key}
            style={[
              baseStyle,
              {
                color: themeConfig.primary,
                textDecorationLine: "underline",
              },
            ]}
            onPress={() => Linking.openURL(`tel:${segment.fullMatch}`)}
          >
            {segment.fullMatch}
          </Text>
        );

      case "mention":
        return (
          <Text
            key={segment.key}
            style={[
              baseStyle,
              {
                color: themeConfig.primary,
                fontWeight: "600",
              },
            ]}
          >
            {segment.fullMatch}
          </Text>
        );

      case "hashtag":
        return (
          <Text
            key={segment.key}
            style={[
              baseStyle,
              {
                color: themeConfig.primary,
                fontWeight: "600",
              },
            ]}
          >
            {segment.fullMatch}
          </Text>
        );

      case "text":
      default:
        return (
          <Text key={segment.key} style={baseStyle}>
            {segment.content}
          </Text>
        );
    }
  };

  // Apply emoticon conversion first
  let processedText = convertEmoticons(text);

  // Split into lines
  const lines = processedText.split("\n");
  const elements = [];
  let key = 0;
  let listCounter = 0;

  lines.forEach((line, lineIndex) => {
    if (!line.trim()) {
      // Empty line - add spacing
      elements.push({ type: "break", key: key++, lineIndex });
      return;
    }

    // Check for list items
    const listMatch = line.match(/^(\s*)(\d+\.|\-|•|o|\*)\s+(.*)$/);
    if (config.lists && listMatch) {
      const [, indent, marker, content] = listMatch;
      const level = Math.floor(indent.length / 2);
      const isOrdered = /\d+\./.test(marker);

      if (isOrdered) {
        listCounter++;
      }

      elements.push({
        type: "list-item",
        content: content,
        level: level,
        ordered: isOrdered,
        number: listCounter,
        key: key++,
        lineIndex,
      });
      return;
    } else {
      listCounter = 0;
    }

    // Parse inline formatting
    const segments = parseInlineFormatting(line, config);
    elements.push({
      type: "line",
      segments: segments,
      key: key++,
      lineIndex,
    });
  });

  // Render the parsed elements
  const baseStyle = {
    fontSize: fontSize,
    lineHeight: fontSize * 1.5,
    color: themeConfig.textPrimary,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 0.15,
  };

  const renderedElements = elements.map((element, index) => {
    if (element.type === "break") {
      return (
        <Text key={`break-${element.key}`} style={baseStyle}>
          {"\n"}
        </Text>
      );
    }

    if (element.type === "list-item") {
      const bullet = element.ordered ? `${element.number}. ` : "• ";
      const indent = element.level * 20;

      return (
        <View
          key={`list-${element.key}`}
          style={{
            flexDirection: "row",
            marginLeft: indent,
            marginVertical: 2,
          }}
        >
          <Text style={[baseStyle, { marginRight: 8 }]}>{bullet}</Text>
          <View style={{ flex: 1 }}>
            <Text style={baseStyle}>
              {parseInlineFormatting(element.content, config).map((seg) =>
                renderSegment(seg, baseStyle)
              )}
            </Text>
          </View>
        </View>
      );
    }

    if (element.type === "line") {
      return (
        <Text key={`line-${element.key}`} style={baseStyle}>
          {element.segments.map((seg) => renderSegment(seg, baseStyle))}
          {index < elements.length - 1 && "\n"}
        </Text>
      );
    }

    return null;
  });

  return <>{renderedElements}</>;
}

// Custom hook for AsyncStorage state
const useAsyncState = (key, initialValue) => {
  const [state, setState] = useState(initialValue);
  const stateRef = React.useRef(initialValue); // ✅ Add ref to track current state

  // Update ref whenever state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Load from AsyncStorage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue !== null) {
          const parsed = JSON.parse(storedValue);
          setState(parsed);
          stateRef.current = parsed; // ✅ Update ref too
        }
      } catch (error) {
        console.error(`Error reading AsyncStorage key "${key}":`, error);
      }
    };

    loadState();
  }, [key]);

  // Update AsyncStorage when state changes
  const setStateAndStore = useCallback(
    async (newValue) => {
      try {
        // ✅ Use stateRef.current instead of state for functional updates
        const valueToStore =
          typeof newValue === "function"
            ? newValue(stateRef.current)
            : newValue;

        setState(valueToStore);
        stateRef.current = valueToStore; // ✅ Update ref immediately
        await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error writing AsyncStorage key "${key}":`, error);
      }
    },
    [key] // ✅ Remove 'state' from dependencies
  );

  return [state, setStateAndStore];
};

// Agent time tracker component for mobile
const AgentTimeTracker = ({ socket, agent, userData }) => {
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const totalTimeRef = React.useRef(0);
  const mountTimeRef = React.useRef(Date.now());

  useEffect(() => {
    if (!agent || !userData?.uid || !socket) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - mountTimeRef.current) / 1000);
      totalTimeRef.current = elapsed;

      // Always send current session time (capped at 5s increments)
      const timeSinceLastSave = Math.min(elapsed - lastSavedTime, 5);

      if (timeSinceLastSave > 0) {
        socket.emit("message", {
          type: "update_spend_time",
          payload: {
            uid: userData.uid,
            date: new Date().toISOString().split("T")[0], // Current date
            timeSpent: timeSinceLastSave,
          },
        });

        setLastSavedTime(elapsed);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      const finalElapsed = Math.floor(
        (Date.now() - mountTimeRef.current) / 1000
      );
      const unsavedTime = finalElapsed - lastSavedTime;

      if (unsavedTime > 0) {
        socket.emit("message", {
          type: "update_spend_time",
          payload: {
            uid: userData.uid,
            date: new Date().toISOString().split("T")[0],
            timeSpent: unsavedTime,
          },
        });
      }
    };
  }, [agent, userData?.uid, socket]);

  return null;
};

export const InboxProvider = ({
  children,
  uid = "randomUID",
  agent = false,
  userToken,
  userData,
}) => {
  const [socket, setSocket] = useState(null);
  const [phonebookData, setPhonebookData] = useAsyncState("phonebookData", []);
  const [error, setError] = useState({ show: false, message: "" });
  const [labelData, setLabelData] = useAsyncState("labelData", []);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [chatList, setChatList] = useAsyncState("chatList", []);
  const [agentData, setAgentData] = useAsyncState("agentData", []);
  const [cdTimer, setCdTimer] = useAsyncState("cdTimer", {});
  const [loadingChats, setLoadingChats] = useAsyncState("loadingChats", false);
  const [hasMoreChats, setHasMoreChats] = useAsyncState("hasMoreChats", true);
  const [chatInfo, setChatInfo] = useAsyncState("chatInfo", null);
  const [chatNote, setChatNote] = useAsyncState("chatNote", []);
  const [chatBots, setChatBots] = useAsyncState("chatBots", []);
  const [chatFilters, setChatFilters] = useAsyncState("chatFilters", {
    search: "",
    origin: "",
    unreadOnly: false,
    assignedOnly: false,
    dateRange: { start: null, end: null },
    limit: CHAT_LOAD_LIMIT,
    offset: 0,
  });

  // Inside your component or create a custom hook
  const notificationPlayer = useAudioPlayer(
    require("../../assets/notification.mp3")
  );

  // Conversation states
  const [conversation, setConversation] = useAsyncState(
    "conversationArr",
    null
  );
  const [loadingConversation, setLoadingConversation] = useAsyncState(
    "loadingConversation",
    false
  );
  const [hasMoreMessages, setHasMoreMessages] = useAsyncState(
    "hasMoreMessages",
    true
  );
  const [currentChat, setCurrentChat] = useAsyncState("currentChat", null);
  const [conversationFilters, setConversationFilters] = useAsyncState(
    "conversationFilters",
    {
      search: "",
      dateRange: { start: null, end: null },
      limit: CONVERSATION_LOAD_LIMIT,
      offset: 0,
    }
  );

  // Error handling
  const handleError = useCallback((error) => {
    setError({ show: true, message: error?.msg || "Something went wrong" });
    console.error("Socket error:", error);
  }, []);

  // Chat list handler
  const handleChatList = useCallback((payload) => {
    const { chats, total, offset, agentData } = payload;
    console.log({
      total,
    });

    setAgentData(agentData || []);

    setChatList((prev) => {
      if (offset === 0) return chats;
      const existingIds = new Set(prev.map((c) => c.chat_id));
      const newChats = chats.filter((c) => !existingIds.has(c.chat_id));
      return [...prev, ...newChats];
    });

    setHasMoreChats(offset + chats.length < total);
    setLoadingChats(false);
  }, []);

  // Conversation handler
  const handleConversation = useCallback((payload) => {
    const {
      conversation: newMessages,
      total,
      offset,
      chatInfo,
      labelsAdded,
      agentData,
      countDownTimer,
      phonebookData,
      chatBots,
    } = payload;

    setAgentData(agentData || []);
    setChatBots(chatBots || []);

    setChatInfo(chatInfo);
    setLabelData(labelsAdded);
    setChatNote(chatInfo?.chat_note);
    setCdTimer(countDownTimer);
    setPhonebookData(phonebookData);

    const chronologicalMessages = [...newMessages].reverse();

    setConversation((prev) => {
      if (offset === 0) {
        // Initial load - just use the reversed messages
        return chronologicalMessages;
      } else {
        // Loading more - add older messages to the beginning
        return [...chronologicalMessages, ...prev];
      }
    });

    setHasMoreMessages(offset + newMessages.length < total);
    setLoadingConversation(false);
  }, []);

  // Socket connection setup
  useEffect(() => {
    if (!uid || !userToken) return;

    const newSocket = io(SOCKET_SERVER_URL, {
      query: { token: userToken },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Event listeners
    newSocket.on("connection_ack", setConnectionInfo);
    newSocket.on("chat_list", handleChatList);
    newSocket.on("message", (payload) => {
      console.log("socket message update", { payload });
    });

    newSocket.on("request_update_chat_list", async (payload) => {
      if (payload?.chatId) {
        const currentChatData = JSON.parse(
          (await AsyncStorage.getItem("currentChat")) || "null"
        );
        if (currentChatData?.chat_id === payload?.chatId) {
          const filterData = JSON.parse(
            (await AsyncStorage.getItem("conversationFilters")) || "{}"
          );

          if (currentChatData) {
            newSocket.emit("message", {
              type: "load_conversation",
              payload: {
                chat: currentChatData,
                filters: filterData,
              },
            });
          }
        }
      }

      const filterData = JSON.parse(
        (await AsyncStorage.getItem("chatFilters")) || "{}"
      );
      newSocket.emit("message", {
        type: "get_chat_list",
        payload: filterData,
      });
    });

    newSocket.on("request_update_opened_chat", async () => {
      const filterData = JSON.parse(
        (await AsyncStorage.getItem("conversationFilters")) || "{}"
      );
      const currentChatData = JSON.parse(
        (await AsyncStorage.getItem("currentChat")) || "null"
      );

      if (currentChatData) {
        newSocket.emit("message", {
          type: "load_conversation",
          payload: {
            chat: currentChatData,
            filters: filterData,
          },
        });
      }
    });

    // Updated conversation handler
    newSocket.on("load_conversation", handleConversation);

    newSocket.on("update_labels", (msg) => {
      setLabelData(msg);
    });

    newSocket.on("ring", async (msg) => {
      try {
        await notificationPlayer.play();
      } catch (error) {
        console.error("Error playing notification sound:", error);
      }
    });

    newSocket.on("error", handleError);
    newSocket.on("connect_error", handleError);

    setSocket(newSocket);

    return () => {
      newSocket.off("chat_list", handleChatList);
      newSocket.off("load_conversation", handleConversation);
      newSocket.disconnect();
    };
  }, [uid, userToken]);

  // Socket actions
  const sendToSocket = useCallback(
    (type, payload) => {
      console.log({ typetype: type });
      socket?.emit("message", { type, payload });
    },
    [socket]
  );

  const loadChatList = useCallback(
    (newFilters = {}, loadMore = false) => {
      setLoadingChats(true);

      const updatedFilters = {
        ...chatFilters,
        ...newFilters,
        offset: loadMore ? chatFilters.offset + chatFilters.limit : 0,
      };

      setChatFilters(updatedFilters);
      sendToSocket("get_chat_list", updatedFilters);
    },
    [chatFilters, sendToSocket]
  );

  function markChatAsRead(id) {
    setChatList((prevChatList) => {
      return prevChatList.map((chat) => {
        if (chat.chat_id === id || chat.id === id) {
          // Check both formats to be safe
          return { ...chat, unread_count: 0 };
        }
        return chat;
      });
    });
  }

  // Add this method to clear conversation
  const clearConversation = () => {
    setConversation([]);
  };

  // Add this method to clear chat info
  const clearChatInfo = () => {
    setChatInfo(null);
  };

  // Load conversation with filters
  const loadConversation = useCallback(
    (chat, newFilters = {}, loadMore = false) => {
      // ❌ DON'T clear conversation when loading more
      if (!loadMore) {
        setConversation([]);
        setChatInfo(chat);
      }

      setLoadingConversation(true);
      setCurrentChat(chat);

      if (chat?.id || chat?.chat_id) {
        markChatAsRead(chat.id || chat.chat_id);
      }

      const updatedFilters = {
        ...conversationFilters,
        ...newFilters,
        offset: loadMore
          ? conversationFilters.offset + conversationFilters.limit
          : 0,
      };

      setConversationFilters(updatedFilters);

      sendToSocket("load_conversation", {
        chat,
        filters: updatedFilters,
      });
    },
    [conversationFilters, sendToSocket]
  );

  // Initial data load
  useEffect(() => {
    if (socket?.connected) {
      loadChatList({
        search: "",
        origin: "",
        unreadOnly: false,
        assignedOnly: false,
        dateRange: { start: null, end: null },
        limit: CHAT_LOAD_LIMIT,
        offset: 0,
      });
    }
  }, [socket?.connected]);

  function maskNumber(number, maskChar = "*", keepFirst = 2, keepLast = 2) {
    const mask = parseInt(userData?.mask_number) > 0 ? true : false;
    const numStr = number.toString();

    if (!mask) {
      return numStr;
    }

    if (numStr.length <= keepFirst + keepLast) {
      // If number is too short, keep at least the last digit
      return maskChar.repeat(Math.max(0, numStr.length - 1)) + numStr.slice(-1);
    }

    return (
      numStr.slice(0, keepFirst) +
      maskChar.repeat(numStr.length - keepFirst - keepLast) +
      numStr.slice(-keepLast)
    );
  }

  // Context value
  const contextValue = {
    socket,
    connectionInfo,
    chatList,
    loadingChats,
    hasMoreChats,
    chatFilters,
    sendToSocket,
    loadChatList,
    setChatFilters,
    socketConnection: socket?.connected ? true : false,

    // Conversation-related values
    conversation,
    setConversation,
    loadingConversation,
    hasMoreMessages,
    conversationFilters,
    setConversationFilters,
    loadConversation,
    currentChat,
    formatWhatsAppText,
    chatInfo,
    labelData,
    setChatNote,
    chatNote,
    agent,
    setAgentData,
    agentData,
    cdTimer,
    setCdTimer,
    userData,
    phonebookData,
    setChatBots,
    chatBots,
    maskNumber,
    clearConversation,
    clearChatInfo,
    setChatInfo,
  };

  return (
    <InboxContext.Provider value={contextValue}>
      {children}
      {agent && (
        <AgentTimeTracker socket={socket} agent={agent} userData={userData} />
      )}
      {error.show &&
        Alert.alert("Error", error.message, [
          { text: "OK", onPress: () => setError({ show: false, message: "" }) },
        ])}
    </InboxContext.Provider>
  );
};
