import { defineStore } from 'pinia';
import { toRaw } from 'vue';

export type ItemType = 'text' | 'image' | 'rect';

export interface BaseItem {
  id: string;
  type: ItemType; // discriminante
  name?: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;   // para texto lo usamos temporalmente y lo reseteamos en transformEnd
  scaleY: number;
  draggable: boolean;
  opacity?: number;
  visible: boolean;
  locked: boolean;
}

export interface TextItem extends BaseItem {
  type: 'text';
  text: string;
  fill: string;
  fontSize: number;
  fontFamily: string;
}

export interface ImageItem extends BaseItem {
  type: 'image';
  src: string;
  // 👇 ahora requeridos (absorbemos escala aquí)
  width: number;
  height: number;
}

export interface RectItem extends BaseItem {
  type: 'rect';
  width: number;
  height: number;
  fill: string;
  cornerRadius: number;
}

export type CanvasItem = TextItem | ImageItem | RectItem;

// Parches por tipo (evita el problema de Partial<Union>)
export type ItemPatch =
  | Partial<TextItem>
  | Partial<ImageItem>
  | Partial<RectItem>;

const STORAGE_KEY = 'dtf_designer_v1';

function cloneItems<T>(arr: T[]): T[] {
  return JSON.parse(JSON.stringify(arr.map((it: any) => toRaw(it))));
}

export const useCanvasStore = defineStore('canvas', {
  state: () => ({
    items: [] as CanvasItem[],
    selectedId: null as string | null,
    canvas: { width: 900, height: 600 },
    history: [] as CanvasItem[][],
    future: [] as CanvasItem[][],
    loaded: false,
  }),
  actions: {
    // ---------- Persistencia ----------
    saveToStorage() {
      const data = { items: cloneItems(this.items), canvas: { ...this.canvas } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },
    loadFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        const items: CanvasItem[] = (data.items || []).map((it: any) => ({
          visible: it.visible ?? true,
          locked: it.locked ?? false,
          draggable: it.locked ? false : (it.draggable ?? true),
          name: it.name,
          ...it,
        }));
        this.items = items;
        if (data.canvas) this.canvas = data.canvas;
      } finally {
        this.loaded = true;
      }
    },
    clearStorage() {
      localStorage.removeItem(STORAGE_KEY);
    },
    init() {
      if (!this.loaded) this.loadFromStorage();
    },

    // ---------- Helpers ----------
    _pushHistory() {
      this.history.push(cloneItems(this.items));
      this.future = [];
    },
    _autoName(item: CanvasItem) {
      const idx = this.items.filter(i => i.type === item.type).length + 1;
      const map = { text: 'Texto', image: 'Imagen', rect: 'Rect' } as const;
      return `${map[item.type]} ${idx}`;
    },

    // ---------- Acciones ----------
    select(id: string | null) { this.selectedId = id; },

    addItem(item: CanvasItem) {
      item.visible ??= true;
      item.locked ??= false;
      item.draggable = !item.locked;
      item.name ??= this._autoName(item);
      this._pushHistory();
      this.items.push(item);
      this.selectedId = item.id;
      this.saveToStorage();
    },

    // 👇 firma que acepta parches por tipo
    updateItem(id: string, patch: ItemPatch) {
      const i = this.items.findIndex(it => it.id === id);
      if (i === -1) return;
      this._pushHistory();
      const next = { ...this.items[i], ...patch } as CanvasItem;
      next.draggable = !next.locked;
      this.items[i] = next;
      this.saveToStorage();
    },

    remove(id: string) {
      const i = this.items.findIndex(it => it.id === id);
      if (i === -1) return;
      this._pushHistory();
      this.items.splice(i, 1);
      if (this.selectedId === id) this.selectedId = null;
      this.saveToStorage();
    },

    bringToFront(id: string) {
      const i = this.items.findIndex(it => it.id === id);
      if (i === -1) return;
      this._pushHistory();
      const [el] = this.items.splice(i, 1);
      this.items.push(el);
      this.saveToStorage();
    },

    sendToBack(id: string) {
      const i = this.items.findIndex(it => it.id === id);
      if (i === -1) return;
      this._pushHistory();
      const [el] = this.items.splice(i, 1);
      this.items.unshift(el);
      this.saveToStorage();
    },

    toggleVisible(id: string) {
      const it = this.items.find(i => i.id === id);
      if (!it) return;
      this._pushHistory();
      it.visible = !it.visible;
      this.saveToStorage();
    },

    toggleLocked(id: string) {
      const it = this.items.find(i => i.id === id);
      if (!it) return;
      this._pushHistory();
      it.locked = !it.locked;
      it.draggable = !it.locked;
      if (this.selectedId === id && it.locked) this.selectedId = null;
      this.saveToStorage();
    },

    rename(id: string, name: string) {
      const it = this.items.find(i => i.id === id);
      if (!it) return;
      this._pushHistory();
      it.name = name;
      this.saveToStorage();
    },

    reorder(newOrder: CanvasItem[]) {
      this._pushHistory();
      this.items = cloneItems(newOrder);
      this.saveToStorage();
    },

    undo() {
      const prev = this.history.pop();
      if (!prev) return;
      this.future.push(cloneItems(this.items));
      this.items = prev;
      this.saveToStorage();
    },

    redo() {
      const next = this.future.pop();
      if (!next) return;
      this.history.push(cloneItems(this.items));
      this.items = next;
      this.saveToStorage();
    },

    replace(items: CanvasItem[], canvas?: { width: number; height: number }) {
      this._pushHistory();
      this.items = items.map((it: any) => ({
        visible: it.visible ?? true,
        locked: it.locked ?? false,
        draggable: it.locked ? false : (it.draggable ?? true),
        name: it.name ?? this._autoName(it),
        ...it,
      })) as CanvasItem[];
      this.selectedId = null;
      if (canvas?.width && canvas?.height) this.canvas = { ...canvas };
      this.saveToStorage();
    },
  },
});

// (Opcional) type guards útiles en componentes
export const isText = (it: CanvasItem): it is TextItem => it.type === 'text';
export const isImage = (it: CanvasItem): it is ImageItem => it.type === 'image';
export const isRect  = (it: CanvasItem): it is RectItem  => it.type === 'rect';
