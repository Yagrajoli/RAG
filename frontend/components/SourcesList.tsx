import { Source } from '@/types/app';
import { StatusBadge } from './StatusBadge';
import { File, Globe, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SourcesListProps {
  sources: Source[];
  onDelete: (id: string) => void;
}

export function SourcesList({ sources, onDelete }: SourcesListProps) {
  if (sources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="p-3 rounded-full bg-secondary mb-3">
          <File className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No sources added yet</p>
        <p className="text-xs text-muted-foreground mt-1">Upload documents or add URLs to get started</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-2">
      {sources.map((source, index) => {
        const displayName = source.type === 'file' 
          ? source.name 
          : (source.url ? new URL(source.url).hostname : 'Unknown URL');

        const subInfo = source.type === 'file' 
          ? `${source.name?.split('.').pop()?.toUpperCase() || 'UNKNOWN'} • ${source.file ? (source.file.size / 1024).toFixed(1) : '0'} KB`
          : (source.url || '');

        return (
        <div
          key={source.id}
          className={cn(
            'group flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50 transition-all duration-200 hover:bg-secondary/50',
            'animate-slide-in'
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className={cn(
            'p-2 rounded-lg shrink-0',
            source.type === 'file' ? 'bg-primary/10' : 'bg-accent/10'
          )}>
            {source.type === 'file' ? (
              <File className="w-4 h-4 text-primary" />
            ) : (
              <Globe className="w-4 h-4 text-accent" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {displayName}
                </p>
                {subInfo && (
                  <p className="text-xs text-muted-foreground truncate">{subInfo}</p>
                )}
              </div>
              <StatusBadge status={source.status} />
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {formatDate(source.createdAt)}
              </span>
              
              {source.error && (
                <Tooltip>
                  <TooltipTrigger>
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{source.error}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 shrink-0"
            onClick={() => onDelete(source.id)}
          >
            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
          </Button>
        </div>
      )})}
    </div>
  );
}