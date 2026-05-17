import { useState } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import type { Board, ColumnId, KanbanCard, Settings } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { CardModal } from './CardModal';
import { Tutorial } from './Tutorial';

const COLUMNS: { id: ColumnId; title: string; accent: string }[] = [
  { id: 'backlog', title: 'Backlog', accent: 'border-slate-500' },
  { id: 'todo', title: 'To Do', accent: 'border-blue-500' },
  { id: 'doing', title: 'Doing', accent: 'border-amber-500' },
  { id: 'done', title: 'Done', accent: 'border-emerald-500' },
];

interface Props {
  board: Board;
  settings: Settings;
  onChange: (board: Board) => void;
  onOpenSettings: () => void;
  onReset: () => void;
  tutorialOpen: boolean;
  onOpenTutorial: () => void;
  onCloseTutorial: () => void;
}

export function KanbanBoard({
  board,
  settings,
  onChange,
  onOpenSettings,
  onReset,
  tutorialOpen,
  onOpenTutorial,
  onCloseTutorial,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    if (
      result.source.droppableId === result.destination.droppableId &&
      result.source.index === result.destination.index
    ) {
      return;
    }
    const from = result.source.droppableId as ColumnId;
    const to = result.destination.droppableId as ColumnId;
    const next: Board = structuredClone(board);
    const [moved] = next.columns[from].splice(result.source.index, 1);
    next.columns[to].splice(result.destination.index, 0, moved);
    onChange(next);
  }

  function addCard(column: ColumnId) {
    const id = uid();
    const next: Board = structuredClone(board);
    next.cards[id] = {
      id,
      title: 'New task',
      description: '',
      createdAt: Date.now(),
    };
    next.columns[column].unshift(id);
    onChange(next);
    setEditingId(id);
  }

  function updateCard(card: KanbanCard) {
    const next: Board = structuredClone(board);
    next.cards[card.id] = card;
    onChange(next);
  }

  function deleteCard(id: string) {
    const next: Board = structuredClone(board);
    delete next.cards[id];
    for (const col of Object.keys(next.columns) as ColumnId[]) {
      next.columns[col] = next.columns[col].filter((c) => c !== id);
    }
    onChange(next);
    setEditingId(null);
  }

  const isManual = !board.meta.objective;
  const headerSubtitle = isManual ? 'Manual Kanban' : board.meta.objective;

  return (
    <div className="h-full flex flex-col">
      <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-emerald-400">Free</span>llo
          </h1>
          <p
            className="text-xs text-slate-400 truncate max-w-3xl mt-0.5"
            title={headerSubtitle}
          >
            {headerSubtitle}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onOpenTutorial}
            data-tour="help"
            title="Show tutorial"
            aria-label="Show tutorial"
            className="px-3 py-1.5 text-sm rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold"
          >
            ?
          </button>
          <button
            onClick={onOpenSettings}
            data-tour="settings"
            className="px-3 py-1.5 text-sm rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700"
          >
            Settings
          </button>
          <button
            onClick={onReset}
            data-tour="reset"
            className="px-3 py-1.5 text-sm rounded-md bg-rose-900/40 hover:bg-rose-900/60 border border-rose-800 text-rose-200"
          >
            Reset
          </button>
        </div>
      </header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto">
          <div
            data-tour="columns"
            className="flex gap-4 p-6 min-w-max h-full items-start"
          >
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                cards={board.columns[col.id].map((id) => board.cards[id]).filter(Boolean)}
                onAdd={() => addCard(col.id)}
                onCardClick={(id) => setEditingId(id)}
              />
            ))}
          </div>
        </div>
      </DragDropContext>

      <footer className="px-6 py-2 border-t border-slate-800/60 text-[10px] text-slate-500 flex justify-between">
        <span>
          {Object.keys(board.cards).length} cards
          {isManual ? ' · manual mode' : ` · drafted with ${settings.openRouterModel}`}
        </span>
        <span>
          GIFs powered by{' '}
          <a
            href="https://giphy.com"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-slate-300"
          >
            GIPHY
          </a>
        </span>
      </footer>

      {editingId && board.cards[editingId] && (
        <CardModal
          card={board.cards[editingId]}
          onClose={() => setEditingId(null)}
          onSave={updateCard}
          onDelete={() => deleteCard(editingId)}
        />
      )}

      <Tutorial open={tutorialOpen} onClose={onCloseTutorial} />
    </div>
  );
}

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
