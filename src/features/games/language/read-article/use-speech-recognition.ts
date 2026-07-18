import { readonly, ref } from 'vue'

export type SpeechError =
  | 'unsupported'
  | 'permission-denied'
  | 'network'
  | 'unavailable'
  | null

type SpeechRecognitionResultLike = {
  isFinal: boolean
  0?: { transcript?: string }
}

type SpeechRecognitionEventLike = Event & {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

type SpeechRecognitionErrorEventLike = Event & {
  error: string
}

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function useSpeechRecognition(options?: { lang?: string }) {
  const transcript = ref('')
  const interimTranscript = ref('')
  const isListening = ref(false)
  const error = ref<SpeechError>(null)

  let recognition: SpeechRecognitionLike | null = null
  let shouldListen = false
  let finalChunks: string[] = []

  function syncTranscript() {
    transcript.value = finalChunks.join('')
  }

  function mapError(code: string): SpeechError {
    if (code === 'not-allowed' || code === 'service-not-allowed') return 'permission-denied'
    if (code === 'network') return 'network'
    return 'unavailable'
  }

  function createRecognition(lang?: string): SpeechRecognitionLike | null {
    const Ctor = getSpeechRecognitionConstructor()
    if (!Ctor) {
      error.value = 'unsupported'
      return null
    }

    const instance = new Ctor()
    instance.lang = lang ?? options?.lang ?? 'zh-CN'
    instance.continuous = true
    instance.interimResults = true
    instance.maxAlternatives = 1

    instance.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        if (!result) continue
        const text = result[0]?.transcript ?? ''
        if (result.isFinal) {
          finalChunks.push(text)
          syncTranscript()
        } else {
          interim += text
        }
      }
      interimTranscript.value = interim
    }

    instance.onerror = (event) => {
      // "no-speech" / "aborted" are common during pauses; keep listening if intended.
      if (event.error === 'no-speech' || event.error === 'aborted') return
      error.value = mapError(event.error)
      shouldListen = false
      isListening.value = false
    }

    instance.onend = () => {
      isListening.value = false
      if (!shouldListen) return
      // Auto-restart until the user explicitly finishes reading.
      try {
        instance.start()
        isListening.value = true
      } catch {
        // Ignored: start may throw if already starting.
      }
    }

    return instance
  }

  async function start(lang?: string): Promise<boolean> {
    stop()
    error.value = null
    finalChunks = []
    transcript.value = ''
    interimTranscript.value = ''

    recognition = createRecognition(lang)
    if (!recognition) return false

    // Best-effort microphone permission prompt before recognition starts.
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop())
      } catch {
        error.value = 'permission-denied'
        recognition = null
        return false
      }
    }

    shouldListen = true
    try {
      recognition.start()
      isListening.value = true
      return true
    } catch {
      error.value = 'unavailable'
      shouldListen = false
      isListening.value = false
      return false
    }
  }

  function stop() {
    shouldListen = false
    interimTranscript.value = ''
    if (!recognition) {
      isListening.value = false
      return
    }
    const current = recognition
    recognition = null
    current.onresult = null
    current.onerror = null
    current.onend = null
    try {
      current.stop()
    } catch {
      try {
        current.abort()
      } catch {
        // ignore
      }
    }
    isListening.value = false
  }

  return {
    transcript: readonly(transcript),
    interimTranscript: readonly(interimTranscript),
    isListening: readonly(isListening),
    error: readonly(error),
    start,
    stop,
  }
}
