export type ColumnId = 'backlog' | 'todo' | 'doing' | 'done';

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  giphyQuery?: string;
  gifUrl?: string;
  createdAt: number;
}

export interface Board {
  cards: Record<string, KanbanCard>;
  columns: Record<ColumnId, string[]>;
  meta: {
    objective: string;
    context: string;
    createdAt: number;
  };
}

export interface Settings {
  openRouterKey: string;
  openRouterModel: string;
  giphyKey: string;
}
