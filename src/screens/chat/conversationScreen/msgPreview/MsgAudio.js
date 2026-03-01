import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import { Directory, File, Paths } from "expo-file-system";
import { Typography } from "../../../../ui";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useGlobal } from "../../../../contexts/GlobalContext";
import { useTranslate } from "../../../../contexts/TranslateContext";
import { useInbox } from "../../../../contexts/InboxContext";

export default function MsgAudio({ msg }) {
  const { agent } = useInbox();
  const { t } = useTranslate();
  const { colorMode } = useTheme();
  const { apiCall } = useGlobal();

  const [audioUrl, setAudioUrl] = useState(msg?.msgContext?.audio?.link || "");
  const [isConverting, setIsConverting] = useState(false);
  const [hasConverted, setHasConverted] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const isIncoming = msg?.route === "INCOMING";

  // Check if URL ends with .mp3
  const isMP3 = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith(".mp3");
  };

  async function convertAudio() {
    if (hasConverted || isConverting) return;

    try {
      setIsConverting(true);
      const res = await apiCall(
        agent ? "/api/agent/convert_audio" : "/api/user/convert_audio",
        {
          method: "POST",
          data: {
            msgId: msg.id,
            audioUrl: msg?.msgContext?.audio?.link,
          },
        }
      );

      if (res.success && res.newUrl) {
        setAudioUrl(res.newUrl);
        setHasConverted(true);
        setPlayerKey((prev) => prev + 1);
      } else {
        Alert.alert(t("err"));
      }
    } catch (error) {
      console.error("Error converting audio:", error);
      Alert.alert(t("err"));
    } finally {
      setIsConverting(false);
    }
  }

  // Create audio player
  const player = useAudioPlayer(audioUrl ? { uri: audioUrl } : null, [
    playerKey,
  ]);
  const status = useAudioPlayerStatus(player);

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Check if audio URL exists
  if (!audioUrl) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isIncoming
              ? colorMode === "dark"
                ? "#1F2C34"
                : "#FFFFFF"
              : colorMode === "dark"
              ? "#005C4B"
              : "#DCF8C6",
          },
        ]}
      >
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color="#999" />
          <Typography fontSize={11} color="#999" style={{ marginLeft: 6 }}>
            {t("unavailable")}
          </Typography>
        </View>
      </View>
    );
  }

  // Format time in MM:SS
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Check if audio has finished playing
  const isFinished =
    status.duration > 0 && Math.abs(status.currentTime - status.duration) < 0.5;

  // Toggle play/pause
  const togglePlayPause = async () => {
    // Check if audio needs conversion first
    if (!isMP3(audioUrl) && !hasConverted && !isConverting) {
      await convertAudio();
      return;
    }

    if (loadError) {
      handleOpenInBrowser();
      return;
    }

    try {
      setIsLoading(true);

      if (status.playing) {
        await player.pause();
      } else {
        if (isFinished || status.currentTime >= status.duration - 0.1) {
          await player.seekTo(0);
        }
        await player.play();
      }
    } catch (error) {
      console.error("Error toggling play/pause:", error);
      setLoadError(true);
      Alert.alert(
        "Audio Error",
        "This audio format is not supported. Open in browser?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open", onPress: () => handleOpenInBrowser() },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Open audio in browser
  const handleOpenInBrowser = async () => {
    try {
      const supported = await Linking.canOpenURL(audioUrl);
      if (supported) {
        await Linking.openURL(audioUrl);
      } else {
        Alert.alert(t("err"), "Cannot open URL");
      }
    } catch (error) {
      console.error("Error opening URL:", error);
      Alert.alert(t("err"), "Failed to open");
    }
  };

  // Download audio
  const handleDownload = async (e) => {
    if (!audioUrl) {
      Alert.alert("Error", "Audio URL not found");
      return;
    }

    try {
      setDownloading(true);

      let urlToDownload = audioUrl;

      // Convert if needed
      if (!isMP3(audioUrl) && !hasConverted) {
        await convertAudio();
        if (!hasConverted) {
          setDownloading(false);
          return;
        }
        urlToDownload = audioUrl;
      }

      // Create destination directory
      const destination = new Directory(Paths.cache, "audio");

      // Check if directory exists, if not create it
      if (!destination.exists) {
        destination.create();
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const uniqueFileName = `audio_${timestamp}_${randomString}.mp3`;

      // Create a File object
      const outputFile = new File(destination, uniqueFileName);

      // Download the file
      const output = await File.downloadFileAsync(urlToDownload, outputFile);

      if (output.exists) {
        // Check if sharing is available
        const canShare = await Sharing.isAvailableAsync();

        if (canShare) {
          // Share the file
          await Sharing.shareAsync(output.uri, {
            mimeType: "audio/mpeg",
            dialogTitle: "Share Audio",
            UTI: "public.mp3",
          });
        } else {
          Alert.alert("Success", "Audio downloaded successfully");
        }

        // Clean up the cache file after sharing
        try {
          await output.delete();
        } catch (cleanupError) {
          console.log("Cleanup error (non-critical):", cleanupError);
        }
      } else {
        throw new Error("Download failed - file does not exist");
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", `Failed to download audio: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const duration = status.duration || 0;
  const position = status.currentTime || 0;
  const isPlaying = status.playing;

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  const trackColor = isIncoming
    ? colorMode === "dark"
      ? "#06CF9C"
      : "#09D261"
    : colorMode === "dark"
    ? "#00A884"
    : "#128C7E";

  const bgTrackColor =
    colorMode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";

  const textColor = isIncoming
    ? colorMode === "dark"
      ? "#AEBAC1"
      : "#667781"
    : colorMode === "dark"
    ? "#D1D7DB"
    : "#667781";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isIncoming
            ? colorMode === "dark"
              ? "#1F2C34"
              : "#FFFFFF"
            : colorMode === "dark"
            ? "#005C4B"
            : "#DCF8C6",
        },
      ]}
    >
      <View style={styles.mainRow}>
        {/* Play/Pause Button */}
        <TouchableOpacity
          onPress={togglePlayPause}
          disabled={isLoading || isConverting}
          style={[styles.playButton, { backgroundColor: trackColor }]}
          activeOpacity={0.7}
        >
          {isLoading || isConverting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : loadError ? (
            <Ionicons name="open-outline" size={20} color="#fff" />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={20}
              color="#fff"
              style={{ marginLeft: isPlaying ? 0 : 2 }}
            />
          )}
        </TouchableOpacity>

        {/* Audio Info */}
        <View style={styles.contentContainer}>
          {/* Progress Bar */}
          <View style={[styles.progressBar, { backgroundColor: bgTrackColor }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: trackColor,
                },
              ]}
            />
          </View>

          {/* Time Display */}
          <View style={styles.timeContainer}>
            <Typography fontSize={11} color={textColor}>
              {loadError
                ? "---"
                : isPlaying
                ? formatTime(position)
                : formatTime(duration)}
            </Typography>
          </View>
        </View>

        {/* Download Button */}
        <TouchableOpacity
          onPress={handleDownload}
          style={styles.downloadBtn}
          disabled={downloading || isConverting}
        >
          {downloading ? (
            <ActivityIndicator size="small" color={textColor} />
          ) : (
            <Ionicons name="download-outline" size={20} color={textColor} />
          )}
        </TouchableOpacity>
      </View>

      {/* Error message */}
      {loadError && (
        <View style={styles.errorMessageContainer}>
          <Typography fontSize={10} color={textColor}>
            Tap to open in browser
          </Typography>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 250,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  contentContainer: {
    flex: 1,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 1.5,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  downloadBtn: {
    padding: 6,
    marginLeft: 8,
  },
  errorMessageContainer: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
});
