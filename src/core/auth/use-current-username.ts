import { computed, ref } from 'vue'

/** Auth stub — always null until backend login is integrated. */
const currentUsername = ref<string | null>(null)

export function useCurrentUsername() {
  return computed(() => currentUsername.value)
}

export function setCurrentUsername(username: string | null): void {
  currentUsername.value = username
}
