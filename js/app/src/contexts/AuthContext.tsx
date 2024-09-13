import React, { createContext, useContext, useState, useEffect } from "react";
import { userToken, userRegister } from "../api/services.gen";
import { getApiBaseUrl } from "../utils/apiConfig";

interface AuthContextType {
  isLoggedIn: boolean;
  userEmail: string;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    fullName: string,
    email: string,
    password: string,
    nwcString: string,
    nwcRefreshToken: string | undefined,
    nwcExpiresAt: number | undefined,
    accessTokenExpiresAt: number | undefined
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authState, setAuthState] = useState(() => {
    const storedToken = localStorage.getItem("token");
    const storedEmail = localStorage.getItem("userEmail");
    return {
      isLoggedIn: !!storedToken,
      userEmail: storedEmail || "",
      token: storedToken,
    };
  });

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await userToken({
        baseUrl: getApiBaseUrl(),
        body: {
          username: email,
          password: password,
        },
      });

      if (response.data && response.data.access_token) {
        setAuthState({
          isLoggedIn: true,
          userEmail: email,
          token: response.data.access_token,
        });
        localStorage.setItem("userEmail", email);
        localStorage.setItem("token", response.data.access_token);
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (
    fullName: string,
    email: string,
    password: string,
    nwcString: string,
    nwcRefreshToken: string | undefined = undefined,
    nwcExpiresAt: number | undefined = undefined,
    accessTokenExpiresAt: number | undefined = undefined
  ) => {
    try {
      const fullNameParts = fullName.split(" ");
      const firstName = fullNameParts[0];
      const lastName =
        fullNameParts.length > 1 ? fullNameParts.slice(1).join(" ") : "";
      const registerResponse = await userRegister({
        baseUrl: getApiBaseUrl(),
        body: {
          email: email,
          nwc_string: nwcString,
          first_name: firstName,
          last_name: lastName,
          picture_url: null, // TODO: Add picture upload
          nwc_refresh_token: nwcRefreshToken || null,
          nwc_expires_at: nwcExpiresAt || null,
          access_token_expires_at: accessTokenExpiresAt || null,
        },
      });

      if (registerResponse.data) {
        await login(email, password);
      } else {
        throw new Error("Sign up failed");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const logout = () => {
    setAuthState({
      isLoggedIn: false,
      userEmail: "",
      token: null,
    });
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
