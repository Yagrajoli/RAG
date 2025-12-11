import { useState } from 'react';
import { Plus, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UrlInputProps {
  onAddUrl: (url: string) => void;
}

export function UrlInput({ onAddUrl }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    
    if (!trimmedUrl) {
      setError('Please enter a URL');
      return;
    }

    let finalUrl = trimmedUrl;
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      finalUrl = 'https://' + trimmedUrl;
    }

    if (!validateUrl(finalUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    onAddUrl(finalUrl);
    setUrl('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            placeholder="Enter website URL..."
            className="pl-9"
          />
        </div>
        <Button type="submit" size="icon" variant="secondary">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive animate-fade-in">{error}</p>
      )}
    </form>
  );
}
