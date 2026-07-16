<script setup lang="ts">
defineProps<{
  label: string
  seniorMode?: boolean
}>()
</script>

<template>
  <p class="split-timer" :class="{ 'split-timer--senior': seniorMode }">{{ label }}</p>
</template>

<style scoped>
.split-timer {
  position: fixed;
  top: max(0.5rem, env(safe-area-inset-top));
  left: 50%;
  z-index: 15;
  margin: 0;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-outline);
  border-radius: 8px;
  background: color-mix(in srgb, var(--color-surface) 92%, var(--color-primary) 8%);
  color: var(--color-on-surface-variant);
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.2;
  transform: translateX(-50%);
  pointer-events: none;
  white-space: nowrap;
}

.split-timer--senior {
  font-size: 1.1rem;
  padding: 0.65rem 1.125rem;
}
</style>
