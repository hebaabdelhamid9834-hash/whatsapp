import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseUrl } from "./api";
import { useTheme } from "./ThemeContext";
import { Dialog } from "../ui";

const DialogContext = createContext(null);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};

export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = React.useState({
    open: false,
    title: "",
    message: "",
    cancel: "Cancel",
    confirm: "Confirm",
    fun: () => {},
  });

  const value = {
    setDialog,
    dialog,
  };

  return (
    <DialogContext.Provider value={value}>
      <Dialog
        visible={dialog.open}
        title={dialog.title}
        content={dialog.message}
        onClose={() => setDialog({ ...dialog, open: false })}
        actions={[
          {
            label: dialog.cancel,
            variant: "text",
            onPress: () => setDialog({ ...dialog, open: false }),
          },
          {
            label: dialog.confirm,
            variant: "contained",
            color: "primary",
            onPress: () => {
              setDialog({ ...dialog, open: false });
              dialog.fun();
            },
          },
        ]}
      />
      {children}
    </DialogContext.Provider>
  );
};
