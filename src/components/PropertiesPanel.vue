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
import { computed } from 'vue'
import { useCanvasStore, type CanvasItem } from '@/stores/canvas'
const store = useCanvasStore()

const sel = computed<CanvasItem | null>(() => {
  const id = store.selectedId
  return id ? (store.items.find((i) => i.id === id) ?? null) : null
})

function round(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}
function num(e: Event, k: keyof CanvasItem) {
  if (!sel.value) return
  const v = Number((e.target as HTMLInputElement).value)
  store.updateItem(sel.value.id, { [k]: isNaN(v) ? 0 : v } as any)
}
function str(e: Event, k: keyof CanvasItem | 'text' | 'fill') {
  if (!sel.value) return
  const v = (e.target as HTMLInputElement).value
  store.updateItem(sel.value.id, { [k]: v } as any)
}
function toggleVisible(id: string) {
  store.toggleVisible(id)
}
function toggleLocked(id: string) {
  store.toggleLocked(id)
}
</script>
