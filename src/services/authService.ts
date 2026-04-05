import api from './api';

export interface RegisterPayload {
    full_name: string;
    email: string;
    password?: string;
    confirm_password?: string;
}

export interface LoginPayload {
    email: string;
    password?: string;
}

export interface UserProfile {
    id?: number | string;
    full_name?: string;
    email?: string;
}

interface Tokens {
    access: string;
    refresh: string;
}

export const authService = {
    register: async (payload: RegisterPayload): Promise<{ message: string }> => {
        const response = await api.post('/auth/register/', payload);
        return response.data;
    },

    login: async (payload: LoginPayload): Promise<Tokens> => {
        const response = await api.post('/auth/login/', payload);
        return response.data;
    },

    getProfile: async (): Promise<UserProfile> => {
        const response = await api.get('/auth/profile/');
        return response.data;
    },
};
