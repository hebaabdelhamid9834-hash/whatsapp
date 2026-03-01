import { View, Text } from "react-native";
import React from "react";
import { Box, Container, Typography } from "../../../../ui";
import Notes from "./Notes";
import ContactDetails from "./ContactDetails";
import ChatLabel from "./ChatLabel";
import AsignAgent from "./AsignAgent";
import MediaComp from "./mediaComp/MediaComp";

export default function ChatDetailsComp({ route }) {
  const id = route?.params?.i?.id;
  return (
    <Container>
      <Box>
        {id === "Notes" && <Notes />}
        {id === "ContactDetails" && <ContactDetails />}
        {id === "ChatLabel" && <ChatLabel />}
        {id === "AsignAgent" && <AsignAgent />}
        {id === "Medias" && <MediaComp />}
      </Box>
    </Container>
  );
}
