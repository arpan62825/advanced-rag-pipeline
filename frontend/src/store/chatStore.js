import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/generate-response";

const generateId = () => Math.random().toString(36).substring(2, 12);

const useChatStore = create((set, get) => ({
  // Conversations: { id, title, messages[], createdAt }
  conversations: [],
  activeConversationId: null,
  isSidebarOpen: false,
  isLoading: false,

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),

  // Create new conversation and set it active
  createConversation: () => {
    const id = generateId();
    const conversation = {
      id,
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
    };
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      activeConversationId: id,
    }));
    return id;
  },

  // Switch to an existing conversation
  setActiveConversation: (id) => set({ activeConversationId: id }),

  // Get current conversation's messages
  getActiveMessages: () => {
    const state = get();
    const conv = state.conversations.find(
      (c) => c.id === state.activeConversationId
    );
    return conv?.messages || [];
  },

  // Send a message and get AI response
  sendMessage: async (queryText) => {
    const state = get();
    let conversationId = state.activeConversationId;

    // If no active conversation, create one
    if (!conversationId) {
      conversationId = get().createConversation();
    }

    const userMessage = {
      id: generateId(),
      role: "user",
      content: queryText,
      timestamp: Date.now(),
    };

    const assistantMessage = {
      id: generateId(),
      role: "assistant",
      content: "",
      isStreaming: true,
      timestamp: Date.now(),
    };

    // Add user message + empty assistant placeholder
    set((state) => ({
      isLoading: true,
      conversations: state.conversations.map((conv) => {
        if (conv.id !== conversationId) return conv;
        // Auto-title from first message
        const title =
          conv.messages.length === 0
            ? queryText.slice(0, 40) + (queryText.length > 40 ? "…" : "")
            : conv.title;
        return {
          ...conv,
          title,
          messages: [...conv.messages, userMessage, assistantMessage],
        };
      }),
    }));

    try {
      const response = await axios.post(API_URL, { query: queryText });
      const fullText = response.data.result || "No response received.";

      // Simulate streaming — reveal text character by character
      const chunkSize = 3;
      for (let i = 0; i <= fullText.length; i += chunkSize) {
        const partialText = fullText.slice(0, i + chunkSize);
        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id !== conversationId) return conv;
            return {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: partialText, isStreaming: true }
                  : msg
              ),
            };
          }),
        }));
        // Small delay between chunks for typewriter effect
        await new Promise((r) => setTimeout(r, 12));
      }

      // Mark streaming complete
      set((state) => ({
        isLoading: false,
        conversations: state.conversations.map((conv) => {
          if (conv.id !== conversationId) return conv;
          return {
            ...conv,
            messages: conv.messages.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: fullText, isStreaming: false }
                : msg
            ),
          };
        }),
      }));
    } catch (error) {
      const errorText =
        error.response?.data?.error ||
        "Something went wrong. Please try again.";
      set((state) => ({
        isLoading: false,
        conversations: state.conversations.map((conv) => {
          if (conv.id !== conversationId) return conv;
          return {
            ...conv,
            messages: conv.messages.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: errorText, isStreaming: false }
                : msg
            ),
          };
        }),
      }));
    }
  },

  // Delete a conversation
  deleteConversation: (id) =>
    set((state) => {
      const filtered = state.conversations.filter((c) => c.id !== id);
      return {
        conversations: filtered,
        activeConversationId:
          state.activeConversationId === id
            ? filtered[0]?.id || null
            : state.activeConversationId,
      };
    }),
}));

export default useChatStore;
