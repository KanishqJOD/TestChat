"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { addChat, getAllChats, clearChats, addMessageToHistory, loadChatHistory } from "@/lib/chatHistoryDb";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  images?: string[];
}

interface Chat {
  id: string;
  user: string;
  agent: string;
  timestamp: string;
  images?: string[];
}

interface UseChatbotReturn {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (message: string, files?: File[]) => Promise<void>;
  resetChat: () => Promise<void>;
  initializeChat: () => Promise<void>;
}

const apiCall = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("API call failed:", error);
    throw error;
  }
};

export function useChatbot(): UseChatbotReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const initializingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const currentRequestRef = useRef<AbortController | null>(null);
  const lastRequestTimeRef = useRef(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // In-memory fallback
  const inMemoryChats = useRef<Chat[]>([]);
  const isIndexedDBBlocked = useRef(false);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory().then(history => {
      if (history && history.length > 0) {
        setMessages(history);
      }
    });
  }, []);

  const initializeChat = useCallback(async () => {
    if (initializingRef.current || hasInitializedRef.current) {
      return;
    }
    try {
      initializingRef.current = true;
      setIsLoading(true);
      await apiCall("/api/chat/new", { method: "POST" });
      setMessages([]);
      if (isIndexedDBBlocked.current) {
        inMemoryChats.current = [];
      } else {
        await clearChats();
      }
      hasInitializedRef.current = true;
      toast.success("New chat session initialized");
    } catch (error: any) {
      console.error("Failed to initialize chat:", error);
      hasInitializedRef.current = false;
      if (error.name !== 'AbortError') {
        toast.error(`Failed to initialize chat: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    } finally {
      setIsLoading(false);
      initializingRef.current = false;
    }
  }, []);

  const sendMessage = useCallback(async (text: string, images?: string[], audioBlob?: Blob) => {
    if (!text.trim() && !images?.length && !audioBlob) return;

    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      content: text,
      role: "user",
      timestamp: new Date(),
      images
    };

    // Add user message to state and history
    setMessages(prev => [...prev, userMessage]);
    await addMessageToHistory(userMessage);

    // Start loading state
    setIsLoading(true);

    try {
      // Log the message data that would be sent to MCP server
      console.log("Message data to be sent to MCP server:", {
        text,
        images: images?.length || 0,
        hasAudio: !!audioBlob
      });

      // Mock assistant response for now
      const mockResponses = [
        "I can help you find great deals on those items! Let me check our inventory.",
        "Based on your images, I recommend checking out these similar products...",
        "Here are some popular options in that category with great reviews...",
        "I found several matching items at competitive prices. Would you like to see them?",
      ];
      
      const assistantMessage: Message = {
        id: uuidv4(),
        content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        role: "assistant",
        timestamp: new Date()
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add assistant message
      setMessages(prev => [...prev, assistantMessage]);
      await addMessageToHistory(assistantMessage);
    } catch (error) {
      console.error("Error processing message:", error);
      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        content: "Sorry, I encountered an error processing your request. Please try again.",
        role: "assistant",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      await addMessageToHistory(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetChat = useCallback(async () => {
    try {
      setIsLoading(true);
      await apiCall("/api/chat/reset", { method: "POST" });
      setMessages([]);
      if (isIndexedDBBlocked.current) {
        inMemoryChats.current = [];
      } else {
        await clearChats();
      }
      toast.success("Chat history cleared");
    } catch (error) {
      console.error("Failed to reset chat:", error);
      toast.error("Failed to reset chat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    resetChat,
    initializeChat,
  };
}
