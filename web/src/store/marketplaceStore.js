import { create } from 'zustand';

export const useMarketplaceStore = create((set) => ({
    currentMarketplace: '',
    setCurrentMarketplace: (marketplace) => set({ currentMarketplace: marketplace }),
}));
