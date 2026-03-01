import React from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../../contexts/ThemeContext";
import { VStack, Typography } from "../../../../ui";

const MsgList = ({ msg }) => {
  const { theme, colorMode } = useTheme();

  const handleItemPress = (row) => {
    console.log("List item pressed:", row.title);
    // Handle item action here
  };

  const isDark = colorMode === "dark";
  const sections = msg?.msgContext?.interactive?.action?.sections || [];
  const headerText = msg?.msgContext?.interactive?.header?.text;
  const bodyText = msg?.msgContext?.interactive?.body?.text;

  return (
    <VStack space={0} style={styles.container}>
      {/* Header */}
      {headerText && (
        <Typography variant="body1" fontWeight="600" style={styles.header}>
          {headerText}
        </Typography>
      )}

      {/* Body */}
      {bodyText && (
        <Typography
          variant="body2"
          color={theme.textSecondary}
          style={styles.body}
        >
          {bodyText}
        </Typography>
      )}

      {/* List Sections */}
      <VStack
        space={0}
        style={[
          styles.listContainer,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.03)"
              : "rgba(0,0,0,0.02)",
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          },
          (headerText || bodyText) && styles.withMargin,
        ]}
      >
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex}>
            {/* Section Title */}
            {section.title && (
              <View
                style={[
                  styles.sectionHeader,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)",
                    borderBottomColor: isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.08)",
                  },
                ]}
              >
                <Typography
                  variant="caption"
                  color={theme.textSecondary}
                  fontWeight="600"
                  style={styles.sectionTitle}
                >
                  {section.title.toUpperCase()}
                </Typography>
              </View>
            )}

            {/* Section Rows */}
            {section.rows.map((row, rowIndex) => (
              <TouchableOpacity
                disabled
                key={rowIndex}
                onPress={() => handleItemPress(row)}
                style={[
                  styles.listItem,
                  {
                    borderBottomWidth:
                      rowIndex < section.rows.length - 1 ? 0.5 : 0,
                    borderBottomColor: isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.08)",
                  },
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.listItemContent}>
                  <View style={styles.textContainer}>
                    <Typography
                      variant="body2"
                      fontWeight="500"
                      style={styles.itemTitle}
                    >
                      {row.title}
                    </Typography>

                    {row.description && (
                      <Typography
                        variant="caption"
                        color={theme.textSecondary}
                        style={styles.itemDescription}
                      >
                        {row.description}
                      </Typography>
                    )}
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </VStack>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: { minWidth: 280 },
  header: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  body: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    lineHeight: 18,
  },
  listContainer: {
    borderRadius: 8,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  withMargin: {
    marginTop: 8,
  },
  sectionHeader: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
  },
  sectionTitle: {
    letterSpacing: 0.5,
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    lineHeight: 18,
  },
  itemDescription: {
    marginTop: 4,
    lineHeight: 16,
  },
});

export default MsgList;
