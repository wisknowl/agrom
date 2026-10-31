import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  yields: string[];
  posts: string[];
  addYield: (id: string) => void;
  removeYield: (id: string) => void;
  toggleYield: (id: string) => void;
  addPost: (id: string) => void;
  removePost: (id: string) => void;
  togglePost: (id: string) => void;
  isYieldFavorite: (id: string) => boolean;
  isPostFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      yields: [],
      posts: [],

      addYield: (id: string) =>
        set((state) => ({
          yields: state.yields.includes(id) ? state.yields : [...state.yields, id],
        })),

      removeYield: (id: string) =>
        set((state) => ({
          yields: state.yields.filter((yId) => yId !== id),
        })),

      toggleYield: (id: string) => {
        if (get().yields.includes(id)) {
          get().removeYield(id);
        } else {
          get().addYield(id);
        }
      },

      addPost: (id: string) =>
        set((state) => ({
          posts: state.posts.includes(id) ? state.posts : [...state.posts, id],
        })),

      removePost: (id: string) =>
        set((state) => ({
          posts: state.posts.filter((pId) => pId !== id),
        })),

      togglePost: (id: string) => {
        if (get().posts.includes(id)) {
          get().removePost(id);
        } else {
          get().addPost(id);
        }
      },

      isYieldFavorite: (id: string) => get().yields.includes(id),
      isPostFavorite: (id: string) => get().posts.includes(id),
    }),
    {
      name: 'agrom-web-favorites-storage',
    }
  )
);

