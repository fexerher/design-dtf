import { ref, watch } from 'vue';

export function useGrid() {
  const gridShow = ref(true);
  const gridSnap = ref(true);
  const gridSize = ref(20);
  const gridPattern = ref<HTMLCanvasElement | null>(null);

  watch(gridSize, makeGridPattern, { immediate: true })

  function makeGridPattern() {
    const s = Math.max(4, Math.floor(gridSize.value))
    const c = document.createElement('canvas')
    c.width = s
    c.height = s
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, s, s)

    // líneas finas (0.5 para pixel perfect)
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'
    ctx.lineWidth = 1

    // vertical en x=0
    ctx.beginPath()
    ctx.moveTo(0.5, 0)
    ctx.lineTo(0.5, s)
    ctx.stroke()

    // horizontal en y=0
    ctx.beginPath()
    ctx.moveTo(0, 0.5)
    ctx.lineTo(s, 0.5)
    ctx.stroke()

    gridPattern.value = c
  }
  
  function snapNodeToGrid(node: any, boardX: number, boardY: number) {
    if (!gridSnap.value) return;
    const s = Math.max(4, Math.floor(gridSize.value));
    const tx = Math.round((node.x() - boardX) / s) * s + boardX;
    const ty = Math.round((node.y() - boardY) / s) * s + boardY;
    node.x(tx); node.y(ty);
  }

  return { gridShow, gridSnap, gridSize, gridPattern, makeGridPattern, snapNodeToGrid };
}
