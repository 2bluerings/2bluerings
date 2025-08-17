import { create } from 'zustand'

export interface Mode {
  name: string
  icon: string
  supported: boolean
  title: string
}

interface ModesStore {
  selectedMode: Mode | null
  items: Mode[]
  load: () => Promise<void>
  selectMode: (mode: Mode) => void
}

export const useModesStore = create<ModesStore>((set) => ({
  selectedMode: null,
  items: [],
  load: async () => {
    set(() => {
      return {
        items: [
          {
            name: "default",
            title: "Default",
            supported: true,
            icon: "blend"
          },
          {
            name: "focus",
            title: "Focus",
            supported: true,
            icon: "lightbulb"
          },
          {
            name: "thinking",
            title: "Thinking (coming soon)",
            supported: false,
            icon: "badge-question-mark"
          }
        ]
      }
    })
  },
  selectMode: (mode: Mode) => {
    set({
      selectedMode: mode
    })
  }
}));
