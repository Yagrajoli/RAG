export type SourceType = "file" | "url";

export type SourceStatus = 'pending' | 'processing' | 'indexed' | 'failed';

export interface Source {
  id: string;
  type: SourceType;
  name?: string;     // for files
  url?: string;      // for URLs
  file?: File;       // for upload
  status: SourceStatus;
  error?: string;
  createdAt: Date;
}

export interface Citation {
  id: string;
  sourceId: string;
  sourceType: SourceType;
  sourceName?: string;
  page?: number;
  excerpt: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
  isThinking?: boolean; // optional, for streaming/loading state
}