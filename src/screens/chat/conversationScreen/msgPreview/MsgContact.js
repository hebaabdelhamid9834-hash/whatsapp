import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { useTheme } from "../../../../contexts/ThemeContext";
import { HStack, VStack, Typography } from "../../../../ui";
import { useTranslate } from "../../../../contexts/TranslateContext";

const MsgContact = ({ msg }) => {
  const { theme, colorMode } = useTheme();
  const { t } = useTranslate();

  // Parse vCard
  const parseVCard = (vcardString) => {
    const result = { name: "", phone: "" };
    const lines = vcardString.split("\n");

    lines.forEach((line) => {
      if (line.startsWith("FN:")) {
        result.name = line.substring(3).trim();
      } else if (line.startsWith("TEL;")) {
        result.phone = line.substring(line.lastIndexOf(":") + 1).trim();
      }
    });

    return result;
  };

  const vcard = msg?.msgContext?.contact?.vcard || "";
  const contact = parseVCard(vcard);

  const handleAddContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Cannot access contacts");
        return;
      }

      await Contacts.addContactAsync({
        [Contacts.Fields.FirstName]: contact.name,
        [Contacts.Fields.PhoneNumbers]: [{ number: contact.phone }],
      });

      Alert.alert("Success", "Contact added");
    } catch (error) {
      Alert.alert("Error", "Failed to add contact");
    }
  };

  const isDark = colorMode === "dark";

  return (
    <VStack space={0} style={styles.container}>
      {/* Contact Info */}
      <HStack space={12} style={styles.contactInfo}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: isDark ? "#2A3942" : "#E9E9EB" },
          ]}
        >
          <Ionicons
            name="person"
            size={28}
            color={isDark ? "#8696A0" : "#8E8E93"}
          />
        </View>

        <VStack space={2} style={{ flex: 1 }}>
          <Typography variant="body1" fontWeight="500">
            {contact.name}
          </Typography>
          <Typography variant="body2" color={theme.textSecondary}>
            {contact.phone}
          </Typography>
        </VStack>
      </HStack>

      {/* Actions */}
      {/* <TouchableOpacity
        onPress={handleMessage}
        style={[
          styles.button,
          { borderTopColor: isDark ? "#2A3942" : "#E5E5EA" },
        ]}
        activeOpacity={0.6}
      >
        <Typography variant="body2" color="#2481CC" style={styles.buttonText}>
          Message
        </Typography>
      </TouchableOpacity> */}

      <TouchableOpacity
        onPress={handleAddContact}
        style={[
          styles.button,
          { borderTopColor: isDark ? "#2A3942" : "#E5E5EA" },
        ]}
        activeOpacity={0.6}
      >
        <Typography variant="body2" color="#2481CC" style={styles.buttonText}>
          {t("addCOntact")}
        </Typography>
      </TouchableOpacity>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: { minWidth: 280 },
  contactInfo: {
    padding: 12,
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    paddingVertical: 12,
    borderTopWidth: 0.5,
    alignItems: "center",
  },
  buttonText: {
    textAlign: "center",
  },
});

export default MsgContact;
