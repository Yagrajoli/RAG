import { useRef, useEffect } from "react";
import { Message } from "@/types/app";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Bot, Moon, Sparkles, Trash2 } from "lucide-react";
import { ModeToggle } from "@/lib/ModeToggle";
import { Button } from "./ui/button";

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  onClearMessages?: () => void;
  isLoading?: boolean;
  hasSources?: boolean;
  sidebarOpen: boolean;
}

export function ChatPanel({
  messages,
  onSendMessage,
  onClearMessages,
  sidebarOpen,
  isLoading = false,
  hasSources = false,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between border-border">
        {sidebarOpen ? (
          <div className="flex items-center  gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>

            <div className="">
              <h2 className="text-lg font-semibold text-foreground">
                AI Assistant
              </h2>
              <p className="text-xs text-muted-foreground">
                Ask questions about your knowledge base
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center lg:ml-[39px] gap-2 left-12">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>

            <div className="">
              <h2 className="text-lg font-semibold text-foreground">
                AI Assistant
              </h2>
              <p className="text-xs text-muted-foreground">
                Ask questions about your knowledge base
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {messages.length > 0 && onClearMessages && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearMessages}
              className="cursor-pointer text-muted-foreground hover:text-destructive"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-secondary to-card border border-border">
                <Bot className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Welcome to RAG Assistant
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Upload documents or add website URLs to your knowledge base, then
              ask questions to get AI-powered answers with citations.
            </p>
            <div className="grid gap-2 text-left max-w-sm">
              {[
                "What are the key points in my documents?",
                "Summarize the main topics covered",
                "Find information about specific topics",
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => hasSources && onSendMessage(suggestion)}
                  disabled={!hasSources}
                  className="p-3 rounded-lg bg-secondary/50 border border-border text-sm text-left hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-muted-foreground">"</span>
                  {suggestion}
                  <span className="text-muted-foreground">"</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary/50 border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex flex-col">
                  
                  <span className="text-sm text-muted-foreground">
                    Thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <ChatInput
          onSend={onSendMessage}
          isLoading={isLoading}
          disabled={!hasSources}
        />
      </div>
    </div>
  );
}
