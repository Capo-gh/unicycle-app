import { create } from 'zustand';

export const useMarketplaceStore = create((set) => ({
    currentMarketplace: localStorage.getItem('currentMarketplace') || '',
    setCurrentMarketplace: (marketplace) => {
        localStorage.setItem('currentMarketplace', marketplace);
        set({ currentMarketplace: marketplace });
    },
}));
