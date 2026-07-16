import { ref } from 'vue'

const message = ref<string | null>(null)
let hideTimer: ReturnType<typeof setTimeout> | undefined

export function useToast() {
  function show(text: string, durationMs = 3000): void {
    message.value = text
    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      message.value = null
    }, durationMs)
  }

  function dismiss(): void {
    message.value = null
    if (hideTimer) clearTimeout(hideTimer)
  }

  return { message, show, dismiss }
}
