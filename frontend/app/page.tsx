"use client"
import { useState } from 'react';
import { SourcesPanel } from '@/components/SourcesPanel';
import { ChatPanel } from '@/components/ChatPanel';
import { useRAG } from '@/hooks/useRAG';
import { Database, MessageSquare, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const page = () => {
  const { sources, messages, isLoading, uploadFiles, addUrl, deleteSource, sendMessage } = useRAG();
  const [mobileView, setMobileView] = useState<'sources' | 'chat'>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const hasSources = sources.some(s => s.status === 'indexed');

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <h1 className="text-lg font-semibold text-foreground">RAG Assistant</h1>
        <div className="flex gap-1">
          <Button
            className='cursor-pointer'
            variant={mobileView === 'sources' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMobileView('sources')}
          >
            <Database className="w-4 h-4" />
          </Button>
          <Button
            className='cursor-pointer'
            variant={mobileView === 'chat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMobileView('chat')}
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Layout */}
        <div className="hidden lg:flex  flex-1">
          {/* Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-4 z-10 transition-all duration-300 cursor-pointer",
              sidebarOpen ? "left-[328px]" : "left-4"
            )}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-4 h-4 cursor-pointer" /> : <Menu className="w-4 h-4 cursor-pointer" />}
          </Button>

          {/* Sources Panel */}
          <div className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            sidebarOpen ? "w-[380px]" : "w-0"
          )}>
            <div className="w-[380px] h-full">
              <SourcesPanel
                sources={sources}
                onUploadFiles={uploadFiles}
                onAddUrl={addUrl}
                onDeleteSource={deleteSource}
              />
            </div>
          </div>

          {/* Chat Panel */}
          <div className="flex-1">
            <ChatPanel
              messages={messages}
              onSendMessage={sendMessage}
              isLoading={isLoading}
              hasSources={hasSources}
              sidebarOpen={sidebarOpen}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex-1">
          {mobileView === 'sources' ? (
            <SourcesPanel
              sources={sources}
              onUploadFiles={uploadFiles}
              onAddUrl={addUrl}
              onDeleteSource={deleteSource}
            />
          ) : (
            <ChatPanel
              messages={messages}
              onSendMessage={sendMessage}
              isLoading={isLoading}
              hasSources={hasSources}
              sidebarOpen={sidebarOpen}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default page;