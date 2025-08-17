import { create,type StoreApi, type UseBoundStore } from "zustand";
import appConfig from '@/config';
import { useUsersStore } from '@/hooks/use-users-store'

interface ApiStore {
  fetch: (
    path: string,
    config?: any
  ) => Promise<Response>,
  createSocket: (path: string) => WebSocket | null
}

export const useApiStore: UseBoundStore<StoreApi<ApiStore>> = create<ApiStore>(() => ({
  fetch: async (
    path: string,
    config: any = {}
  ) => {
    const token = useUsersStore.getState().currentUser?.jwt?.token
    if (token) {
      config.headers ||= {}
      config.headers["Authorization"] = `Bearer ${token}`
    }
    const response = await fetch(`${appConfig.API_URL}${path}`, config)

    if (response.status === 401) {
      useUsersStore.getState().setCurrentUser(null)
    }

    return response
  },
  createSocket: (path: string) => {
    const token = useUsersStore.getState().currentUser?.jwt?.token
    if (!token) {
      return null
    }
    return new WebSocket(`${appConfig.WS_URL}${path}?token=${encodeURIComponent(token || "")}`)
  }
}));
