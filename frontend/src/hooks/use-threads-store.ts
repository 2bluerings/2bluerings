import { create } from 'zustand'
import type { ContextNode } from '@/hooks/use-context-nodes-store'
import { useApiStore } from './use-api-store'
export type Thread = {
  id: string
  title: string
  project_id: string,
  contextNodes: ContextNode[],
  created_at: string,
  current: boolean | false
}

interface ThreadsStore {
  items: Thread[],
  setCurrent: (threadId: string | null) => void,
  add: (threads: Thread[]) => Promise<void>,
  create: (projectId: string, firstUserInput: string) => Promise<Thread>
  delete: (threadId: string) => Promise<void>
  addContextNodeToCurrent: (contextNode: ContextNode) => void
  removeContextNodeFromCurrent: (contextNodeId: string) => void
}

export const useThreadsStore = create<ThreadsStore>((set) => ({
  items: [],
  add: async (threads: Thread[]) => {
    set((state) => {
      const merged = [...threads, ...state.items];
      const unique = merged.filter(
        (thread, index, self) =>
          index === self.findIndex((t) => t.id === thread.id)
      );
      return { items: unique };
    });
  },

  create: async (projectId: string, firstUserInput: string) => {
    const response = await useApiStore.getState().fetch(`/api/v1/projects/${projectId}/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: firstUserInput
      })
    })

    if (!response.ok) throw new Error('Failed to create thread')

    const thread = await response.json()

    return thread
  },


  delete: async (threadId: string) => {
    const response = await useApiStore.getState().fetch(`/api/v1/threads/${threadId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) throw new Error('Failed to delete thread.')

    set((state) => ({
      items: [
        ...state.items.filter((th) => th.id != threadId)
      ]
    }));
  },

  addContextNodeToCurrent: (contextNode: ContextNode) => {
    set((state) => {
      const current = state.items.find(t => t.current === true)

      if (!current) {
        return state
      }

      const updatedContextNodes = [
        ...(current.contextNodes || []),
        contextNode
      ];

      const deduped = Array.from(
        new Map(updatedContextNodes.map(cn => [cn.id, cn])).values()
      );
      current.contextNodes = deduped

      return {
        items: [
          ...state.items
        ]
      }
    });
  },

  removeContextNodeFromCurrent: (contextNodeId: string) => {
    set((state) => {
      const current = state.items.find(t => t.current === true)

      if (!current) {
        return state
      }

      const filtered = (current.contextNodes ?? []).filter(
        cn => cn.id !== contextNodeId
      )

      current.contextNodes = filtered

      return {
        items: [
          ...state.items
        ]
      }
    })
  },

  setCurrent: (threadId: string | null) => {
    set((state) => {
      state.items.forEach((item) => {
        item.current = false

        if (item.id === threadId) {
          item.current = true
        }
      })

      return {
        items: [
          ...state.items
        ]
      }
    })
  }
}));
