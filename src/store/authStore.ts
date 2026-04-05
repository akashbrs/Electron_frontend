import { create } from 'zustand';
import { authService } from '../services/authService';
import type { LoginPayload, RegisterPayload, UserProfile } from '../services/authService';
import api from '../services/api';

interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    register: (payload: RegisterPayload) => Promise<void>;
    login: (payload: LoginPayload) => Promise<void>;
    logout: () => void;
    fetchProfile: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('access_token'),
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    register: async (payload: RegisterPayload) => {
        set({ isLoading: true, error: null });
        try {
            await authService.register(payload);
            // Depending on requirements, we can log the user in automatically or just finish successfully
            set({ isLoading: false });
        } catch (e) {
            const error = e as Error;
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    login: async (payload: LoginPayload) => {
        set({ isLoading: true, error: null });
        try {
            const tokens = await authService.login(payload);

            // Store tokens securely in local storage
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);

            // Attach token immediately for the next request
            api.defaults.headers.common.Authorization = `Bearer ${tokens.access}`;

            // Fetch profile data successfully logged in
            await get().fetchProfile();

            set({ isAuthenticated: true, isLoading: false });
        } catch (e) {
            const error = e as Error;
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    logout: () => {
        // Clear tokens and default headers
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        delete api.defaults.headers.common.Authorization;

        set({ user: null, isAuthenticated: false, error: null });
    },

    fetchProfile: async () => {
        // Prevent fetching if no token is available
        if (!localStorage.getItem('access_token')) {
            set({ isAuthenticated: false, user: null });
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const profile = await authService.getProfile();
            set({ user: profile, isAuthenticated: true, isLoading: false });
        } catch (e) {
            const error = e as Error;
            // If fetching profile fails (e.g. invalid token that couldn't be refreshed)
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            delete api.defaults.headers.common.Authorization;

            set({
                user: null,
                isAuthenticated: false,
                error: 'Session expired. Please log in again.',
                isLoading: false
            });
            throw error;
        }
    },
}));
