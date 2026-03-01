import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
} from "react-native";
import { useAudioPlayer, AudioModule } from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import {
  Icon,
  Typography,
  VStack,
  Dialog,
  Button,
  HStack,
} from "../../../../ui";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useGlobal } from "../../../../contexts/GlobalContext";
import { useInbox } from "../../../../contexts/InboxContext";

const { width } = Dimensions.get("window");

export default function SendAudio({ t, onSend }) {
  const { agent, chatInfo } = useInbox();
  const { apiCall, loading, uploadFile } = useGlobal();
  const { theme } = useTheme();

  // ✅ Use expo-audio's useAudioPlayer hook with proper configuration
  const [audioUri, setAudioUri] = useState(null);
  const audioPlayer = useAudioPlayer(audioUri, {
    updateInterval: 100,
    downloadFirst: true,
  });

  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isAudioModeSet, setIsAudioModeSet] = useState(false);

  // ✅ Setup audio mode on mount
  useEffect(() => {
    setupAudioMode();
  }, []);

  // ✅ Setup audio mode with proper iOS configuration
  const setupAudioMode = async () => {
    try {
      await AudioModule.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      setIsAudioModeSet(true);
    } catch (error) {
      console.error("Failed to set audio mode:", error);
    }
  };

  // ✅ Monitor playback status using the player's built-in updates
  useEffect(() => {
    if (!audioPlayer) return;

    // Update state when player properties change
    setIsPlaying(audioPlayer.playing);
    setPosition(audioPlayer.currentTime || 0);
    setDuration(audioPlayer.duration || 0);

    // Check if audio ended naturally
    if (
      audioPlayer.currentTime >= audioPlayer.duration - 0.1 &&
      audioPlayer.playing
    ) {
      // Audio finished playing
      setTimeout(() => {
        setIsPlaying(false);
      }, 100);
    }
  }, [audioPlayer.playing, audioPlayer.currentTime, audioPlayer.duration]);

  // Cleanup when preview closes
  useEffect(() => {
    if (!previewVisible) {
      if (audioPlayer && audioPlayer.playing) {
        audioPlayer.pause();
      }
      setAudioUri(null);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
    }
  }, [previewVisible]);

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const audio = result.assets[0];

      // Optional: Check audio size (e.g., max 16MB)
      if (audio.size && audio.size > 16 * 1024 * 1024) {
        Alert.alert(t("fileTooLarge"));
        return;
      }

      setSelectedAudio(audio);
      setPreviewVisible(true);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);

      await loadAudio(audio.uri);
    } catch (error) {
      console.error("Pick audio error:", error);
      Alert.alert(t("err"));
    }
  };

  const loadAudio = async (uri) => {
    try {
      // Ensure audio mode is set
      if (!isAudioModeSet) {
        await setupAudioMode();
      }

      // ✅ Set the audio URI which will automatically load in the player
      setAudioUri(uri);

      // Wait a bit for metadata to load
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Load audio error:", error);
      Alert.alert(t("err"));
    }
  };

  const handleClose = () => {
    // Pause if playing
    if (audioPlayer && audioPlayer.playing) {
      audioPlayer.pause();
    }

    setPreviewVisible(false);
    setSelectedAudio(null);
    setAudioUri(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  };

  const togglePlayPause = async () => {
    if (!audioPlayer || !audioUri) return;

    try {
      if (isPlaying) {
        // ✅ Pause in expo-audio
        audioPlayer.pause();
        setIsPlaying(false);
      } else {
        // If we're at the end, seek to beginning before playing again
        if (position >= duration - 0.1) {
          // For local files, we need to reset by reloading the URI
          const currentUri = audioUri;
          setAudioUri(null);
          setTimeout(() => {
            setAudioUri(currentUri);
            // Play after a short delay to ensure reload
            setTimeout(() => {
              if (audioPlayer) {
                audioPlayer.play();
                setIsPlaying(true);
              }
            }, 200);
          }, 50);
        } else {
          // ✅ Play in expo-audio
          audioPlayer.play();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Toggle play/pause error:", error);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + " " + sizes[i];
  };

  async function handleSend() {
    if (!selectedAudio || loading) return;

    try {
      // Pause audio before sending
      if (audioPlayer && audioPlayer.playing) {
        audioPlayer.pause();
      }

      const formData = new FormData();
      const fileName = selectedAudio.name || `audio_${Date.now()}`;

      formData.append("file", {
        uri: selectedAudio.uri,
        type: selectedAudio.mimeType || "audio/*",
        name: fileName,
      });

      formData.append("convert", "YES");
      formData.append("target", chatInfo?.origin === "qr" ? "baileys" : "meta");

      const res = await uploadFile(
        agent ? "/api/agent/return_media_url" : "/api/user/return_media_url",
        formData,
        {
          showLoading: false, // Use local loading state
          showSnackbar: true, // Show success/error messages
        }
      );

      if (res.success) {
        onSend({
          type: "audio",
          msgContext: {
            type: "audio",
            audio: { link: res.url },
          },
        });
        handleClose();
      } else {
        Alert.alert(t("err"));
      }
    } catch (error) {
      console.error("Send error:", error);
      Alert.alert(t("err"));
    }
  }

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <>
      <TouchableOpacity
        onPress={pickAudio}
        activeOpacity={0.7}
        style={[styles.button, { backgroundColor: theme.action.hover }]}
      >
        <VStack space={8} alignItems="center">
          <Icon name="musical-notes-outline" size={32} color={theme.primary} />
          <Typography variant="caption" fontWeight="500" textAlign="center">
            {t("audio")}
          </Typography>
        </VStack>
      </TouchableOpacity>

      <Dialog
        noPadding
        visible={previewVisible}
        title="Preview"
        onClose={handleClose}
        fullScreen
        darker
      >
        <View style={{ flex: 1 }}>
          {/* Audio Preview - Centered */}
          {selectedAudio && (
            <View style={styles.audioContainer}>
              <VStack space={32} alignItems="center">
                {/* Large Audio Icon with Animation */}
                <View style={styles.audioIconContainer}>
                  <View
                    style={[
                      styles.audioIconBackground,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <Icon
                      name={isPlaying ? "musical-notes" : "musical-note"}
                      size={80}
                      color="white"
                    />
                  </View>
                  {isPlaying && (
                    <View style={styles.playingIndicator}>
                      <View
                        style={[
                          styles.pulseRing,
                          { borderColor: theme.primary },
                        ]}
                      />
                    </View>
                  )}
                </View>

                {/* File Info */}
                <VStack space={8} alignItems="center" style={styles.fileInfo}>
                  <Typography
                    fontWeight="600"
                    fontSize={16}
                    textAlign="center"
                    color="white"
                    numberOfLines={2}
                    style={{ paddingHorizontal: 20 }}
                  >
                    {selectedAudio.name}
                  </Typography>
                  <HStack space={12} alignItems="center">
                    <HStack space={6} alignItems="center">
                      <Icon
                        name="time-outline"
                        size={14}
                        color="rgba(255,255,255,0.7)"
                      />
                      <Typography fontSize={14} color="rgba(255,255,255,0.7)">
                        {formatTime(duration)}
                      </Typography>
                    </HStack>
                    <Typography fontSize={14} color="rgba(255,255,255,0.5)">
                      •
                    </Typography>
                    <Typography fontSize={14} color="rgba(255,255,255,0.7)">
                      {formatFileSize(selectedAudio.size)}
                    </Typography>
                  </HStack>
                </VStack>

                {/* Audio Player Controls */}
                <View style={styles.playerContainer}>
                  <TouchableOpacity
                    onPress={togglePlayPause}
                    style={[styles.playButton, { backgroundColor: "white" }]}
                    activeOpacity={0.8}
                    disabled={!audioUri}
                  >
                    <Icon
                      name={isPlaying ? "pause" : "play"}
                      size={32}
                      color={audioUri ? theme.primary : "gray"}
                    />
                  </TouchableOpacity>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressBackground}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            backgroundColor: "white",
                            width: `${progressPercentage}%`,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.timeContainer}>
                      <Typography fontSize={12} color="rgba(255,255,255,0.9)">
                        {formatTime(position)}
                      </Typography>
                      <Typography fontSize={12} color="rgba(255,255,255,0.7)">
                        {formatTime(duration)}
                      </Typography>
                    </View>
                  </View>
                </View>
              </VStack>
            </View>
          )}

          {/* Send Button - Positioned at bottom */}
          <View style={styles.sendButtonContainer}>
            <Button
              onPress={handleSend}
              loading={loading}
              disabled={loading}
              style={styles.sendButton}
            >
              <HStack space={8} alignItems="center" justifyContent="center">
                <Icon name="send" size={20} color="white" />
                <Typography color="white" fontWeight="600" fontSize={16}>
                  {t("send") || "Send"}
                </Typography>
              </HStack>
            </Button>
          </View>
        </View>
      </Dialog>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  audioContainer: {
    flex: 1,
    width: width,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 20,
  },
  audioIconContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  audioIconBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  playingIndicator: {
    position: "absolute",
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  pulseRing: {
    width: "100%",
    height: "100%",
    borderRadius: 90,
    borderWidth: 2,
    opacity: 0.5,
  },
  fileInfo: {
    maxWidth: width - 40,
  },
  playerContainer: {
    width: width - 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  progressContainer: {
    flex: 1,
    gap: 8,
  },
  progressBackground: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  sendButtonContainer: {
    padding: 15,
  },
  sendButton: {
    width: "100%",
  },
});
