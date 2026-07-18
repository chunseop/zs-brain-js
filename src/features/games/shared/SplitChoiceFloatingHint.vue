<script setup lang="ts">
defineProps<{
  text: string
  seniorMode?: boolean
  visible?: boolean
}>()
</script>

<template>
  <Transition name="floating-hint">
    <div
      v-if="visible"
      class="floating-hint"
      :class="{ 'floating-hint--senior': seniorMode }"
      role="status"
    >
      {{ text }}
    </div>
  </Transition>
</template>

<style scoped>
.floating-hint {
  position: fixed;
  top: max(5.5rem, calc(env(safe-area-inset-top) + 5rem));
  left: 50%;
  z-index: 15;
  width: min(28rem, calc(100vw - 1.5rem));
  padding: 1rem 1.25rem;
  border-radius: 10px;
  background: #111827;
  color: #f8fafc;
  text-align: center;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.35;
  box-shadow: 0 8px 24px rgb(15 23 42 / 32%);
  transform: translateX(-50%);
  pointer-events: none;
}

.floating-hint--senior {
  width: min(32rem, calc(100vw - 1rem));
  padding: 1.125rem 1.375rem;
  font-size: 1.6rem;
}

.floating-hint-enter-active,
.floating-hint-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.floating-hint-enter-from,
.floating-hint-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-0.5rem);
}
</style>
