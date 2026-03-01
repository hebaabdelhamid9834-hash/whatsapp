import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  View,
  Platform,
  Alert,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import * as ImagePicker from "expo-image-picker";
import {
  Icon,
  Typography,
  VStack,
  Dialog,
  TextField,
  Box,
} from "../../../../ui";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useGlobal } from "../../../../contexts/GlobalContext";
import { useInbox } from "../../../../contexts/InboxContext";

const { width, height } = Dimensions.get("window");

// ✅ Allowed video formats
const ALLOWED_VIDEO_FORMATS = ["video/mp4", "video/mkv", "video/webm"];
const ALLOWED_EXTENSIONS = ["mp4", "mkv", "webm"];

export default function SendVideo({ t, onSend }) {
  const { agent } = useInbox();
  const { apiCall, loading, uploadFile } = useGlobal();
  const { theme } = useTheme();

  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [caption, setCaption] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  // Initialize video player
  const player = useVideoPlayer(selectedVideo?.uri || null, (player) => {
    player.loop = false;
    player.muted = false;
  });

  // Listen to player status changes
  useEffect(() => {
    if (!player) return;

    const subscription = player.addListener("playingChange", (newIsPlaying) => {
      setIsPlaying(newIsPlaying);
    });

    const statusSubscription = player.addListener("statusChange", (status) => {
      if (status.duration) {
        setDuration(status.duration);
      }
    });

    return () => {
      subscription.remove();
      statusSubscription.remove();
    };
  }, [player]);

  // Cleanup video when dialog closes
  useEffect(() => {
    if (!previewVisible && player) {
      player.pause();
      player.currentTime = 0;
    }
  }, [previewVisible, player]);

  // Update player source when video changes
  useEffect(() => {
    if (selectedVideo?.uri && player) {
      player.replace(selectedVideo.uri);
    }
  }, [selectedVideo?.uri]);

  // ✅ Validate video format
  const isValidVideoFormat = (uri, mimeType) => {
    // Check by MIME type if available
    if (mimeType && ALLOWED_VIDEO_FORMATS.includes(mimeType.toLowerCase())) {
      return true;
    }

    // Check by file extension
    const uriParts = uri.split(".");
    const fileExtension = uriParts[uriParts.length - 1].toLowerCase();
    return ALLOWED_EXTENSIONS.includes(fileExtension);
  };

  const pickVideo = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        t("permissionRequired") || "Permission Required",
        t("mediaLibraryPermission") ||
          "Permission to access media library is required!"
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
      videoMaxDuration: 300, // 5 minutes max (adjust as needed)
    });

    if (!result.canceled) {
      const video = result.assets[0];

      // ✅ Validate video format
      if (!isValidVideoFormat(video.uri, video.mimeType)) {
        Alert.alert(
          t("invalidFormat") || "Invalid Format",
          t("onlyMp4MkvWebm") ||
            "Only MP4, MKV, and WebM video formats are supported."
        );
        return;
      }

      // Optional: Check video size (e.g., max 50MB)
      if (video.fileSize && video.fileSize > 50 * 1024 * 1024) {
        Alert.alert(
          t("fileTooLarge") || "File Too Large",
          t("videoSizeLimit") ||
            "Video is too large. Please select a video under 50MB."
        );
        return;
      }

      setSelectedVideo(video);
      setPreviewVisible(true);
      setCaption("");
      setIsPlaying(false);
    }
  };

  const handleClose = () => {
    if (player) {
      player.pause();
      player.currentTime = 0;
    }
    setPreviewVisible(false);
    setSelectedVideo(null);
    setCaption("");
    setIsPlaying(false);
    setDuration(0);
  };

  const togglePlayPause = () => {
    if (!player) return;

    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ✅ Get proper MIME type based on extension
  const getVideoMimeType = (uri) => {
    const uriParts = uri.split(".");
    const fileExtension = uriParts[uriParts.length - 1].toLowerCase();

    switch (fileExtension) {
      case "mp4":
        return "video/mp4";
      case "mkv":
        return "video/x-matroska";
      case "webm":
        return "video/webm";
      default:
        return "video/mp4"; // fallback
    }
  };

  async function handleSend() {
    if (!selectedVideo || loading) return;

    try {
      const formData = new FormData();

      // Get file extension
      const uriParts = selectedVideo.uri.split(".");
      const fileExtension = uriParts[uriParts.length - 1].toLowerCase();

      // ✅ Double-check format before sending
      if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        Alert.alert(
          t("error") || "Error",
          t("invalidVideoFormat") || "Invalid video format"
        );
        return;
      }

      const mimeType = getVideoMimeType(selectedVideo.uri);

      formData.append("file", {
        uri: selectedVideo.uri,
        type: mimeType,
        name: `video_${Date.now()}.${fileExtension}`,
      });

      const res = await uploadFile(
        agent ? "/api/agent/return_media_url" : "/api/user/return_media_url",
        formData,
        {
          showLoading: false, // Use local loading state
          showSnackbar: true, // Show success/error messages
        }
      );

      if (res.success) {
        const mediaUrl = res.url;
        const msgContext = {
          type: "video",
          video: { link: mediaUrl, caption: caption },
        };
        setPreviewVisible(false);
        onSend({ type: "video", msgContext });
        handleClose(); // ✅ Clean up after successful send
      } else {
        Alert.alert(
          t("error") || "Error",
          res.message || t("uploadFailed") || "Failed to upload video"
        );
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      Alert.alert(
        t("error") || "Error",
        t("uploadFailed") || "Failed to upload video"
      );
    }
  }

  return (
    <>
      <TouchableOpacity
        onPress={pickVideo}
        activeOpacity={0.7}
        style={[styles.button, { backgroundColor: theme.action.hover }]}
      >
        <VStack space={8} alignItems="center">
          <Icon name="videocam-outline" size={32} color={theme.primary} />
          <Typography variant="caption" fontWeight="500" textAlign="center">
            {t("video")}
          </Typography>
        </VStack>
      </TouchableOpacity>

      <Dialog
        noPadding
        visible={previewVisible}
        title={t("preview") || "Preview Video"}
        onClose={handleClose}
        fullScreen
        darker
      >
        <View style={{ flex: 1 }}>
          {/* Caption Input with Send Button */}
          <View style={styles.inputContainer}>
            <TextField
              loading={loading}
              variant="whatsapp"
              placeholder={t("captionOptional")}
              value={caption}
              onChangeText={setCaption}
              numberOfLines={3}
              maxLength={1000}
              rightIcon="send"
              rightIconPress={handleSend}
            />
          </View>

          {/* Video Preview */}
          {selectedVideo && player && (
            <View style={styles.videoContainer}>
              <VideoView
                player={player}
                style={styles.video}
                contentFit="contain"
                nativeControls={false}
                allowsFullscreen={false}
                allowsPictureInPicture={false}
              />

              {/* Play/Pause Overlay */}
              <TouchableOpacity
                style={styles.playPauseOverlay}
                onPress={togglePlayPause}
                activeOpacity={0.7}
              >
                {!isPlaying && (
                  <View style={styles.playButton}>
                    <Icon
                      name="play"
                      size={64}
                      color="white"
                      style={{ opacity: 0.9 }}
                    />
                  </View>
                )}
              </TouchableOpacity>

              {/* Video Info Overlay */}
              {duration > 0 && (
                <View style={styles.durationBadge}>
                  <Typography
                    fontSize={12}
                    fontWeight="600"
                    color="white"
                    style={{
                      textShadowColor: "rgba(0,0,0,0.5)",
                      textShadowRadius: 4,
                    }}
                  >
                    {formatDuration(duration)}
                  </Typography>
                </View>
              )}

              {/* Format Badge */}
              <View style={styles.formatBadge}>
                <Typography
                  fontSize={11}
                  fontWeight="600"
                  color="white"
                  style={{
                    textShadowColor: "rgba(0,0,0,0.5)",
                    textShadowRadius: 4,
                  }}
                >
                  {selectedVideo.uri.split(".").pop().toUpperCase()}
                </Typography>
              </View>
            </View>
          )}
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
  videoContainer: {
    flex: 1,
    width: width,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    position: "relative",
  },
  video: {
    width: width,
    height: "100%",
  },
  playPauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  durationBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  formatBadge: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inputContainer: {
    padding: 15,
  },
});
