import React, { useState } from "react";
import { View, StyleSheet, PanResponder, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const ColorPicker = ({
  onColorChange,
  size = 300,
  defaultColor = "#FF0000",
}) => {
  const [color, setColor] = useState(defaultColor);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => handleColorSelect(e),
    onPanResponderMove: (e) => handleColorSelect(e),
  });

  const handleColorSelect = (e) => {
    const { locationX, locationY } = e.nativeEvent;

    // Calculate hue from X position (0-360)
    const hue = Math.max(0, Math.min(360, (locationX / size) * 360));

    // Calculate saturation and lightness from Y position
    const saturation = 100;
    const lightness = Math.max(
      0,
      Math.min(100, 100 - (locationY / size) * 100)
    );

    const hexColor = hslToHex(hue, saturation, lightness);
    setColor(hexColor);
    onColorChange?.(hexColor);
  };

  return (
    <View style={styles.container}>
      <View {...panResponder.panHandlers} style={{ width: size, height: size }}>
        <LinearGradient
          colors={[
            "#FF0000",
            "#FFFF00",
            "#00FF00",
            "#00FFFF",
            "#0000FF",
            "#FF00FF",
            "#FF0000",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { width: size, height: size }]}
        >
          <LinearGradient
            colors={["#FFFFFF", "transparent", "#000000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.overlay}
          />
        </LinearGradient>
      </View>
      <View style={[styles.preview, { backgroundColor: color }]} />
    </View>
  );
};

// Helper function to convert HSL to Hex
const hslToHex = (h, s, l) => {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  gradient: {
    borderRadius: 8,
  },
  overlay: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  preview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginTop: 20,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ColorPicker;
