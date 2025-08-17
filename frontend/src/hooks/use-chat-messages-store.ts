import { create } from "zustand";
import { useApiStore } from "./use-api-store";

export type ChatMessage = {
  role: "user" | "assistant" | "tool" | "token";
  content: string;
  metadata?: any
};

export type ChatMessagesStore = {
  items: ChatMessage[];
  unpublishedItem: ChatMessage | null;
  setUnpublishedItem: (item: ChatMessage) => void;
  clearUnpublishedItem: () => void;
  create: (message: ChatMessage) => Promise<ChatMessage>;
  updateToken: (token: string) => void;
  clearItems: () => void;
  load: (threadId: string, projectId: string) => Promise<ChatMessage[]>;
};

export const useChatMessagesStore = create<ChatMessagesStore>((set, get) => ({
  items: [],

  unpublishedItem: null,

  clearItems: () => {
    set({ items: [] })
  },

  create: async (message: ChatMessage) => {
    set(
      (state) => ({
        ...state,
        items: [
          ...state.items,
          message
        ]
      })
    );

    return message;
  },

  load: async (threadId: string, projectId: string) => {
    try {
      const response = await useApiStore.getState().fetch(
        `/api/v1/projects/${projectId}/threads/${threadId}/messages`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const data = await response.json();

      const formattedMessages: ChatMessage[] = data.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));

      set({ items: formattedMessages });

      return formattedMessages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      set({ items: [] });

      return [];
    }
  },

  updateToken: (token: string) => {
    set((state) => {
      const noTools = state.items.filter((m) => m.role !== "tool");
      const updated = [...noTools];
      const last = updated[updated.length - 1];

      if (last && last.role === "assistant") {
        updated[updated.length - 1] = {
          ...last,
          content: last.content + token,
        };
      } else {
        updated.push({
          role: "assistant",
          content: token,
        });
      }

      return { items: updated };
    });
  },

  setUnpublishedItem: (item: ChatMessage) => {
    set({
      unpublishedItem: item
    })
  },

  clearUnpublishedItem: () => {
    set({
      unpublishedItem: null
    })
  }
}));
