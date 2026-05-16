// Cartoon pain sound synthesizer using Web Audio API

const AudioContext = window.AudioContext || window.webkitAudioContext;

function getCtx() {
  if (!getCtx._ctx) getCtx._ctx = new AudioContext();
  return getCtx._ctx;
}

function resume() {
  const ctx = getCtx();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// A rough "voice" using oscillators + noise + filters
function cartoonYell(pitch = 200, duration = 0.35, type = "slap", volume = 0.5) {
  const ctx = resume();
  const now = ctx.currentTime;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, now);
  masterGain.connect(ctx.destination);

  // Main oscillator (voice-like)
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "sawtooth";
  filter.type = "bandpass";
  filter.frequency.value = pitch * 2;
  filter.Q.value = 3;

  // Pitch envelope - slides down like "OUUCH"
  osc.frequency.setValueAtTime(pitch * 1.5, now);
  osc.frequency.exponentialRampToValueAtTime(pitch * 0.6, now + duration);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.4, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(masterGain);

  osc.start(now);
  osc.stop(now + duration);

  // Add a second "harmonic" oscillator for richness
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "square";
  osc2.frequency.setValueAtTime(pitch * 2.2, now);
  osc2.frequency.exponentialRampToValueAtTime(pitch * 0.8, now + duration * 0.8);
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.linearRampToValueAtTime(0.15, now + 0.015);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7);
  osc2.connect(gain2);
  gain2.connect(masterGain);
  osc2.start(now);
  osc2.stop(now + duration);

  // Impact thud
  const bufSize = ctx.sampleRate * 0.08;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.15));
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = type === "punch" ? 180 : 300;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(type === "punch" ? 0.6 : 0.35, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);
  noise.start(now);
}

const SLAP_SOUNDS = [
  (vol) => cartoonYell(220, 0.4, "slap", vol),
  (vol) => cartoonYell(180, 0.5, "slap", vol),
  (vol) => cartoonYell(260, 0.3, "slap", vol),
  (vol) => cartoonYell(150, 0.55, "slap", vol),
  (vol) => cartoonYell(300, 0.25, "slap", vol),
];

const PUNCH_SOUNDS = [
  (vol) => cartoonYell(160, 0.45, "punch", vol),
  (vol) => cartoonYell(130, 0.6, "punch", vol),
  (vol) => cartoonYell(200, 0.35, "punch", vol),
  (vol) => cartoonYell(110, 0.7, "punch", vol),
  (vol) => cartoonYell(240, 0.3, "punch", vol),
];

export function playHitSound(mode = "slap", volume = 0.5) {
  const sounds = mode === "punch" ? PUNCH_SOUNDS : SLAP_SOUNDS;
  const fn = sounds[Math.floor(Math.random() * sounds.length)];
  fn(volume);
}