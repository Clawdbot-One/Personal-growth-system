import { create } from "zustand";
import type { ChatMessage, ChatContext } from "@/types";
import { streamReply, makeMessage } from "@/services/aiService";
import { welcomeMessages } from "@/mock/chat";
import { uid } from "@/lib/utils";

interface ChatState {
  messages: ChatMessage[];
  sessionId: string;
  streaming: boolean;
  streamingContent: string;
  loadWelcome: () => void;
  send: (text: string) => Promise<void>;
  highlight: (messageId: string) => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  sessionId: uid("s"),
  streaming: false,
  streamingContent: "",

  loadWelcome: () => {
    if (get().messages.length === 0) {
      set({ messages: [...welcomeMessages] });
    }
  },

  send: async (text) => {
    const sessionId = get().sessionId;
    const userMsg = makeMessage(sessionId, "user", text);
    set((s) => ({ messages: [...s.messages, userMsg], streaming: true, streamingContent: "" }));

    let aiContent = "";
    let context: ChatContext = "general";
    try {
      for await (const chunk of streamReply(text)) {
        if (chunk.content) {
          aiContent += chunk.content;
          set({ streamingContent: aiContent });
        }
        context = chunk.context;
      }
      const aiMsg = makeMessage(sessionId, "ai", aiContent, context);
      set((s) => ({
        messages: [...s.messages, aiMsg],
        streaming: false,
        streamingContent: "",
      }));
    } catch {
      set({ streaming: false, streamingContent: "" });
    }
  },

  highlight: (messageId) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, highlighted: !m.highlighted } : m
      ),
    })),

  clear: () => set({ messages: [], sessionId: uid("s"), streamingContent: "", streaming: false }),
}));
