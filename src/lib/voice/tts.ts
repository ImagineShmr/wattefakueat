let currentUtterance: SpeechSynthesisUtterance | null = null;
let voiceLoaded = false;
let selectedVoice: SpeechSynthesisVoice | null = null;

const PHRASES = {
  saved: [
    'Got it.',
    'Noted.',
    'Logged.',
    'Saved.',
    'All set.'
  ],
  confirmFoods: [
    (foods: string[], meal: string) => `${foods.slice(0, 2).join(' and ')}, for ${meal}.`,
    (foods: string[], meal: string) => `I have ${foods.slice(0, 2).join(', ')} for ${meal}.`,
  ],
  unclear: [
    'I did not quite catch that. Could you tell me again what you ate?',
    'I heard something, but I could not make out the foods. Want to try again?',
    'Sorry, I did not understand. Please tell me your meal again.'
  ],
  empty: [
    'I did not hear anything. Want to say what you ate?',
    'Go ahead, tell me what you had to eat.'
  ]
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function isTTSSupported(): boolean {
  return 'speechSynthesis' in window;
}

function loadVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return;

  const langPrefix = 'en';
  selectedVoice =
    voices.find(v => v.name.includes('Google') && v.lang.startsWith(langPrefix)) ||
    voices.find(v => v.name.includes('Microsoft') && v.lang.startsWith(langPrefix)) ||
    voices.find(v => v.name.includes('Neural') && v.lang.startsWith(langPrefix)) ||
    voices.find(v => v.name.includes('Natural') && v.lang.startsWith(langPrefix)) ||
    voices.find(v => v.lang.startsWith(langPrefix)) ||
    null;

  voiceLoaded = true;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
}

function speakText(text: string): Promise<void> {
  return new Promise((resolve) => {
    cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    if (selectedVoice) utterance.voice = selectedVoice;

    currentUtterance = utterance;
    utterance.onend = () => { currentUtterance = null; resolve(); };
    utterance.onerror = () => { currentUtterance = null; resolve(); };
    window.speechSynthesis.speak(utterance);
  });
}

export async function speakConfirmation(foods: string[], meal: string | null): Promise<void> {
  const prefix = pick(PHRASES.saved);
  const detail = pick(PHRASES.confirmFoods)(foods, meal || 'snack');
  await speakText(`${prefix} ${detail}`);
}

export async function speakUnclear(): Promise<void> {
  await speakText(pick(PHRASES.unclear));
}

export async function speakEmpty(): Promise<void> {
  await speakText(pick(PHRASES.empty));
}

export function cancel(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}
