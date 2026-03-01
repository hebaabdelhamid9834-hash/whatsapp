import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
  Platform,
  Linking,
  ScrollView,
  Image,
} from "react-native";
import * as Location from "expo-location";
import {
  Icon,
  Typography,
  VStack,
  Dialog,
  TextField,
  Button,
  HStack,
  Grid,
} from "../../../../ui";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useGlobal } from "../../../../contexts/GlobalContext";
import { useInbox } from "../../../../contexts/InboxContext";

const imgPath = require("../../../../../assets/map_photo.png");

const { width, height } = Dimensions.get("window");

export default function SendLoc({ t, onSend }) {
  const { chatInfo } = useInbox();
  const { loading } = useGlobal();
  const { theme } = useTheme();

  const [previewVisible, setPreviewVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [caption, setCaption] = useState("");
  const [address, setAddress] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Manual input states
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const pickLocation = async () => {
    try {
      setLoadingLocation(true);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("grantPre"));
        setLoadingLocation(false);
        // Still show dialog for manual input
        setPreviewVisible(true);
        setShowManualInput(true);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;

      setLocation({ latitude, longitude });
      setManualLat(latitude.toFixed(6));
      setManualLng(longitude.toFixed(6));

      // Reverse geocode to get address
      try {
        const addressResult = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (addressResult && addressResult.length > 0) {
          const addr = addressResult[0];
          const formattedAddress = [
            addr.street,
            addr.city,
            addr.region,
            addr.country,
          ]
            .filter(Boolean)
            .join(", ");
          setAddress(formattedAddress || "Current Location");
          setCaption(formattedAddress || "");
        }
      } catch (error) {
        setAddress("Current Location");
      }

      setPreviewVisible(true);
      setLoadingLocation(false);
    } catch (error) {
      setLoadingLocation(false);
      Alert.alert(
        t("err") || "Error",
        t("locationError") ||
          "Failed to get your location. You can enter manually."
      );
      // Show dialog for manual input
      setPreviewVisible(true);
      setShowManualInput(true);
    }
  };

  const handleClose = () => {
    setPreviewVisible(false);
    setLocation(null);
    setCaption("");
    setAddress("");
    setManualLat("");
    setManualLng("");
    setShowManualInput(false);
  };

  const validateCoordinates = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return {
        valid: false,
        error: t("invalidCoords") || "Invalid coordinates",
      };
    }

    if (latitude < -90 || latitude > 90) {
      return {
        valid: false,
        error: t("latRange") || "Latitude must be between -90 and 90",
      };
    }

    if (longitude < -180 || longitude > 180) {
      return {
        valid: false,
        error: t("lngRange") || "Longitude must be between -180 and 180",
      };
    }

    return { valid: true, latitude, longitude };
  };

  const handleManualUpdate = async () => {
    const validation = validateCoordinates(manualLat, manualLng);

    if (!validation.valid) {
      Alert.alert(t("err") || "Error", validation.error);
      return;
    }

    const { latitude, longitude } = validation;
    setLocation({ latitude, longitude });

    // Try to get address for manual coordinates
    try {
      const addressResult = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addressResult && addressResult.length > 0) {
        const addr = addressResult[0];
        const formattedAddress = [
          addr.street,
          addr.city,
          addr.region,
          addr.country,
        ]
          .filter(Boolean)
          .join(", ");
        setAddress(formattedAddress || "Custom Location");
        if (!caption) {
          setCaption(formattedAddress || "");
        }
      }
    } catch (error) {
      setAddress("Custom Location");
    }
  };

  const handleSend = () => {
    // Validate manual input if location is not set
    if (!location) {
      const validation = validateCoordinates(manualLat, manualLng);

      if (!validation.valid) {
        Alert.alert(t("err") || "Error", validation.error);
        return;
      }

      setLocation({
        latitude: validation.latitude,
        longitude: validation.longitude,
      });
    }

    if (loading) return;

    const finalLocation = location || {
      latitude: parseFloat(manualLat),
      longitude: parseFloat(manualLng),
    };

    const messageData = {
      type: "location",
      msgContext:
        chatInfo?.origin === "qr"
          ? {
              type: "location",
              location: {
                latitude: finalLocation.latitude,
                longitude: finalLocation.longitude,
                name: caption.trim() || address || "Location",
              },
            }
          : {
              type: "location",
              location: {
                latitude: finalLocation.latitude,
                longitude: finalLocation.longitude,
              },
            },
    };

    onSend(messageData);
    handleClose();
  };

  const openInMaps = () => {
    if (!location) return;

    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${location.latitude},${location.longitude}`;
    const label = caption || "Location";
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
  };

  return (
    <>
      <TouchableOpacity
        onPress={pickLocation}
        activeOpacity={0.7}
        disabled={loadingLocation}
        style={[
          styles.button,
          { backgroundColor: theme.action.hover },
          loadingLocation && { opacity: 0.6 },
        ]}
      >
        <VStack space={8} alignItems="center">
          {loadingLocation ? (
            <Icon name="hourglass-outline" size={32} color={theme.primary} />
          ) : (
            <Icon name="location-outline" size={32} color={theme.primary} />
          )}
          <Typography variant="caption" fontWeight="500" textAlign="center">
            {loadingLocation ? t("loading") || "Loading..." : t("location")}
          </Typography>
        </VStack>
      </TouchableOpacity>

      <Dialog
        noPadding
        visible={previewVisible}
        title={t("sendLocation")}
        onClose={handleClose}
        fullScreen
        darker
      >
        <ScrollView style={{ flex: 1 }}>
          {/* Map Preview */}
          {location && (
            <View style={styles.mapContainer}>
              {/* Static Map Background Image */}
              <Image
                source={imgPath}
                style={styles.mapImage}
                resizeMode="cover"
              />

              {/* Overlay for better pin visibility */}
              <View style={styles.mapOverlay} />

              {/* Large Pin Marker */}
              <View style={styles.pinContainer}>
                <View
                  style={[styles.pinCircle, { backgroundColor: theme.primary }]}
                >
                  <Icon name="location" size={48} color="white" />
                </View>
                <View
                  style={[styles.pinShadow, { backgroundColor: theme.primary }]}
                />
              </View>

              {/* Location Info Card */}
              <View style={styles.infoOverlay}>
                <VStack
                  space={16}
                  style={[
                    styles.infoCard,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <HStack space={12} alignItems="flex-start">
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: theme.primary + "20" },
                      ]}
                    >
                      <Icon name="location" size={24} color={theme.primary} />
                    </View>
                    <VStack space={4} style={{ flex: 1 }}>
                      <Typography fontWeight="600" fontSize={15}>
                        {address || "Current Location"}
                      </Typography>
                      <Typography fontSize={12} color={theme.textSecondary}>
                        {location.latitude.toFixed(6)},{" "}
                        {location.longitude.toFixed(6)}
                      </Typography>
                    </VStack>
                  </HStack>

                  {/* Open in Maps Button */}
                  <TouchableOpacity
                    onPress={openInMaps}
                    style={[
                      styles.openMapsButton,
                      { backgroundColor: theme.action.hover },
                    ]}
                    activeOpacity={0.7}
                  >
                    <HStack
                      space={8}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon name="navigate" size={18} color={theme.primary} />
                      <Typography
                        fontSize={14}
                        fontWeight="600"
                        color={theme.primary}
                      >
                        {t("viewOnMap")}
                      </Typography>
                    </HStack>
                  </TouchableOpacity>
                </VStack>
              </View>
            </View>
          )}

          {/* Input Section */}
          <View style={styles.inputContainer}>
            {/* Manual Coordinates Section */}
            <VStack space={12}>
              {/* Toggle Manual Input */}
              <TouchableOpacity
                onPress={() => setShowManualInput(!showManualInput)}
                style={[
                  styles.toggleButton,
                  { backgroundColor: theme.action.hover },
                ]}
                activeOpacity={0.7}
              >
                <HStack space={8} alignItems="center" justifyContent="center">
                  <Icon
                    name={showManualInput ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={theme.primary}
                  />
                  <Typography
                    fontSize={14}
                    fontWeight="600"
                    color={theme.primary}
                  >
                    {t("manualLoc")}
                  </Typography>
                </HStack>
              </TouchableOpacity>

              {/* Manual Input Fields */}
              {showManualInput && (
                <VStack space={12}>
                  <Grid.Container spacing={2}>
                    <Grid.Item xs={6}>
                      <TextField
                        variant="outlined"
                        label={t("latitude") || "Latitude"}
                        placeholder="e.g., 37.7749"
                        value={manualLat}
                        onChangeText={setManualLat}
                        keyboardType="numeric"
                        leftIcon="navigate-outline"
                      />
                    </Grid.Item>

                    <Grid.Item xs={6}>
                      <TextField
                        variant="outlined"
                        label={t("longitude") || "Longitude"}
                        placeholder="e.g., -122.4194"
                        value={manualLng}
                        onChangeText={setManualLng}
                        keyboardType="numeric"
                        leftIcon="navigate-outline"
                      />
                    </Grid.Item>
                  </Grid.Container>

                  {/* Update Location Button */}
                  <Button
                    variant="outlined"
                    onPress={handleManualUpdate}
                    disabled={!manualLat || !manualLng}
                  >
                    <HStack
                      space={8}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon name="refresh" size={18} color={theme.primary} />
                      <Typography
                        color={theme.primary}
                        fontWeight="600"
                        fontSize={14}
                      >
                        {t("updateLocation") || "Update Location"}
                      </Typography>
                    </HStack>
                  </Button>

                  {/* Helper Text */}
                  <View
                    style={[
                      styles.helperBox,
                      { backgroundColor: theme.action.hover },
                    ]}
                  >
                    <HStack space={8} alignItems="flex-start">
                      <Icon
                        name="information-circle-outline"
                        size={18}
                        color={theme.textSecondary}
                      />
                      <Typography
                        fontSize={12}
                        color={theme.textSecondary}
                        style={{ flex: 1 }}
                      >
                        {t("coordsHelper") ||
                          "Latitude: -90 to 90, Longitude: -180 to 180"}
                      </Typography>
                    </HStack>
                  </View>
                </VStack>
              )}

              {/* Caption Input (only for QR/Baileys) */}
              {chatInfo?.origin === "qr" && (
                <TextField
                  variant="outlined"
                  placeholder={t("locTit")}
                  value={caption}
                  onChangeText={setCaption}
                  maxLength={256}
                  leftIcon="create-outline"
                />
              )}

              {/* Send Button */}
              <Button
                onPress={handleSend}
                loading={loading}
                disabled={loading || (!location && (!manualLat || !manualLng))}
              >
                <HStack space={8} alignItems="center" justifyContent="center">
                  <Icon name="send" size={20} color="white" />
                  <Typography color="white" fontWeight="600" fontSize={16}>
                    {t("sendLocation") || "Send Location"}
                  </Typography>
                </HStack>
              </Button>
            </VStack>
          </View>
        </ScrollView>
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
  mapContainer: {
    height: 400,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  mapImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)", // Slight dark overlay for better pin visibility
  },
  pinContainer: {
    position: "absolute",
    top: "35%",
    alignItems: "center",
    zIndex: 10,
  },
  pinCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pinShadow: {
    width: 20,
    height: 8,
    borderRadius: 10,
    marginTop: 8,
    opacity: 0.3,
  },
  infoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 10,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  openMapsButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  inputContainer: {
    padding: 16,
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  helperBox: {
    padding: 12,
    borderRadius: 8,
  },
});
