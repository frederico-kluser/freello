import type { KanbanCard } from '../types';

export function KanbanCardView({ card }: { card: KanbanCard }) {
  return (
    <article className="rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-500 transition overflow-hidden cursor-grab active:cursor-grabbing shadow-sm">
      {card.gifUrl && (
        <img
          src={card.gifUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-28 object-cover bg-slate-900"
        />
      )}
      <div className="p-3">
        <h3 className="text-sm font-medium leading-snug text-slate-100">{card.title}</h3>
        {card.description && (
          <p className="mt-1 text-xs text-slate-400 line-clamp-3">{card.description}</p>
        )}
      </div>
    </article>
  );
}
