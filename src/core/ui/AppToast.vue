<script setup lang="ts">
import { useToast } from '@/core/ui/use-toast'

const { message, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="message"
      class="app-toast"
      role="status"
      @click="dismiss"
    >
      {{ message }}
    </div>
  </Teleport>
</template>

<style scoped>
.app-toast {
  position: fixed;
  left: 50%;
  bottom: 1.5rem;
  z-index: 1000;
  max-width: min(28rem, calc(100vw - 2rem));
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: color-mix(in srgb, var(--color-on-surface) 92%, transparent);
  color: var(--color-surface);
  font-size: 0.95rem;
  font-weight: 600;
  box-shadow: 0 8px 24px rgb(15 23 42 / 24%);
  transform: translateX(-50%);
  cursor: pointer;
}
</style>
