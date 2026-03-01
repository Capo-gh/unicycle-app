import { create } from 'zustand';
import { getCurrentUser } from '../api/auth';
import { logout as logoutApi } from '../api/auth';

export const useAuthStore = create((set) => ({
    user: null,
    isLoading: true,

    initAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            set({ isLoading: false });
            return;
        }
        try {
            const user = await getCurrentUser();
            localStorage.setItem('user', JSON.stringify(user));
            set({ user, isLoading: false });
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null, isLoading: false });
        }
    },

    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
    },

    logout: () => {
        try { logoutApi(); } catch {}
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('currentPage');
        set({ user: null });
    },
}));
