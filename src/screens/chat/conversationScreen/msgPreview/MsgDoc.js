import React, { useState } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import { Directory, File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useTheme } from "../../../../contexts/ThemeContext";
import { HStack, VStack, Box, Typography } from "../../../../ui";

const MsgDoc = ({ msg }) => {
  const [downloading, setDownloading] = useState(false);
  const { theme, colorMode } = useTheme();

  const documentUrl = msg?.msgContext?.document?.link;
  const filename =
    msg?.msgContext?.document?.filename ||
    msg?.filename ||
    documentUrl?.split("/").pop() ||
    "Document";

  const rawFileSize =
    msg?.msgContext?.document?.fileSize ||
    msg?.fileSize ||
    msg?.document?.fileSize;

  const fileSize = rawFileSize
    ? rawFileSize >= 1024 * 1024
      ? `${(rawFileSize / (1024 * 1024)).toFixed(2)} MB`
      : `${(rawFileSize / 1024).toFixed(2)} KB`
    : null;

  const caption = msg?.msgContext?.document?.caption || msg?.caption;

  const handleDownload = async (e) => {
    e.stopPropagation();

    if (!documentUrl) {
      Alert.alert("Error", "Document URL not found");
      return;
    }

    try {
      setDownloading(true);

      // Create destination directory
      const destination = new Directory(Paths.cache, "documents");

      // Check if directory exists, if not create it
      if (!destination.exists) {
        destination.create();
      }

      // Generate unique filename to avoid conflicts
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);

      // Extract file extension from original filename
      const fileExtension = filename.split(".").pop();
      const fileNameWithoutExt = filename.replace(`.${fileExtension}`, "");

      // Create unique filename
      const uniqueFileName = `${fileNameWithoutExt}_${timestamp}_${randomString}.${fileExtension}`;

      // Create a File object with unique name
      const outputFile = new File(destination, uniqueFileName);

      // Download the file
      const output = await File.downloadFileAsync(documentUrl, outputFile);

      console.log("File exists:", output.exists);
      console.log("File URI:", output.uri);

      if (output.exists) {
        // Check if sharing is available
        const canShare = await Sharing.isAvailableAsync();

        if (canShare) {
          // Share the file
          await Sharing.shareAsync(output.uri, {
            mimeType: getMimeType(fileExtension),
            dialogTitle: `Share ${filename}`,
            UTI: getUTI(fileExtension),
          });
        } else {
          // If sharing not available, try to save to media library (for images/videos)
          const ext = fileExtension.toLowerCase();
          if (
            [
              "jpg",
              "jpeg",
              "png",
              "gif",
              "bmp",
              "webp",
              "mp4",
              "mov",
              "avi",
            ].includes(ext)
          ) {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === "granted") {
              const asset = await MediaLibrary.createAssetAsync(output.uri);
              const album = await MediaLibrary.getAlbumAsync("Downloads");
              if (album == null) {
                await MediaLibrary.createAlbumAsync("Downloads", asset, false);
              } else {
                await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
              }
              Alert.alert("Success", "File saved to gallery");
            } else {
              Alert.alert("Success", "File downloaded successfully");
            }
          } else {
            Alert.alert("Success", "File downloaded successfully");
          }
        }

        // Clean up the cache file after sharing/saving
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
      Alert.alert("Error", `Failed to download file: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  // Helper function to get MIME type based on file extension
  const getMimeType = (extension) => {
    const mimeTypes = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      zip: "application/zip",
      rar: "application/x-rar-compressed",
      txt: "text/plain",
      mp4: "video/mp4",
      mp3: "audio/mpeg",
    };
    return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
  };

  // Helper function to get UTI (Uniform Type Identifier) for iOS
  const getUTI = (extension) => {
    const utiMap = {
      pdf: "com.adobe.pdf",
      doc: "com.microsoft.word.doc",
      docx: "org.openxmlformats.wordprocessingml.document",
      xls: "com.microsoft.excel.xls",
      xlsx: "org.openxmlformats.spreadsheetml.sheet",
      ppt: "com.microsoft.powerpoint.ppt",
      pptx: "org.openxmlformats.presentationml.presentation",
      jpg: "public.jpeg",
      jpeg: "public.jpeg",
      png: "public.png",
      gif: "com.compuserve.gif",
      zip: "public.zip-archive",
      txt: "public.plain-text",
      mp4: "public.mpeg-4",
      mp3: "public.mp3",
    };
    return utiMap[extension.toLowerCase()] || "public.data";
  };

  const getFileInfo = () => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    const iconMap = {
      pdf: { icon: "document-text", color: "#f44336" },
      doc: { icon: "document", color: "#2196f3" },
      docx: { icon: "document", color: "#2196f3" },
      xls: { icon: "grid", color: "#4caf50" },
      xlsx: { icon: "grid", color: "#4caf50" },
      ppt: { icon: "easel", color: "#ff922b" },
      pptx: { icon: "easel", color: "#ff922b" },
      jpg: { icon: "image", color: "#9775fa" },
      jpeg: { icon: "image", color: "#9775fa" },
      png: { icon: "image", color: "#9775fa" },
      zip: { icon: "archive", color: "#fab005" },
      rar: { icon: "archive", color: "#fab005" },
    };
    return iconMap[ext] || { icon: "document-attach", color: "#9e9e9e" };
  };

  const fileInfo = getFileInfo();
  const fileExt = filename?.split(".").pop()?.toUpperCase() || "FILE";

  return (
    <VStack space={0} style={styles.wrapper}>
      <Box style={styles.container}>
        <Box bg="action.hover" style={styles.iconContainer}>
          <Ionicons name={fileInfo.icon} size={28} color={fileInfo.color} />
        </Box>

        <VStack space={4} style={{ flex: 1 }}>
          <Typography variant="body2" fontWeight="500" numberOfLines={2}>
            {filename}
          </Typography>

          <HStack space={6} alignItems="center">
            <Typography variant="caption" color={theme.textSecondary}>
              {fileExt}
            </Typography>
            {fileSize && (
              <>
                <Box
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: 1.5,
                    backgroundColor: theme.textSecondary,
                    opacity: 0.6,
                  }}
                />
                <Typography variant="caption" color={theme.textSecondary}>
                  {fileSize}
                </Typography>
              </>
            )}
          </HStack>
        </VStack>

        <TouchableOpacity
          onPress={handleDownload}
          style={styles.downloadBtn}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator size="small" color={theme.textSecondary} />
          ) : (
            <Ionicons
              name="download-outline"
              size={20}
              color={theme.textSecondary}
            />
          )}
        </TouchableOpacity>
      </Box>

      {caption && (
        <Box style={styles.captionBox}>
          <Typography variant="caption" selectable>
            {caption}
          </Typography>
        </Box>
      )}
    </VStack>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    minWidth: 250,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadBtn: {
    padding: 6,
  },
  captionBox: {
    paddingVertical: 8,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
});

export default MsgDoc;
