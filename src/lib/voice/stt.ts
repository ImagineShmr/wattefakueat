export interface STTCallbacks {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

let recognition: any = null;

function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

export function isSTTSupported(): boolean {
  return !!getSpeechRecognition();
}

export function startSTT(lang: string, callbacks: STTCallbacks): void {
  const SpeechRecognition = getSpeechRecognition();
  if (!SpeechRecognition) {
    callbacks.onError('Speech recognition not supported in this browser');
    return;
  }

  stopSTT();

  recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;

  recognition.onresult = (event: any) => {
    let interim = '';
    let final = '';
    for (let i = event.results.length; i-- > 0;) {
      const result = event.results[i];
      if (result.isFinal) {
        final = result[0].transcript;
      } else {
        interim = result[0].transcript;
      }
    }
    if (final) callbacks.onFinal(final);
    else if (interim) callbacks.onInterim(interim);
  };

  recognition.onerror = (event: { error: string }) => {
    callbacks.onError(event.error);
  };

  recognition.onend = () => {
    callbacks.onEnd();
  };

  recognition.start();
}

export function stopSTT(): void {
  if (recognition) {
    try { recognition.stop(); } catch {}
    recognition = null;
  }
}
