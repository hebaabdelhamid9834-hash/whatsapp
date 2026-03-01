// MediaComp.js
import React, { useState, useMemo } from "react";
import {
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";
import { Directory, File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import {
  Box,
  Divider,
  HStack,
  Icon,
  Typography,
  VStack,
  IconButton,
  Snackbar,
  Grid,
  Dialog,
} from "../../../../../ui";
import { useInbox } from "../../../../../contexts/InboxContext";
import { useTheme } from "../../../../../contexts/ThemeContext";
import { useTranslate } from "../../../../../contexts/TranslateContext";
import MediaPreviewDialog from "./MediaPreviewDialog";

const { width, height } = Dimensions.get("window");

export default function MediaComp() {
  const { t } = useTranslate();
  const { conversation: messages } = useInbox();
  const { theme, colorMode } = useTheme();

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
    variant: "success",
  });

  // Filter and combine all media types
  const allMedia = useMemo(() => {
    const media = [];

    messages.forEach((msg) => {
      if (msg.type === "image") {
        media.push({
          type: "image",
          url: msg?.msgContext?.image?.link,
          caption: msg?.msgContext?.image?.caption,
          timestamp: msg.timestamp,
          data: msg.msgContext.image,
        });
      } else if (msg.type === "video") {
        media.push({
          type: "video",
          url: msg?.msgContext?.video?.link,
          caption: msg?.msgContext?.video?.caption,
          thumbnail: msg?.msgContext?.video?.link,
          timestamp: msg.timestamp,
          data: msg.msgContext.video,
        });
      } else if (msg.type === "document") {
        media.push({
          type: "document",
          url: msg?.msgContext?.document?.link,
          filename: msg?.msgContext?.document?.filename,
          fileSize: msg?.msgContext?.document?.file_size,
          timestamp: msg.timestamp,
          data: msg.msgContext.document,
        });
      } else if (msg.type === "audio") {
        media.push({
          type: "audio",
          url: msg?.msgContext?.audio?.link,
          duration: msg?.msgContext?.audio?.seconds,
          timestamp: msg.timestamp,
          data: msg.msgContext.audio,
        });
      } else if (msg.type === "location") {
        media.push({
          type: "location",
          latitude: msg?.msgContext?.location?.latitude,
          longitude: msg?.msgContext?.location?.longitude,
          address: msg?.msgContext?.location?.address,
          timestamp: msg.timestamp,
          data: msg.msgContext.location,
        });
      }
    });

    return media.sort((a, b) => b.timestamp - a.timestamp);
  }, [messages]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Download Image
  const downloadImage = async (url) => {
    try {
      setDownloading(true);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        setSnackbar({
          visible: true,
          message: "Permission denied",
          variant: "error",
        });
        return;
      }

      const destination = new Directory(Paths.cache, "images");
      if (!destination.exists) {
        destination.create();
      }

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileExtension = url.split(".").pop().split("?")[0] || "jpg";
      const uniqueFileName = `image_${timestamp}_${randomString}.${fileExtension}`;

      const outputFile = new File(destination, uniqueFileName);
      const output = await File.downloadFileAsync(url, outputFile);

      if (output.exists) {
        const asset = await MediaLibrary.createAssetAsync(output.uri);
        const album = await MediaLibrary.getAlbumAsync("Downloads");
        if (album == null) {
          await MediaLibrary.createAlbumAsync("Downloads", asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }

        setSnackbar({
          visible: true,
          message: "Saved to gallery",
          variant: "success",
        });

        try {
          await output.delete();
        } catch (cleanupError) {
          console.log("Cleanup error:", cleanupError);
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      setSnackbar({
        visible: true,
        message: "Download failed",
        variant: "error",
      });
    } finally {
      setDownloading(false);
    }
  };

  // Download Video
  const downloadVideo = async (url) => {
    try {
      setDownloading(true);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        setSnackbar({
          visible: true,
          message: "Permission denied",
          variant: "error",
        });
        return;
      }

      const destination = new Directory(Paths.cache, "videos");
      if (!destination.exists) {
        destination.create();
      }

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileExtension = url.split(".").pop().split("?")[0] || "mp4";
      const uniqueFileName = `video_${timestamp}_${randomString}.${fileExtension}`;

      const outputFile = new File(destination, uniqueFileName);
      const output = await File.downloadFileAsync(url, outputFile);

      if (output.exists) {
        const asset = await MediaLibrary.createAssetAsync(output.uri);
        const album = await MediaLibrary.getAlbumAsync("Downloads");
        if (album == null) {
          await MediaLibrary.createAlbumAsync("Downloads", asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }

        setSnackbar({
          visible: true,
          message: "Saved to gallery",
          variant: "success",
        });

        try {
          await output.delete();
        } catch (cleanupError) {
          console.log("Cleanup error:", cleanupError);
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      setSnackbar({
        visible: true,
        message: "Download failed",
        variant: "error",
      });
    } finally {
      setDownloading(false);
    }
  };

  // Download Document/Audio
  const downloadFile = async (url, filename) => {
    try {
      setDownloading(true);

      const destination = new Directory(Paths.cache, "documents");
      if (!destination.exists) {
        destination.create();
      }

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileExtension = filename.split(".").pop();
      const fileNameWithoutExt = filename.replace(`.${fileExtension}`, "");
      const uniqueFileName = `${fileNameWithoutExt}_${timestamp}_${randomString}.${fileExtension}`;

      const outputFile = new File(destination, uniqueFileName);
      const output = await File.downloadFileAsync(url, outputFile);

      if (output.exists) {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(output.uri, {
            dialogTitle: `Share ${filename}`,
          });
        }

        setSnackbar({
          visible: true,
          message: "File downloaded",
          variant: "success",
        });

        try {
          await output.delete();
        } catch (cleanupError) {
          console.log("Cleanup error:", cleanupError);
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      setSnackbar({
        visible: true,
        message: "Download failed",
        variant: "error",
      });
    } finally {
      setDownloading(false);
    }
  };

  // Open location in maps
  const openLocation = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  // Get icon and color for media type
  const getMediaIcon = (item) => {
    switch (item.type) {
      case "image":
        return { icon: "image", color: "#9775fa", bg: item.url };
      case "video":
        return { icon: "play-circle", color: "#FFFFFF", bg: item.thumbnail };
      case "document":
        const ext = item.filename?.split(".").pop()?.toLowerCase();
        const docIcons = {
          pdf: { icon: "document-text", color: "#f44336" },
          doc: { icon: "document", color: "#2196f3" },
          docx: { icon: "document", color: "#2196f3" },
          xls: { icon: "grid", color: "#4caf50" },
          xlsx: { icon: "grid", color: "#4caf50" },
          ppt: { icon: "easel", color: "#ff922b" },
          pptx: { icon: "easel", color: "#ff922b" },
        };
        return docIcons[ext] || { icon: "document-attach", color: "#9e9e9e" };
      case "audio":
        return { icon: "musical-notes", color: "#00bcd4" };
      case "location":
        return { icon: "location", color: "#f44336" };
      default:
        return { icon: "document", color: "#9e9e9e" };
    }
  };

  // Render Grid Item
  const renderMediaItem = (item, index) => {
    const mediaInfo = getMediaIcon(item);
    const isImageOrVideo = item.type === "image" || item.type === "video";

    return (
      <Grid.Item key={index} xs={4}>
        <TouchableOpacity
          onPress={() => setSelectedMedia(item)}
          activeOpacity={0.8}
        >
          <Box
            width="100%"
            aspectRatio={1}
            bg={colorMode === "dark" ? "#1C1C1E" : "#F2F2F7"}
            borderRadius={8}
            overflow="hidden"
            position="relative"
          >
            {isImageOrVideo && mediaInfo.bg ? (
              <Image
                source={{ uri: mediaInfo.bg }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <Box
                flex={1}
                justifyContent="center"
                alignItems="center"
                bg={colorMode === "dark" ? "#2C2C2E" : "#E5E5EA"}
              >
                <Icon name={mediaInfo.icon} size={32} color={mediaInfo.color} />
              </Box>
            )}

            {/* Overlay for video */}
            {item.type === "video" && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                justifyContent="center"
                alignItems="center"
                bg="rgba(0, 0, 0, 0.3)"
              >
                <Box
                  width={40}
                  height={40}
                  borderRadius={20}
                  bg="rgba(0, 0, 0, 0.6)"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Icon name="play" size={20} color="#FFFFFF" />
                </Box>
              </Box>
            )}

            {/* Label for non-image/video types */}
            {!isImageOrVideo && (
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                px={8}
                py={6}
                bg="rgba(0, 0, 0, 0.6)"
              >
                <Typography
                  variant="caption"
                  color="#FFFFFF"
                  numberOfLines={1}
                  fontSize={10}
                >
                  {item.type === "document"
                    ? item.filename
                    : item.type === "audio"
                    ? formatDuration(item.duration)
                    : "Location"}
                </Typography>
              </Box>
            )}
          </Box>
        </TouchableOpacity>
      </Grid.Item>
    );
  };

  // Get dialog title
  const getDialogTitle = () => {
    if (!selectedMedia) return "";

    switch (selectedMedia.type) {
      case "image":
        return "Image";
      case "video":
        return "Video";
      case "document":
        return "Document";
      case "audio":
        return "Audio";
      case "location":
        return "Location";
      default:
        return "Media";
    }
  };

  return (
    <>
      <Box borderRadius={10} overflow="hidden" bg="action.hover">
        <VStack space={0}>
          {/* Header */}
          <Box px={16} py={12}>
            <HStack space={10} alignItems="center">
              <Icon name="images-outline" size={20} />
              <Typography variant="subtitle2" fontWeight="600">
                {t("mediaAsets")}
              </Typography>
            </HStack>
          </Box>

          <Divider />

          {/* Grid Content */}
          <Box height={400}>
            {allMedia.length > 0 ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Box p={8}>
                  <Grid.Container spacing={1}>
                    {allMedia.map((item, index) =>
                      renderMediaItem(item, index)
                    )}
                  </Grid.Container>
                </Box>
              </ScrollView>
            ) : (
              <Box flex={1} justifyContent="center" alignItems="center">
                <Icon
                  name="images-outline"
                  size={60}
                  color={
                    colorMode === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)"
                  }
                />
                <Typography
                  variant="body2"
                  color={theme.textSecondary}
                  style={{ marginTop: 12 }}
                >
                  {t("noDataAvai")}
                </Typography>
              </Box>
            )}
          </Box>
        </VStack>
      </Box>

      {/* ✅ Separate component for media preview */}
      <MediaPreviewDialog
        visible={!!selectedMedia}
        media={selectedMedia}
        onClose={() => setSelectedMedia(null)}
        onDownload={(media) => {
          if (media.type === "image") {
            downloadImage(media.url);
          } else if (media.type === "video") {
            downloadVideo(media.url);
          } else if (media.type === "document") {
            downloadFile(media.url, media.filename);
          } else if (media.type === "audio") {
            downloadFile(media.url, `audio_${Date.now()}.mp3`);
          }
        }}
        onOpenLocation={openLocation}
        formatFileSize={formatFileSize}
        formatDuration={formatDuration}
        downloading={downloading}
      />

      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        variant={snackbar.variant}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        position="bottom"
      />
    </>
  );
}
