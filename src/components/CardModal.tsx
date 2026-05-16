import { useEffect, useState } from 'react';
import type { KanbanCard } from '../types';

interface Props {
  card: KanbanCard;
  onClose: () => void;
  onSave: (card: KanbanCard) => void;
  onDelete: () => void;
}

export function CardModal({ card, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [gifUrl, setGifUrl] = useState(card.gifUrl ?? '');

  function commit() {
    onSave({ ...card, title: title.trim() || 'Untitled', description, gifUrl: gifUrl || undefined });
    onClose();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') commit();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, gifUrl]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={commit}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {gifUrl && (
          <img
            src={gifUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-48 object-cover bg-slate-800"
          />
        )}

        <div className="p-5 space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-lg font-semibold outline-none border-b border-slate-700 focus:border-slate-500 pb-2"
            placeholder="Task title"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Add a description…"
            className="w-full bg-slate-800 rounded-md p-3 text-sm outline-none focus:ring-1 focus:ring-slate-600 resize-none"
          />
          <label className="block">
            <div className="text-xs font-medium text-slate-400 mb-1">GIF URL (Giphy)</div>
            <input
              value={gifUrl}
              onChange={(e) => setGifUrl(e.target.value)}
              placeholder="https://media.giphy.com/…"
              className="w-full bg-slate-800 rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-slate-600 font-mono"
              spellCheck={false}
            />
          </label>

          <div className="flex justify-between pt-2">
            <button
              onClick={onDelete}
              className="px-3 py-2 text-sm rounded-md bg-rose-900/40 hover:bg-rose-900/60 border border-rose-800 text-rose-200"
            >
              Delete
            </button>
            <button
              onClick={commit}
              className="px-4 py-2 text-sm rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
