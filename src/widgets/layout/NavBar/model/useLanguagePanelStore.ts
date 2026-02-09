import { create } from 'zustand';

export type LanguagePanelContext = 'desktop' | 'mobile';

type LanguagePanelState = {
	isOpen: boolean;
	context: LanguagePanelContext;
	close: () => void;
	open: (context: LanguagePanelContext) => void;
	toggle: (context: LanguagePanelContext) => void;
};

export const useLanguagePanelStore = create<LanguagePanelState>((set, get) => ({
	isOpen: false,
	context: 'desktop',

	close: () => set({ isOpen: false }),

	open: (context) => set({ isOpen: true, context }),

	toggle: (context) => {
		const s = get();

		if (s.isOpen && s.context === context) {
			set({ isOpen: false });

			return;
		}

		set({ isOpen: true, context });
	},
}));
