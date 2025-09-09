<!-- src/views/EditorView.vue (reemplaza tu <template> por este layout) -->
<template>
  <section class="max-w-7xl mx-auto px-4 py-6">
    <!-- Toolbar -->
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" v-model="gridShow" />
        Grid
      </label>

      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" v-model="gridSnap" />
        Snap grid
      </label>

      <input
        type="number"
        min="4"
        step="1"
        class="w-20 bg-transparent border border-white/20 rounded px-2 py-1 text-sm"
        v-model.number="gridSize"
      />
      <span class="text-sm opacity-70">px</span>
      <!-- Presets -->
      <select
        v-model="presetName"
        class="bg-transparent border border-white/20 rounded px-2 py-1 text-sm"
      >
        <option disabled value="">-- Presets --</option>
        <option value="centerText">Texto centrado</option>
        <option value="badge">Badge rectangular</option>
        <option value="imageTopText">Imagen arriba + Texto</option>
      </select>
      <button class="btn" @click="applyPreset" :disabled="!presetName">Aplicar</button>

      <span class="mx-2 opacity-50">|</span>

      <!-- Export / Import -->
      <button class="btn" @click="exportJSON">Export JSON</button>
      <button class="btn" @click="openImport">Import JSON</button>
      <input
        ref="importFile"
        type="file"
        accept="application/json"
        class="hidden"
        @change="onFileImportChange"
      />

      <button class="btn" @click="addText">+ Texto</button>
      <label class="btn cursor-pointer">
        <input
          ref="fileInput"
          type="file"
          accept="image/*,image/svg+xml"
          class="hidden"
          @change="onPickImage"
        />
        + Imagen
      </label>
      <button class="btn" @click="removeSelected" :disabled="!store.selectedId">Eliminar</button>
      <span class="mx-2 opacity-50">|</span>
      <button class="btn" @click="store.undo">Undo</button>
      <button class="btn" @click="store.redo">Redo</button>
      <span class="mx-2 opacity-50">|</span>
      <button class="btn" @click="bringToFront" :disabled="!store.selectedId">Al frente</button>
      <button class="btn" @click="sendToBack" :disabled="!store.selectedId">Al fondo</button>
      <span class="mx-2 opacity-50">|</span>
      <button class="btn-primary" @click="exportPNG">Exportar PNG</button>
    </div>

    <!-- dentro del <section> principal -->
    <div class="grid gap-4 lg:grid-cols-[280px_1fr_320px] md:grid-cols-[280px_1fr]">
      <!-- Panel de capas -->
      <LayersPanel />

      <!-- Lienzo -->
      <div
        ref="containerRef"
        class="relative border border-white/10 rounded-xl bg-[url('data:image/svg+xml;utf8,<?xml version=%221.0%22?><svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22><rect width=%2210%22 height=%2210%22 fill=%22%23222222%22/><rect x=%2210%22 width=%2210%22 height=%2210%22 fill=%22%23282828%22/><rect y=%2210%22 width=%2210%22 height=%2210%22 fill=%22%23282828%22/><rect x=%2210%22 y=%2210%22 width=%2210%22 height=%2210%22 fill=%22%23222222%22/></svg>')] p-3"
      >
        <v-stage
          ref="stageRef"
          :config="{ width: stageW, height: stageH }"
          @mousedown="onStagePointer"
          @touchstart="onStagePointer"
        >
          <v-layer ref="layerRef">
            <!-- Artboard guía suave -->
            <v-rect
              :config="{
                x: boardX,
                y: boardY,
                width: boardW,
                height: boardH,
                cornerRadius: 12,
                fill: '#ffffff',
                opacity: 0.02,
                stroke: '#ffffff22',
                strokeWidth: 1,
              }"
            />
            <!-- Grid sobre el artboard -->
            <v-rect
              v-if="gridShow && gridPattern"
              :config="{
                x: boardX,
                y: boardY,
                width: boardW,
                height: boardH,
                fillPatternImage: gridPattern,
                fillPatternRepeat: 'repeat',
                listening: false,
                opacity: 0.9,
              }"
            />

            <!-- Items -->
            <template v-for="item in store.items" :key="item.id">
              <v-text
                v-if="item.type === 'text'"
                :config="{
                  id: item.id,
                  text: item.text,
                  x: item.x,
                  y: item.y,
                  rotation: item.rotation,
                  scaleX: item.scaleX,
                  scaleY: item.scaleY,
                  fontSize: item.fontSize,
                  fontFamily: item.fontFamily,
                  fill: item.fill,
                  draggable: !item.locked,
                  visible: item.visible,
                  listening: !item.locked,
                  opacity: item.opacity ?? 1,
                }"
                @click="select(item.id)"
                @dblclick="onTextDblClick(item, $event)"
                @dbltap="onTextDblClick(item, $event)"
                @dragmove="onDragMove(item.id, $event)"
                @dragend="onDragEnd(item.id, $event)"
                @transform="onTransform(item.id, $event)"
                @transformend="onTransformEnd(item.id, $event)"
                @tap="select(item.id)"
              />
              <v-image
                v-else-if="item.type === 'image'"
                :config="{
                  id: item.id,
                  image: imageMap[item.id] || undefined,
                  x: item.x,
                  y: item.y,
                  rotation: item.rotation,
                  scaleX: item.scaleX,
                  scaleY: item.scaleY,
                  width: item.width,            <!-- 👈 -->
                  height: item.height,          <!-- 👈 -->
                  draggable: !item.locked,
                  visible: item.visible,
                  listening: !item.locked,
                  opacity: item.opacity ?? 1,
                }"
                @click="select(item.id)"
                @dragmove="onDragMove(item.id, $event)"
                @dragend="onDragEnd(item.id, $event)"
                @transform="onTransform(item.id, $event)"
                @transformend="onTransformEnd(item.id, $event)"
                @tap="select(item.id)"
              />
              <v-rect
                v-else
                :config="{
                  id: item.id,
                  x: item.x,
                  y: item.y,
                  width: item.width,
                  height: item.height,
                  rotation: item.rotation,
                  scaleX: item.scaleX,
                  scaleY: item.scaleY,
                  fill: item.fill,
                  cornerRadius: item.cornerRadius,
                  draggable: !item.locked,
                  visible: item.visible,
                  listening: !item.locked,
                  opacity: item.opacity ?? 1,
                }"
                @click="select(item.id)"
                @dragmove="onDragMove(item.id, $event)"
                @dragend="onDragEnd(item.id, $event)"
                @transform="onTransform(item.id, $event)"
                @transformend="onTransformEnd(item.id, $event)"
                @tap="select(item.id)"
              />
            </template>

            <v-transformer ref="trRef" :config="{ rotateEnabled: true }" />
          </v-layer>

          <!-- ⭐ Capa de guías -->
          <v-layer ref="guidesLayerRef">
            <template v-for="(g, i) in guides" :key="i">
              <v-line
                v-if="g.o === 'V'"
                :config="{
                  points: [g.pos, 0, g.pos, stageH],
                  stroke: '#2ee7ff',
                  strokeWidth: 1,
                  dash: [4, 4],
                  opacity: 0.9,
                }"
              />
              <v-line
                v-else
                :config="{
                  points: [0, g.pos, stageW, g.pos],
                  stroke: '#2ee7ff',
                  strokeWidth: 1,
                  dash: [4, 4],
                  opacity: 0.9,
                }"
              />
            </template>
          </v-layer>
        </v-stage>
        <!-- Modal Import -->
        <div v-if="importOpen" class="fixed inset-0 z-50 grid place-items-center bg-black/60">
          <div class="w-[90vw] max-w-xl bg-neutral-900 border border-white/15 rounded-xl p-4">
            <h3 class="text-lg font-semibold mb-2">Importar diseño (JSON)</h3>
            <p class="text-sm opacity-70 mb-3">Pega tu JSON o selecciona un archivo.</p>
            <textarea
              v-model="importText"
              rows="10"
              class="w-full bg-transparent border border-white/20 rounded p-2 text-sm mb-3"
            ></textarea>
            <div class="flex items-center gap-2">
              <button class="btn" @click="triggerFile">Elegir archivo…</button>
              <div class="flex-1"></div>
              <button class="btn" @click="closeImport">Cancelar</button>
              <button class="btn-primary" @click="applyImport">Importar</button>
            </div>
          </div>
        </div>

        <!-- textarea de edición inline (igual que antes) -->
        <textarea
          v-if="editing"
          ref="editRef"
          v-model="editing.value"
          :style="editing.style"
          class="fixed z-50 bg-transparent text-white outline-none border border-white/30 rounded px-1"
          @keydown.enter.prevent="onEditEnter"
          @keydown.esc.prevent="cancelEdit"
          @blur="commitEdit"
        />
      </div>

      <!-- Panel de propiedades (derecha en desktop) -->
      <PropertiesPanel class="hidden md:block" />
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  onMounted,
  onBeforeUnmount,
  reactive,
  ref,
  watch,
  nextTick,
  type CSSProperties,
  computed,
} from 'vue'
import LayersPanel from '@/components/LayersPanel.vue'
import { useCanvasStore, type TextItem } from '@/stores/canvas'
import PropertiesPanel from '@/components/PropertiesPanel.vue'

import type { Stage as KonvaStage } from 'konva/lib/Stage'
import type { Transformer as KonvaTransformer } from 'konva/lib/shapes/Transformer'
import type { Text as KonvaText } from 'konva/lib/shapes/Text'

const store = useCanvasStore()

const containerRef = ref<HTMLDivElement | null>(null)
const stageRef = ref<any>(null)
const layerRef = ref<any>(null)
const trRef = ref<any>(null)
const fileInput = ref<HTMLInputElement | null>(null)
// refs y medidas existentes...
const guidesLayerRef = ref<any>(null)

// ---- Presets ----
const presetName = ref<string>('')

const stageW = ref(900)
const stageH = ref(600)
const boardW = 700
const boardH = 500
// Posición del artboard (centrado dentro del stage)
const boardX = computed(() => (stageW.value - boardW) / 2)
const boardY = computed(() => (stageH.value - boardH) / 2)

// === GRID ===
const gridShow = ref(true)
const gridSnap = ref(true)
const gridSize = ref(20)
const gridPattern = ref<HTMLCanvasElement | null>(null)

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

type PItem = Partial<TextItem> & { id?: string; type: 'text' | 'rect' | 'image' } & Record<
    string,
    any
  >
type Preset = { canvas?: { width: number; height: number }; items: PItem[] }

const presets: Record<string, Preset> = {
  centerText: {
    items: [
      {
        type: 'text',
        text: 'NOCTURNE',
        fontSize: 64,
        fill: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif',
        x: boardX.value + boardW / 2 - 150,
        y: boardY.value + boardH / 2 - 32,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        locked: false,
        draggable: true,
      },
    ],
  },
  badge: {
    items: [
      {
        type: 'rect',
        x: boardX.value + 80,
        y: boardY.value + 120,
        width: boardW - 160,
        height: 120,
        cornerRadius: 16,
        fill: '#141414',
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        locked: false,
        draggable: true,
      },
      {
        type: 'text',
        text: 'DTF Designer',
        x: boardX.value + boardW / 2 - 120,
        y: boardY.value + 160,
        fontSize: 36,
        fill: '#fff',
        fontFamily: 'Inter, system-ui, sans-serif',
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        locked: false,
        draggable: true,
      },
    ],
  },
  imageTopText: {
    items: [
      {
        type: 'image',
        src: '',
        x: boardX.value + boardW / 2 - 150,
        y: boardY.value + 40,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        locked: false,
        draggable: true,
      },
      {
        type: 'text',
        text: 'Doble click para editar',
        x: boardX.value + boardW / 2 - 160,
        y: boardY.value + 260,
        fontSize: 28,
        fill: '#fff',
        fontFamily: 'Inter, system-ui, sans-serif',
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        visible: true,
        locked: false,
        draggable: true,
      },
    ],
  },
}

function materializePreset(p: Preset): any[] {
  // Asigna IDs y defaults mínimos
  return p.items.map((it) => ({
    id: crypto.randomUUID(),
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    visible: true,
    locked: false,
    draggable: true,
    ...it,
  }))
}

function applyPreset() {
  const p = presetName.value && presets[presetName.value]
  if (!p) return
  const items = materializePreset(p)
  store.replace(items, p.canvas)
  // rehidratar imágenes si las hay
  items.forEach((it) => {
    if (it.type === 'image' && it.src) loadImageFor(it.id, it.src)
  })
  presetName.value = ''
}

// ---- Export / Import ----
function exportJSON() {
  const data = {
    canvas: store.canvas,
    items: JSON.parse(JSON.stringify(store.items)), // plano
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'design.json'
  a.click()
  URL.revokeObjectURL(a.href)
}

const importOpen = ref(false)
const importText = ref('')
const importFile = ref<HTMLInputElement | null>(null)

function openImport() {
  importOpen.value = true
  importText.value = ''
}
function closeImport() {
  importOpen.value = false
  importText.value = ''
}
function triggerFile() {
  importFile.value?.click()
}

function onFileImportChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  const reader = new FileReader()
  reader.onload = () => {
    importText.value = String(reader.result || '')
  }
  reader.readAsText(f, 'utf-8')
}

function applyImport() {
  try {
    const data = JSON.parse(importText.value || '{}')
    if (!Array.isArray(data.items)) throw new Error('JSON inválido: falta "items"')
    const items = data.items.map((it: any) => ({
      id: crypto.randomUUID(),
      visible: it.visible ?? true,
      locked: it.locked ?? false,
      draggable: it.locked ? false : (it.draggable ?? true),
      ...it,
    }))
    store.replace(items, data.canvas)
    // rehidratar imágenes
    items.forEach((it: any) => {
      if (it.type === 'image' && it.src) loadImageFor(it.id, it.src)
    })
    closeImport()
  } catch (e) {
    alert('No se pudo importar: ' + (e as Error).message)
  }
}

// ========== Guías ==========
type Guide = { o: 'V' | 'H'; pos: number } // orientación y posición
const guides = reactive<Guide[]>([])
const SNAP = 6 // umbral de snap en px

function clearGuides() {
  guides.splice(0, guides.length)
}
function pushGuide(g: Guide) {
  guides.push(g)
}

// Stops = posiciones candidatas para alinear
function getLineGuideStops(excludeId?: string) {
  const sx: number[] = []
  const sy: number[] = []

  // Artboard: bordes, centro y tercios
  const x = boardX.value,
    y = boardY.value,
    w = boardW,
    h = boardH
  const thirdsX = [x + w / 3, x + (2 * w) / 3]
  const thirdsY = [y + h / 3, y + (2 * h) / 3]

  sx.push(x, x + w, x + w / 2, ...thirdsX)
  sy.push(y, y + h, y + h / 2, ...thirdsY)

  // Otros items visibles: bordes y centro
  for (const it of store.items) {
    if (!it.visible || it.id === excludeId) continue
    const r = getNodeRectById(it.id)
    if (!r) continue
    sx.push(r.x, r.x + r.w, r.x + r.w / 2)
    sy.push(r.y, r.y + r.h, r.y + r.h / 2)
  }
  return { sx, sy }
}

/** Bounding box del item (usa client rect de Konva) */
function getNodeRectById(id: string) {
  const stage = stageRef.value?.getNode()
  const node = stage?.findOne(`#${id}`)
  if (!node) return null
  const r = node.getClientRect({ skipShadow: true, skipStroke: false })
  return { x: r.x, y: r.y, w: r.width, h: r.height, node }
}
function getItemRect(it: any) {
  // aproximación con sus props (mejor usar getClientRect si está en escena)
  const nr = getNodeRectById(it.id)
  if (nr) return { x: nr.x, y: nr.y, w: nr.w, h: nr.h }
  return {
    x: it.x,
    y: it.y,
    w: (it.width ?? 100) * it.scaleX,
    h: (it.height ?? it.fontSize ?? 40) * it.scaleY,
  }
}

// Evaluamos los snaps comparando bordes y centros del nodo con stops
function getSnapOffsets(id: string) {
  const r = getNodeRectById(id)
  if (!r) return { dx: 0, dy: 0, v: null as number | null, h: null as number | null }

  const { sx, sy } = getLineGuideStops(id)

  // Candidatos del nodo: bordes y centro
  const candX = [
    { kind: 'left', val: r.x },
    { kind: 'center', val: r.x + r.w / 2 },
    { kind: 'right', val: r.x + r.w },
  ]
  const candY = [
    { kind: 'top', val: r.y },
    { kind: 'middle', val: r.y + r.h / 2 },
    { kind: 'bottom', val: r.y + r.h },
  ]

  let bestV: { stop: number; diff: number; kind: string } | null = null
  let bestH: { stop: number; diff: number; kind: string } | null = null

  for (const c of candX) {
    for (const stop of sx) {
      const d = Math.abs(stop - c.val)
      if (d <= SNAP && (!bestV || d < bestV.diff)) {
        bestV = { stop, diff: d, kind: c.kind }
      }
    }
  }
  for (const c of candY) {
    for (const stop of sy) {
      const d = Math.abs(stop - c.val)
      if (d <= SNAP && (!bestH || d < bestH.diff)) {
        bestH = { stop, diff: d, kind: c.kind }
      }
    }
  }

  // Calculamos el delta para mover el nodo completo
  let dx = 0,
    dy = 0
  if (bestV) {
    const current =
      bestV.kind === 'left' ? r.x : bestV.kind === 'center' ? r.x + r.w / 2 : /* right */ r.x + r.w
    dx = bestV.stop - current
  }
  if (bestH) {
    const current =
      bestH.kind === 'top' ? r.y : bestH.kind === 'middle' ? r.y + r.h / 2 : /* bottom */ r.y + r.h
    dy = bestH.stop - current
  }

  return { dx, dy, v: bestV?.stop ?? null, h: bestH?.stop ?? null }
}

/** Aplicar snapping durante drag/transform (suave) */
function applySnap(id: string) {
  clearGuides()
  const s = getSnapOffsets(id)
  const stage = stageRef.value?.getNode()
  const n = stage?.findOne(`#${id}`)
  if (!n) return

  if (s.v !== null) pushGuide({ o: 'V', pos: s.v })
  if (s.h !== null) pushGuide({ o: 'H', pos: s.h })

  if (s.dx || s.dy) {
    n.x(n.x() + s.dx)
    n.y(n.y() + s.dy)
  }
}
const imageMap = reactive<Record<string, HTMLImageElement | null>>({})

// ========= Persistencia inicial =========
onMounted(() => {
  store.init() // carga desde localStorage si existe

  // responsive
  const el = containerRef.value
  if (el) {
    const pad = 24
    const updateSize = () => {
      const w = Math.max(320, el.clientWidth - pad * 2)
      stageW.value = w
      stageH.value = Math.round((w * 2) / 3)
    }
    const ro = new ResizeObserver(updateSize)
    ro.observe(el)
    updateSize()
  }

  // rehidratar imágenes almacenadas
  store.items.forEach((it) => {
    if (it.type === 'image') loadImageFor(it.id, (it as any).src)
  })
})

// si se añaden imágenes luego (p. ej. al cargar storage en caliente)
watch(
  () => store.items.map((i) => i.id + (i as any).src).join('|'),
  () => {
    store.items.forEach((it) => {
      if (it.type === 'image' && !imageMap[it.id]) loadImageFor(it.id, (it as any).src)
    })
  },
)

// ========= Edición inline =========
type EditingState = { id: string; value: string; style: CSSProperties }
const editing = ref<EditingState | null>(null)
const editRef = ref<HTMLTextAreaElement | null>(null)

function onTextDblClick(item: TextItem, e: any) {
  if (item.locked) return

  const stage = stageRef.value?.getNode() as KonvaStage
  const textNode = e.target as KonvaText
  const abs = textNode.getAbsolutePosition()
  const rect = stage.container().getBoundingClientRect()

  editing.value = {
    id: item.id,
    value: item.text,
    style: {
      left: `${rect.left + abs.x}px`,
      top: `${rect.top + abs.y}px`,
      width: `${Math.max(150, textNode.width() * textNode.scaleX())}px`,
      position: 'fixed',
      fontSize: `${item.fontSize}px`,
      fontFamily: item.fontFamily,
      lineHeight: '1.2',
      color: item.fill,
      padding: '0px',
      margin: '0px',
      background: 'transparent',
    },
  }

  // Ocultar transformer durante edición
  const tr = trRef.value?.getNode() as KonvaTransformer | undefined
  if (tr) tr.nodes([])

  nextTick(() => {
    editRef.value?.focus()
    editRef.value?.select()
  })
}

function onEditEnter(ev: KeyboardEvent) {
  // Enter confirma, Shift+Enter permite salto de línea
  if (ev.shiftKey) return
  commitEdit()
}

function commitEdit() {
  if (!editing.value) return
  store.updateItem(editing.value.id, { text: editing.value.value })
  editing.value = null
}

function cancelEdit() {
  editing.value = null
}

// ========= Resto (igual que ya tenías) =========
function loadImageFor(id: string, src: string) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    imageMap[id] = img
  }
  img.onerror = () => {
    console.warn('No se pudo cargar imagen')
  }
  img.src = src
}

function addText() {
  store.addItem({
    id: crypto.randomUUID(),
    type: 'text',
    text: 'Doble click para editar',
    x: (stageW.value - 200) / 2,
    y: (stageH.value - 40) / 2,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    draggable: true,
    visible: true,
    locked: false,
    fill: '#ffffff',
    fontSize: 28,
    fontFamily: 'Inter, system-ui, sans-serif',
  })
}

async function onPickImage(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || !files[0]) return
  const file = files[0]
  const dataUrl = await fileToDataURL(file)
  const id = crypto.randomUUID()
  store.addItem({
    id,
    type: 'image',
    src: dataUrl,
    x: (stageW.value - 300) / 2,
    y: (stageH.value - 300) / 2,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    draggable: true,
    visible: true,
    locked: false,
  })
  loadImageFor(id, dataUrl)
  if (fileInput.value) fileInput.value.value = ''
}

function removeSelected() {
  if (store.selectedId) store.remove(store.selectedId)
}
function bringToFront() {
  if (store.selectedId) store.bringToFront(store.selectedId)
}
function sendToBack() {
  if (store.selectedId) store.sendToBack(store.selectedId)
}

function select(id: string) {
  const it = store.items.find((i) => i.id === id)
  if (it?.locked) return
  store.select(id)
}

function onStagePointer(e: any) {
  if (e.target === stageRef.value?.getNode()) store.select(null)
}

function onDragMove(id: string, e: any) {
  if (store.items.find((i) => i.id === id)?.locked) return
  applySnap(id)
}

function onDragEnd(id: string, e: any) {
  clearGuides()
  const node = e.target
  snapNodeToGrid(node) // 👈
  store.updateItem(id, { x: node.x(), y: node.y() })
}

function onTransformEnd(id: string, e: any) {
  clearGuides()
  const node = e.target
  snapNodeToGrid(node) // 👈
  store.updateItem(id, {
    x: node.x(),
    y: node.y(),
    rotation: node.rotation(),
    scaleX: node.scaleX(),
    scaleY: node.scaleY(),
  })
}

function exportPNG() {
  const stage = stageRef.value?.getNode() as KonvaStage | undefined
  if (!stage) return
  const uri = stage.toDataURL({ mimeType: 'image/png', pixelRatio: 2 })
  const a = document.createElement('a')
  a.href = uri
  a.download = 'design.png'
  a.click()
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onerror = () => reject(new Error('read error'))
    r.onload = () => resolve(r.result as string)
    r.readAsDataURL(file)
  })
}

function snapNodeToGrid(node: any) {
  if (!gridSnap.value) return
  const s = Math.max(4, Math.floor(gridSize.value))
  const tx = Math.round((node.x() - boardX.value) / s) * s + boardX.value
  const ty = Math.round((node.y() - boardY.value) / s) * s + boardY.value
  node.x(tx)
  node.y(ty)
}
</script>
