import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import {
  Box,
  Button,
  Dialog,
  HStack,
  TextField,
  Typography,
  VStack,
} from "../ui";
import { useGlobal } from "../contexts/GlobalContext";

export default function SignupScreen({ theme, t }) {
  const { apiCall, loading, snack_msg, snack_success } = useGlobal();
  const [state, setState] = React.useState({
    dialog: false,
    email: "",
    mobile_with_country_code: "",
    password: "",
    name: "",
    acceptPolicy: true,
  });

  async function handleSignup(params) {
    const response = await apiCall("/api/user/signup", {
      method: "POST",
      data: state,
    });
    if (response.success) {
      setState({ ...state, dialog: false });
    }
  }

  return (
    <Box mt={20}>
      {/* Sign Up */}
      <HStack justifyContent="center" space={5}>
        <Typography color={theme.textSecondary}>
          {t("dontHaveAnAccount")}
        </Typography>
        <TouchableOpacity onPress={() => setState({ ...state, dialog: true })}>
          <Typography color={theme.primary}>{t("signUp")}</Typography>
        </TouchableOpacity>
      </HStack>

      <Dialog
        fullScreen
        titleIcon="log-in"
        visible={state.dialog}
        onClose={() => setState({ ...state, dialog: false })}
        title={t("signUp")}
      >
        <VStack space={8}>
          <TextField
            type="email"
            variant="whatsapp"
            leftIcon="mail-outline"
            placeholder={t("yourEmail")}
            value={state.email}
            onChangeText={(text) =>
              setState((prev) => ({ ...prev, email: text }))
            }
            borderRadius={0}
          />

          <TextField
            type="password"
            variant="whatsapp"
            leftIcon="lock-closed-outline"
            placeholder={t("password")}
            value={state.password}
            onChangeText={(text) =>
              setState((prev) => ({ ...prev, password: text }))
            }
            borderRadius={0}
          />

          <TextField
            variant="whatsapp"
            leftIcon="person-circle-outline"
            placeholder={t("yourName")}
            value={state.name}
            onChangeText={(text) =>
              setState((prev) => ({ ...prev, name: text }))
            }
            borderRadius={0}
          />

          <TextField
            variant="whatsapp"
            leftIcon="call-outline"
            placeholder={t("mobile")}
            value={state.mobile_with_country_code}
            onChangeText={(text) =>
              setState((prev) => ({ ...prev, mobile_with_country_code: text }))
            }
            type="number"
            borderRadius={0}
            helperText={t("mobileHelper")}
          />

          <Button
            onPress={handleSignup}
            loading={loading}
            color="secondary"
            fullWidth
            startIcon={"log-in"}
            style={{
              borderRadius: 0,
            }}
          >
            {t("signUp")}
          </Button>

          {snack_msg && !snack_success && (
            <Typography color={theme.error}>{snack_msg}</Typography>
          )}
        </VStack>
      </Dialog>
    </Box>
  );
}
