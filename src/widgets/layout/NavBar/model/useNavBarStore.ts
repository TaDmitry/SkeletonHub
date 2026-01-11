import { create } from 'zustand';

type NavBarState = {
	isPanelOpen: boolean;
	open: () => void;
	close: () => void;
	toggle: () => void;
	set: (v: boolean) => void;
};

export const useNavBarStore = create<NavBarState>((set) => ({
	isPanelOpen: false,
	open: () => set({ isPanelOpen: true }),
	close: () => set({ isPanelOpen: false }),
	toggle: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
	set: (v: boolean) => set({ isPanelOpen: v }),
}));
