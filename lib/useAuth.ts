import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { isTokenExpired } from "./jwt";

interface User {
  id?: string;
  email: string;
  name?: string;
  role?: string;
  isAdmin?: boolean;
  subscription?: {
    plan: string;
    documentsPerMonth: number;
    questionsPerMonth: number;
    questionsUsed: number;
    validUntil: Date;
  };
}

interface AuthState {
  token: string | null;
  user: User | null;
  adminToken: string | null;
  setAuth: (token: string, user: User) => void;
  setAdminAuth: (token: string, user: User) => void;
  logout: () => void;
  adminLogout: () => void;
  checkAuth: () => boolean;
  updateAuthFromSession: () => Promise<void>;
  checkAdminAuth: () => Promise<boolean>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      adminToken: null,
      setAuth: (token: string, user: User) => {
        console.log("useAuth: Setting auth with token and user");
        if (!token || isTokenExpired(token)) {
          console.error(
            "useAuth: Invalid or expired token provided to setAuth"
          );
          get().logout();
          return;
        }

        set({ token, user });
        console.log("useAuth: Auth state updated successfully");

        if (typeof window !== "undefined") {
          window.localStorage.setItem("auth-token", token);
        }
      },
      setAdminAuth: (token: string, user: User) => {
        console.log("useAuth: Setting admin auth with token and user");
        if (!token || isTokenExpired(token)) {
          console.error("useAuth: Invalid or expired admin token");
          get().adminLogout();
          return;
        }

        set({ adminToken: token, user: { ...user, isAdmin: true } });
        console.log("useAuth: Admin auth state updated successfully");

        if (typeof window !== "undefined") {
          window.localStorage.setItem("admin-token", token);
        }
      },
      logout: async () => {
        console.log("useAuth: Logging out");
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
          console.log("useAuth: Logout API call successful");
        } catch (error) {
          console.error("useAuth: Error during logout:", error);
        }
        set({ token: null, user: null });
        console.log("useAuth: Auth state cleared");
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("auth-token");
          window.location.href = "/";
        }
      },
      adminLogout: async () => {
        console.log("useAuth: Admin logging out");
        try {
          await fetch("/api/admin/auth", {
            method: "DELETE",
            credentials: "include",
          });
          console.log("useAuth: Admin logout API call successful");
        } catch (error) {
          console.error("useAuth: Error during admin logout:", error);
        }
        set({ adminToken: null, user: null });
        console.log("useAuth: Admin auth state cleared");
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("admin-token");
          window.location.href = "/admin-login";
        }
      },
      checkAuth: () => {
        console.log("useAuth: Checking auth state");
        const state = get();
        if (!state.token) {
          console.log("useAuth: No token found");
          return false;
        }

        try {
          if (isTokenExpired(state.token)) {
            console.log("useAuth: Token is expired");
            get().logout();
            return false;
          }
          console.log("useAuth: Auth check passed");
          return true;
        } catch (error) {
          console.error("useAuth: Error checking auth:", error);
          get().logout();
          return false;
        }
      },
      checkAdminAuth: async () => {
        console.log("useAuth: Checking admin auth");
        try {
          const response = await fetch("/api/admin/auth", {
            method: "GET",
            credentials: "include",
          });
          console.log("useAuth: Admin auth check response:", response.status);

          if (response.ok) {
            const data = await response.json();
            console.log("useAuth: Admin auth data received:", data);
            if (data.success && data.user) {
              set({
                user: { ...data.user, isAdmin: true },
                adminToken: "cookie-auth",
              });
              return true;
            }
          }
          console.log("useAuth: Admin auth check failed");
          set({ user: null, adminToken: null });
          return false;
        } catch (error) {
          console.error("useAuth: Admin auth check error:", error);
          set({ user: null, adminToken: null });
          return false;
        }
      },
      updateAuthFromSession: async () => {
        console.log("useAuth: Updating auth from session");
        try {
          const response = await fetch("/api/auth/session", {
            credentials: "include",
          });
          console.log("useAuth: Session API response status:", response.status);

          if (!response.ok) {
            if (response.status === 401) {
              console.log("useAuth: Session unauthorized, clearing state");
              set({ token: null, user: null });
            }
            return;
          }

          const data = await response.json();
          console.log("useAuth: Session data received");

          if (data.token && data.user) {
            if (!isTokenExpired(data.token)) {
              console.log("useAuth: Setting new session data");
              set({ token: data.token, user: data.user });
            } else {
              console.error("useAuth: Received expired token from session");
              set({ token: null, user: null });
            }
          } else {
            console.log("useAuth: No valid session data, clearing state");
            set({ token: null, user: null });
          }
        } catch (error) {
          console.error("useAuth: Error updating auth from session:", error);
          set({ token: null, user: null });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: {
        getItem: (name) => {
          console.log("useAuth: Getting item from storage:", name);
          if (typeof window === "undefined") return null;
          try {
            const str = window.localStorage.getItem(name);
            if (!str) return null;
            return JSON.parse(str);
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          console.log("useAuth: Setting item in storage:", name);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(name, JSON.stringify(value));
          }
        },
        removeItem: (name) => {
          console.log("useAuth: Removing item from storage:", name);
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(name);
          }
        },
      },
      partialize: (state: AuthState) =>
        ({
          token: state.token,
          user: state.user,
          adminToken: state.adminToken,
        } as Partial<AuthState>),
    }
  )
);

// Helper function to get auth token with validation
export const getAuthToken = () => {
  const { token, checkAuth } = useAuth.getState();
  if (!token || !checkAuth()) return null;
  return token;
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const { checkAuth } = useAuth.getState();
  return checkAuth();
};

// Helper function to get current user
export const getCurrentUser = () => {
  const { user, checkAuth } = useAuth.getState();
  if (!checkAuth()) return null;
  return user;
};

// Custom fetch with auth header
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No authentication token available");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  if (response.status === 401) {
    useAuth.getState().logout();
    throw new Error("Authentication failed");
  }

  return response;
};
