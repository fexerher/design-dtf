import { reactive } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import type { useCanvasStore } from '@/stores/canvas';

type Guide = { o:'V'|'H'; pos:number };

export function useSnap(
  stageRef: Ref<any>,
  store: ReturnType<typeof useCanvasStore>,
  boardX: ComputedRef<number>,
  boardY: ComputedRef<number>,
  boardW: number,
  boardH: number,
) {
  const guides = reactive<Guide[]>([]);
  const SNAP = 6;

  function clearGuides(){ guides.splice(0, guides.length); }
  function pushGuide(g: Guide){ guides.push(g); }

  function getNodeRectById(id: string){
    const stage = stageRef.value?.getNode();
    const node = stage?.findOne(`#${id}`);
    if (!node) return null;
    const r = node.getClientRect({ skipShadow: true, skipStroke: false });
    return { x: r.x, y: r.y, w: r.width, h: r.height, node };
  }

  function getStops(excludeId?: string){
    const sx:number[] = [], sy:number[] = [];
    const x = boardX.value, y = boardY.value, w = boardW, h = boardH;
    sx.push(x, x+w, x+w/2, x+w/3, x+2*w/3);
    sy.push(y, y+h, y+h/2, y+h/3, y+2*h/3);

    for (const it of store.items) {
      if (!it.visible || it.id === excludeId) continue;
      const stage = stageRef.value?.getNode();
      const node = stage?.findOne(`#${it.id}`);
      if (!node) continue;
      const r = node.getClientRect({ skipShadow: true, skipStroke: false });
      sx.push(r.x, r.x + r.width, r.x + r.width/2);
      sy.push(r.y, r.y + r.height, r.y + r.height/2);
    }
    return { sx, sy };
  }

  function getSnapOffsets(id: string){
    const r = getNodeRectById(id);
    if (!r) return { dx:0, dy:0, v:null as number|null, h:null as number|null };

    const { sx, sy } = getStops(id);
    const candX = [{k:'left',v:r.x},{k:'center',v:r.x+r.w/2},{k:'right',v:r.x+r.w}];
    const candY = [{k:'top',v:r.y},{k:'middle',v:r.y+r.h/2},{k:'bottom',v:r.y+r.h}];

    let bestV: {stop:number; diff:number; k:string}|null = null;
    let bestH: {stop:number; diff:number; k:string}|null = null;

    for (const c of candX) for (const stop of sx) {
      const d = Math.abs(stop - c.v);
      if (d <= SNAP && (!bestV || d < bestV.diff)) bestV = { stop, diff:d, k:c.k };
    }
    for (const c of candY) for (const stop of sy) {
      const d = Math.abs(stop - c.v);
      if (d <= SNAP && (!bestH || d < bestH.diff)) bestH = { stop, diff:d, k:c.k };
    }

    let dx=0, dy=0;
    if (bestV) {
      const cur = bestV.k==='left'?r.x:bestV.k==='center'?r.x+r.w/2:r.x+r.w;
      dx = bestV.stop - cur;
    }
    if (bestH) {
      const cur = bestH.k==='top'?r.y:bestH.k==='middle'?r.y+r.h/2:r.y+r.h;
      dy = bestH.stop - cur;
    }

    return { dx, dy, v: bestV?.stop ?? null, h: bestH?.stop ?? null };
  }

  function applySnap(id: string){
    clearGuides();
    const s = getSnapOffsets(id);
    const stage = stageRef.value?.getNode();
    const n = stage?.findOne(`#${id}`);
    if (!n) return;

    if (s.v !== null) pushGuide({o:'V', pos:s.v});
    if (s.h !== null) pushGuide({o:'H', pos:s.h});

    if (s.dx || s.dy) { n.x(n.x()+s.dx); n.y(n.y()+s.dy); }
  }

  return { guides, clearGuides, applySnap };
}
