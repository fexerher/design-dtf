import { onMounted, onBeforeUnmount } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import type { CanvasItem } from '@/stores/canvas';
import type { useCanvasStore } from '@/stores/canvas';

export function useKeyboard(
  store: ReturnType<typeof useCanvasStore>,
  editing: Ref<any>,
  boardX: ComputedRef<number>,
  boardY: ComputedRef<number>,
  boardW: number,
  boardH: number,
  getNodeRectById: (id: string)=>{x:number;y:number;w:number;h:number}|null
) {
  function clampToBoard(id: string, x: number, y: number) {
    const rect = getNodeRectById(id);
    const w = rect?.w ?? 0, h = rect?.h ?? 0;
    const minX = boardX.value, minY = boardY.value;
    const maxX = boardX.value + boardW - w, maxY = boardY.value + boardH - h;
    return { x: Math.round(Math.min(Math.max(x, minX), maxX)),
             y: Math.round(Math.min(Math.max(y, minY), maxY)) };
  }

  function duplicateItem(it: CanvasItem) {
    const copy: CanvasItem = {
      ...JSON.parse(JSON.stringify(it)),
      id: crypto.randomUUID(),
      x: it.x + 16, y: it.y + 16,
      name: (it.name ?? `${it.type}`) + ' (copy)',
      locked: false, draggable: true, visible: true,
    } as CanvasItem;
    const items = [...store.items, copy];
    store.replace(items);
    store.select(copy.id);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (editing.value) return;
    const id = store.selectedId;
    const it = id ? store.items.find(i => i.id === id) : null;
    const step = e.shiftKey ? 10 : 1;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
      if (it && !it.locked) { e.preventDefault(); duplicateItem(it); }
      return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (id) { e.preventDefault(); store.remove(id); }
      return;
    }
    if (e.key === 'Escape') {
      store.select(null);
      return;
    }
    if (!it || it.locked) return;

    let dx=0, dy=0;
    if (e.key === 'ArrowLeft') dx = -step;
    if (e.key === 'ArrowRight') dx = step;
    if (e.key === 'ArrowUp') dy = -step;
    if (e.key === 'ArrowDown') dy = step;

    if (dx || dy) {
      e.preventDefault();
      const next = clampToBoard(it.id, it.x + dx, it.y + dy);
      store.updateItem(it.id, next);
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown));
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown));
}
