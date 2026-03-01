import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Typography, Icon } from "./index";
import { useTheme } from "../contexts/ThemeContext";

export default function CustomHeader({
  title,
  showBackButton = true,
  endComp = null,
}) {
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {showBackButton && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
      )}

      <View style={styles.titleContainer}>
        <Typography variant="h6" style={styles.title}>
          {title}
        </Typography>
      </View>

      <View style={styles.endContainer}>{endComp}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  endContainer: {
    minWidth: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
