// src/screens/TryUI.js
import React, { useState } from "react";
import { ScrollView, Switch } from "react-native";
import {
  // Layout
  Box,
  Container,
  HStack,
  VStack,
  Divider,

  // Typography
  Typography,

  // Inputs
  TextField,
  Button,
  IconButton,
  SearchBar,
  MessageInput,

  // Display
  Avatar,
  Badge,
  Chip,
  ChatBubble,

  // Feedback
  Snackbar,
  Dialog,
  Loading,

  // Navigation
  AppBar,

  // Chat
  ChatListItem,
} from "../ui";
import { useTheme } from "../contexts/ThemeContext";

export default function ProfileScreen({ navigation }) {
  const { theme, colorMode, toggleColorMode } = useTheme();

  // States for interactive components
  const [textValue, setTextValue] = useState("");
  const [password, setPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarVariant, setSnackbarVariant] = useState("default");
  const [loading, setLoading] = useState(false);

  // Section Header Component
  const SectionHeader = ({ title, subtitle }) => (
    <VStack space={4} mb={16}>
      <Typography variant="h5" fontWeight="700">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color={theme.textSecondary}>
          {subtitle}
        </Typography>
      )}
    </VStack>
  );

  return (
    <Container safeArea={false} scrollable={false}>
      {/* ============================================
          APP BAR COMPONENT
          ============================================ */}
      <AppBar
        title="UI Components"
        subtitle="Complete Component Library"
        leftIcon="arrow-back"
        rightIcons={["search", "ellipsis-vertical"]}
        onLeftPress={() => navigation.goBack()}
        onRightPress={(icon) => console.log("Pressed:", icon)}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={32} px={20} py={24}>
          {/* ============================================
              THEME TOGGLE
              ============================================ */}
          <Box
            bg={theme.surface}
            p={16}
            borderRadius={12}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space={12} alignItems="center">
                <IconButton
                  icon={colorMode === "dark" ? "moon" : "sunny"}
                  variant="contained"
                  size="medium"
                />
                <VStack space={2}>
                  <Typography variant="subtitle1" fontWeight="600">
                    Dark Mode
                  </Typography>
                  <Typography variant="caption" color={theme.textSecondary}>
                    Currently {colorMode === "dark" ? "enabled" : "disabled"}
                  </Typography>
                </VStack>
              </HStack>
              <Switch
                value={colorMode === "dark"}
                onValueChange={toggleColorMode}
                trackColor={{ false: "#767577", true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </HStack>
          </Box>

          <Divider />

          {/* ============================================
              TYPOGRAPHY COMPONENT
              ============================================ */}
          <VStack space={16}>
            <SectionHeader
              title="Typography"
              subtitle="All text variants with different weights"
            />

            <VStack space={8}>
              <Typography variant="h1" fontWeight="700">
                Heading 1 - Bold
              </Typography>
              <Typography variant="h2" fontWeight="600">
                Heading 2 - SemiBold
              </Typography>
              <Typography variant="h3" fontWeight="500">
                Heading 3 - Medium
              </Typography>
              <Typography variant="h4">Heading 4 - Regular</Typography>
              <Typography variant="h5">Heading 5 - Regular</Typography>
              <Typography variant="h6">Heading 6 - Regular</Typography>

              <Divider style={{ marginVertical: 8 }} />

              <Typography variant="subtitle1" fontWeight="600">
                Subtitle 1 - SemiBold
              </Typography>
              <Typography variant="subtitle2" fontWeight="500">
                Subtitle 2 - Medium
              </Typography>

              <Typography variant="body1">
                Body 1 - This is regular body text for paragraphs and content.
              </Typography>
              <Typography variant="body2" color={theme.textSecondary}>
                Body 2 - Secondary text with smaller size.
              </Typography>

              <Typography variant="caption" color={theme.textSecondary}>
                Caption - Small text for labels and hints
              </Typography>

              <Typography variant="overline" color={theme.textSecondary}>
                OVERLINE - UPPERCASE TEXT
              </Typography>
            </VStack>
          </VStack>

          <Divider />

          {/* ============================================
              BUTTON COMPONENT
              ============================================ */}
          <VStack space={16}>
            <SectionHeader
              title="Buttons"
              subtitle="Different variants, colors, and sizes"
            />

            {/* Variants */}
            <VStack space={12}>
              <Typography variant="subtitle2" fontWeight="600">
                Variants
              </Typography>
              <Button
                variant="contained"
                onPress={() => console.log("Contained")}
              >
                Contained Button
              </Button>
              <Button
                variant="outlined"
                onPress={() => console.log("Outlined")}
              >
                Outlined Button
              </Button>
              <Button variant="text" onPress={() => console.log("Text")}>
                Text Button
              </Button>
            </VStack>

            {/* Colors */}
            <VStack space={12}>
              <Typography variant="subtitle2" fontWeight="600">
                Colors
              </Typography>
              <HStack space={8} flexWrap="wrap">
                <Button color="primary">Primary</Button>
                <Button color="secondary">Secondary</Button>
                <Button color="success">Success</Button>
                <Button color="error">Error</Button>
              </HStack>
            </VStack>

            {/* Sizes */}
            <VStack space={12}>
              <Typography variant="subtitle2" fontWeight="600">
                Sizes
              </Typography>
              <Button size="small">Small Button</Button>
              <Button size="medium">Medium Button</Button>
              <Button size="large">Large Button</Button>
            </VStack>

            {/* With Icons */}
            <VStack space={12}>
              <Typography variant="subtitle2" fontWeight="600">
                With Icons
              </Typography>
              <Button startIcon="heart" endIcon="arrow-forward">
                With Icons
              </Button>
              <Button startIcon="download-outline" variant="outlined">
                Download
              </Button>
            </VStack>

            {/* States */}
            <VStack space={12}>
              <Typography variant="subtitle2" fontWeight="600">
                States
              </Typography>
              <Button loading>Loading Button</Button>
              <Button disabled>Disabled Button</Button>
              <Button fullWidth>Full Width Button</Button>
            </VStack>
          </VStack>

          <Divider />

          {/* ============================================
              ICON BUTTON COMPONENT
              ============================================ */}
          <VStack space={16}>
            <SectionHeader
              title="Icon Buttons"
              subtitle="Circular icon buttons with variants"
            />

            <VStack space={12}>
              <Typography variant="subtitle2" fontWeight="600">
                Variants & Sizes
              </Typography>
              <HStack space={12} alignItems="center">
                <IconButton icon="heart" variant="contained" size="small" />
                <IconButton icon="heart" variant="contained" size="medium" />
                <IconButton icon="heart" variant="contained" size="large" />
              </HStack>

              <HStack space={12} alignItems="center">
                <IconButton icon="star" variant="outlined" />
                <IconButton icon="bookmark" variant="text" />
                <IconButton
                  icon="share-social"
                  variant="contained"
                  color="success"
                />
                <IconButton icon="trash" variant="contained" color="error" />
              </HStack>
            </VStack>
          </VStack>

          <Divider />

          {/* ============================================
              TEXT FIELD COMPONENT
              ============================================ */}
          <VStack space={16}>
            <SectionHeader
              title="Text Fields"
              subtitle="Input fields with various configurations"
            />

            <TextField
              label="Basic Input"
              value={textValue}
              onChangeText={setTextValue}
              placeholder="Enter text..."
            />

            <TextField
              label="With Left Icon"
              value={textValue}
              onChangeText={setTextValue}
              placeholder="Enter email..."
              leftIcon="mail-outline"
              keyboardType="email-address"
            />

            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password..."
              secureTextEntry
              leftIcon="lock-closed-outline"
            />

            <TextField
              label="With Helper Text"
              placeholder="Username"
              helperText="Choose a unique username"
              leftIcon="person-outline"
            />

            <TextField
              label="Error State"
              placeholder="Invalid input"
              error
              helperText="This field is required"
            />

            <TextField
              label="Disabled"
              placeholder="Disabled input"
              disabled
              value="Cannot edit"
            />

            <TextField
              label="Multiline"
              placeholder="Enter your message..."
              multiline
              numberOfLines={4}
            />
          </VStack>

          <Divider />

          {/* ============================================
              SEARCH BAR COMPONENT
              ============================================ */}
          <VStack space={16}>
            <SectionHeader
              title="Search Bar"
              subtitle="iOS-style search with cancel button"
            />

            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search messages..."
              showCancel={searchQuery.length > 0}
              onCancel={() => setSearchQuery("")}
            />
          </VStack>

          <Divider />

          {/* ============================================
              AVATAR COMPONENT
              ============================================ */}
          <VStack space={16}>
            <SectionHeader
              title="Avatars"
              subtitle="Profile pictures with different sizes"
            />

            <VStack space={12}>
              <Typography variant="subtitle2" fontWeight="600">
                Sizes
              </Typography>
              <HStack space={12} alignItems="center">
                <Avatar
                  src="https://i.pravatar.cc/150?img=1"
                  name="John Doe"
                  size="small"
                />
                <Avatar
                  src="https://i.pravatar.cc/150?img=2"
                  name="Jane Smith"
                  size="medium"
                />
                <Avatar
                  src="https://i.pravatar.cc/150?img=3"
                  name="Bob Wilson"
                  size="large"
                />
                <Avatar
                  src="https://i.pravatar.cc/150?img=4"
                  name="Alice Brown"
                  size="xlarge"
                />
              </HStack>
            </VStack>

            <VStack space={12}>
              <Typography variant="subtitle2" fontWeight="600">
                Without Image (Initials)
              </Typography>
              <HStack space={12} alignItems="center">
                <Avatar name="John Doe" size="medium" />
                <Avatar name="Jane Smith" size="medium" />
                <Avatar name="Bob Wilson" size="medium" />
                <Avatar name="Alice Brown" size="medium" />
              </HStack>
            </VStack>
          </VStack>

          <Divider />

          {/* ============================================
              BADGE COMPONENT
              ============================================ */}
          <VStack space={16}>
            <SectionHeader
              title="Badges"
              subtitle="Notification badges with different variants"
            />

            <VStack space={12}>
              <Typography variant="subtitle2" fontWeight="600">
                Standard Badges
              </Typography>
              <HStack space={16} alignItems="center">
                <Badge content={5} color="primary">
                  <IconButton icon="mail-outline" variant="outlined" />
                </Badge>

                <Badge content={99} color="error">
                  <IconButton icon="notifications-outline" variant="outlined" />
                </Badge>

                <Badge content={1000} max={999} color="success">
                  <IconButton icon="chatbubble-outline" variant="outlined" />
                </Badge>
              </HStack>
            </VStack>

            <VStack space={12}>
              <Typography variant="subtitle2" fontWeight="600">
                Dot Badges
              </Typography>
              <HStack space={16} alignItems="center">
                <Badge variant="dot" color="success">
                  <Avatar
                    src="https://i.pravatar.cc/150?img=5"
                    name="Online User"
                    size="large"
                  />
                </Badge>

                <Badge variant="dot" color="error">
                  <IconButton icon="person-outline" variant="outlined" />
                </Badge>
              </HStack>
            </VStack>
          </VStack>

          <Divider />

          {/* ============================================
              CHIP COMPONENT
              ============================================ */}
          <VStack space={16}>
            <SectionHeader
              title="Chips"
              subtitle="Compact elements for tags and filters"
            />

            <VStack space={12}>
              <Typography variant="subtitle2" fontWeight="600">
                Filled Chips
              </Typography>
              <HStack space={8} flexWrap="wrap">
                <Chip label="Default" />
                <Chip label="Primary" color="primary" />
                <Chip label="Success" color="success" />
                <Chip label="Error" color="error" />
              </HStack>
            </VStack>

            <VStack space={12}>
              <Typography variant="subtitle2" fontWeight="600">
                Outlined Chips
              </Typography>
              <HStack space={8} flexWrap="wrap">
                <Chip label="Outlined" variant="outlined" />
                <Chip label="Primary" variant="outlined" color="primary" />
                <Chip label="Success" variant="outlined" color="success" />
              </HStack>
            </VStack>

            <VStack space={12}>
              <Typography variant="subtitle2" fontWeight="600">
                With Icons
              </Typography>
              <HStack space={8} flexWrap="wrap">
                <Chip label="Favorite" icon="heart" color="error" />
                <Chip
                  label="Verified"
                  icon="checkmark-circle"
                  color="success"
                />
                <Chip label="Star" icon="star" color="primary" />
              </HStack>
            </VStack>

            <VStack space={12}>
              <Typography variant="subtitle2" fontWeight="600">
                With Avatar & Delete
              </Typography>
              <HStack space={8} flexWrap="wrap">
                <Chip
                  label="John Doe"
                  avatar="https://i.pravatar.cc/150?img=1"
                  onDelete={() => console.log("Delete John")}
                />
                <Chip
                  label="Jane Smith"
                  avatar="https://i.pravatar.cc/150?img=2"
                  onDelete={() => console.log("Delete Jane")}
                />
              </HStack>
            </VStack>

            <VStack space={12}>
              <Typography variant="subtitle2" fontWeight="600">
                Clickable & Sizes
              </Typography>
              <HStack space={8} flexWrap="wrap">
                <Chip
                  label="Click Me"
                  color="primary"
                  onPress={() => console.log("Clicked")}
                />
                <Chip label="Small" size="small" color="secondary" />
                <Chip label="Medium" size="medium" color="success" />
              </HStack>
            </VStack>
          </VStack>

          <Divider />

          {/* ============================================
              CHAT BUBBLE COMPONENT
              ============================================ */}
          <VStack space={16}>
            <SectionHeader
              title="Chat Bubbles"
              subtitle="WhatsApp-style message bubbles"
            />

            <VStack space={8}>
              <ChatBubble
                message="Hey! How are you doing? 😊"
                timestamp="10:30 AM"
                isSent={false}
                showTail={true}
              />

              <ChatBubble
                message="I'm great! Thanks for asking. How about you?"
                timestamp="10:31 AM"
                isSent={true}
                isRead={true}
                showTail={true}
              />

              <ChatBubble
                message="Doing well! Are we still meeting tomorrow?"
                timestamp="10:32 AM"
                isSent={false}
                showTail={false}
              />

              <ChatBubble
                message="Yes! See you at 3 PM ☕"
                timestamp="10:33 AM"
                isSent={true}
                isDelivered={true}
                showTail={true}
                onLongPress={() => console.log("Long press message")}
              />
            </VStack>
          </VStack>

          <Divider />

          {/* ============================================
              CHAT LIST ITEM COMPONENT
              ============================================ */}
          <VStack space={16}>
            <SectionHeader
              title="Chat List Items"
              subtitle="WhatsApp-style chat list entries"
            />

            <VStack>
              <ChatListItem
                avatar="https://i.pravatar.cc/150?img=6"
                name="John Doe"
                lastMessage="Hey! How are you doing?"
                timestamp="10:30 AM"
                unreadCount={3}
                isOnline={true}
                isPinned={true}
                onPress={() => console.log("Open chat")}
              />

              <Divider variant="inset" />

              <ChatListItem
                avatar="https://i.pravatar.cc/150?img=7"
                name="Jane Smith"
                lastMessage="See you tomorrow! 👋"
                timestamp="Yesterday"
                unreadCount={0}
                isOnline={false}
                isMuted={true}
                onPress={() => console.log("Open chat")}
              />

              <Divider variant="inset" />

              <ChatListItem
                avatar={null}
                name="Dev Team"
                lastMessage="Alice is typing..."
                timestamp="9:45 AM"
                unreadCount={12}
                isTyping={true}
                onPress={() => console.log("Open chat")}
              />
            </VStack>
          </VStack>

          <Divider />

          {/* ============================================
              MESSAGE INPUT COMPONENT
              ============================================ */}
          <VStack space={16}>
            <SectionHeader
              title="Message Input"
              subtitle="WhatsApp-style message composer"
            />

            <Box
              bg={theme.surface}
              borderRadius={12}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <MessageInput
                value={message}
                onChangeText={setMessage}
                onSend={(text) => {
                  console.log("Sending:", text);
                  setMessage("");
                  setSnackbarVariant("success");
                  setShowSnackbar(true);
                }}
                onAttach={() => console.log("Attach")}
                onCamera={() => console.log("Camera")}
                onVoice={() => console.log("Voice")}
                placeholder="Type a message..."
              />
            </Box>
          </VStack>

          <Divider />

          {/* ============================================
              DIVIDER COMPONENT
              ============================================ */}
          <VStack space={16}>
            <SectionHeader
              title="Dividers"
              subtitle="Separators with different variants"
            />

            <VStack space={16}>
              <Typography variant="caption">Full Width</Typography>
              <Divider />

              <Typography variant="caption">Inset</Typography>
              <Divider variant="inset" />

              <Typography variant="caption">Middle</Typography>
              <Divider variant="middle" />

              <Typography variant="caption">With Text (Center)</Typography>
              <Divider textAlign="center">OR</Divider>

              <Typography variant="caption">With Text (Left)</Typography>
              <Divider textAlign="left">Section Title</Divider>

              <Typography variant="caption">With Text (Right)</Typography>
              <Divider textAlign="right">End</Divider>
            </VStack>
          </VStack>

          <Divider />

          {/* ============================================
              DIALOG COMPONENT
              ============================================ */}
          <VStack space={16}>
            <SectionHeader
              title="Dialog"
              subtitle="Modal dialogs with actions"
            />

            <Button
              variant="outlined"
              onPress={() => setShowDialog(true)}
              startIcon="alert-circle-outline"
            >
              Open Dialog
            </Button>
          </VStack>

          <Divider />

          {/* ============================================
              SNACKBAR COMPONENT
              ============================================ */}
          <VStack space={16}>
            <SectionHeader
              title="Snackbar"
              subtitle="Toast notifications with variants"
            />

            <HStack space={8} flexWrap="wrap">
              <Button
                size="small"
                onPress={() => {
                  setSnackbarVariant("default");
                  setShowSnackbar(true);
                }}
              >
                Default
              </Button>

              <Button
                size="small"
                color="success"
                onPress={() => {
                  setSnackbarVariant("success");
                  setShowSnackbar(true);
                }}
              >
                Success
              </Button>

              <Button
                size="small"
                color="error"
                onPress={() => {
                  setSnackbarVariant("error");
                  setShowSnackbar(true);
                }}
              >
                Error
              </Button>

              <Button
                size="small"
                color="secondary"
                onPress={() => {
                  setSnackbarVariant("info");
                  setShowSnackbar(true);
                }}
              >
                Info
              </Button>
            </HStack>
          </VStack>

          <Divider />

          {/* ============================================
              LOADING COMPONENT
              ============================================ */}
          <VStack space={16}>
            <SectionHeader
              title="Loading"
              subtitle="Loading indicators with text"
            />

            <VStack space={16}>
              <HStack space={16} alignItems="center">
                <Loading size="small" />
                <Loading size="large" />
                <Loading size="large" color={theme.success} />
              </HStack>

              <Box
                bg={theme.surface}
                p={24}
                borderRadius={12}
                alignItems="center"
              >
                <Loading text="Loading data..." />
              </Box>

              <Button
                variant="outlined"
                onPress={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 2000);
                }}
              >
                Show Overlay Loading
              </Button>
            </VStack>
          </VStack>

          {/* Bottom Spacing */}
          <Box height={40} />
        </VStack>
      </ScrollView>

      {/* ============================================
          DIALOG INSTANCE
          ============================================ */}
      <Dialog
        visible={showDialog}
        title="Confirm Action"
        content="Are you sure you want to proceed with this action? This cannot be undone."
        onClose={() => setShowDialog(false)}
        actions={[
          {
            label: "Cancel",
            variant: "text",
            onPress: () => setShowDialog(false),
          },
          {
            label: "Confirm",
            variant: "contained",
            color: "primary",
            onPress: () => {
              setShowDialog(false);
              setSnackbarVariant("success");
              setShowSnackbar(true);
            },
          },
        ]}
      />

      {/* ============================================
          SNACKBAR INSTANCE
          ============================================ */}
      <Snackbar
        visible={showSnackbar}
        message={
          snackbarVariant === "success"
            ? "Action completed successfully!"
            : snackbarVariant === "error"
            ? "An error occurred. Please try again."
            : snackbarVariant === "info"
            ? "Here's some helpful information."
            : "This is a default notification"
        }
        variant={snackbarVariant}
        action="UNDO"
        onActionPress={() => console.log("Undo action")}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        position="bottom"
      />

      {/* ============================================
          LOADING OVERLAY
          ============================================ */}
      {loading && <Loading overlay text="Please wait..." size="large" />}
    </Container>
  );
}
