import React from "react";
import { ScrollView } from "react-native";
import Box from "./Box";

// HStack - Horizontal Stack
export function HStack({
  children,
  space = 0,
  alignItems = "center",
  justifyContent = "flex-start",
  wrap = false,
  scrollable = false,
  ...props
}) {
  const spacedChildren = React.Children.map(children, (child, index) => {
    if (!child) return null;
    return (
      <Box
        key={index}
        mr={index < React.Children.count(children) - 1 ? space : 0}
        flexShrink={scrollable ? 0 : 1} // Only prevent shrinking when scrollable
      >
        {child}
      </Box>
    );
  });

  const content = (
    <Box
      flexDirection="row"
      alignItems={alignItems}
      justifyContent={justifyContent}
      flexWrap={wrap ? "wrap" : "nowrap"}
      {...props}
    >
      {spacedChildren}
    </Box>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: alignItems,
        }}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}

// VStack - Vertical Stack
export function VStack({
  children,
  space = 0,
  alignItems = "stretch",
  justifyContent = "flex-start",
  ...props
}) {
  const spacedChildren = React.Children.map(children, (child, index) => {
    if (!child) return null;
    return (
      <Box
        key={index}
        mb={index < React.Children.count(children) - 1 ? space : 0}
      >
        {child}
      </Box>
    );
  });

  return (
    <Box
      flexDirection="column"
      alignItems={alignItems}
      justifyContent={justifyContent}
      {...props}
    >
      {spacedChildren}
    </Box>
  );
}
