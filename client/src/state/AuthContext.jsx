import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import { api, setAuthToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshMeRef = useRef(null);
  const lastRefreshTime = useRef(0);

  const isLoggedIn = !!user;

  const refreshMe = useCallback(async () => {
    // Throttle: Don't allow more than 1 request per second
    const now = Date.now();
    if (now - lastRefreshTime.current < 1000) {
      return user;
    }
    lastRefreshTime.current = now;

    try {
      const res = await api.get("/auth/me");
      if (res.data.user) {
        setUser(res.data.user);
        return res.data.user;
      }
      return null;
    } catch (_e) {
      // Don't clear user on error, just return null
      return null;
    }
  }, [user]);

  refreshMeRef.current = refreshMe;

  useEffect(() => {
    (async () => {
      try {
        const stored = localStorage.getItem("maze_token");
        if (stored) {
          setToken(stored);
          setAuthToken(stored);
        }
        await refreshMe();
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshMe]);

  const loginWithToken = useCallback(async (newToken) => {
    localStorage.setItem("maze_token", newToken);
    setToken(newToken);
    setAuthToken(newToken);
    await refreshMe();
  }, [refreshMe]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (_e) {
      // ignore
    }
    localStorage.removeItem("maze_token");
    setToken(null);
    setAuthToken(null);
    setUser(null);
    toast.success("Logged out");
  }, []);

  const value = useMemo(
    () => ({
      loading,
      token,
      user,
      isLoggedIn,
      credits: user?.credits ?? 0,
      setUser,
      refreshMe,
      loginWithToken,
      logout,
    }),
    [loading, token, user, isLoggedIn, refreshMe, loginWithToken, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

