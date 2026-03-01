import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  Icon,
  Typography,
  VStack,
  Dialog,
  TextField,
  HStack,
} from "../../../../ui";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useGlobal } from "../../../../contexts/GlobalContext";
import { useInbox } from "../../../../contexts/InboxContext";

const { width } = Dimensions.get("window");

export default function SendDoc({ t, onSend }) {
  const { agent, chatInfo } = useInbox();
  const { apiCall, loading } = useGlobal();
  const { theme } = useTheme();

  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [caption, setCaption] = useState("");

  const getSupportedFormats = () => {
    return [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];
  };

  const isValidDocFormat = (mimeType) => {
    const supportedFormats = getSupportedFormats();
    return supportedFormats.includes(mimeType);
  };

  const getFileExtension = (filename) => {
    const parts = filename.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "FILE";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + " " + sizes[i];
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/msword",
          "text/plain",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const doc = result.assets[0];

      // Validate format
      if (!isValidDocFormat(doc.mimeType)) {
        Alert.alert(t("formatNotSupp"));
        return;
      }

      // Optional: Check file size (e.g., max 100MB)
      if (doc.size && doc.size > 100 * 1024 * 1024) {
        Alert.alert(t("fileTooLarge"));
        return;
      }

      setSelectedDoc(doc);
      setPreviewVisible(true);
      setCaption("");
    } catch (error) {
      Alert.alert(t("err"));
    }
  };

  const handleClose = () => {
    setPreviewVisible(false);
    setSelectedDoc(null);
    setCaption("");
  };

  async function handleSend() {
    if (!selectedDoc || loading) return;

    try {
      const formData = new FormData();
      const fileName = selectedDoc.name || `document_${Date.now()}`;

      formData.append("file", {
        uri: selectedDoc.uri,
        type: selectedDoc.mimeType,
        name: fileName,
      });

      const res = await apiCall(
        agent ? "/api/agent/return_media_url" : "/api/user/return_media_url",
        {
          method: "POST",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.success) {
        const messageData = {
          type: "document",
          msgContext: {
            type: "document",
            document: {
              link: res.url,
              filename: fileName,
              caption: caption.trim() || undefined,
            },
          },
        };

        onSend(messageData);
        handleClose();
      } else {
        Alert.alert(t("err"));
      }
    } catch (error) {
      Alert.alert(t("err"));
    }
  }

  return (
    <>
      <TouchableOpacity
        onPress={pickDocument}
        activeOpacity={0.7}
        style={[styles.button, { backgroundColor: theme.action.hover }]}
      >
        <VStack space={8} alignItems="center">
          <Icon name="document-text-outline" size={32} color={theme.primary} />
          <Typography variant="caption" fontWeight="500" textAlign="center">
            {t("document")}
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
          {/* Document Preview - Centered */}
          {selectedDoc && (
            <View style={styles.docContainer}>
              <VStack space={24} alignItems="center">
                {/* Large File Type Badge */}
                <View
                  style={[
                    styles.largeBadge,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Icon name="document-text" size={64} color="white" />
                  <View style={styles.extensionBadge}>
                    <Typography fontSize={14} fontWeight="700" color="white">
                      {getFileExtension(selectedDoc.name)}
                    </Typography>
                  </View>
                </View>

                {/* File Info */}
                <VStack space={8} alignItems="center" style={styles.fileInfo}>
                  <Typography
                    fontWeight="600"
                    fontSize={16}
                    textAlign="center"
                    color="white"
                    numberOfLines={3}
                    style={{ paddingHorizontal: 20 }}
                  >
                    {selectedDoc.name}
                  </Typography>
                  <HStack space={8} alignItems="center">
                    <Icon
                      name="document-outline"
                      size={14}
                      color="rgba(255,255,255,0.7)"
                    />
                    <Typography fontSize={14} color="rgba(255,255,255,0.7)">
                      {formatFileSize(selectedDoc.size)}
                    </Typography>
                  </HStack>
                </VStack>
              </VStack>
            </View>
          )}

          {/* Caption Input with Send Button - Positioned at bottom */}
          <View style={styles.inputContainer}>
            <TextField
              loading={loading}
              variant="whatsapp"
              placeholder={t("captionOptional") || "Add a caption..."}
              value={caption}
              onChangeText={setCaption}
              numberOfLines={3}
              maxLength={1024}
              rightIcon="send"
              rightIconPress={handleSend}
            />
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
  docContainer: {
    flex: 1,
    width: width,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  largeBadge: {
    width: 140,
    height: 140,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  extensionBadge: {
    position: "absolute",
    bottom: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fileInfo: {
    maxWidth: width - 40,
  },
  inputContainer: {
    padding: 15,
  },
});
