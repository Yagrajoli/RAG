import { Message, Citation } from '@/types/app';
import { cn } from '@/lib/utils';
import { User, Bot, File, Globe, ExternalLink, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChatMessageProps {
  message: Message;
}

function CitationBadge({ citation }: { citation: Citation }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
          {citation.sourceType === 'file' ? (
            <File className="w-3 h-3" />
          ) : (
            <Globe className="w-3 h-3" />
          )}
          <span className="max-w-[100px] truncate">{citation.sourceName}</span>
          {citation.page && <span>p.{citation.page}</span>}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs text-muted-foreground mb-1">{citation.sourceName}</p>
        <p className="text-xs">"{citation.excerpt}"</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 animate-fade-in', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn(
  'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
  isUser ? 'bg-primary' : 'bg-secondary border border-border'
)}>
  {isUser ? (
    <User className="w-4 h-4 text-primary-foreground" />
  ) : message.isThinking ? (
    <Loader2 className="w-4 h-4 animate-spin text-primary" />
  ) : (
    <Bot className="w-4 h-4 text-primary" />
  )}
</div>


      <div className={cn(
        'flex-1 max-w-[80%] space-y-2',
        isUser ? 'items-end' : 'items-start'
      )}>
        <div className={cn(
          'rounded-2xl px-4 py-3',
          isUser 
            ? 'bg-primary text-primary-foreground rounded-tr-sm' 
            : 'bg-secondary/50 border border-border rounded-tl-sm'
        )}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>

        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1">
            {message.citations.map((citation) => (
              <CitationBadge key={citation.id} citation={citation} />
            ))}
          </div>
        )}

        <span className="text-xs text-muted-foreground px-1">
          {new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }).format(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
