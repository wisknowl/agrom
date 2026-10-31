import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ContainerRegionId =
  | 'CAMEROON'
  | 'EAST_AFRICA'
  | 'GLOBAL'
  | 'NIGERIA'
  | 'LATIN_AMERICA';

export interface RegionalContainer {
  id: ContainerRegionId;
  name: string;
  shortName: string;
  frenchName: string;
  regionLabel: string;
  description: string;
  imageUrl: string;
  currency: string;
  flag: string;
}

export const REGIONAL_CONTAINERS: Record<ContainerRegionId, RegionalContainer> = {
  CAMEROON: {
    id: 'CAMEROON',
    name: 'Bamboo Basket',
    shortName: 'Basket',
    frenchName: 'Panier Bambou',
    regionLabel: 'Cameroon & CEMAC',
    description: 'Traditional handwoven bamboo agricultural harvest basket',
    imageUrl: '/assets/basket_cameroon.jpg',
    currency: 'FCFA',
    flag: '🇨🇲',
  },
  EAST_AFRICA: {
    id: 'EAST_AFRICA',
    name: 'Kiondo',
    shortName: 'Kiondo',
    frenchName: 'Kiondo',
    regionLabel: 'Kenya, Tanzania & EAC',
    description: 'Traditional sisal & banana-bark handwoven market basket',
    imageUrl: '/assets/basket_east_africa.jpg',
    currency: 'KES',
    flag: '🇰🇪',
  },
  GLOBAL: {
    id: 'GLOBAL',
    name: 'Harvest Crate',
    shortName: 'Crate',
    frenchName: 'Caisse de récolte',
    regionLabel: 'International Trade Hub',
    description: 'Rustic wooden farmer produce harvest crate',
    imageUrl: '/assets/basket_crate.jpg',
    currency: 'USD',
    flag: '🌍',
  },
  NIGERIA: {
    id: 'NIGERIA',
    name: 'Agbá Basket',
    shortName: 'Agbá',
    frenchName: 'Panier Agbá',
    regionLabel: 'Nigeria & ECOWAS',
    description: 'Handwoven palm-frond and cane market harvest basket',
    imageUrl: '/assets/basket_cameroon.jpg',
    currency: 'NGN',
    flag: '🇳🇬',
  },
  LATIN_AMERICA: {
    id: 'LATIN_AMERICA',
    name: 'Canasta',
    shortName: 'Canasta',
    frenchName: 'Canasta',
    regionLabel: 'Latin America',
    description: 'Handcrafted wicker coffee and fruit harvesting canasta',
    imageUrl: '/assets/basket_cameroon.jpg',
    currency: 'USD',
    flag: '🌎',
  },
};

interface RegionalContainerState {
  regionId: ContainerRegionId;
  language: 'en' | 'fr';
  isEcosystemDrawerOpen: boolean;
  isCreatePostModalOpen: boolean;
  setRegion: (regionId: ContainerRegionId) => void;
  setLanguage: (lang: 'en' | 'fr') => void;
  setEcosystemDrawerOpen: (open: boolean) => void;
  setCreatePostModalOpen: (open: boolean) => void;
  getContainer: () => RegionalContainer;
}

export const useRegionalContainerStore = create<RegionalContainerState>()(
  persist(
    (set, get) => ({
      regionId: 'CAMEROON',
      language: 'en',
      isEcosystemDrawerOpen: false,
      isCreatePostModalOpen: false,
      setRegion: (regionId: ContainerRegionId) => set({ regionId }),
      setLanguage: (language: 'en' | 'fr') => set({ language }),
      setEcosystemDrawerOpen: (isEcosystemDrawerOpen: boolean) => set({ isEcosystemDrawerOpen }),
      setCreatePostModalOpen: (isCreatePostModalOpen: boolean) => set({ isCreatePostModalOpen }),
      getContainer: () => REGIONAL_CONTAINERS[get().regionId] || REGIONAL_CONTAINERS.CAMEROON,
    }),
    {
      name: 'agrom-web-regional-container',
    }
  )
);

