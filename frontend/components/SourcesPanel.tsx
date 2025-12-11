import { Source } from '@/types/app';
import { FileUpload } from './FileUpload';
import { UrlInput } from './UrlInput';
import { SourcesList } from './SourcesList';
import { Database, FileStack, Globe } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SourcesPanelProps {
  sources: Source[];
  onUploadFiles: (files: File[]) => void;
  onAddUrl: (url: string) => void;
  onDeleteSource: (id: string) => void;
}

export function SourcesPanel({ sources, onUploadFiles, onAddUrl, onDeleteSource }: SourcesPanelProps) {
  const fileCount = sources.filter(s => s.type === 'file').length;
  const urlCount = sources.filter(s => s.type === 'url').length;
  const indexedCount = sources.filter(s => s.status === 'indexed').length;

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Knowledge Base</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {indexedCount} of {sources.length} sources indexed
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 p-4">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border/50">
          <FileStack className="w-4 h-4 text-primary" />
          <div>
            <p className="text-lg font-semibold text-foreground">{fileCount}</p>
            <p className="text-xs text-muted-foreground">Documents</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border/50">
          <Globe className="w-4 h-4 text-accent" />
          <div>
            <p className="text-lg font-semibold text-foreground">{urlCount}</p>
            <p className="text-xs text-muted-foreground">Web Pages</p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="px-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Upload Documents</h3>
          <FileUpload onUpload={onUploadFiles} />
        </div>

        <Separator className="bg-border" />

        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Add Web Source</h3>
          <UrlInput onAddUrl={onAddUrl} />
        </div>
      </div>

      <Separator className="bg-border my-4" />

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <h3 className="text-sm font-medium text-foreground mb-3">All Sources</h3>
        <SourcesList sources={sources} onDelete={onDeleteSource} />
      </div>
    </div>
  );
}