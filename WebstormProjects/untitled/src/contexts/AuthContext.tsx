"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") || "http://localhost:8080";

    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Prihlásenie zlyhalo");
    }

    const data = await response.json();
    const newToken = data.token;

    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    router.push("/dashboard");
  };

  const register = async (username: string, password: string) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") || "http://localhost:8080";

    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Registrácia zlyhala");
    }

    const data = await response.json();
    const newToken = data.token;

    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
