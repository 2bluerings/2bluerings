import { create } from "zustand";
import { useUsersStore } from '@/hooks/use-users-store'

interface AppBootstrap {
  run: () => Promise<void>,
  loading: boolean
}

export const useAppBootstrap = create<AppBootstrap>((set, get) => ({
  loading: false,
  run: async () => {
    set({ loading: true })
    await useUsersStore.getState().loadCurrentUser()
    set({ loading: false })
  }
}));
