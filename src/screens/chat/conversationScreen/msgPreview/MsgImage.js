import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Directory, File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";
import { Box, Typography } from "../../../../ui";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useTranslate } from "../../../../contexts/TranslateContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MsgImage({ msg }) {
  const { t } = useTranslate();
  const { theme, colorMode } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [downloading, setDownloading] = useState(false);

  const imageUrl = msg?.msgContext?.image?.link || "";
  const caption = msg?.msgContext?.image?.caption || "";
  const isIncoming = msg?.route === "INCOMING";

  const handleDownload = async () => {
    if (!imageUrl) {
      Alert.alert("Error", "No image URL found");
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

      // Create destination directory (check if exists first)
      const destination = new Directory(Paths.cache, "images");

      // Check if directory exists, if not create it
      if (!destination.exists) {
        destination.create();
      }

      // Generate unique filename to avoid conflicts
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileExtension = imageUrl.split(".").pop().split("?")[0] || "jpg";
      const uniqueFileName = `image_${timestamp}_${randomString}.${fileExtension}`;

      // Create a File object with unique name
      const outputFile = new File(destination, uniqueFileName);

      // Download the file
      const output = await File.downloadFileAsync(imageUrl, outputFile);

      console.log("File exists:", output.exists);
      console.log("File URI:", output.uri);

      if (output.exists) {
        // Save to media library using the output URI
        const asset = await MediaLibrary.createAssetAsync(output.uri);

        // Optionally create an album
        const album = await MediaLibrary.getAlbumAsync("Downloads");
        if (album == null) {
          await MediaLibrary.createAlbumAsync("Downloads", asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }

        Alert.alert(t("success"), "Image saved to gallery");

        // Clean up the cache file after saving
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
      Alert.alert("Error", `Failed to download image: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleImageLoad = (event) => {
    const { width, height } = event.nativeEvent.source;
    setImageSize({ width, height });
    setLoaded(true);
  };

  // Calculate thumbnail dimensions
  const maxThumbnailSize = 250;
  const thumbnailStyle =
    imageSize.width && imageSize.height
      ? imageSize.width > imageSize.height
        ? {
            width: maxThumbnailSize,
            height: (maxThumbnailSize * imageSize.height) / imageSize.width,
          }
        : {
            height: maxThumbnailSize,
            width: (maxThumbnailSize * imageSize.width) / imageSize.height,
          }
      : { width: maxThumbnailSize, height: maxThumbnailSize };

  return (
    <View style={styles.container}>
      {/* Thumbnail Image */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setModalVisible(true)}
        style={styles.imageWrapper}
      >
        <View style={[styles.imageContainer, thumbnailStyle]}>
          {!loaded && (
            <View style={[styles.loader, thumbnailStyle]}>
              <ActivityIndicator
                size="large"
                color={colorMode === "dark" ? "#fff" : "#128C7E"}
              />
            </View>
          )}

          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={[styles.image, thumbnailStyle]}
              onLoad={handleImageLoad}
              resizeMode="cover"
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Caption */}
      {caption && (
        <View style={styles.captionContainer}>
          <Typography
            variant="caption"
            color={
              isIncoming
                ? theme.textPrimary
                : colorMode === "dark"
                ? "#E9EDEF"
                : "#000000"
            }
            style={styles.caption}
          >
            {caption}
          </Typography>
        </View>
      )}

      {/* Full-screen Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          {/* Download button in modal */}
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownload}
            activeOpacity={0.7}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="download-outline" size={24} color="#fff" />
            )}
          </TouchableOpacity>

          {/* Full-size image */}
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}

          {/* Caption overlay */}
          {caption && (
            <View style={styles.modalCaptionContainer}>
              <Box p={10}>
                <Typography
                  fontSize={14}
                  color="#fff"
                  style={styles.modalCaption}
                >
                  {caption}
                </Typography>
              </Box>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  imageWrapper: {
    borderRadius: 8,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  image: {
    borderRadius: 8,
  },
  loader: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
  },
  captionContainer: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  caption: {
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadButton: {
    position: "absolute",
    top: 50,
    right: 80,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  modalCaptionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 16,
  },
  modalCaption: {
    lineHeight: 20,
  },
});
