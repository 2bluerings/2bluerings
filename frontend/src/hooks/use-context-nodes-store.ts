import { create } from "zustand";
import { useApiStore } from "./use-api-store";

export type ContextNode = {
  id: string
  name: string
  summary: string | null
  content: string | null
  project_id: string
  external_id: string | null
  source: string
  type: string
  link: string | null
  status: string
  created_at: string
  updated_at: string
  pos_x: number
  pos_y: number
};

export type ContextNodeUpdate = {
  pos_x: number,
  pos_y: number
}

export type ContextNodesStore = {
  items: ContextNode[]
  visibleNodeIds: string[]
  setVisibleNodeIds: (itemIds: string[]) => Promise<void>
  load: (projectId: string) => Promise<ContextNode[]>
  update: (id: string, payload: ContextNodeUpdate) => Promise<ContextNode>
  delete: (id: string) => Promise<void>
  deleting: boolean
  deletedNodeId: string | null
};


export const useContextNodesStore = create<ContextNodesStore>((set) => ({
  items: [],
  visibleNodeIds: [],
  deletedNodeId: null,
  setVisibleNodeIds: async (itemIds: string[]) => {
    set(() => {
      return {
        visibleNodeIds: itemIds
      }
    })
  },
  update: async (
    id: string,
    payload: ContextNodeUpdate
  ) => {
    const response = await useApiStore.getState().fetch(`/api/v1/context_nodes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) throw new Error('Failed to update context_node')

    const node = await response.json()

    set((state) => {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === node.id ? { ...item, ...node } : item
        )
      }
    })

    return node
  },

  load: async (projectId: string) => {
    try {
      const response = await useApiStore.getState().fetch(`/api/v1/projects/${projectId}/context_nodes`)
      const data: ContextNode[] = await response.json()
      set({ items: data })
      return data
    } catch (error) {
      console.error("Failed to load context nodes", error);
      set({ items: [] })
      return [];
    }
  },
  deleting: false,
  delete: async (id: string) => {
    set(() => ({deleting: true}))
    const response = await useApiStore.getState().fetch(`/api/v1/context_nodes/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      set(() => ({deleting: false}))
      throw new Error('Failed to delete context_node');
    }

    set((state) => ({
      items: state.items.filter((item) => item.id !== id)
    }))
    set(() => ({deleting: false, deletedNodeId: id}))
  }
}));
