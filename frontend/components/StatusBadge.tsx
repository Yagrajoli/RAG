import { SourceStatus } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: SourceStatus;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'text-muted-foreground bg-muted',
  },
  processing: {
    label: 'Processing',
    icon: Loader2,
    className: 'text-warning bg-warning/10',
    iconClass: 'animate-spin',
  },
  indexed: {
    label: 'Indexed',
    icon: CheckCircle2,
    className: 'text-success bg-success/10',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'text-destructive bg-destructive/10',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      <Icon className={cn('w-3 h-3', (config as any).iconClass)} />
      {config.label}
    </span>
  );
}
