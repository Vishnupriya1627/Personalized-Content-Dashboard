import { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal } from 'lucide-react';
import type { ContentItem } from '@/types/content';
import ContentCard from '@/components/cards/ContentCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setOrder } from '@/features/feed/feedSlice';

// Saved order first; items the user hasn't placed yet go at the end
function applyOrder(items: ContentItem[], order: string[]): ContentItem[] {
  if (order.length === 0) return items;
  const pos = new Map(order.map((id, i) => [id, i]));
  const known = items
    .filter((i) => pos.has(i.id))
    .sort((a, b) => pos.get(a.id)! - pos.get(b.id)!);
  const fresh = items.filter((i) => !pos.has(i.id));
  return [...known, ...fresh];
}

function SortableCard({ item }: { item: ContentItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'opacity-80 shadow-2xl' : ''}`}
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        type="button"
        aria-label={`Reorder ${item.title}. Press space to pick up, arrow keys to move.`}
        className="absolute left-1/2 top-3 z-10 -translate-x-1/2 cursor-grab touch-none rounded-full bg-surface/90 px-2.5 py-1 text-muted backdrop-blur transition hover:text-text focus:outline-none focus:ring-2 focus:ring-brand/40 active:cursor-grabbing"
      >
        <GripHorizontal size={16} aria-hidden="true" />
      </button>
      <ContentCard item={item} />
    </li>
  );
}

export default function SortableFeed({ items }: { items: ContentItem[] }) {
  const dispatch = useAppDispatch();
  const order = useAppSelector((s) => s.feed.order);

  const ordered = useMemo(() => applyOrder(items, order), [items, order]);
  const ids = useMemo(() => ordered.map((i) => i.id), [ordered]);

  const sensors = useSensors(
    // small distance so a plain click on a button isn't treated as a drag
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    dispatch(setOrder(arrayMove(ids, from, to)));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ordered.map((item) => (
            <SortableCard key={item.id} item={item} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}