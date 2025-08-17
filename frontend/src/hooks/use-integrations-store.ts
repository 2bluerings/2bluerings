import { create } from 'zustand'
import { useApiStore } from './use-api-store';

export interface Integration {
  id: string
  name: string
  active: boolean
  supported: boolean
  config: any
  description: string
  type: string
  logo: string
  display_name: string
  placeholder: string
}

interface IntegrationsStore {
  items: Integration[]
  create: (name: string, config: any) => Promise<Integration>
  update: (id: string, name: string, config: any) => Promise<Integration>
  load: () => Promise<Integration[]>
}

export const useIntegrationsStore = create<IntegrationsStore>((set) => ({
  items: [],
  update: async (
    id: string,
    name: string,
    config: any
  ) => {
    const response = await useApiStore.getState().fetch(`/api/v1/integrations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, config })
    })

    if (!response.ok) throw new Error('Failed to update integration')

    const integration = await response.json()

    set((state) => {
      return {
        ...state,
        items: state.items.map((item) =>
          item.name === integration.name ? { ...item, ...integration } : item
        )
      };
    });

    return integration
  },
  create: async (name: string, config: any) => {
    const response = await useApiStore.getState().fetch(`/api/v1/integrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, config })
    })

    if (!response.ok) throw new Error('Failed to create integration')

    const integration = await response.json()
    
    set((state) => {
      return {
        ...state,
        items: state.items.map((item) =>
          item.name === integration.name ? { ...item, ...integration } : item
        )
      };
    });

    return integration
  },
  load: async () => {
    const response = await useApiStore.getState().fetch(`/api/v1/integrations`, {
      method: 'GET'
    })

    const integrations = await response.json()

    set(() => ({
      items: integrations
    }))

    return integrations;
  }
}));
