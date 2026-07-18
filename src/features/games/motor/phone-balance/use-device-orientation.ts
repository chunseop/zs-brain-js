import { readonly, ref } from 'vue'

export type OrientationError = 'unsupported' | 'permission-denied' | 'unavailable' | null

type PermissionState = 'granted' | 'denied'
type DeviceOrientationEventConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>
}

export function useDeviceOrientation() {
  const beta = ref(0)
  const gamma = ref(0)
  const hasSample = ref(false)
  const error = ref<OrientationError>(null)
  let listening = false

  function handleOrientation(event: DeviceOrientationEvent) {
    if (
      event.beta == null ||
      event.gamma == null ||
      !Number.isFinite(event.beta) ||
      !Number.isFinite(event.gamma)
    ) {
      return
    }

    beta.value = event.beta
    gamma.value = event.gamma
    hasSample.value = true
  }

  async function start(): Promise<boolean> {
    stop()
    hasSample.value = false
    error.value = null

    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      error.value = 'unsupported'
      return false
    }

    try {
      const OrientationEvent = window.DeviceOrientationEvent as DeviceOrientationEventConstructor
      if (typeof OrientationEvent.requestPermission === 'function') {
        const permission = await OrientationEvent.requestPermission()
        if (permission !== 'granted') {
          error.value = 'permission-denied'
          return false
        }
      }

      window.addEventListener('deviceorientation', handleOrientation)
      listening = true
      return true
    } catch {
      error.value = 'unavailable'
      return false
    }
  }

  function stop() {
    if (!listening || typeof window === 'undefined') return
    window.removeEventListener('deviceorientation', handleOrientation)
    listening = false
  }

  return {
    beta: readonly(beta),
    gamma: readonly(gamma),
    hasSample: readonly(hasSample),
    error: readonly(error),
    start,
    stop,
  }
}
