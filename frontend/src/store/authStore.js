import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/authService";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(credentials);
          const { user, token, refreshToken } = response.data;

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || "Login failed",
          };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(userData);
          const { user, token, refreshToken } = response.data;

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || "Registration failed",
          };
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const response = await authService.refreshToken(refreshToken);
          const { token, refreshToken: newRefreshToken } = response.data;

          set({
            token,
            refreshToken: newRefreshToken,
            isAuthenticated: true,
          });

          return true;
        } catch (error) {
          // Refresh failed, logout user
          get().logout();
          return false;
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true });
        try {
          const response = await authService.updateProfile(profileData);
          set({
            user: response.data.user,
            isLoading: false,
          });
          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || "Update failed",
          };
        }
      },

      changePassword: async (passwordData) => {
        set({ isLoading: true });
        try {
          await authService.changePassword(passwordData);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || "Password change failed",
          };
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export { useAuthStore };
