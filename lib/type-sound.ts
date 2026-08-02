// Som de digitação — mesma abordagem do portfólio: um único mp3 com várias
// batidas de tecla, das quais tocamos uma fatia aleatória a cada caractere.

const TYPE_SRC = "/sounds/type.mp3";

// Posições (em segundos) das batidas dentro do arquivo, detectadas por
// análise de amplitude. Cada digitação toca uma delas.
const TYPE_HITS = [
  0.86, 0.99, 1.65, 1.89, 2.03, 2.16, 2.55, 2.67, 2.9, 3.4, 3.58, 3.72, 4.1,
  4.31, 4.49, 4.6, 4.75, 5.08, 5.24, 5.36, 5.61, 6.73, 7.12, 7.26,
];
const SLICE_DURATION = 0.09;
const VOLUME = 0.5;

const MUTE_KEY = "indash-som-mudo";

let audioCtx: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
let loading: Promise<void> | null = null;
let muted = false;

/** Assinantes para o botão de mudo refletir o estado atual. */
const listeners = new Set<(muted: boolean) => void>();

export function isMuted() {
  return muted;
}

export function subscribeMute(fn: (muted: boolean) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setMuted(value: boolean) {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {
    // modo privativo pode bloquear o storage — não é motivo para quebrar
  }
  listeners.forEach((fn) => fn(value));
}

export function loadMutePreference() {
  try {
    muted = localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    muted = false;
  }
  listeners.forEach((fn) => fn(muted));
}

/**
 * Prepara o áudio. Navegadores só liberam som após um gesto do usuário —
 * scroll não conta —, então isso é chamado no primeiro clique/tecla.
 */
export function primeTypeSound() {
  if (loading) return loading;

  loading = (async () => {
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioCtx = new Ctor();
      const res = await fetch(TYPE_SRC);
      buffer = await audioCtx.decodeAudioData(await res.arrayBuffer());
    } catch {
      // Sem áudio disponível: a digitação continua, só que silenciosa.
      audioCtx = null;
      buffer = null;
    }
  })();

  return loading;
}

export function playKey() {
  if (muted || !audioCtx || !buffer) return;
  if (audioCtx.state === "suspended") void audioCtx.resume();

  const hit = TYPE_HITS[Math.floor(Math.random() * TYPE_HITS.length)];
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  const gain = audioCtx.createGain();
  gain.gain.value = VOLUME;
  src.connect(gain).connect(audioCtx.destination);
  src.start(0, Math.max(0, hit - 0.005), SLICE_DURATION);
}
