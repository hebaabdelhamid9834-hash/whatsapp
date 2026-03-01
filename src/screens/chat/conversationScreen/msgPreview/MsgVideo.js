import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Directory, File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useVideoPlayer, VideoView } from "expo-video";
import { Typography } from "../../../../ui";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useTranslate } from "../../../../contexts/TranslateContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function MsgVideo({ msg }) {
  const { t } = useTranslate();
  const { theme, colorMode } = useTheme();

  const videoUrl = msg?.msgContext?.video?.link || "";
  const caption = msg?.msgContext?.video?.caption || "";
  const isIncoming = msg?.route === "INCOMING";

  const [downloading, setDownloading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // ✅ Track loading state

  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = true;
    player.pause();
  });

  // ✅ Listen to player state changes
  useEffect(() => {
    const playingSubscription = player.addListener(
      "playingChange",
      (newStatus) => {
        setIsPlaying(newStatus.isPlaying);
      }
    );

    // ✅ Listen to status changes (loading, ready, error)
    const statusSubscription = player.addListener("statusChange", (status) => {
      if (status.status === "readyToPlay") {
        setIsLoading(false);
      } else if (status.status === "loading") {
        setIsLoading(true);
      } else if (status.status === "error") {
        setIsLoading(false);
        Alert.alert("Error", "Failed to load video");
      }
    });

    return () => {
      playingSubscription.remove();
      statusSubscription.remove();
    };
  }, [player]);

  const handleDownload = async () => {
    if (!videoUrl) {
      Alert.alert("Error", "No video URL found");
      return;
    }

    try {
      setDownloading(true);

      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("grantPre"), t("alloPerToDown"));
        setDownloading(false);
        return;
      }

      const destination = new Directory(Paths.cache, "videos");
      if (!destination.exists) {
        await destination.create();
      }

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileExtension = videoUrl.split(".").pop().split("?")[0] || "mp4";
      const uniqueFileName = `video_${timestamp}_${randomString}.${fileExtension}`;

      const outputFile = new File(destination, uniqueFileName);
      const output = await File.downloadFileAsync(videoUrl, outputFile);

      if (output.exists) {
        const asset = await MediaLibrary.createAssetAsync(output.uri);

        const album = await MediaLibrary.getAlbumAsync("Downloads");
        if (album == null) {
          await MediaLibrary.createAlbumAsync("Downloads", asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }

        Alert.alert(t("success"), "Video saved to gallery");

        try {
          await output.delete();
        } catch (cleanupError) {
          console.log("Cleanup error (non-critical):", cleanupError);
        }
      } else {
        throw new Error("Download failed – file does not exist");
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", `Failed to download video: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View collapsable={false} style={styles.container}>
      <View style={styles.videoContainer}>
        <VideoView
          style={styles.video}
          player={player}
          allowsFullscreen
          allowsPictureInPicture
          nativeControls={false}
        />

        {/* ✅ Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Typography style={styles.loadingText} color="#fff">
              {t("loading")}
            </Typography>
          </View>
        )}

        {/* Custom Play/Pause Button - Only show when loaded */}
        {!isLoading && (
          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayPause}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={40}
              color="#fff"
            />
          </TouchableOpacity>
        )}

        {/* Floating Download Button - Only show when loaded */}
        {!isLoading && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownload}
            disabled={downloading}
            activeOpacity={0.8}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="download-outline" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {caption ? (
        <Typography
          variant="caption"
          style={styles.caption}
          color={
            isIncoming
              ? theme.textPrimary
              : colorMode === "dark"
              ? "#E9EDEF"
              : "#000"
          }
        >
          {caption}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 4 },
  videoContainer: {
    width: 250,
    height: 250,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  video: { width: "100%", height: "100%" },
  loadingContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  playButton: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 25,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  caption: { marginTop: 6, lineHeight: 20 },
});
