import React from "react";
import { Text, View, Linking } from "react-native";

// Helper function to format WhatsApp text
export function formatWhatsAppText({ text, options, theme, fontSize = 15 }) {
  if (!text) return null;

  // ✅ Default options - all enabled by default
  const defaultOptions = {
    autoLinks: true,
    detectEmails: true,
    detectPhoneNumbers: true,
    detectMentions: true,
    detectHashtags: true,
    lists: true,
    detectEmojis: true,
  };

  const config = { ...defaultOptions, ...options };

  // ✅ Default theme - will be overridden if passed
  const defaultTheme = {
    textPrimary: "#212121",
    primary: "#1976d2",
  };
  const themeConfig = { ...defaultTheme, ...theme };

  // ... rest of your code remains the same
  // (all the helper functions and rendering logic)

  // Helper: Convert text emoticons to emojis
  const convertEmoticons = (str) => {
    if (!config.detectEmojis) return str;

    const emojiMap = {
      ":)": "😊",
      ":(": "😞",
      ":D": "😃",
      ":P": "😛",
      ";P": "😜",
      ";)": "😉",
      ":O": "😮",
      ":'(": "😢",
      "<3": "❤️",
      "</3": "💔",
      ":|": "😐",
      ":o": "😮",
    };

    Object.keys(emojiMap).forEach((emoticon) => {
      str = str.split(emoticon).join(emojiMap[emoticon]);
    });

    return str;
  };

  // Parse inline formatting (bold, italic, links, etc.)
  const parseInlineFormatting = (text, config) => {
    const segments = [];
    let currentPos = 0;
    let segmentKey = 0;

    const patterns = [
      {
        name: "bold",
        regex: /\*([^*\n]+)\*/g,
        enabled: true,
      },
      {
        name: "italic",
        regex: /_([^_\n]+)_/g,
        enabled: true,
      },
      {
        name: "strike",
        regex: /~([^~\n]+)~/g,
        enabled: true,
      },
      {
        name: "monospace",
        regex: /```([^`\n]+)```/g,
        enabled: true,
      },
      {
        name: "url",
        regex: /(https?:\/\/[^\s]+)/g,
        enabled: config.autoLinks,
      },
      {
        name: "url-no-protocol",
        regex:
          /(^|\s)([a-zA-Z0-9-]+\.(com|org|net|io|co|us|uk|ca|au|in|gov|edu|me)[^\s]*)/g,
        enabled: config.autoLinks,
      },
      {
        name: "email",
        regex: /([\w.-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g,
        enabled: config.detectEmails,
      },
      {
        name: "phone",
        regex:
          /(\+\d{1,3}[-.\s]?)?(\(\d{2,3}\)|\d{2,3})[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
        enabled: config.detectPhoneNumbers,
      },
      {
        name: "mention",
        regex: /(^|\s)@(\w+)/g,
        enabled: config.detectMentions,
      },
      {
        name: "hashtag",
        regex: /(^|\s)#(\w+)/g,
        enabled: config.detectHashtags,
      },
    ];

    const matches = [];
    patterns.forEach((pattern) => {
      if (!pattern.enabled) return;

      let match;
      const regex = new RegExp(pattern.regex.source, "g");
      while ((match = regex.exec(text)) !== null) {
        const content = match[2] || match[1] || match[0];
        const prefix = pattern.name === "url-no-protocol" ? match[1] || "" : "";

        matches.push({
          type: pattern.name,
          start: match.index,
          end: regex.lastIndex,
          fullMatch: match[0],
          content: content,
          prefix: prefix,
        });
      }
    });

    matches.sort((a, b) => a.start - b.start);

    const filteredMatches = [];
    let lastEnd = 0;
    matches.forEach((match) => {
      if (match.start >= lastEnd) {
        filteredMatches.push(match);
        lastEnd = match.end;
      }
    });

    filteredMatches.forEach((match) => {
      if (match.start > currentPos) {
        segments.push({
          type: "text",
          content: text.substring(currentPos, match.start),
          key: segmentKey++,
        });
      }

      segments.push({
        type: match.type,
        content: match.content,
        fullMatch: match.fullMatch,
        prefix: match.prefix,
        key: segmentKey++,
      });

      currentPos = match.end;
    });

    if (currentPos < text.length) {
      segments.push({
        type: "text",
        content: text.substring(currentPos),
        key: segmentKey++,
      });
    }

    if (segments.length === 0) {
      segments.push({
        type: "text",
        content: text,
        key: segmentKey++,
      });
    }

    return segments;
  };

  const renderSegment = (segment, baseStyle) => {
    switch (segment.type) {
      case "bold":
        return (
          <Text key={segment.key} style={[baseStyle, { fontWeight: "700" }]}>
            {segment.content}
          </Text>
        );

      case "italic":
        return (
          <Text key={segment.key} style={[baseStyle, { fontStyle: "italic" }]}>
            {segment.content}
          </Text>
        );

      case "strike":
        return (
          <Text
            key={segment.key}
            style={[baseStyle, { textDecorationLine: "line-through" }]}
          >
            {segment.content}
          </Text>
        );

      case "monospace":
        return (
          <Text
            key={segment.key}
            style={[
              baseStyle,
              {
                fontFamily: "Courier",
                backgroundColor: "rgba(0,0,0,0.05)",
                paddingHorizontal: 4,
                paddingVertical: 2,
                borderRadius: 3,
              },
            ]}
          >
            {segment.content}
          </Text>
        );

      case "url":
        return (
          <Text
            key={segment.key}
            style={[
              baseStyle,
              {
                color: themeConfig.primary,
                textDecorationLine: "underline",
                fontWeight: "500",
              },
            ]}
            onPress={() => Linking.openURL(segment.fullMatch.trim())}
          >
            {segment.content}
          </Text>
        );

      case "url-no-protocol":
        const url = segment.content.trim();
        return (
          <Text
            key={segment.key}
            style={[
              baseStyle,
              {
                color: themeConfig.primary,
                textDecorationLine: "underline",
                fontWeight: "500",
              },
            ]}
            onPress={() => Linking.openURL(`http://${url}`)}
          >
            {segment.prefix}
            {url}
          </Text>
        );

      case "email":
        return (
          <Text
            key={segment.key}
            style={[
              baseStyle,
              {
                color: themeConfig.primary,
                textDecorationLine: "underline",
              },
            ]}
            onPress={() => Linking.openURL(`mailto:${segment.content}`)}
          >
            {segment.content}
          </Text>
        );

      case "phone":
        return (
          <Text
            key={segment.key}
            style={[
              baseStyle,
              {
                color: themeConfig.primary,
                textDecorationLine: "underline",
              },
            ]}
            onPress={() => Linking.openURL(`tel:${segment.fullMatch}`)}
          >
            {segment.fullMatch}
          </Text>
        );

      case "mention":
        return (
          <Text
            key={segment.key}
            style={[
              baseStyle,
              {
                color: themeConfig.primary,
                fontWeight: "600",
              },
            ]}
          >
            {segment.fullMatch}
          </Text>
        );

      case "hashtag":
        return (
          <Text
            key={segment.key}
            style={[
              baseStyle,
              {
                color: themeConfig.primary,
                fontWeight: "600",
              },
            ]}
          >
            {segment.fullMatch}
          </Text>
        );

      case "text":
      default:
        return (
          <Text key={segment.key} style={baseStyle}>
            {segment.content}
          </Text>
        );
    }
  };

  let processedText = convertEmoticons(text);
  const lines = processedText.split("\n");
  const elements = [];
  let key = 0;
  let listCounter = 0;

  lines.forEach((line, lineIndex) => {
    if (!line.trim()) {
      elements.push({ type: "break", key: key++, lineIndex });
      return;
    }

    const listMatch = line.match(/^(\s*)(\d+\.|\-|•|o|\*)\s+(.*)$/);
    if (config.lists && listMatch) {
      const [, indent, marker, content] = listMatch;
      const level = Math.floor(indent.length / 2);
      const isOrdered = /\d+\./.test(marker);

      if (isOrdered) {
        listCounter++;
      }

      elements.push({
        type: "list-item",
        content: content,
        level: level,
        ordered: isOrdered,
        number: listCounter,
        key: key++,
        lineIndex,
      });
      return;
    } else {
      listCounter = 0;
    }

    const segments = parseInlineFormatting(line, config);
    elements.push({
      type: "line",
      segments: segments,
      key: key++,
      lineIndex,
    });
  });

  const baseStyle = {
    fontSize: fontSize,
    lineHeight: fontSize * 1.5,
    color: themeConfig.textPrimary,
    letterSpacing: 0.15,
  };

  const renderedElements = elements.map((element, index) => {
    if (element.type === "break") {
      return (
        <Text key={`break-${element.key}`} style={baseStyle}>
          {"\n"}
        </Text>
      );
    }

    if (element.type === "list-item") {
      const bullet = element.ordered ? `${element.number}. ` : "• ";
      const indent = element.level * 20;

      return (
        <View
          key={`list-${element.key}`}
          style={{
            flexDirection: "row",
            marginLeft: indent,
            marginVertical: 2,
          }}
        >
          <Text style={[baseStyle, { marginRight: 8 }]}>{bullet}</Text>
          <View style={{ flex: 1 }}>
            <Text style={baseStyle}>
              {parseInlineFormatting(element.content, config).map((seg) =>
                renderSegment(seg, baseStyle)
              )}
            </Text>
          </View>
        </View>
      );
    }

    if (element.type === "line") {
      return (
        <Text key={`line-${element.key}`} style={baseStyle}>
          {element.segments.map((seg) => renderSegment(seg, baseStyle))}
          {index < elements.length - 1 && "\n"}
        </Text>
      );
    }

    return null;
  });

  return <>{renderedElements}</>;
}
