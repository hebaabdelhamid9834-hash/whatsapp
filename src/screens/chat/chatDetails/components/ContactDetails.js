import { View, Text } from "react-native";
import React from "react";
import {
  Box,
  Button,
  CustomHeader,
  Divider,
  Grid,
  HStack,
  Icon,
  IconButton,
  Select,
  TextField,
  Typography,
  VStack,
} from "../../../../ui";
import { useTranslate } from "../../../../contexts/TranslateContext";
import Top from "./Top";
import { useInbox } from "../../../../contexts/InboxContext";
import { useTheme } from "../../../../contexts/ThemeContext";

export default function ContactDetails() {
  const { t } = useTranslate();
  const { chatInfo, sendToSocket, phonebookData } = useInbox();
  const { theme } = useTheme();
  const hasContactData = Boolean(chatInfo.contactData);

  const [state, setstate] = React.useState({
    conName: "",
    conMob: Number(chatInfo?.sender_mobile),
    var1: "",
    var2: "",
    var3: "",
    var4: "",
    var5: "",
    dialog: false,
    phonebookDataa: {},
  });

  function saveAsContact() {
    sendToSocket("save_as_context", state);
  }

  function delContact(contactId) {
    sendToSocket("del_contact", { contactId });
  }

  // ✅ Build agent options properly
  const contactOptions = React.useMemo(() => {
    return phonebookData.map((c) => ({
      label: c.name,
      value: c.name, // ✅ Ensure string
      id: c.id,
      ...c,
    }));
  }, [phonebookData, t]);

  const handleSelectPhonebook = (value, selectedPB) => {
    setstate({ ...state, phonebookDataa: selectedPB });
  };

  const varArr = [
    {
      code: "var1",
    },
    {
      code: "var2",
    },
    {
      code: "var3",
    },
    {
      code: "var4",
    },
    {
      code: "var5",
    },
  ];

  return (
    <Box>
      <CustomHeader title={t("contactDetails")} />
      <Box px={10} mt={5}>
        <VStack space={10}>
          <Top />

          {hasContactData ? (
            <VStack space={10}>
              <TextField
                editable={false}
                variant="whatsapp"
                rightComponent={
                  <Icon
                    onPress={() => delContact(chatInfo?.contactData?.id)}
                    name={"trash-outline"}
                    color={theme.error}
                  />
                }
                rightIconPress={() => delContact(chatInfo?.contactData?.id)}
                value={chatInfo?.contactData?.name}
              />

              <Divider />

              {varArr.map((v, key) => {
                return (
                  <HStack key={key} alignItems="center" space={10}>
                    <Icon color={theme.textDisabled} name="id-card-outline" />
                    <Typography>{chatInfo?.contactData[v.code]}</Typography>
                  </HStack>
                );
              })}
            </VStack>
          ) : (
            <VStack space={15}>
              <Select
                leftIcon={"book-outline"}
                // label={t("selPhonebook")}
                value={state?.phonebookDataa?.name}
                onChange={handleSelectPhonebook}
                options={contactOptions}
                variant="outlined"
                size="medium"
                placeholder={t("selPhonebook")}
              />

              <TextField
                value={state.conName}
                leftIcon={"person-outline"}
                placeholder={t("contactName")}
                variant="whatsapp"
                onChangeText={(e) => setstate({ ...state, conName: e })}
              />

              <Grid.Container spacing={1}>
                {varArr.map((v, k) => {
                  return (
                    <Grid.Item xs={6}>
                      <TextField
                        leftIcon={"id-card-outline"}
                        onChangeText={(e) =>
                          setstate({ ...state, [v.code]: e })
                        }
                        variant="whatsapp"
                        key={k}
                        placeholder={t(v.code)}
                        value={state[v.code]}
                      />
                    </Grid.Item>
                  );
                })}
              </Grid.Container>

              <Button
                onPress={saveAsContact}
                disabled={
                  state.conMob && state.conName && state.phonebookDataa?.id
                    ? false
                    : true
                }
                variant="text"
                startIcon={"save-outline"}
              >
                {t("saveAsContact")}
              </Button>
            </VStack>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
