import React, { useState, useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import moment from "moment-timezone";
import { useInbox } from "../../../../contexts/InboxContext";
import { useTheme } from "../../../../contexts/ThemeContext";
import Typography from "../../../../ui/Typography";
import { HStack, VStack } from "../../../../ui/Stack";
import Box from "../../../../ui/Box";
import { Ionicons } from "@expo/vector-icons";
import { useTranslate } from "../../../../contexts/TranslateContext";
import { Button } from "../../../../ui";

export default function MetaChatTimer({
  variant = "horizontal", // "round" || "horizontal" || "text"
  size = 140, // Size for round variant (default: 140)
  color = "auto", // "auto" || "success" || "warning" || "error" || "primary" || "secondary"
}) {
  const { t } = useTranslate();
  const { chatInfo, cdTimer } = useInbox();
  const { theme } = useTheme();
  const [timeLeft, setTimeLeft] = useState(null);
  const [expired, setExpired] = useState(false);

  const isMeta = chatInfo?.origin === "meta";
  const hasTimer = isMeta && cdTimer?.timezone && cdTimer?.timestamp;

  useEffect(() => {
    if (!hasTimer) return;

    setExpired(false);
    setTimeLeft(null);

    const calculateTimeLeft = () => {
      const now = moment.tz(cdTimer.timezone);
      const eventTime = moment.unix(cdTimer.timestamp).tz(cdTimer.timezone);
      const timeSinceEvent = now.diff(eventTime, "seconds");

      if (timeSinceEvent >= 86400) {
        // 24 hours
        setExpired(true);
        setTimeLeft(null);
      } else {
        const duration = moment.duration(86400 - timeSinceEvent, "seconds");
        setTimeLeft({
          hours: Math.floor(duration.asHours()),
          minutes: duration.minutes(),
          seconds: duration.seconds(),
        });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [cdTimer?.timestamp, cdTimer?.timezone, hasTimer]);

  if (!hasTimer) return null;

  const percentageLeft = timeLeft
    ? ((timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds) /
        86400) *
      100
    : 0;

  // Get color from theme based on prop
  const getTimerColor = () => {
    // If color is manually set, use theme color
    if (color !== "auto") {
      const colorMap = {
        success: theme.success,
        warning: theme.warning,
        error: theme.error,
        primary: theme.primary,
        secondary: theme.secondary,
        info: theme.info,
      };
      return colorMap[color] || theme.primary;
    }

    // Auto color based on time percentage
    if (percentageLeft > 50) return theme.success;
    if (percentageLeft > 20) return theme.warning;
    return theme.error;
  };

  const timerColor = getTimerColor();

  // Get background color with opacity
  const getBackgroundColor = (color, opacity = 0.1) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  if (expired) {
    return (
      <Button
        size="small"
        color="error"
        startIcon={"time-outline"}
        variant="text"
      >
        {t("expired")}
      </Button>
    );
  }

  if (!timeLeft) return null;

  // Render based on variant
  if (variant === "round") {
    return (
      <RoundTimer
        timeLeft={timeLeft}
        percentage={percentageLeft}
        color={timerColor}
        theme={theme}
        getBackgroundColor={getBackgroundColor}
        size={size}
      />
    );
  }

  if (variant === "text") {
    return (
      <TextTimer
        timeLeft={timeLeft}
        percentage={percentageLeft}
        color={timerColor}
        theme={theme}
      />
    );
  }

  return (
    <HorizontalTimer
      timeLeft={timeLeft}
      percentage={percentageLeft}
      color={timerColor}
      theme={theme}
      getBackgroundColor={getBackgroundColor}
    />
  );
}

// ✅ HORIZONTAL VARIANT (Compact, inline)
const HorizontalTimer = ({
  timeLeft,
  percentage,
  color,
  theme,
  getBackgroundColor,
}) => {
  const progressAnim = useRef(new Animated.Value(percentage)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <Box
      style={{
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: getBackgroundColor(color, 0.1),
        borderWidth: 1,
        borderColor: getBackgroundColor(color, 0.3),
        overflow: "hidden",
      }}
    >
      {/* Progress Bar Background */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: getBackgroundColor(color, 0.2),
        }}
      >
        <Animated.View
          style={{
            height: "100%",
            width: progressWidth,
            backgroundColor: color,
          }}
        />
      </View>

      <HStack space={12} alignItems="center" justifyContent="space-around">
        <TimeUnit
          value={timeLeft.hours.toString().padStart(2, "0")}
          label="HRS"
          color={color}
          theme={theme}
        />
        <Typography
          variant="h6"
          color={color}
          fontWeight="700"
          style={{ marginTop: -8 }}
        >
          :
        </Typography>
        <TimeUnit
          value={timeLeft.minutes.toString().padStart(2, "0")}
          label="MIN"
          color={color}
          theme={theme}
        />
        <Typography
          variant="h6"
          color={color}
          fontWeight="700"
          style={{ marginTop: -8 }}
        >
          :
        </Typography>
        <TimeUnit
          value={timeLeft.seconds.toString().padStart(2, "0")}
          label="SEC"
          color={color}
          theme={theme}
        />
      </HStack>
    </Box>
  );
};

// ✅ ROUND VARIANT (Circular progress with customizable size)
const RoundTimer = ({
  timeLeft,
  percentage,
  color,
  theme,
  getBackgroundColor,
  size,
}) => {
  const strokeWidth = Math.max(8, size * 0.07); // Dynamic stroke width based on size
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation when time is low
  useEffect(() => {
    if (percentage < 20) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [percentage]);

  // Calculate responsive font sizes
  const timeFontSize = size * 0.15;
  const labelFontSize = size * 0.08;
  const bottomFontSize = size * 0.12;
  const bottomLabelSize = size * 0.07;

  return (
    <Box
      style={{ alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <Animated.View
        style={{
          width: size,
          height: size,
          transform: [{ scale: pulseAnim }],
        }}
      >
        {/* Outer Circle (Background) */}
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: getBackgroundColor(color, 0.2),
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Progress Circle */}
          <CircleProgress
            size={size}
            strokeWidth={strokeWidth}
            percentage={percentage}
            color={color}
          />

          {/* Center Content */}
          <View
            style={{
              position: "absolute",
              justifyContent: "center",
              alignItems: "center",
              width: size - strokeWidth * 4,
            }}
          >
            <VStack space={size * 0.03} alignItems="center">
              <Typography
                fontWeight="700"
                color={color}
                style={{
                  fontFamily: "monospace",
                  fontSize: timeFontSize,
                  lineHeight: timeFontSize * 1.2,
                }}
              >
                {timeLeft.hours.toString().padStart(2, "0")}:
                {timeLeft.minutes.toString().padStart(2, "0")}:
                {timeLeft.seconds.toString().padStart(2, "0")}
              </Typography>
              <Typography
                color={theme.textSecondary}
                style={{
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  fontSize: labelFontSize,
                }}
              >
                TIME LEFT
              </Typography>
            </VStack>
          </View>
        </View>
      </Animated.View>

      {/* Bottom Time Units */}
      <HStack space={size * 0.14} style={{ marginTop: size * 0.11 }}>
        <VStack space={size * 0.014} alignItems="center">
          <Typography
            fontWeight="700"
            color={color}
            style={{ fontSize: bottomFontSize }}
          >
            {timeLeft.hours.toString().padStart(2, "0")}
          </Typography>
          <Typography
            color={theme.textSecondary}
            style={{ fontSize: bottomLabelSize }}
          >
            Hours
          </Typography>
        </VStack>
        <VStack space={size * 0.014} alignItems="center">
          <Typography
            fontWeight="700"
            color={color}
            style={{ fontSize: bottomFontSize }}
          >
            {timeLeft.minutes.toString().padStart(2, "0")}
          </Typography>
          <Typography
            color={theme.textSecondary}
            style={{ fontSize: bottomLabelSize }}
          >
            Minutes
          </Typography>
        </VStack>
        <VStack space={size * 0.014} alignItems="center">
          <Typography
            fontWeight="700"
            color={color}
            style={{ fontSize: bottomFontSize }}
          >
            {timeLeft.seconds.toString().padStart(2, "0")}
          </Typography>
          <Typography
            color={theme.textSecondary}
            style={{ fontSize: bottomLabelSize }}
          >
            Seconds
          </Typography>
        </VStack>
      </HStack>
    </Box>
  );
};

// ✅ TEXT VARIANT (Minimal, inline text only)
const TextTimer = ({ timeLeft, percentage, color, theme }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation when time is low
  useEffect(() => {
    if (percentage < 20) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [percentage]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <HStack space={6} alignItems="center">
        <Ionicons name="time-outline" size={16} color={color} />
        <Typography
          variant="body2"
          fontWeight="600"
          color={color}
          style={{ fontFamily: "monospace" }}
        >
          {timeLeft.hours.toString().padStart(2, "0")}:
          {timeLeft.minutes.toString().padStart(2, "0")}:
          {timeLeft.seconds.toString().padStart(2, "0")}
        </Typography>
      </HStack>
    </Animated.View>
  );
};

// ✅ CIRCLE PROGRESS (Fixed for React Native)
const CircleProgress = ({ size, strokeWidth, percentage, color }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [percentage]);

  // Create segments for circular progress
  const segments = Math.max(40, Math.floor(size / 3)); // Dynamic segments based on size
  const segmentAngle = 360 / segments;

  return (
    <View
      style={{
        position: "absolute",
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {[...Array(segments)].map((_, index) => {
        const segmentPercentage = ((index + 1) / segments) * 100;

        const opacity = progressAnim.interpolate({
          inputRange: [
            Math.max(0, segmentPercentage - 100 / segments),
            segmentPercentage,
          ],
          outputRange: [0, 1],
          extrapolate: "clamp",
        });

        const angle = (index * segmentAngle - 90) * (Math.PI / 180);
        const radius = size / 2 - strokeWidth / 2;

        const x = size / 2 + radius * Math.cos(angle) - strokeWidth / 2;
        const y = size / 2 + radius * Math.sin(angle) - strokeWidth / 2;

        return (
          <Animated.View
            key={index}
            style={{
              position: "absolute",
              width: strokeWidth,
              height: strokeWidth,
              borderRadius: strokeWidth / 2,
              backgroundColor: color,
              left: x,
              top: y,
              opacity: opacity,
            }}
          />
        );
      })}
    </View>
  );
};

// ✅ TIME UNIT COMPONENT
const TimeUnit = ({ value, label, color, theme }) => {
  return (
    <VStack space={2} alignItems="center">
      <Typography
        variant="h6"
        fontWeight="700"
        color={color}
        style={{ fontFamily: "monospace" }}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        color={theme.textSecondary}
        style={{
          textTransform: "uppercase",
          fontSize: 10,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Typography>
    </VStack>
  );
};
