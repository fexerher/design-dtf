import type { TextItem, ImageItem, RectItem } from '@/stores/canvas';

export type PText  = Partial<Omit<TextItem,  'type' | 'id'>> & { type: 'text';  id?: string };
export type PImage = Partial<Omit<ImageItem, 'type' | 'id'>> & { type: 'image'; id?: string };
export type PRect  = Partial<Omit<RectItem,  'type' | 'id'>> & { type: 'rect';  id?: string };
export type PItem = PText | PImage | PRect;

export type Preset = {
  canvas?: { width:number; height:number };
  items: PItem[];
};

export function materializePreset(p: Preset) {
  return p.items.map(it => ({
    id: crypto.randomUUID(),
    rotation: 0, scaleX: 1, scaleY: 1,
    visible: true, locked: false, draggable: true,
    ...it,
  }));
}

// algunos presets base (ajusta a gusto)
export function makePresets(boardX:number, boardY:number, boardW:number, boardH:number) {
  return {
    centerText: {
      items: [
        { type: 'text', text: 'NOCTURNE', fontSize: 64, fill: '#fff',
          fontFamily: 'Inter, system-ui, sans-serif',
          x: boardX + boardW/2 - 150, y: boardY + boardH/2 - 32 },
      ],
    },
    badge: {
      items: [
        { type: 'rect', x: boardX + 80, y: boardY + 120, width: boardW - 160, height: 120, cornerRadius: 16, fill: '#141414' },
        { type: 'text', text: 'DTF Designer', x: boardX + boardW/2 - 120, y: boardY + 160, fontSize: 36, fill: '#fff',
          fontFamily: 'Inter, system-ui, sans-serif' },
      ],
    },
  } as Record<string, Preset>;
}
