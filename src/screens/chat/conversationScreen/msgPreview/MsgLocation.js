import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "../../../../ui";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useTranslate } from "../../../../contexts/TranslateContext";
import * as Clipboard from "expo-clipboard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const mapBackgroundImage = require("../../../../../assets/map_photo.png");

export default function MsgLocation({ msg }) {
  const { t } = useTranslate();
  const { theme, colorMode } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);

  const latitude = msg?.msgContext?.location?.latitude;
  const longitude = msg?.msgContext?.location?.longitude;
  const locationName =
    msg?.msgContext?.location?.name || t("unknownLocation") || "location";
  const locationAddress = msg?.msgContext?.location?.address;

  const isIncoming = msg?.route === "INCOMING";

  // Check if location data exists
  if (!latitude || !longitude) {
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
          <Ionicons name="location-outline" size={20} color="#999" />
          <Typography fontSize={12} color="#999" style={{ marginLeft: 6 }}>
            {t("locationUnavailable") || "Location unavailable"}
          </Typography>
        </View>
      </View>
    );
  }

  // Generate Google Maps URL
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  // Generate Apple Maps URL (iOS)
  const appleMapsUrl = `http://maps.apple.com/?ll=${latitude},${longitude}&q=${encodeURIComponent(
    locationName
  )}`;

  // Coordinates string
  const coordinatesString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

  // Open in maps app
  const openInMaps = () => {
    Alert.alert(
      t("openLocation") || "Open Location",
      t("chooseMapApp") || "Choose map application",
      [
        {
          text: t("cancel") || "Cancel",
          style: "cancel",
        },
        {
          text: "Google Maps",
          onPress: () => openUrl(googleMapsUrl),
        },
        ...(Platform.OS === "ios"
          ? [
              {
                text: "Apple Maps",
                onPress: () => openUrl(appleMapsUrl),
              },
            ]
          : []),
      ]
    );
  };

  // Open URL
  const openUrl = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          t("error") || "Error",
          t("cantOpenUrl") || "Cannot open URL"
        );
      }
    } catch (error) {
      console.error("Error opening URL:", error);
      Alert.alert(t("error") || "Error", t("failedToOpen") || "Failed to open");
    }
  };

  // Copy coordinates
  const copyCoordinates = async () => {
    try {
      await Clipboard.setStringAsync(coordinatesString);
      Alert.alert(
        t("copied") || "Copied",
        t("coordinatesCopied") || "Coordinates copied to clipboard"
      );
    } catch (error) {
      console.error("Error copying:", error);
    }
  };

  const textColor = isIncoming
    ? colorMode === "dark"
      ? "#E9EDEF"
      : "#111B21"
    : colorMode === "dark"
    ? "#E9EDEF"
    : "#111B21";

  const secondaryTextColor = isIncoming
    ? colorMode === "dark"
      ? "#8696A0"
      : "#667781"
    : colorMode === "dark"
    ? "#8696A0"
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
      {/* Map Preview */}
      <TouchableOpacity
        onPress={openInMaps}
        activeOpacity={0.8}
        style={styles.mapContainer}
      >
        {/* Background Map Image */}
        <Image
          source={mapBackgroundImage}
          style={styles.mapImage}
          resizeMode="cover"
        />

        {/* Slight overlay for better pin visibility */}
        <View style={styles.mapOverlay} />

        {/* Location pin overlay */}
        <View style={styles.pinOverlay}>
          <View style={styles.pinShadow} />
          <Ionicons name="location" size={40} color="#EA4335" />
        </View>

        {/* Tap to open indicator */}
        <View style={styles.tapIndicator}>
          <Ionicons name="open-outline" size={12} color="#666" />
          <Typography fontSize={10} color="#666" style={{ marginLeft: 4 }}>
            {t("tapToOpen") || "Tap to open"}
          </Typography>
        </View>
      </TouchableOpacity>

      {/* Location Details */}
      <View style={styles.detailsContainer}>
        {/* Location Name */}
        <View style={styles.nameRow}>
          <Ionicons
            name="location-sharp"
            size={16}
            color={secondaryTextColor}
            style={{ marginRight: 6 }}
          />
          <Typography
            fontSize={14}
            fontWeight="600"
            color={textColor}
            numberOfLines={1}
            style={{ flex: 1 }}
          >
            {locationName}
          </Typography>
        </View>

        {/* Address if available */}
        {locationAddress && (
          <Typography
            fontSize={12}
            color={secondaryTextColor}
            numberOfLines={2}
            style={{ marginTop: 4, marginLeft: 22 }}
          >
            {locationAddress}
          </Typography>
        )}

        {/* Coordinates and Actions */}
        <View style={styles.actionsRow}>
          {/* Coordinates */}
          <TouchableOpacity
            onPress={copyCoordinates}
            style={styles.coordinatesButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="copy-outline"
              size={12}
              color={secondaryTextColor}
            />
            <Typography
              fontSize={11}
              color={secondaryTextColor}
              style={{ marginLeft: 4 }}
            >
              {coordinatesString}
            </Typography>
          </TouchableOpacity>

          {/* Navigate Button */}
          <TouchableOpacity
            onPress={openInMaps}
            style={[
              styles.navigateButton,
              {
                backgroundColor: colorMode === "dark" ? "#00A884" : "#25D366",
              },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={14} color="#FFF" />
            <Typography
              fontSize={12}
              color="#FFF"
              fontWeight="600"
              style={{ marginLeft: 4 }}
            >
              {t("navigate") || "Navigate"}
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: "hidden",
    width: 280, // Fixed width for location cards
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  mapContainer: {
    width: "100%",
    height: 150,
    position: "relative",
    backgroundColor: "#E5E5E5",
    overflow: "hidden",
  },
  mapImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)", // Subtle overlay for pin visibility
  },
  pinOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -40 }],
    alignItems: "center",
  },
  pinShadow: {
    position: "absolute",
    bottom: -5,
    width: 15,
    height: 6,
    borderRadius: 7.5,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  tapIndicator: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  detailsContainer: {
    padding: 10,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  coordinatesButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  navigateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
