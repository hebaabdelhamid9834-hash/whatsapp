// MediaPreviewDialog.js
import React, { useState, useEffect } from "react";
import {
  Image,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useAudioPlayer } from "expo-audio";
import { Ionicons } from "@expo/vector-icons";
import {
  Box,
  Button,
  Dialog,
  HStack,
  Typography,
  VStack,
} from "../../../../../ui";
import { useTheme } from "../../../../../contexts/ThemeContext";
import { useTranslate } from "../../../../../contexts/TranslateContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MediaPreviewDialog({
  visible,
  media,
  onClose,
  onDownload,
  onOpenLocation,
  formatFileSize,
  downloading,
}) {
  const { theme, colorMode } = useTheme();
  const { t } = useTranslate();
  const [audioPlaying, setAudioPlaying] = useState(false);

  // ✅ ALWAYS call hooks at top level
  const videoPlayer = useVideoPlayer(
    media?.type === "video" && media?.url ? media.url : null,
    (player) => {
      if (player) {
        player.loop = false;
      }
    }
  );

  const audioPlayer = useAudioPlayer(
    media?.type === "audio" && media?.url ? { uri: media.url } : null
  );

  // ✅ Reset video when dialog opens/closes - WITH NULL CHECK
  useEffect(() => {
    if (visible && media?.type === "video") {
      try {
        if (videoPlayer && videoPlayer.playing) {
          videoPlayer.pause();
        }
      } catch (error) {
        console.log(
          "Video player pause error (safe to ignore):",
          error.message
        );
      }
    }
  }, [visible, media]);

  // ✅ Cleanup audio on unmount - WITH NULL CHECK
  useEffect(() => {
    return () => {
      try {
        if (audioPlayer && audioPlayer.playing) {
          audioPlayer.pause();
        }
      } catch (error) {
        console.log(
          "Audio player cleanup error (safe to ignore):",
          error.message
        );
      }
    };
  }, []);

  // ✅ Reset audio playing state when media changes
  useEffect(() => {
    setAudioPlaying(false);
  }, [media]);

  const handleAudioToggle = () => {
    try {
      if (audioPlayer) {
        if (audioPlaying) {
          audioPlayer.pause();
          setAudioPlaying(false);
        } else {
          audioPlayer.play();
          setAudioPlaying(true);
        }
      }
    } catch (error) {
      console.error("Audio toggle error:", error);
      setAudioPlaying(false);
    }
  };

  const handleDownload = () => {
    if (media?.type === "location") {
      onOpenLocation(media.latitude, media.longitude);
    } else {
      onDownload(media);
    }
  };

  // Get dialog title based on media type
  const getDialogTitle = () => {
    switch (media?.type) {
      case "image":
        return t("preview");
      case "video":
        return t("preview");
      case "document":
        return t("preview");
      case "audio":
        return t("preview");
      case "location":
        return t("preview");
      default:
        return t("preview");
    }
  };

  const renderContent = () => {
    if (!media) return null;

    switch (media.type) {
      case "image":
        return (
          <VStack gap={16}>
            {/* Image Preview */}
            <Box
              borderRadius={12}
              overflow="hidden"
              bg={"action.hover"}
              style={{ height: SCREEN_HEIGHT * 0.5 }}
            >
              <Image
                source={{ uri: media.url }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            </Box>

            {/* Caption */}
            {media.caption && (
              <Box bg={"action.hover"} p={12} borderRadius={8}>
                <Typography variant="body2" color={theme.textSecondary}>
                  {media.caption}
                </Typography>
              </Box>
            )}

            {/* Download Button */}
            <Button
              onPress={handleDownload}
              variant="text"
              disabled={downloading}
            >
              {downloading ? t("loading") : t("download")}
            </Button>
          </VStack>
        );

      case "video":
        return (
          <VStack gap={16}>
            {/* Video Preview */}
            <Box
              borderRadius={12}
              overflow="hidden"
              bg={"action.hover"}
              style={{ height: SCREEN_HEIGHT * 0.5 }}
            >
              {videoPlayer && (
                <VideoView
                  player={videoPlayer}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="contain"
                  nativeControls
                />
              )}
            </Box>

            {/* Caption */}
            {media.caption && (
              <Box bg={"action.hover"} p={12} borderRadius={8}>
                <Typography variant="body2" color={theme.textSecondary}>
                  {media.caption}
                </Typography>
              </Box>
            )}

            {/* Download Button */}
            <Button
              onPress={handleDownload}
              variant="text"
              disabled={downloading}
            >
              {downloading ? t("loading") : t("download")}
            </Button>
          </VStack>
        );

      case "document":
        const fileExt = media.filename?.split(".").pop()?.toUpperCase();
        return (
          <VStack gap={16} alignItems="center">
            {/* Document Icon */}
            <Box
              width={120}
              height={120}
              borderRadius={60}
              bg={"action.hover"}
              justifyContent="center"
              alignItems="center"
            >
              <Ionicons name="document-text" size={60} color={theme.primary} />
            </Box>

            {/* File Info */}
            <VStack gap={4} alignItems="center">
              <Typography
                variant="h6"
                textAlign="center"
                numberOfLines={2}
                px={16}
              >
                {media.filename}
              </Typography>
              <Typography variant="body2" color={theme.textSecondary}>
                {fileExt} • {formatFileSize(media.fileSize)}
              </Typography>
            </VStack>

            {/* Download Button */}
            <Button
              onPress={handleDownload}
              variant="text"
              disabled={downloading}
            >
              {downloading ? t("loading") : t("download")}
            </Button>
          </VStack>
        );

      case "audio":
        return (
          <VStack gap={16} alignItems="center">
            {/* Audio Icon */}
            <Box
              width={120}
              height={120}
              borderRadius={60}
              bg={"action.hover"}
              justifyContent="center"
              alignItems="center"
            >
              <Ionicons name="musical-notes" size={60} color={theme.primary} />
            </Box>

            {/* Audio Info */}
            <VStack gap={4} alignItems="center">
              <Typography variant="h6">{t("audrioMsg")}</Typography>
            </VStack>

            {/* Play/Pause Button */}
            <TouchableOpacity
              onPress={handleAudioToggle}
              style={[
                styles.audioPlayButton,
                { backgroundColor: theme.primary },
              ]}
              activeOpacity={0.8}
              disabled={!audioPlayer}
            >
              <Ionicons
                name={audioPlaying ? "pause" : "play"}
                size={32}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            {/* Download Button */}
            <Button
              onPress={handleDownload}
              variant="text"
              disabled={downloading}
            >
              {downloading ? t("loading") : t("download")}
            </Button>
          </VStack>
        );

      case "location":
        return (
          <VStack gap={16} alignItems="center">
            {/* Location Icon */}
            <Box
              width={120}
              height={120}
              borderRadius={60}
              bg={"action.hover"}
              justifyContent="center"
              alignItems="center"
            >
              <Ionicons name="location" size={60} color="#f44336" />
            </Box>

            {/* Location Info */}
            <VStack gap={4} alignItems="center" px={16}>
              <Typography variant="h6" textAlign="center">
                {t("location")}
              </Typography>
              {media.address && (
                <Typography
                  variant="body2"
                  color={theme.textSecondary}
                  textAlign="center"
                >
                  {media.address}
                </Typography>
              )}
              <Typography variant="caption" color={theme.textSecondary}>
                {media.latitude}, {media.longitude}
              </Typography>
            </VStack>

            {/* Open in Maps Button */}
            <Button
              onPress={() => onOpenLocation(media.latitude, media.longitude)}
              variant="text"
            >
              {t("openLocation")}
            </Button>
          </VStack>
        );

      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <Dialog
      fullScreen
      position="bottom"
      visible={visible}
      onClose={onClose}
      title={getDialogTitle()}
      darker
    >
      <StatusBar
        barStyle={colorMode === "dark" ? "light-content" : "dark-content"}
      />

      {/* Content - Scrollable */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: SCREEN_HEIGHT * 0.7 }}
      >
        <Box py={16}>{renderContent()}</Box>
      </ScrollView>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  audioPlayButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
});
