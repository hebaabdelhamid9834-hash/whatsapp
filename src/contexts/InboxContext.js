import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useRef,
} from "react";
import { Alert, Text, View, Linking, ActivityIndicator } from "react-native";
import { io } from "socket.io-client";
import { useAudioPlayer } from "expo-audio";
import { baseUrl } from "./api";
import * as DB from "../utils/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import formatWhatsAppText from "../utils/formatWhatsAppText";
import { Snackbar } from "../ui";

const CHAT_LOAD_LIMIT = 20;
const CONVERSATION_LOAD_LIMIT = 20;
const SOCKET_SERVER_URL = baseUrl;

export const InboxContext = createContext(null);

export const useInbox = () => {
  const context = useContext(InboxContext);
  if (!context) {
    throw new Error("useInbox must be used within an InboxProvider");
  }
  return context;
};

// ✅ Simple Syncing Indicator Component (just true/false)
const SyncingIndicator = ({ isSyncing }) => {
  if (!isSyncing) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: "#2196f3",
        padding: 12,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
      }}
    >
      <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
      <Text
        style={{
          color: "#fff",
          fontSize: 14,
          flex: 1,
          fontFamily: "Outfit_500Medium",
        }}
      >
        Syncing messages...
      </Text>
    </View>
  );
};

// Agent Time Tracker Component
const AgentTimeTracker = ({ socket, agent, userData }) => {
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const totalTimeRef = useRef(0);
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!agent || !userData?.uid || !socket) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - mountTimeRef.current) / 1000);
      totalTimeRef.current = elapsed;

      const timeSinceLastSave = Math.min(elapsed - lastSavedTime, 5);

      if (timeSinceLastSave > 0) {
        socket.emit("message", {
          type: "update_spend_time",
          payload: {
            uid: userData.uid,
            date: new Date().toISOString().split("T")[0],
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
  }, [agent, userData?.uid, socket, lastSavedTime]);

  return null;
};

// ============ INBOX PROVIDER ============
export const InboxProvider = ({
  children,
  uid = "randomUID",
  agent = false,
  userToken,
  userData,
}) => {
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState({ show: false, message: "" });
  const [connectionInfo, setConnectionInfo] = useState(null);

  // ✅ NEW: Simple syncing state (just true/false)
  const [isSyncing, setIsSyncing] = useState(false);

  const [chatList, setChatList] = useState([]);
  const [conversation, setConversation] = useState([]);
  const [labelData, setLabelData] = useState([]);
  const [phonebookData, setPhonebookData] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [chatBots, setChatBots] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);
  const [chatNote, setChatNote] = useState([]);
  const [cdTimer, setCdTimer] = useState({});
  const [currentChat, setCurrentChat] = useState(null);

  const [loadingChats, setLoadingChats] = useState(false);
  const [hasMoreChats, setHasMoreChats] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const [dataSource, setDataSource] = useState({
    chats: "none",
    conversation: "none",
  });

  const [chatFilters, setChatFilters] = useState({
    search: "",
    origin: "",
    unreadOnly: false,
    assignedOnly: false,
    dateRange: { start: null, end: null },
    limit: CHAT_LOAD_LIMIT,
    offset: 0,
  });

  const [conversationFilters, setConversationFilters] = useState({
    search: "",
    dateRange: { start: null, end: null },
    limit: CONVERSATION_LOAD_LIMIT,
    offset: 0,
  });

  const notificationPlayer = useAudioPlayer(
    require("../../assets/notification.mp3")
  );

  // ✅ Initialize Database on mount
  useEffect(() => {
    const initDB = async () => {
      try {
        // console.log("🔄 Initializing database...");
        await DB.initDatabase();
        // console.log("✅ Database initialized");
      } catch (err) {
        console.error("❌ DB init failed:", err);
      }
    };

    initDB();
  }, []);

  // ✅ Load cached data IMMEDIATELY on mount
  useEffect(() => {
    const loadCachedData = async () => {
      if (!uid) {
        console.log("⚠️ No UID provided, skipping cache load");
        return;
      }

      try {
        console.log("📦 Loading cached data...");

        // Load chats from cache
        const cachedChats = await DB.getData(`chats_${uid}`);
        if (cachedChats && cachedChats.length > 0) {
          // console.log(`✅ Loaded ${cachedChats.length} chats from cache`);
          setChatList(cachedChats);
          setDataSource((prev) => ({ ...prev, chats: "cache" }));
        }

        // Load labels from cache
        const cachedLabels = await DB.getData(`labels_${uid}`);
        if (cachedLabels && cachedLabels.length > 0) {
          setLabelData(cachedLabels);
        }

        // Load phonebook from cache
        const cachedPhonebook = await DB.getData(`phonebook_${uid}`);
        if (cachedPhonebook && cachedPhonebook.length > 0) {
          setPhonebookData(cachedPhonebook);
        }

        // Load agent data
        const cachedAgents = await DB.getData(`agents_${uid}`);
        if (cachedAgents && cachedAgents.length > 0) {
          setAgentData(cachedAgents);
        }
      } catch (err) {
        console.error("❌ Error loading cached data:", err);
      }
    };

    loadCachedData();
  }, [uid]);

  const handleError = useCallback((error) => {
    setError({ show: true, message: error?.msg || "Something went wrong" });
    console.error("❌ Socket error:", error);
  }, []);

  // ✅ Chat list handler - Save to SQLite
  const handleChatList = useCallback(
    async (payload) => {
      const { chats, total, offset, agentData } = payload;

      // console.log(`🌐 Received ${chats.length} chats from server`);

      setAgentData(agentData || []);

      // ✅ Save to SQLite
      if (chats.length > 0) {
        await DB.saveData(`chats_${uid}`, chats);
        // console.log("💾 Saved chats to SQLite");
      }

      if (agentData && agentData.length > 0) {
        await DB.saveData(`agents_${uid}`, agentData);
      }

      // ✅ Update state
      setChatList((prev) => {
        if (offset === 0) {
          setDataSource((prevState) => ({ ...prevState, chats: "server" }));
          return chats;
        }

        const existingIds = new Set(prev.map((c) => c.chat_id));
        const newChats = chats.filter((c) => !existingIds.has(c.chat_id));
        return [...prev, ...newChats];
      });

      setHasMoreChats(offset + chats.length < total);
      setLoadingChats(false);

      // ✅ Hide syncing indicator
      setIsSyncing(false);
    },
    [uid]
  );

  // ✅ Conversation handler - Save to SQLite
  const handleConversation = useCallback(
    async (payload) => {
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

      // console.log(`🌐 Received ${newMessages.length} messages from server`);

      setAgentData(agentData || []);
      setChatBots(chatBots || []);
      setChatInfo(chatInfo);
      setLabelData(labelsAdded);
      setChatNote(chatInfo?.chat_note);
      setCdTimer(countDownTimer);
      setPhonebookData(phonebookData);

      // ✅ Save to SQLite
      if (labelsAdded?.length > 0) {
        await DB.saveData(`labels_${uid}`, labelsAdded);
      }

      if (phonebookData?.length > 0) {
        await DB.saveData(`phonebook_${uid}`, phonebookData);
      }

      const chronologicalMessages = [...newMessages].reverse();

      if (chatInfo?.chat_id && newMessages.length > 0) {
        await DB.saveData(
          `conversation_${chatInfo.chat_id}`,
          chronologicalMessages
        );
        // console.log("💾 Saved conversation to SQLite");
      }

      // ✅ Update state
      setConversation((prev) => {
        if (offset === 0) {
          setDataSource((prevState) => ({
            ...prevState,
            conversation: "server",
          }));
          return chronologicalMessages;
        }

        const existingIds = new Set(prev.map((m) => m.metaChatId));
        const newMsgs = chronologicalMessages.filter(
          (m) => !existingIds.has(m.metaChatId)
        );
        return [...newMsgs, ...prev];
      });

      setHasMoreMessages(offset + newMessages.length < total);
      setLoadingConversation(false);

      // ✅ Hide syncing indicator
      setIsSyncing(false);
    },
    [uid]
  );

  // Socket connection setup
  useEffect(() => {
    if (!uid || !userToken) {
      // console.log("⚠️ Missing UID or token, skipping socket connection");
      return;
    }

    // console.log("🔌 Connecting to socket server...");

    const newSocket = io(SOCKET_SERVER_URL, {
      query: { token: userToken },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected");
    });

    newSocket.on("connection_ack", (data) => {
      console.log("✅ Connection acknowledged");
      setConnectionInfo(data);
    });

    newSocket.on("chat_list", handleChatList);
    newSocket.on("load_conversation", handleConversation);

    newSocket.on("message", (payload) => {
      console.log("📨 Socket message update:", payload);
    });

    // ✅ USE ASYNCSTORAGE DIRECTLY - Like web localStorage
    newSocket.on("request_update_chat_list", async (payload) => {
      // console.log("🔄 Request to update chat list:", payload);

      if (payload?.chatId) {
        const currentChatData = await AsyncStorage.getItem("currentChat");
        const parsedChat = currentChatData ? JSON.parse(currentChatData) : null;

        if (parsedChat?.chat_id === payload?.chatId) {
          // console.log("✅ Reloading conversation for current chat");

          // ✅ Show syncing indicator
          setIsSyncing(true);

          const filterData = await AsyncStorage.getItem("conversationFilters");
          const parsedFilters = filterData ? JSON.parse(filterData) : {};

          if (parsedChat) {
            newSocket.emit("message", {
              type: "load_conversation",
              payload: {
                chat: parsedChat,
                filters: parsedFilters,
              },
            });
          }
        } else {
          console.log("ℹ️ Message is for different chat");
        }
      }

      const filterData = await AsyncStorage.getItem("chatFilters");
      const parsedFilters = filterData ? JSON.parse(filterData) : {};

      newSocket.emit("message", {
        type: "get_chat_list",
        payload: parsedFilters,
      });
    });

    // ✅ USE ASYNCSTORAGE DIRECTLY - Like web localStorage
    newSocket.on("request_update_opened_chat", async () => {
      console.log("🔄 Request to update opened chat");

      // ✅ Show syncing indicator
      setIsSyncing(true);

      const filterData = await AsyncStorage.getItem("conversationFilters");
      const parsedFilters = filterData ? JSON.parse(filterData) : {};

      const currentChatData = await AsyncStorage.getItem("currentChat");
      const parsedChat = currentChatData ? JSON.parse(currentChatData) : null;

      if (parsedChat) {
        console.log("🔄 Reloading conversation");
        newSocket.emit("message", {
          type: "load_conversation",
          payload: {
            chat: parsedChat,
            filters: parsedFilters,
          },
        });
      }
    });

    newSocket.on("update_labels", async (msg) => {
      console.log("🏷️ Labels updated");
      setLabelData(msg);
      await DB.saveData(`labels_${uid}`, msg);
    });

    newSocket.on("ring", async () => {
      try {
        await notificationPlayer.play();
      } catch (error) {
        console.error("❌ Error playing notification:", error);
      }
    });

    newSocket.on("error", handleError);
    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
      handleError(err);
    });

    newSocket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });

    setSocket(newSocket);

    return () => {
      console.log("🔌 Disconnecting socket...");
      newSocket.disconnect();
    };
  }, [uid, userToken, handleChatList, handleConversation, handleError]);

  const sendToSocket = useCallback(
    (type, payload) => {
      if (!socket) {
        console.warn("⚠️ Socket not connected, cannot send:", type);
        return;
      }
      socket.emit("message", { type, payload });
    },
    [socket]
  );

  const loadChatList = useCallback(
    async (newFilters = {}, loadMore = false) => {
      setLoadingChats(true);

      const updatedFilters = {
        ...chatFilters,
        ...newFilters,
        offset: loadMore ? chatFilters.offset + chatFilters.limit : 0,
      };

      setChatFilters(updatedFilters);
      await AsyncStorage.setItem("chatFilters", JSON.stringify(updatedFilters));

      sendToSocket("get_chat_list", updatedFilters);
    },
    [chatFilters, sendToSocket]
  );

  const markChatAsRead = useCallback((id) => {
    setChatList((prevChatList) => {
      return prevChatList.map((chat) => {
        if (chat.chat_id === id || chat.id === id) {
          return { ...chat, unread_count: 0 };
        }
        return chat;
      });
    });
  }, []);

  const clearConversation = useCallback(() => {
    setConversation([]);
    setDataSource((prev) => ({ ...prev, conversation: "none" }));
  }, []);

  const clearChatInfo = useCallback(() => {
    setChatInfo(null);
  }, []);

  // ✅ Load conversation - Cache first, then server
  const loadConversation = useCallback(
    async (chat, newFilters = {}, loadMore = false) => {
      if (!loadMore) {
        setConversation([]);
        setDataSource((prev) => ({ ...prev, conversation: "loading" }));

        setChatInfo(chat);
        setCurrentChat(chat);
        await AsyncStorage.setItem("currentChat", JSON.stringify(chat));

        const cachedMessages = await DB.getData(`conversation_${chat.chat_id}`);

        if (cachedMessages && cachedMessages.length > 0) {
          // console.log(`✅ Loaded ${cachedMessages.length} cached messages`);
          setConversation(cachedMessages);
          setDataSource((prev) => ({ ...prev, conversation: "cache" }));

          // ✅ Show syncing indicator when loading from cache
          setIsSyncing(true);
        }
      }

      setLoadingConversation(true);

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
      await AsyncStorage.setItem(
        "conversationFilters",
        JSON.stringify(updatedFilters)
      );

      sendToSocket("load_conversation", {
        chat,
        filters: updatedFilters,
      });
    },
    [conversationFilters, sendToSocket, markChatAsRead]
  );

  // ✅ Initial data load from server
  useEffect(() => {
    if (socket?.connected) {
      loadChatList({}, false);
    }
  }, [socket?.connected]);

  function maskNumber(number, maskChar = "*", keepFirst = 2, keepLast = 2) {
    const mask = parseInt(userData?.mask_number) > 0 ? true : false;
    const numStr = number?.toString();

    if (!mask) {
      return numStr;
    }

    if (numStr.length <= keepFirst + keepLast) {
      return maskChar.repeat(Math.max(0, numStr.length - 1)) + numStr.slice(-1);
    }

    return (
      numStr.slice(0, keepFirst) +
      maskChar.repeat(numStr.length - keepFirst - keepLast) +
      numStr.slice(-keepLast)
    );
  }

  // ✅ Context value with all exports
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
    dataSource,
    isSyncing, // ✅ NEW: Simple true/false syncing state
    setLabelData,
    setPhonebookData,
  };

  return (
    <InboxContext.Provider value={contextValue}>
      {children}
      {agent && (
        <AgentTimeTracker socket={socket} agent={agent} userData={userData} />
      )}

      <Snackbar
        visible={error.show}
        message={error.message}
        onDismiss={() => setError({ show: false, message: "" })}
        duration={3000}
        position="bottom"
        isSuccess={false}
      />
    </InboxContext.Provider>
  );
};
