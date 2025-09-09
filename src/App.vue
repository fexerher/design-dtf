<template>
  <div class="min-h-screen flex flex-col">
    <header class="border-b border-white/10">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <RouterLink to="/" class="font-semibold tracking-wide">DTF Designer (Vue)</RouterLink>
        <nav class="flex items-center gap-4 text-sm">
          <RouterLink to="/" class="opacity-80 hover:opacity-100">Inicio</RouterLink>
          <RouterLink to="/editor" class="opacity-80 hover:opacity-100">Editor</RouterLink>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <RouterView />
    </main>

    <footer class="border-t border-white/10">
      <div class="max-w-6xl mx-auto px-4 h-12 flex items-center text-xs opacity-70">
        © 2025 — Demo de portafolio
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts"></script>
