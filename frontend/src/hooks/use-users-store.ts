import { create } from "zustand";
import { useApiStore } from "./use-api-store";


export type User = {
  id: string
  full_name: string
  email: string
  jwt: Jwt | null
  settings: UserSettings
};

export type UserSettings = {
  llm_model?: string
  llm_provider?: string
}

export type ErrorResponse = {
  detail: string
}

type Jwt = {
  token: string,
  type: string
}

type SignInPayload = { email: string; password: string };
type SignUpPayload = { full_name: string; email: string; password: string };

interface UsersStore {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  loadCurrentUser: () => Promise<User | null>
  signIn: (payload: SignInPayload) => Promise<User>
  signUp: (payload: SignUpPayload) => Promise<User>
  signOut: () => void
  errorResponse: ErrorResponse | null
  loading: boolean,
  updateSettings: (payload: UserSettings) => void
}

const STORAGE_KEY = "cm.currentUser";

export const useUsersStore = create<UsersStore>((set, get) => ({
  currentUser: null,
  errorResponse: null,
  loading: false,
  setCurrentUser: (user: User | null) => {
    if (!user || !user.id) {
      localStorage.removeItem(STORAGE_KEY);
      set({ currentUser: null });

      return
    }

    set((state) => {
      const mergedUser = {
        ...state.currentUser,
        ...user
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(mergedUser)
      )

      return {
        currentUser: mergedUser
      }
    })
  },

  signIn: async (payload: SignInPayload) => {
    try {
      set(() => ({ loading: true }))
      const res = await useApiStore.getState().fetch(`/api/v1/users/sign_in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const response = await res.json()
        set(() => ({
          errorResponse: response,
          loading: false
        }))
        return response
      }

      const user = (await res.json()) as User;
      get().setCurrentUser(user)
      
      set(() => ({
        errorResponse: null,
        loading: false
      }))

      return user;
    } catch (e: any) {
      throw new Error("Failed to sign in");
    }
  },

  signUp: async (payload: SignUpPayload) => {
    set(() => ({ loading: true }))
    const res = await useApiStore.getState().fetch(`/api/v1/users/sign_up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const response = await res.json()
      set(() => ({
        errorResponse: response,
        loading: false
      }))
      return response
    }

    set(() => ({
      errorResponse: null,
      loading: false
    }))

    return (await res.json()) as User
  },

  signOut: async () => {
    get().setCurrentUser(null)
  },

  loadCurrentUser: async () => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      set({ currentUser: null });
      return null;
    }

    try {
      const parsed = JSON.parse(stored) as User;
      set({ currentUser: parsed });

      return parsed;
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
      set({ currentUser: null });

      return null;
    }
  },

  updateSettings: async (payload: UserSettings) => {
    const res = await useApiStore.getState().fetch(`/api/v1/users/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const user = (await res.json()) as User;
    get().setCurrentUser(user)
  }
}));
