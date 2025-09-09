<template>
  <section class="max-w-6xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold mb-4">Diseñador de camisetas (MVP)</h1>
    <p class="opacity-80 mb-8">
      Añade texto e imágenes, muévelas/rotálas y exporta a PNG con fondo transparente.
    </p>

    <RouterLink
      to="/editor"
      class="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 transition"
    >
      Ir al editor →
    </RouterLink>
  </section>
</template>

<script setup lang="ts"></script>
