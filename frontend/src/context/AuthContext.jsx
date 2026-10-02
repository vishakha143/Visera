import { createContext, useContext, useState, useEffect } from "react";
import apiClient from "@/api/client";
import { signInWithGoogle, signInWithGithub } from "@/lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("auth_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.token) {
          setUser(parsed);
        } else {
          localStorage.removeItem("auth_user");
        }
      } catch {
        localStorage.removeItem("auth_user");
      }
    }
    setLoading(false);
  }, []);

  function persist(userData, token) {
    const payload = {
      _id: userData._id || userData.id,
      name: userData.name,
      email: userData.email,
      avatarUrl: userData.avatarUrl || "",
      token,
    };
    localStorage.setItem("auth_user", JSON.stringify(payload));
    setUser(payload);
    return payload;
  }

  function updateUser(partial) {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      localStorage.setItem("auth_user", JSON.stringify(next));
      return next;
    });
  }

  async function login({ email, password }) {
    const { data } = await apiClient.post("/auth/login", { email, password });
    if (!data?.token) {
      throw new Error("Login succeeded but no token returned from server");
    }
    return persist(data.user, data.token);
  }

  async function register({ name, email, password }) {
    const { data } = await apiClient.post("/auth/register", {
      name,
      email,
      password,
    });
    if (!data?.token) {
      throw new Error("Register succeeded but no token returned from server");
    }
    return persist(data.user, data.token);
  }

  async function continueWithFirebase(getIdToken) {
    const idToken = await getIdToken();
    const { data } = await apiClient.post("/auth/firebase", { idToken });
    if (!data?.token) {
      throw new Error("Sign-in succeeded but no session was returned from server");
    }
    return persist(data.user, data.token);
  }

  function loginWithGoogle() {
    return continueWithFirebase(signInWithGoogle);
  }

  function loginWithGithub() {
    return continueWithFirebase(signInWithGithub);
  }

  async function logout() {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem("auth_user");
    setUser(null);
  }

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    loginWithGithub,
    logout,
    updateUser,
    isAuthenticated: !!user?.token,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}