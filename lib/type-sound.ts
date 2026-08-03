// Som de digitação — mesma abordagem do portfólio: um único mp3 com várias
// batidas de tecla, das quais tocamos uma fatia aleatória a cada caractere.

const TYPE_SRC = "/sounds/type.mp3";
const CLICK_SRC = "/sounds/click.mp3";

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
let clickBuffer: AudioBuffer | null = null;
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
      const load = async (url: string) => {
        const res = await fetch(url);
        return audioCtx!.decodeAudioData(await res.arrayBuffer());
      };
      // O clique é leve e vem primeiro; a digitação é um arquivo maior
      clickBuffer = await load(CLICK_SRC).catch(() => null);
      buffer = await load(TYPE_SRC).catch(() => null);
    } catch {
      // Sem áudio disponível: a interface continua, só que silenciosa.
      audioCtx = null;
      buffer = null;
      clickBuffer = null;
    }
  })();

  return loading;
}

function play(
  source: AudioBuffer | null,
  volume: number,
  offset?: number,
  duration?: number
) {
  if (muted || !audioCtx || !source) return;
  if (audioCtx.state === "suspended") void audioCtx.resume();

  const src = audioCtx.createBufferSource();
  src.buffer = source;
  const gain = audioCtx.createGain();
  gain.gain.value = volume;
  src.connect(gain).connect(audioCtx.destination);
  if (duration) {
    src.start(0, offset ?? 0, duration);
  } else {
    src.start(0);
  }
}

export function playKey() {
  const hit = TYPE_HITS[Math.floor(Math.random() * TYPE_HITS.length)];
  play(buffer, VOLUME, Math.max(0, hit - 0.005), SLICE_DURATION);
}

export function playClick() {
  play(clickBuffer, 0.55);
}
