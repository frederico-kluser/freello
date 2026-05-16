import { Droppable, Draggable } from '@hello-pangea/dnd';
import type { ColumnId, KanbanCard } from '../types';
import { KanbanCardView } from './KanbanCard';

interface Props {
  column: { id: ColumnId; title: string; accent: string };
  cards: KanbanCard[];
  onAdd: () => void;
  onCardClick: (id: string) => void;
}

export function KanbanColumn({ column, cards, onAdd, onCardClick }: Props) {
  return (
    <div
      className={`flex flex-col w-80 shrink-0 rounded-xl bg-slate-900/60 border-t-4 ${column.accent} border-x border-b border-slate-800 max-h-full`}
    >
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/60">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          {column.title}
        </h2>
        <span className="text-xs text-slate-500 tabular-nums">{cards.length}</span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[60px] px-3 py-2 space-y-2 overflow-y-auto transition-colors ${
              snapshot.isDraggingOver ? 'bg-slate-800/40' : ''
            }`}
          >
            {cards.map((card, idx) => (
              <Draggable key={card.id} draggableId={card.id} index={idx}>
                {(p, snap) => (
                  <div
                    ref={p.innerRef}
                    {...p.draggableProps}
                    {...p.dragHandleProps}
                    onClick={() => onCardClick(card.id)}
                    className={snap.isDragging ? 'rotate-1' : ''}
                  >
                    <KanbanCardView card={card} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <button
        onClick={onAdd}
        className="m-3 px-3 py-2 text-sm rounded-md bg-slate-800/60 hover:bg-slate-800 border border-dashed border-slate-700 text-slate-400 hover:text-slate-200"
      >
        + Add card
      </button>
    </div>
  );
}
