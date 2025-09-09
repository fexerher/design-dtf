<!-- src/components/LayersPanel.vue -->
<template>
  <aside class="w-full max-w-[280px] border border-white/10 rounded-xl p-2 bg-white/5">
    <header class="px-2 py-1 text-sm opacity-80">Capas</header>
    <draggable
      v-model="panelItems"
      item-key="id"
      handle=".drag"
      @end="applyReorder"
      class="flex flex-col gap-1 mt-2"
    >
      <template #item="{ element }">
        <div
          class="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
          :class="{ 'bg-white/15': selectedId === element.id }"
          @click="select(element.id)"
        >
          <span class="drag select-none opacity-60 mr-1">⋮⋮</span>

          <button
            class="icon-btn"
            @click.stop="toggleVisible(element.id)"
            :title="element.visible ? 'Ocultar' : 'Mostrar'"
          >
            <span v-if="element.visible">👁️</span>
            <span v-else>🚫</span>
          </button>

          <button
            class="icon-btn"
            @click.stop="toggleLocked(element.id)"
            :title="element.locked ? 'Desbloquear' : 'Bloquear'"
          >
            <span v-if="element.locked">🔒</span>
            <span v-else>🔓</span>
          </button>

          <div class="flex-1 truncate">
            <input
              v-if="editingId === element.id"
              v-model="editingName"
              @keydown.enter.prevent="commitRename(element.id)"
              @blur="commitRename(element.id)"
              class="w-full bg-transparent border-b border-white/20 outline-none text-sm"
              :placeholder="defaultName(element)"
              autofocus
            />
            <span v-else class="text-sm" @dblclick.stop="startRename(element)">
              {{ element.name || defaultName(element) }}
            </span>
          </div>

          <small class="opacity-50">
            {{ label(element) }}
          </small>
        </div>
      </template>
    </draggable>
  </aside>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import { computed, ref, watch } from 'vue'
import { useCanvasStore, type CanvasItem } from '@/stores/canvas'

const store = useCanvasStore()

const selectedId = computed(() => store.selectedId)

// Mostramos TOP-FIRST: el último en el array (frente) arriba en el panel
const panelItems = ref<CanvasItem[]>([])
const toPanel = (items: CanvasItem[]) => [...items].reverse()
const fromPanel = (panel: CanvasItem[]) => [...panel].reverse()

watch(
  () => store.items,
  (val) => {
    panelItems.value = toPanel(val)
  },
  { immediate: true, deep: true },
)

function applyReorder() {
  // Convertimos orden del panel (top->bottom) a orden real del lienzo (bottom->top)
  store.reorder(fromPanel(panelItems.value))
}

function select(id: string) {
  if (store.items.find((i) => i.id === id)?.locked) return // no seleccionar bloqueados
  store.select(id)
}

function toggleVisible(id: string) {
  store.toggleVisible(id)
}
function toggleLocked(id: string) {
  store.toggleLocked(id)
}

function label(it: CanvasItem) {
  if (it.type === 'text') return 'Texto'
  if (it.type === 'image') return 'Imagen'
  return 'Rect'
}
function defaultName(it: CanvasItem) {
  return it.name || label(it)
}

// Renombrar
const editingId = ref<string | null>(null)
const editingName = ref('')
function startRename(it: CanvasItem) {
  editingId.value = it.id
  editingName.value = it.name || defaultName(it)
}
function commitRename(id: string) {
  if (!editingId.value) return
  store.rename(id, editingName.value.trim() || defaultName(store.items.find((i) => i.id === id)!))
  editingId.value = null
  editingName.value = ''
}
</script>
