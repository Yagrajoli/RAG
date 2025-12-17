import { useState, useCallback, useEffect } from 'react';
import { Source, Message } from '@/types/app';
import { toast } from "sonner";

const STORAGE_KEYS = {
  SOURCES: 'rag-sources',
  MESSAGES: 'rag-messages',
};

// Helper to safely parse JSON from localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
};

// Helper to safely save to localStorage
const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Types for serialized data (dates as strings)
interface SerializedSource {
  id: string;
  type: "file" | "url";
  name?: string;
  url?: string;
  status: 'pending' | 'processing' | 'indexed' | 'failed';
  error?: string;
  createdAt: string;
}

interface SerializedMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: any[];
  timestamp: string;
  isThinking?: boolean;
}

// Serialize sources for storage (exclude File objects as they can't be serialized)
const serializeSources = (sources: Source[]): SerializedSource[] => {
  return sources.map(({ file, ...rest }) => ({
    ...rest,
    // Convert Date to string for storage
    createdAt: rest.createdAt instanceof Date ? rest.createdAt.toISOString() : String(rest.createdAt),
  }));
};

// Deserialize sources from storage (restore Date objects)
const deserializeSources = (sources: SerializedSource[]): Source[] => {
  return sources.map(source => ({
    ...source,
    createdAt: new Date(source.createdAt),
  }));
};

// Serialize messages for storage
const serializeMessages = (messages: Message[]): SerializedMessage[] => {
  return messages.map(msg => ({
    ...msg,
    timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : String(msg.timestamp),
  }));
};

// Deserialize messages from storage (restore Date objects)
const deserializeMessages = (messages: SerializedMessage[]): Message[] => {
  return messages.map(msg => ({
    ...msg,
    timestamp: new Date(msg.timestamp),
  }));
};

export function useRAG() {
  const [sources, setSources] = useState<Source[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Load data from localStorage on mount
  useEffect(() => {
    const storedSources = getFromStorage<SerializedSource[]>(STORAGE_KEYS.SOURCES, []);
    const storedMessages = getFromStorage<SerializedMessage[]>(STORAGE_KEYS.MESSAGES, []);
    
    setSources(deserializeSources(storedSources));
    setMessages(deserializeMessages(storedMessages));
    setIsInitialized(true);
  }, []);

  // Save sources to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      saveToStorage(STORAGE_KEYS.SOURCES, serializeSources(sources));
    }
  }, [sources, isInitialized]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      saveToStorage(STORAGE_KEYS.MESSAGES, serializeMessages(messages));
    }
  }, [messages, isInitialized]);

  
  // 1. INDEXING 
  

  const indexSource = async (source: Source) => {
    try {
      setSources(prev =>
        prev.map(s => s.id === source.id ? { ...s, status: "processing" } : s)
      );

      const form = new FormData();

      if (source.type === "file") {
        form.append("type", "pdf");
        form.append("file", source.file!);
      } else {
        form.append("type", "url");
        form.append("url", source.url ?? "");
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/documents/index`, {
        method: "POST",
        body: form
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setSources(prev =>
        prev.map(s =>
          s.id === source.id ? { ...s, status: "indexed" } : s
        )
      );

      toast("Source indexed successfully");

    } catch (err:string | any) {
      setSources(prev =>
        prev.map(s =>
          s.id === source.id
            ? { ...s, status: "failed", error: "Indexing failed" }
            : s
        )
      );

      toast("Error indexing source", { description: err.message });
    }
  };

  
  // 2. File Upload
  
  const uploadFiles = useCallback((files: File[]) => {
    const newSources: Source[] = files.map(file => ({
      id: generateId(),
      name: file.name,
      type: "file",
      file: file,
      status: "pending",
      createdAt: new Date(),
    }));

    setSources(prev => [...prev, ...newSources]);

    toast(`${files.length} file(s) uploaded`, {
      description: "Indexing will begin...",
    });

    newSources.forEach(src => indexSource(src));
  }, []);

  
  // 3. Website URL
  
  const addUrl = useCallback((url: string) => {
    if (sources.some(s => s.type === "url" && s.url === url)) {
      toast("URL already exists");
      return;
    }

    const newSource: Source = {
      id: generateId(),
      url,
      type: "url",
      status: "pending",
      createdAt: new Date(),
    };

    setSources(prev => [...prev, newSource]);

    toast("URL added", { description: "Indexing..." });

    indexSource(newSource);
  }, [sources]);

  
  // 4. DELETE SOURCE
  
  const deleteSource = useCallback((id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
    toast("Source removed");
  }, []);

  
  // 5. CHAT
  
  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const indexedCollections = sources
        .filter(s => s.status === "indexed")
        .map(s =>
          s.type === "file" ? "pdf_collection" : "web_collection"
        );

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuery: content,
          collections: indexedCollections
        })
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: data.answer,
        citations: data.citations,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      toast("Error getting AI response");
    } finally {
      setIsLoading(false);
    }
  }, [sources]);

  // 6. CLEAR FUNCTIONS
  
  const clearMessages = useCallback(() => {
    setMessages([]);
    toast("Chat history cleared");
  }, []);

  const clearSources = useCallback(() => {
    setSources([]);
    toast("All sources cleared");
  }, []);

  const clearAll = useCallback(() => {
    setMessages([]);
    setSources([]);
    toast("All data cleared");
  }, []);

  return {
    sources,
    messages,
    isLoading,
    uploadFiles,
    addUrl,
    deleteSource,
    sendMessage,
    clearMessages,
    clearSources,
    clearAll,
  };
}