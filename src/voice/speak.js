function getSynthesis() {
  if (typeof window === 'undefined') return null;
  try {
    return window.speechSynthesis || null;
  } catch {
    return null;
  }
}

export function isSupported() {
  try {
    return Boolean(
      getSynthesis()
      && (window.SpeechSynthesisUtterance || globalThis.SpeechSynthesisUtterance),
    );
  } catch {
    return false;
  }
}

export function cancel() {
  try {
    getSynthesis()?.cancel();
  } catch {
    return false;
  }
  return true;
}

export function speak(text, { lang = 'en-US', rate = 0.9 } = {}) {
  if (!isSupported()) return false;
  cancel();
  try {
    const SpeechUtterance = window.SpeechSynthesisUtterance || globalThis.SpeechSynthesisUtterance;
    const utterance = new SpeechUtterance(String(text ?? ''));
    const synthesis = getSynthesis();
    const language = String(lang || 'en-US').toLowerCase();
    const prefix = language.split('-')[0];
    const voices = synthesis.getVoices();
    utterance.lang = lang;
    utterance.rate = Number.isFinite(rate) ? Math.min(2, Math.max(0.5, rate)) : 0.9;
    utterance.voice = voices.find((voice) => voice.lang.toLowerCase() === language)
      || voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix))
      || null;
    synthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}
