import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  Vibration,
  Platform,
  Alert,
  Linking,
  StyleSheet,
} from "react-native";
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync, // ✅ Import directly from expo-audio
} from "expo-audio";
import { Icon, Typography } from "../../../../ui";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useGlobal } from "../../../../contexts/GlobalContext";
import { useInbox } from "../../../../contexts/InboxContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RecordAudio({ onSend }) {
  const { chatInfo, agent } = useInbox();
  const { theme } = useTheme();
  const { apiCall } = useGlobal();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);
  const [isPrepared, setIsPrepared] = useState(false);

  // Create audio recorder instance
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  const longPressTimer = useRef(null);

  useEffect(() => {
    setupAudio();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      if (recorderState.isRecording) {
        audioRecorder.stop().catch(() => {});
      }
    };
  }, []);

  const setupAudio = async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        setHasPermission(false);
        return;
      }

      setHasPermission(true);

      // ✅ Set audio mode FIRST, before preparing
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      // ✅ Then prepare the recorder
      await audioRecorder?.prepareToRecordAsync();
      setIsPrepared(true);
    } catch (error) {
      console.error("Failed to setup audio:", error);
      setHasPermission(false);
      setIsPrepared(false); // ✅ Reset prepared state on error
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert(
        "Permission Required",
        "Please grant microphone permission to record voice messages.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
      return;
    }

    try {
      // ✅ Always set audio mode first
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      // ✅ If not prepared OR previous recording was stopped, prepare again
      if (!isPrepared || !recorderState.canRecord) {
        await audioRecorder?.prepareToRecordAsync();
        setIsPrepared(true);
      }

      // ✅ Now start recording
      await audioRecorder.record();

      setIsRecording(true);
      setRecordingDuration(0);

      Vibration.vibrate(50);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      startPulseAnimation();
    } catch (error) {
      console.error("Failed to start recording:", error);

      // ✅ Reset state on error
      setIsRecording(false);
      setIsPrepared(false);

      Alert.alert(
        "Recording Error",
        "Could not start recording. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const stopRecording = async () => {
    if (!recorderState.isRecording) return;

    try {
      setIsRecording(false);
      clearInterval(timerRef.current);

      // Stop recording first
      await audioRecorder.stop();

      // ✅ Get URI from the recorder's uri property
      const uri = audioRecorder.uri;

      // Reset audio mode to playback mode
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      if (uri) {
        await uploadAndSend(uri);
      } else {
        console.error("No URI available after recording");
        Alert.alert("Error", "Recording failed - no file created");
      }

      setRecordingDuration(0);
      setRecordedUri(null);

      // ✅ Re-prepare for next recording
      try {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
        await audioRecorder?.prepareToRecordAsync();
        setIsPrepared(true);
      } catch (prepError) {
        console.log("Failed to re-prepare recorder:", prepError);
        setIsPrepared(false);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording");
      setIsPrepared(false);
    }
  };

  const cancelRecording = async () => {
    if (!recorderState.isRecording) return;

    try {
      setIsRecording(false);
      clearInterval(timerRef.current);

      // Stop and discard recording
      await audioRecorder.stop();

      // Reset audio mode
      await setAudioModeAsync({
        allowsRecording: false, // ✅ Fixed
        playsInSilentMode: true, // ✅ Fixed
      });

      setRecordingDuration(0);
      setRecordedUri(null);
      setIsPrepared(false);

      Vibration.vibrate(50);
    } catch (error) {
      console.error("Failed to cancel recording:", error);
    }
  };

  const uploadAndSend = async (uri) => {
    try {
      const isQR = chatInfo?.origin === "qr";
      const fileName = `voice_${Date.now()}.m4a`;

      const formData = new FormData();

      // ✅ Proper file object
      const fileObj = {
        uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
        type: "audio/m4a",
        name: fileName,
      };

      console.log("File object:", fileObj);
      formData.append("file", fileObj);

      if (isQR) {
        formData.append("target", "baileys");
        formData.append("convert", "YES");
      } else {
        formData.append("convert", "YES");
      }

      // ✅ Use your apiCall function
      const response = await apiCall(
        agent ? "/api/agent/return_media_url" : "/api/user/return_media_url",
        {
          method: "POST",
          data: formData,
          // No need to set headers - apiCall handles it
        }
      );

      if (!response?.success) {
        throw new Error(response?.message || "Upload failed");
      }

      const msgContext = {
        type: "audio",
        audio: {
          link: response.url,
          caption: "",
          duration: recordingDuration,
          mime_type: response.converted ? "audio/aac" : "audio/m4a",
        },
      };

      onSend({
        type: "audio",
        msgContext: msgContext,
      });
    } catch (error) {
      console.error("Failed to upload voice message:", error);
      Alert.alert("Error", "Failed to send voice message");
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handlePressIn = () => {
    longPressTimer.current = setTimeout(() => {
      startRecording();
    }, 200);
  };

  const handlePressOut = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (isRecording) {
      stopRecording();
    }
  };

  // Recording state - shows timer + cancel + send
  if (isRecording) {
    return (
      <View style={styles.recordingContainer}>
        {/* Cancel button */}
        <TouchableOpacity
          onPress={cancelRecording}
          style={styles.cancelButton}
          activeOpacity={0.7}
        >
          <Icon
            name="close-circle"
            size={20}
            color={theme.error || "#FF0000"}
          />
        </TouchableOpacity>

        {/* Timer with pulsing dot */}
        <View style={styles.timerContainer}>
          <Animated.View
            style={[
              styles.recordingDot,
              {
                backgroundColor: theme.error || "#FF0000",
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Typography
            fontSize={13}
            color={theme.textPrimary}
            fontWeight="600"
            style={{ marginLeft: 6 }}
          >
            {formatTime(recordingDuration)}
          </Typography>
        </View>

        {/* Send button */}
        <TouchableOpacity
          onPress={stopRecording}
          style={[styles.sendButton, { backgroundColor: theme.primary }]}
          activeOpacity={0.8}
        >
          <Icon name="send" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  }

  // Default mic button - hold to record
  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!hasPermission}
      activeOpacity={0.7}
      style={styles.micButton}
    >
      <Icon
        size={20}
        name="mic"
        color={hasPermission ? theme.primary : theme.textDisabled}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  micButton: {
    padding: 0,
  },
  recordingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cancelButton: {
    // padding: 2,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  recordingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sendButton: {
    width: 23,
    height: 23,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
