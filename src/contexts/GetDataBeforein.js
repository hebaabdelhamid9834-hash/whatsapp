import { View, Text } from "react-native";
import React from "react";
import { useGlobal } from "./GlobalContext";

export default function GetDataBeforein() {
  const { apiCall, setAddons } = useGlobal();

  async function getAddon(params) {
    const res = await apiCall("/api/web/return_module", {
      method: "GET",
    });
    if (res.success) {
      setAddons(res.data);
    }
  }

  React.useEffect(() => {
    getAddon();
  }, []);

  return null;
}
