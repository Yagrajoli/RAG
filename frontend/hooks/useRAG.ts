import { useState, useCallback } from 'react';
import { Source, Message } from '@/types/app';
import { toast } from "sonner";

export function useRAG() {
  const [sources, setSources] = useState<Source[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  
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

  return {
    sources,
    messages,
    isLoading,
    uploadFiles,
    addUrl,
    deleteSource,
    sendMessage,
  };
}