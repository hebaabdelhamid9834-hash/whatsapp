import React from "react";
import { View, Dimensions } from "react-native";
import Box from "./Box";

// Get screen width for potential responsive calculations
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Breakpoints (similar to MUI, but fixed since RN doesn't have media queries)
const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

// Helper to get current breakpoint (always 'xs' since no media queries)
const getCurrentBreakpoint = () => "xs";

// Helper to get span value for current breakpoint
const getSpan = (props) => {
  const breakpoint = getCurrentBreakpoint();
  return props[breakpoint] || 12; // Default to full width if no prop
};

// Grid Container
function Container({
  children,
  spacing = 0, // 0-10 like MUI
  direction = "row",
  justifyContent = "flex-start",
  alignItems = "stretch",
  wrap = true,
  style,
  ...props
}) {
  // Convert spacing to pixels (MUI spacing is 8px * spacing)
  const spacingPx = spacing * 8;

  // For negative margin technique like MUI
  const containerStyle = {
    flexDirection: direction,
    justifyContent: justifyContent,
    alignItems: alignItems,
    flexWrap: wrap ? "wrap" : "nowrap",
    marginHorizontal: -spacingPx / 2,
    marginVertical: -spacingPx / 2,
  };

  return (
    <Box style={[containerStyle, style]} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            spacingPx,
            ...child.props,
          });
        }
        return child;
      })}
    </Box>
  );
}

// Grid Item
function Item({
  children,
  xs = 12,
  sm,
  md,
  lg,
  xl,
  spacingPx = 0,
  zeroMinWidth = false,
  style,
  ...props
}) {
  const span = getSpan({ xs, sm, md, lg, xl });
  const percentage = `${(span / 12) * 100}%`;

  const itemStyle = {
    flexBasis: zeroMinWidth ? "auto" : percentage,
    flexGrow: 0,
    flexShrink: 0,
    maxWidth: zeroMinWidth ? "none" : percentage,
    minWidth: zeroMinWidth ? 0 : percentage,
    paddingHorizontal: spacingPx / 2,
    paddingVertical: spacingPx / 2,
  };

  return (
    <Box style={[itemStyle, style]} {...props}>
      {children}
    </Box>
  );
}

// Main Grid component
const Grid = {
  Container,
  Item,
};

export default Grid;
