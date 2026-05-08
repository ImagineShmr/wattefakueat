let currentUtterance: SpeechSynthesisUtterance | null = null;
let loaded = false;

export function isTTSSupported(): boolean {
  return 'speechSynthesis' in window;
}

function ensureVoicesLoaded(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  if (!loaded) {
    window.speechSynthesis.getVoices();
    loaded = true;
  }
}

function getBestVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const langPrefix = lang.split('-')[0];

  const google = voices.find(v => v.name.includes('Google') && v.lang.startsWith(langPrefix));
  if (google) return google;

  const premium = voices.find(v =>
    v.name.includes('Premium') && v.lang.startsWith(langPrefix)
  );
  if (premium) return premium;

  const natural = voices.find(v =>
    (v.name.includes('Neural') || v.name.includes('Natural') || v.name.includes('Enhanced'))
    && v.lang.startsWith(langPrefix)
  );
  if (natural) return natural;

  const langMatch = voices.find(v => v.lang.startsWith(langPrefix));
  return langMatch || null;
}

export function speak(text: string, lang = 'en-US'): Promise<void> {
  return new Promise((resolve) => {
    cancel();
    if (!window.speechSynthesis) {
      resolve();
      return;
    }

    ensureVoicesLoaded();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1.0;

    const voice = getBestVoice(lang);
    if (voice) utterance.voice = voice;

    currentUtterance = utterance;
    utterance.onend = () => { currentUtterance = null; resolve(); };
    utterance.onerror = () => { currentUtterance = null; resolve(); };

    window.speechSynthesis.speak(utterance);
  });
}

export function cancel(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}
