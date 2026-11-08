import { create } from 'zustand';

interface SearchState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  isSearchDropdownOpen: boolean;
  setIsSearchDropdownOpen: (open: boolean) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  selectedRegion: '',
  setSelectedRegion: (selectedRegion) => set({ selectedRegion }),
  isSearchDropdownOpen: false,
  setIsSearchDropdownOpen: (isSearchDropdownOpen) => set({ isSearchDropdownOpen }),
}));


