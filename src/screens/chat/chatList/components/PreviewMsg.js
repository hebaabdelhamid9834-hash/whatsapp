import { View, Text } from "react-native";
import React from "react";
import { HStack, Icon, Typography } from "../../../../ui";
import { useTranslate } from "../../../../contexts/TranslateContext";

export default function PreviewMsg({ i, theme, t, unreadCount }) {
  const getMessageIcon = (type) => {
    const iconProps = {
      style: {
        color: i?.route === "INCOMING" ? theme.primary : theme.secondary,
        opacity: 0.9,
      },
    };

    switch (type) {
      case "text":
        return null;
      case "image":
        return <Icon size={15} name="image-outline" {...iconProps} />;
      case "video":
        return <Icon size={15} name="videocam-outline" {...iconProps} />;
      case "audio":
        return <Icon size={15} name="musical-note-outline" {...iconProps} />;
      case "document":
        return <Icon size={15} name="document-text-outline" {...iconProps} />;
      case "location":
        return <Icon size={15} name="navigate-outline" {...iconProps} />;
      case "contact":
        return <Icon size={15} name="person-circle-outline" {...iconProps} />;
      case "reaction":
        return <Icon size={15} name="happy-outline" {...iconProps} />;
      case "sticker":
        return <Icon size={15} name="aperture-outline" {...iconProps} />;
      case "status":
        return <Icon size={15} name="hourglass-outline" {...iconProps} />;
      case "button":
        return <Icon size={15} name="radio-button-on-outline" {...iconProps} />;
      case "list":
        return <Icon size={15} name="list-outline" {...iconProps} />;
      default:
        return null;
    }
  };

  const renderPreview = () => {
    const messageIcon = getMessageIcon(i?.type);

    // Direction icon
    const directionIcon =
      i?.route === "INCOMING" ? (
        <Icon size={15} name={"arrow-down-outline"} color={theme.success} />
      ) : (
        <Icon size={15} name={"arrow-up-outline"} color={theme.info} />
      );

    // Base styling for all message previews
    const baseStyle = {
      color: i.route === "INCOMING" ? theme.textPrimary : theme.textSecondary,
      fontWeight: unreadCount > 0 ? 500 : 400,
    };

    switch (i?.type) {
      case "text":
        return (
          <HStack space={10} alignItems="center">
            {directionIcon}
            <Typography numberOfLines={1} sx={baseStyle}>
              {i?.msgContext?.text?.body}
            </Typography>
          </HStack>
        );

      case "image":
        return (
          <HStack space={10} alignItems="center">
            {directionIcon}
            <HStack space={5} alignItems="center">
              {messageIcon}
              <Typography numberOfLines={1} sx={baseStyle}>
                {t("photo") || "Photo"}{" "}
                {i?.msgContext?.image?.caption
                  ? `• ${i?.msgContext?.image?.caption}`
                  : ""}
              </Typography>
            </HStack>
          </HStack>
        );

      case "video":
        return (
          <HStack space={10} alignItems="center">
            {directionIcon}
            <HStack space={5} alignItems="center">
              {messageIcon}
              <Typography numberOfLines={1} sx={baseStyle}>
                {t("video") || "Video"}{" "}
                {i?.msgContext?.video?.caption
                  ? `• ${i?.msgContext?.video?.caption}`
                  : ""}
              </Typography>
            </HStack>
          </HStack>
        );

      case "audio":
        return (
          <HStack space={10} alignItems="center">
            {directionIcon}
            <HStack space={5} alignItems="center">
              {messageIcon}
              <Typography numberOfLines={1} sx={baseStyle}>
                {t("audioMsgg") || "Voice message"}
              </Typography>
            </HStack>
          </HStack>
        );

      case "document":
        return (
          <HStack space={10} alignItems="center">
            {directionIcon}
            <HStack space={5} alignItems="center">
              {messageIcon}
              <Typography numberOfLines={1} sx={baseStyle}>
                {t("document") || "Document"}{" "}
                {i?.msgContext?.document?.caption
                  ? `• ${i?.msgContext?.document?.caption}`
                  : ""}
              </Typography>
            </HStack>
          </HStack>
        );

      case "location":
        return (
          <HStack space={10} alignItems="center">
            {directionIcon}
            <HStack space={5} alignItems="center">
              {messageIcon}
              <Typography numberOfLines={1} sx={baseStyle}>
                {t("locShared") || "Location shared"}
              </Typography>
            </HStack>
          </HStack>
        );

      case "contact":
        const contactName =
          i?.msgContext?.contact?.contacts?.[0]?.name?.formatted_name ||
          "Contact";
        return (
          <HStack space={10} alignItems="center">
            {directionIcon}
            <HStack space={5} alignItems="center">
              {messageIcon}
              <Typography numberOfLines={1} sx={baseStyle}>
                {(t("contactt") || "Contact") + ": " + contactName}
              </Typography>
            </HStack>
          </HStack>
        );

      case "reaction":
        return (
          <HStack space={10} alignItems="center">
            {directionIcon}
            <HStack space={5} alignItems="center">
              {messageIcon}
              <Typography numberOfLines={1} sx={baseStyle}>
                {`Reacted with ${i?.reaction || "emoji"}`}
              </Typography>
            </HStack>
          </HStack>
        );

      case "sticker":
        return (
          <HStack space={10} alignItems="center">
            {directionIcon}
            <HStack space={5} alignItems="center">
              {messageIcon}
              <Typography numberOfLines={1} sx={baseStyle}>
                {t("stickerSent") || "Sticker"}
              </Typography>
            </HStack>
          </HStack>
        );

      case "status":
        return (
          <HStack space={10} alignItems="center">
            {directionIcon}
            <HStack space={5} alignItems="center">
              {messageIcon}
              <Typography numberOfLines={1} sx={baseStyle}>
                {i?.msgContext?.status?.status || "Status update"}
              </Typography>
            </HStack>
          </HStack>
        );

      case "button":
        return (
          <HStack space={10} alignItems="center">
            {directionIcon}
            <HStack space={5} alignItems="center">
              {messageIcon}
              <Typography numberOfLines={1} sx={baseStyle}>
                {i?.msgContext?.interactive?.body?.text || "Button message"}
              </Typography>
            </HStack>
          </HStack>
        );

      case "list":
        return (
          <HStack space={10} alignItems="center">
            {directionIcon}
            <HStack space={5} alignItems="center">
              {messageIcon}
              <Typography numberOfLines={1} sx={baseStyle}>
                {i?.msgContext?.interactive?.header?.text || "List message"}
              </Typography>
            </HStack>
          </HStack>
        );

      default:
        return (
          <HStack space={10} alignItems="center">
            {directionIcon}
            <Typography numberOfLines={1} variant="caption" sx={baseStyle}>
              {t("unkwnMsg") || "Unknown message type"}
            </Typography>
          </HStack>
        );
    }
  };

  return renderPreview();
}
