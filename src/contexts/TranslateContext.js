import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseUrl } from "./api";

const TranslateContext = createContext(null);

export const useTranslate = () => {
  const context = useContext(TranslateContext);
  if (!context) {
    throw new Error("useTranslate must be used within a TranslateProvider");
  }
  return context;
};

export const TranslateProvider = ({ children }) => {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState("en");

  const API_BASE_URL = baseUrl;

  useEffect(() => {
    initializeLanguage();
  }, []);

  const initializeLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");

      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
        await loadLanguage(savedLanguage);
      } else {
        await loadDefaultLanguage();
      }
    } catch (error) {
      console.log("Error initializing language:", error);
      setData({});
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultLanguage = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/web/get-all-translation-name`
      );

      if (response.data.success && response.data.data.length > 0) {
        const defaultLanguage = response.data.data[0].replace(".json", "");
        await AsyncStorage.setItem("language", defaultLanguage);
        setCurrentLanguage(defaultLanguage);
        await loadLanguage(defaultLanguage);
      } else {
        setData({});
      }
    } catch (error) {
      console.log("Error loading default language:", error);
      setData({});
    }
  };

  const loadLanguage = async (languageCode) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/web/get-one-translation?code=${languageCode}`
      );

      if (response.data.notfound) {
        await AsyncStorage.removeItem("language");
        console.log("Translation file not found");
        setData({});
        return;
      }

      setData(response.data.data || {});
    } catch (error) {
      console.log("Error loading language:", error);
      setData({});
    }
  };

  const changeLanguage = async (languageCode) => {
    try {
      setIsLoading(true);
      await AsyncStorage.setItem("language", languageCode);
      setCurrentLanguage(languageCode);
      await loadLanguage(languageCode);
    } catch (error) {
      console.log("Error changing language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableLanguages = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/web/get-all-translation-name`
      );

      if (response.data.success) {
        return response.data.data.map((lang) => lang.replace(".json", ""));
      }
      return [];
    } catch (error) {
      console.log("Error getting available languages:", error);
      return [];
    }
  };

  const t = (key) => {
    return data[key] || "NA";
  };

  const value = {
    data,
    setData,
    currentLanguage,
    isLoading,
    changeLanguage,
    getAvailableLanguages,
    t,
  };

  return (
    <TranslateContext.Provider value={value}>
      {children}
    </TranslateContext.Provider>
  );
};
