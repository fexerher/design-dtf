import { nextTick } from 'vue';
import type { Ref } from 'vue';

export function useKonvaBindings(
  stageRef: Ref<any>,
  layerRef: Ref<any>,
  trRef: Ref<any>
) {
  function getNodeRectById(id: string) {
    const stage = stageRef.value?.getNode();
    const node = stage?.findOne(`#${id}`);
    if (!node) return null;
    const r = node.getClientRect({ skipShadow: true, skipStroke: false });
    return { x: r.x, y: r.y, w: r.width, h: r.height, node };
  }

  function bindTransformer(selectedId: string | null) {
    const stage = stageRef.value?.getNode();
    const tr = trRef.value?.getNode();
    const layer = layerRef.value?.getNode();
    if (!stage || !tr || !layer) return;

    if (!selectedId) {
      tr.nodes([]);
      layer.batchDraw();
      return;
    }
    const node = stage.findOne(`#${selectedId}`);
    if (!node) {
      requestAnimationFrame(() => bindTransformer(selectedId));
      return;
    }
    tr.nodes([node]);
    tr.moveToTop();
    layer.batchDraw();
  }

  function rebindNextTick(selectedId: string | null) {
    nextTick(() => bindTransformer(selectedId));
  }

  return { getNodeRectById, bindTransformer, rebindNextTick };
}
