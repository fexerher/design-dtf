<template>
  <div class="grid grid-cols-[1fr_auto] gap-2">
    <select class="bg-transparent border border-white/20 rounded px-2 py-1 text-sm"
            :value="modelValue" @change="onChange">
      <option disabled value="">-- Fuente --</option>
      <option v-for="f in fonts" :key="f" :value="f">{{ f }}</option>
    </select>
    <button class="btn" @click="$emit('refresh')">↻</button>
  </div>
</template>

<script setup lang="ts">
import { ensureGoogleFont, POPULAR_FONTS } from '@/utils/fonts';

const props = defineProps<{
  modelValue: string;
  fonts?: string[];
  weights?: number[];
}>();
const emit = defineEmits<{
  (e:'update:modelValue', val: string): void;
  (e:'refresh'): void;
}>();

const fonts = props.fonts ?? POPULAR_FONTS;

function onChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value;
  ensureGoogleFont(val, props.weights ?? [400,700]);
  emit('update:modelValue', val);
}
</script>
