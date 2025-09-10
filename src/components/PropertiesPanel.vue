<template>
  <aside class="w-full max-w-[320px] border border-white/10 rounded-xl p-3 bg-white/5">
    <header class="px-1 pb-2 text-sm opacity-80">Propiedades</header>

    <div v-if="sel" class="space-y-3">
      <div class="text-xs opacity-70">
        ID: <span class="opacity-90">{{ sel.id }}</span>
      </div>

      <!-- Posición / Rotación -->
      <div class="grid grid-cols-3 gap-2">
        <div>
          <label class="block text-xs opacity-70 mb-1">X</label>
          <input
            type="number"
            class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-sm"
            :value="round(sel.x)"
            @change="num($event, 'x')"
          />
        </div>
        <div>
          <label class="block text-xs opacity-70 mb-1">Y</label>
          <input
            type="number"
            class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-sm"
            :value="round(sel.y)"
            @change="num($event, 'y')"
          />
        </div>
        <div>
          <label class="block text-xs opacity-70 mb-1">Rot</label>
          <input
            type="number"
            class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-sm"
            :value="round(sel.rotation)"
            @change="num($event, 'rotation')"
          />
        </div>
      </div>

      <!-- Escala -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-xs opacity-70 mb-1">Scale X</label>
          <input
            type="number"
            step="0.01"
            class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-sm"
            :value="sel.scaleX"
            @change="num($event, 'scaleX')"
          />
        </div>
        <div>
          <label class="block text-xs opacity-70 mb-1">Scale Y</label>
          <input
            type="number"
            step="0.01"
            class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-sm"
            :value="sel.scaleY"
            @change="num($event, 'scaleY')"
          />
        </div>
      </div>

      <!-- Específicos por tipo -->
      <template v-if="sel.type === 'text'">
        <div>
          <label class="block text-xs opacity-70 mb-1">Texto</label>
          <textarea
            rows="2"
            class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-sm"
            :value="sel.text"
            @change="str($event, 'text')"
          />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs opacity-70 mb-1">Tamaño</label>
            <input
              type="number"
              class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-sm"
              :value="sel.fontSize"
              @change="num($event, 'fontSize')"
            />
          </div>
          <div>
            <label class="block text-xs opacity-70 mb-1">Color</label>
            <input
              type="color"
              class="w-full h-9 bg-transparent border border-white/20 rounded px-1 py-1"
              :value="sel.fill"
              @input="str($event, 'fill')"
            />
          </div>
        </div>
        <div class="mt-2">
          <label class="block text-xs opacity-70 mb-1">Fuente</label>
          <FontPicker :model-value="sel.fontFamily" @update:modelValue="onFontChange" />
        </div>
        <div class="mt-2">
          <label class="block text-xs opacity-70 mb-1">Texto</label>
          <textarea
            rows="2"
            class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-sm"
            :value="sel.text"
            @change="str($event, 'text')"
          />
        </div>
      </template>

      <template v-else-if="sel.type === 'rect'">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs opacity-70 mb-1">Ancho</label>
            <input
              type="number"
              class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-sm"
              :value="sel.width"
              @change="num($event, 'width')"
            />
          </div>
          <div>
            <label class="block text-xs opacity-70 mb-1">Alto</label>
            <input
              type="number"
              class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-sm"
              :value="sel.height"
              @change="num($event, 'height')"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs opacity-70 mb-1">Radio</label>
            <input
              type="number"
              class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-sm"
              :value="sel.cornerRadius"
              @change="num($event, 'cornerRadius')"
            />
          </div>
          <div>
            <label class="block text-xs opacity-70 mb-1">Color</label>
            <input
              type="color"
              class="w-full h-9 bg-transparent border border-white/20 rounded px-1 py-1"
              :value="sel.fill"
              @input="str($event, 'fill')"
            />
          </div>
        </div>
      </template>

      <!-- dentro del template, junto a TEXT/RECT -->
      <template v-else-if="sel.type === 'image'">
        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="block text-xs opacity-70 mb-1">Ancho</label>
            <input
              type="number"
              min="1"
              class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-sm"
              :value="sel.width"
              @change="numImage($event, 'width')"
            />
          </div>
          <div>
            <label class="block text-xs opacity-70 mb-1">Alto</label>
            <input
              type="number"
              min="1"
              class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-sm"
              :value="sel.height"
              @change="numImage($event, 'height')"
            />
          </div>
          <div class="flex items-end">
            <label class="flex items-center gap-2 text-xs">
              <input type="checkbox" v-model="lockAspect" />
              Mantener proporción
            </label>
          </div>
        </div>
      </template>

      <div class="grid grid-cols-2 gap-2">
        <button class="btn" @click="toggleVisible(sel.id)">
          {{ sel.visible ? 'Ocultar' : 'Mostrar' }}
        </button>
        <button class="btn" @click="toggleLocked(sel.id)">
          {{ sel.locked ? 'Desbloquear' : 'Bloquear' }}
        </button>
      </div>
    </div>

    <div v-else class="text-sm opacity-70">Selecciona un elemento para editar.</div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  useCanvasStore,
  type CanvasItem,
  isText,
  isImage,
  isRect,
  type ImageItem,
  type RectItem,
  type TextItem,
} from '@/stores/canvas'
import FontPicker from './FontPicker.vue'

const store = useCanvasStore()

const lockAspect = ref(true)

const sel = computed<CanvasItem | null>(() => {
  const id = store.selectedId
  return id ? (store.items.find((i) => i.id === id) ?? null) : null
})

function round(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}
function num(
  e: Event,
  k:
    | 'x'
    | 'y'
    | 'rotation'
    | 'scaleX'
    | 'scaleY'
    | 'fontSize'
    | 'width'
    | 'height'
    | 'cornerRadius',
) {
  if (!sel.value) return
  const v = Number((e.target as HTMLInputElement).value)
  if (!isFinite(v)) return

  const it = sel.value

  // comunes
  if (k === 'x' || k === 'y' || k === 'rotation' || k === 'scaleX' || k === 'scaleY') {
    store.updateItem(it.id, { [k]: v } as { [key in typeof k]: number })
    return
  }

  if (isText(it) && k === 'fontSize') {
    store.updateItem(it.id, { fontSize: Math.max(1, v) })
    return
  }

  if (isImage(it) && (k === 'width' || k === 'height')) {
    const patch: Partial<ImageItem> = { [k]: Math.max(1, v) } as any
    store.updateItem(it.id, patch)
    return
  }

  if (isRect(it)) {
    if (k === 'width' || k === 'height' || k === 'cornerRadius') {
      const patch: Partial<RectItem> = { [k]: Math.max(0, v) } as any
      store.updateItem(it.id, patch)
    }
  }
}
function str(e: Event, k: 'text' | 'fill') {
  if (!sel.value) return
  const val = (e.target as HTMLInputElement).value

  const it = sel.value
  if (isText(it) && (k === 'text' || k === 'fill')) {
    store.updateItem(it.id, { [k]: val } as Pick<TextItem, typeof k>)
    return
  }
  if (isRect(it) && k === 'fill') {
    store.updateItem(it.id, { fill: val })
  }
}
function toggleVisible(id: string) {
  store.toggleVisible(id)
}
function toggleLocked(id: string) {
  store.toggleLocked(id)
}
function numImage(e: Event, key: 'width' | 'height') {
  if (!sel.value || !isImage(sel.value)) return
  const v = Number((e.target as HTMLInputElement).value)
  if (!isFinite(v) || v <= 0) return

  const curW = sel.value.width || 1
  const curH = sel.value.height || 1

  if (key === 'width') {
    if (lockAspect.value) {
      const ratio = curH / curW
      store.updateItem(sel.value.id, { width: v, height: Math.round(v * ratio) })
    } else {
      store.updateItem(sel.value.id, { width: v })
    }
  } else {
    if (lockAspect.value) {
      const ratio = curW / curH
      store.updateItem(sel.value.id, { height: v, width: Math.round(v * ratio) })
    } else {
      store.updateItem(sel.value.id, { height: v })
    }
  }
}
function onFontChange(val: string) {
  if (!sel.value || !isText(sel.value)) return;
  store.updateItem(sel.value.id, { fontFamily: val });
}
</script>
