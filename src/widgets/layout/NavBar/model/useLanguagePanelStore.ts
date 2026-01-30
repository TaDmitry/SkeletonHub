import { create } from 'zustand';

type LanguagePanelState = {
	isOpen: boolean;
	close: () => void;
	open: () => void;
	toggle: () => void;
};

export const useLanguagePanelStore = create<LanguagePanelState>((set) => ({
	isOpen: false,
	close: () => set({ isOpen: false }),
	open: () => set({ isOpen: true }),
	toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
