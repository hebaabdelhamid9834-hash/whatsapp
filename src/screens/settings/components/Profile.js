import { View, Text } from "react-native";
import React from "react";
import {
  Avatar,
  Box,
  Button,
  HStack,
  TextField,
  Typography,
  VStack,
} from "../../../ui";
import { useGlobal } from "../../../contexts/GlobalContext";

export default function Profile({ t }) {
  const { userData, apiCall, setData, data } = useGlobal();
  const profile = userData;
  function setProfile(e) {
    setData({
      ...data,
      userData: {
        ...userData, // or ...profile or ...data.userData
        ...e,
      },
    });
  }

  async function updateProfile(params) {
    const res = await apiCall("/api/user/update_profile", {
      method: "POST",
      data: profile,
    });
  }

  return (
    <Box p={10}>
      <VStack space={15}>
        <VStack space={10} alignItems="center">
          <Avatar name={profile.name} size="large" />
          <VStack alignItems="center">
            <Typography>{profile.name}</Typography>
            <Typography color={"gray"}>{profile.email}</Typography>
          </VStack>
        </VStack>

        <TextField
          leftIcon={"person-outline"}
          onChangeText={(e) => setProfile({ ...profile, name: e })}
          variant="standard"
          label={t("name")}
          value={profile.name}
        />

        <TextField
          leftIcon={"mail-outline"}
          onChangeText={(e) => setProfile({ ...profile, email: e })}
          variant="standard"
          label={t("email")}
          value={profile.email}
        />

        <TextField
          leftIcon={"call-outline"}
          onChangeText={(e) =>
            setProfile({ ...profile, mobile_with_country_code: e })
          }
          variant="standard"
          label={t("mobile")}
          value={profile.mobile_with_country_code}
        />

        <TextField
          leftIcon={"call-outline"}
          onChangeText={(e) => setProfile({ ...profile, newPassword: e })}
          variant="standard"
          label={t("password")}
          helperText={t("ignorePass")}
          value={profile.newPassword}
        />

        <Button onPress={updateProfile} startIcon={"save-outline"}>
          {t("save")}
        </Button>
      </VStack>
    </Box>
  );
}
