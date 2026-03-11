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
            // Only initialize marketplace if not already chosen (preserve user's selection on refresh)
            if (!localStorage.getItem('currentMarketplace')) {
                const defaultMarketplace = user?.is_sponsor ? 'all' : (user?.university || '');
                localStorage.setItem('currentMarketplace', defaultMarketplace);
            }
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
        localStorage.removeItem('currentMarketplace');
        set({ user: null });
    },
}));
