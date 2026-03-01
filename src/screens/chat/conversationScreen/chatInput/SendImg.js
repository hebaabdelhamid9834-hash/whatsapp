import React, { useState } from "react";
import { Image, StyleSheet, Dimensions, View } from "react-native";
import { Icon, Typography, VStack, Dialog, TextField } from "../../../../ui";
import { TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useGlobal } from "../../../../contexts/GlobalContext";
import { useInbox } from "../../../../contexts/InboxContext";

const { width, height } = Dimensions.get("window");

export default function SendImg({ t, onSend }) {
  const { agent, chatInfo } = useInbox();
  const { showSnack, uploadFile } = useGlobal(); // ✅ Use uploadFile instead of apiCall
  const { theme } = useTheme();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert(t("grantPre"));
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [],
          { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
        );

        setSelectedImage(manipulatedImage);
        setPreviewVisible(true);
        setCaption("");
      } catch (error) {
        console.error("Error converting image:", error);
        alert("Failed to process image");
      }
    }
  };

  const handleClose = () => {
    setPreviewVisible(false);
    setSelectedImage(null);
    setCaption("");
  };

  async function handleSend() {
    if (!selectedImage) {
      showSnack("No image selected", false);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: selectedImage.uri,
        type: "image/jpeg",
        name: `image_${Date.now()}.jpg`,
      });

      // ✅ Use uploadFile instead of apiCall
      const res = await uploadFile(
        agent ? "/api/agent/return_media_url" : "/api/user/return_media_url",
        formData,
        {
          showLoading: false, // Use local loading state
          showSnackbar: true, // Show success/error messages
        }
      );

      setUploading(false);

      if (res.success) {
        const mediaUrl = res.url;
        const msgContext = {
          type: "image",
          image: { link: mediaUrl, caption: caption },
        };
        setPreviewVisible(false);
        setSelectedImage(null);
        setCaption("");
        onSend({ type: "image", msgContext });
      }
    } catch (error) {
      setUploading(false);
      console.error("Upload error:", error);
      showSnack("Failed to upload image. Please try again.", false);
    }
  }

  return (
    <>
      <TouchableOpacity
        onPress={pickImage}
        activeOpacity={0.7}
        style={[styles.button, { backgroundColor: theme.action.hover }]}
      >
        <VStack space={8} alignItems="center">
          <Icon name="image-outline" size={32} color={theme.primary} />
          <Typography variant="caption" fontWeight="500" textAlign="center">
            {t("photo")}
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
          <View style={styles.inputContainer}>
            <TextField
              loading={uploading}
              variant="whatsapp"
              placeholder={t("captionOptional")}
              value={caption}
              onChangeText={setCaption}
              numberOfLines={3}
              maxLength={1000}
              rightIcon="send"
              rightIconPress={handleSend}
              editable={!uploading}
            />
          </View>

          {selectedImage && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.image}
                resizeMode="contain"
              />
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
  imageContainer: {
    flex: 1,
    width: width,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  image: {
    width: width,
    height: "100%",
  },
  inputContainer: {
    padding: 15,
  },
});
