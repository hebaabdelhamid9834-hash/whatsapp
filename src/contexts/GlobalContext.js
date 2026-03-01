import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseUrl } from "./api";
import { useTheme } from "./ThemeContext";

const GlobalContext = createContext(null);

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
};

export const GlobalProvider = ({ children }) => {
  const [addons, setAddons] = React.useState([]);
  const { toggleColorMode, theme } = useTheme();
  const [data, setData] = useState({
    loading: false,
    snack: false,
    snack_msg: "",
    snack_success: false,
    userData: null,
    isAuthenticated: false,
    isInitialized: false,
    userToken: null,
    userRole: "user",
  });

  const API_BASE_URL = baseUrl;
  const TOKEN_KEY = "user_token";

  // Initialize auth state
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userData = await AsyncStorage.getItem("user_data");

      if (token && userData) {
        setData((prev) => ({
          ...prev,
          isAuthenticated: true,
          userData: JSON.parse(userData),
          isInitialized: true,
          userToken: token,
        }));
      } else {
        setData((prev) => ({ ...prev, isInitialized: true }));
      }
    } catch (error) {
      console.log("Error initializing app:", error);
      setData((prev) => ({ ...prev, isInitialized: true }));
    }
  };

  // Get user profile data with improved error handling
  const getProfile = async (token = null, role = "user") => {
    try {
      const userToken = token || (await AsyncStorage.getItem(TOKEN_KEY));

      if (!userToken) {
        console.log("No token available for profile fetch");
        return { success: false, message: "No token available" };
      }

      const response = await axios.get(`${API_BASE_URL}/api/${role}/get_me`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // Add timeout to prevent hanging requests
      });

      if (response.data.logout) {
        await handleLogout();
        showSnack("Session expired. Please login again.", false);
        return { success: false, logout: true };
      }

      if (response.data.success) {
        const profileData = response.data.data;
        await AsyncStorage.setItem("user_data", JSON.stringify(profileData));
        setData((prev) => ({
          ...prev,
          userData: profileData,
          isAuthenticated: true,
        }));
        return { success: true, data: profileData };
      } else {
        console.log("Failed to fetch profile:", response.data.msg);
        showSnack(response.data.msg || "Failed to fetch profile", false);
        return { success: false, message: response.data.msg };
      }
    } catch (error) {
      console.log("Error fetching profile:", error);

      // Handle different types of errors
      if (error.code === "ECONNABORTED") {
        showSnack("Request timed out. Please try again.", false);
        return { success: false, error: "Request timed out" };
      } else if (error.message && error.message.includes("Network Error")) {
        showSnack(
          "Network error. Please check your internet connection.",
          false
        );
        return { success: false, error: "Network error" };
      } else if (error.response?.status === 401) {
        await handleLogout();
        showSnack("Session expired. Please login again.", false);
        return { success: false, logout: true };
      }

      const errorMsg = error.response?.data?.msg || "Failed to fetch profile";
      showSnack(errorMsg, false);
      return { success: false, error: errorMsg };
    }
  };

  const showSnack = (message, isSuccess = true) => {
    setData((prev) => ({
      ...prev,
      snack: true,
      snack_msg: message,
      snack_success: isSuccess,
    }));

    setTimeout(() => {
      setData((prev) => ({
        ...prev,
        snack: false,
        snack_msg: "",
      }));
    }, 3000);
  };

  const handleLogout = async () => {
    try {
      // await AsyncStorage.removeItem(TOKEN_KEY);
      // await AsyncStorage.removeItem("user_data");
      await AsyncStorage.clear();
      setData((prev) => ({
        ...prev,
        isAuthenticated: false,
        userData: null,
      }));
    } catch (error) {
      console.log("Error during logout:", error);
      showSnack("Error during logout", false);
    }
  };

  const login = async (email, password, type = "user") => {
    setData((prev) => ({ ...prev, loading: true }));

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/${type}/login`,
        {
          isLogin: true,
          acceptPolicy: false,
          isPassEnter: true,
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer null",
          },
          timeout: 10000, // Add timeout to prevent hanging requests
        }
      );

      setData((prev) => ({ ...prev, loading: false }));

      if (response.data.logout) {
        await handleLogout();
        showSnack("Session expired. Please login again.", false);
        return { success: false, message: "Session expired" };
      }

      if (response.data.success) {
        if (response.data.token) {
          await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
          setData((prev) => ({
            ...prev,
            userToken: response.data.token,
          }));
        }

        const profileResult = await getProfile(response.data.token, type);

        if (profileResult.success) {
          if (response.data.msg) {
            showSnack(response.data.msg, true);
          }
          return { success: true };
        } else {
          const basicUserData = response.data.user || { email };
          await AsyncStorage.setItem(
            "user_data",
            JSON.stringify(basicUserData)
          );

          setData((prev) => ({
            ...prev,
            isAuthenticated: true,
            userData: basicUserData,
          }));

          if (response.data.msg) {
            showSnack(response.data.msg, true);
          }
          return { success: true };
        }
      } else {
        if (response.data.msg) {
          showSnack(response.data.msg, false);
        }
        return { success: false, message: response.data.msg };
      }
    } catch (error) {
      setData((prev) => ({ ...prev, loading: false }));

      // Handle different types of errors
      if (error.code === "ECONNABORTED") {
        showSnack("Login request timed out. Please try again.", false);
        return { success: false, message: "Request timed out" };
      } else if (error.message && error.message.includes("Network Error")) {
        showSnack(
          `Network error. Please check your internet connection. `,
          false
        );
        return { success: false, message: "Network error" };
      }

      const errorMsg =
        error.response?.data?.msg || "Login failed. Please try again.";
      showSnack(errorMsg, false);
      return { success: false, message: errorMsg };
    }
  };

  const logout = async () => {
    await handleLogout();
    showSnack("Logged out successfully", true);
  };

  const apiCall = async (endpoint, options = {}) => {
    if (options.showLoading !== false) {
      setData((prev) => ({ ...prev, loading: true }));
    }

    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      // ✅ Check if data is FormData
      const isFormData = options.data instanceof FormData;

      // ✅ If FormData, use fetch instead of axios
      if (isFormData) {
        const headers = {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser/fetch handles it
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: options.method || "POST",
          body: options.data,
          headers,
        });

        if (options.showLoading !== false) {
          setData((prev) => ({ ...prev, loading: false }));
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle logout
        if (data.logout) {
          await handleLogout();
          showSnack("Session expired. Please login again.", false);
          return { success: false, logout: true };
        }

        // Show success message
        if (data.success && data.msg && options.showSnackbar !== false) {
          showSnack(data.msg, true);
        }

        // Show error message
        if (!data.success && data.msg && options.showSnackbar !== false) {
          showSnack(data.msg, false);
        }

        return data;
      }

      // ✅ For non-FormData requests, use axios as before
      const defaultHeaders = {
        Authorization: `Bearer ${token}`,
      };

      const headers = { ...defaultHeaders };

      if (options.headers) {
        Object.assign(headers, options.headers);

        if (headers["Content-Type"] === "multipart/form-data") {
          delete headers["Content-Type"];
        }
      } else {
        headers["Content-Type"] = "application/json";
      }

      const requestOptions = {
        ...options,
        timeout: options.timeout || 15000,
        headers,
      };

      const response = await axios({
        url: `${API_BASE_URL}${endpoint}`,
        ...requestOptions,
      });

      if (options.showLoading !== false) {
        setData((prev) => ({ ...prev, loading: false }));
      }

      if (response.data.logout) {
        await handleLogout();
        showSnack("Session expired. Please login again.", false);
        return { success: false, logout: true };
      }

      if (
        response.data.success &&
        response.data.msg &&
        options.showSnackbar !== false
      ) {
        showSnack(response.data.msg, true);
      }

      if (
        !response.data.success &&
        response.data.msg &&
        options.showSnackbar !== false
      ) {
        showSnack(response.data.msg, false);
      }

      return response.data;
    } catch (error) {
      if (options.showLoading !== false) {
        setData((prev) => ({ ...prev, loading: false }));
      }

      console.log(`API call error (${API_BASE_URL}${endpoint}):`, error);

      if (error.code === "ECONNABORTED") {
        if (options.showSnackbar !== false) {
          showSnack("Request timed out. Please try again.", false);
        }
        return { success: false, error: "Request timed out" };
      } else if (error.message && error.message.includes("Network Error")) {
        if (options.showSnackbar !== false) {
          showSnack(`Network error: ${API_BASE_URL}${endpoint}`, false);
        }
        return { success: false, error: "Network error" };
      } else if (error.response?.status === 401) {
        await handleLogout();
        if (options.showSnackbar !== false) {
          showSnack("Session expired. Please login again.", false);
        }
        return { success: false, logout: true };
      }

      const errorMsg =
        error.response?.data?.msg ||
        error.message ||
        "Request failed. Please try again later.";
      if (options.showSnackbar !== false) {
        showSnack(errorMsg, false);
      }
      return { success: false, error: errorMsg };
    }
  };

  function parseJson(data) {
    try {
      return JSON.parse(data);
    } catch (err) {
      return null;
    }
  }

  function maskNumber(number, maskChar = "*", keepFirst = 2, keepLast = 2) {
    const mask = parseInt(data?.userData?.mask_number) > 0 ? true : false;
    const numStr = number?.toString();

    if (!mask) {
      return numStr;
    }

    if (numStr.length <= keepFirst + keepLast) {
      // If number is too short, keep at least the last digit
      return maskChar.repeat(Math.max(0, numStr.length - 1)) + numStr.slice(-1);
    }

    return (
      numStr.slice(0, keepFirst) +
      maskChar.repeat(numStr.length - keepFirst - keepLast) +
      numStr.slice(-keepLast)
    );
  }

  const alpha = (color, opacity) => {
    // If already rgba/rgb, extract values and apply new opacity
    if (color.startsWith("rgb")) {
      const values = color.match(/\d+/g);
      if (values && values.length >= 3) {
        return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${opacity})`;
      }
    }

    // Handle hex colors
    const hex = color.replace("#", "");
    let r, g, b;

    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6 || hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else {
      throw new Error("Invalid color format");
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Add this new function in your GlobalContext (alongside apiCall)
  const uploadFile = async (endpoint, formData, options = {}) => {
    if (options.showLoading !== false) {
      setData((prev) => ({ ...prev, loading: true }));
    }

    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      console.log("File Upload Request:", {
        url: `${API_BASE_URL}${endpoint}`,
        method: "POST",
      });

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ✅ Don't set Content-Type - let fetch handle it
        },
        body: formData,
      });

      const res = await response.json();

      console.log("File Upload Response:", {
        url: `${API_BASE_URL}${endpoint}`,
        success: res.success,
      });

      if (options.showLoading !== false) {
        setData((prev) => ({ ...prev, loading: false }));
      }

      if (res.logout) {
        await handleLogout();
        showSnack("Session expired. Please login again.", false);
        return { success: false, logout: true };
      }

      if (res.success && res.msg && options.showSnackbar !== false) {
        showSnack(res.msg, true);
      }

      if (!res.success && res.msg && options.showSnackbar !== false) {
        showSnack(res.msg, false);
      }

      return res;
    } catch (error) {
      if (options.showLoading !== false) {
        setData((prev) => ({ ...prev, loading: false }));
      }

      console.log(`File upload error (${endpoint}):`, error);

      if (error.message && error.message.includes("Network")) {
        if (options.showSnackbar !== false) {
          showSnack(
            "Network error. Please check your internet connection.",
            false
          );
        }
        return { success: false, error: "Network error" };
      }

      const errorMsg = "Upload failed. Please try again.";
      if (options.showSnackbar !== false) {
        showSnack(errorMsg, false);
      }
      return { success: false, error: errorMsg };
    }
  };

  const value = {
    data,
    setData,
    login,
    logout,
    showSnack,
    toggleColorMode,
    apiCall,
    getProfile,
    handleLogout,
    theme,
    userData: data?.userData || {},
    parseJson,
    setAddons,
    addons,
    maskNumber,
    loading: data.loading,
    snack_msg: data.snack_msg,
    snack_success: data.snack_success,
    alpha,
    isAuthenticated: data.isAuthenticated,
    uploadFile,
    userRole: data.userRole,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};
