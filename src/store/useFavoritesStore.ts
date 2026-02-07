import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
  favorites: string[]; // Array of product IDs
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  getFavorites: () => string[];
  validateFavorites: (validIds: Set<string>) => void; // Clean orphaned IDs
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (productId: string) => {
        set((state) => {
          if (!state.favorites.includes(productId)) {
            return { favorites: [...state.favorites, productId] };
          }
          return state;
        });
      },
      
      removeFavorite: (productId: string) => {
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== productId),
        }));
      },
      
      toggleFavorite: (productId: string) => {
        const { isFavorite } = get();
        if (isFavorite(productId)) {
          get().removeFavorite(productId);
        } else {
          get().addFavorite(productId);
        }
      },
      
      isFavorite: (productId: string) => {
        return get().favorites.includes(productId);
      },
      
      getFavorites: () => {
        return get().favorites;
      },

      validateFavorites: (validIds: Set<string>) => {
        set((state) => ({
          favorites: state.favorites.filter((id) => validIds.has(id)),
        }));
      },
    }),
    {
      name: 'favorites-store',
      onRehydrateStorage: () => (state) => {
        // Ensure favorites is always an array
        if (!state || !Array.isArray(state.favorites)) {
          if (state) state.favorites = [];
        }
      },
    }
  )
);
