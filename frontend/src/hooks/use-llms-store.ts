import { create } from 'zustand'
import { useApiStore } from './use-api-store';

export interface Llm {
  provider: string
  model: string
  active: boolean
  supported: boolean
}

interface LlmsStore {
  selectedLlm: Llm | null
  selectedTool: string | null,
  items: Llm[]
  load: () => Promise<Llm[]>
  selectLlm: (llm: Llm) => void
}

export const useLlmsStore = create<LlmsStore>((set) => ({
  selectedLlm: null,
  selectedTool: null,
  items: [],
  load: async () => {
    const response = await useApiStore.getState().fetch(`/api/v1/llms`, {
      method: 'GET'
    })

    const llms = await response.json()

    set(() => ({
      items: llms
    }))

    return llms;
  },
  selectLlm: (llm: Llm) => {
    set({
      selectedLlm: llm
    })
  },
  selectTool: (tool: string) => {
    set({
      selectedTool: tool
    })
  }
}));
