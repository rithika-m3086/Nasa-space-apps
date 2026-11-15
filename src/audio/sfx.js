let context = null;
let master = null;
let unlocked = false;
let muted = false;
let volume = 0.55;

function getContext() {
  if (context) return context;
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  try {
    const nextContext = new AudioContextClass();
    const nextMaster = nextContext.createGain();
    nextMaster.gain.value = muted ? 0 : volume;
    nextMaster.connect(nextContext.destination);
    context = nextContext;
    master = nextMaster;
    return context;
  } catch {
    return null;
  }
}

export function configureSfx(preferences = {}) {
  if (typeof preferences.muted === 'boolean') muted = preferences.muted;
  if (Number.isFinite(preferences.volume)) volume = Math.min(1, Math.max(0, preferences.volume));
  if (master && context) {
    master.gain.setTargetAtTime(muted ? 0 : volume, context.currentTime, 0.02);
  }
}

export function unlockAudio() {
  const audio = getContext();
  if (!audio) return false;
  unlocked = true;
  if (audio.state === 'suspended') {
    try {
      audio.resume().catch(() => { unlocked = false; });
    } catch {
      unlocked = false;
      return false;
    }
  }
  return true;
}

function output(node) {
  node.connect(master);
}

function tone(frequency, start, duration, waveform = 'sine', loudness = 0.12, endFrequency = frequency) {
  const audio = getContext();
  if (!audio || !unlocked || muted || !master) return;
  const oscillator = audio.createOscillator();
  const envelope = audio.createGain();
  oscillator.type = waveform;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(loudness, start + 0.012);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(envelope);
  output(envelope);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function noise(duration, filterType, frequency, loudness, endFrequency = frequency) {
  const audio = getContext();
  if (!audio || !unlocked || muted || !master) return;
  const length = Math.max(1, Math.floor(audio.sampleRate * duration));
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    channel[index] = Math.sin(index * 12.9898) * Math.cos(index * 78.233) * 0.35;
  }
  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const envelope = audio.createGain();
  source.buffer = buffer;
  filter.type = filterType;
  filter.frequency.setValueAtTime(frequency, audio.currentTime);
  filter.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), audio.currentTime + duration);
  envelope.gain.setValueAtTime(0.0001, audio.currentTime);
  envelope.gain.exponentialRampToValueAtTime(loudness, audio.currentTime + 0.04);
  envelope.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
  source.connect(filter);
  filter.connect(envelope);
  output(envelope);
  source.start();
  source.stop(audio.currentTime + duration + 0.02);
}

function chord(notes, spacing = 0.08, length = 0.4) {
  const audio = getContext();
  if (!audio || !unlocked || muted) return;
  notes.forEach((note, index) => {
    tone(note, audio.currentTime + index * spacing, length, 'sine', 0.09);
  });
}

export const sfx = {
  tap() {
    if (context) tone(680, context.currentTime, 0.045, 'sine', 0.045);
  },
  sliderTick() {
    if (context) tone(1120, context.currentTime, 0.025, 'triangle', 0.035);
  },
  lockInWhoosh() {
    if (context) noise(0.28, 'bandpass', 240, 0.12, 1500);
  },
  successChime() {
    if (context) chord([660, 880, 990], 0.085, 0.32);
  },
  softAlert() {
    if (context) {
      tone(440, context.currentTime, 0.22, 'sine', 0.08);
      tone(350, context.currentTime + 0.24, 0.28, 'sine', 0.07);
    }
  },
  shieldHum(direction = 'up') {
    if (context) {
      const start = direction === 'up' ? 230 : 340;
      const end = direction === 'up' ? 390 : 210;
      tone(start, context.currentTime, 0.32, 'sine', 0.07, end);
    }
  },
  flareRumble() {
    if (context) noise(0.65, 'lowpass', 110, 0.16, 55);
  },
  fanfare() {
    if (context) chord([523, 659, 784, 1047], 0.13, 0.6);
  },
  gaugeChange(direction = 'up') {
    if (context) {
      const frequency = direction === 'up' ? 740 : 480;
      tone(frequency, context.currentTime, 0.12, 'triangle', 0.045);
    }
  },
};

function unlockOnGesture() {
  unlockAudio();
  ['pointerdown', 'keydown', 'touchstart'].forEach((eventName) => {
    window.removeEventListener(eventName, unlockOnGesture, true);
  });
}

if (typeof window !== 'undefined') {
  ['pointerdown', 'keydown', 'touchstart'].forEach((eventName) => {
    window.addEventListener(eventName, unlockOnGesture, { capture: true, once: true });
  });
}
