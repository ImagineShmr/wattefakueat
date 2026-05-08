<script lang="ts">
  import GlowingOrb from './GlowingOrb.svelte';
  import { parseFoodText, guessMealType } from '$lib/nlp/parser';
  import { speak } from '$lib/voice/tts';
  import { startSTT, stopSTT, isSTTSupported } from '$lib/voice/stt';
  import { createEntry } from '$lib/db/queries';
  import { MEAL_EMOJI, type MealType } from '$lib/types';

  let { onSaved = () => {}, onClose = () => {} } = $props();

  let state = $state<'listening' | 'processing' | 'result'>('listening');
  let transcript = $state('');
  let parsedMeal = $state<MealType | null>(null);
  let parsedFoods = $state<string[]>([]);
  let interimText = $state('');

  let fullTranscript = $state('');
  let language = $state('en-US');
  let saveError = $state('');

  let editingFood: number | null = $state(null);
  let editingValue = $state('');
  let showMealPicker = $state(false);

  const sttSupported = isSTTSupported();

  const MEALS: { type: MealType; label: string }[] = [
    { type: 'breakfast', label: 'Breakfast' },
    { type: 'lunch', label: 'Lunch' },
    { type: 'dinner', label: 'Dinner' },
    { type: 'snack', label: 'Snack' }
  ];

  function startListening() {
    interimText = '';
    fullTranscript = '';
    parsedMeal = null;
    parsedFoods = [];
    saveError = '';

    if (!sttSupported) {
      state = 'processing';
      return;
    }

    startSTT(language, {
      onInterim: (text) => {
        interimText = text;
      },
      onFinal: (text) => {
        fullTranscript += (fullTranscript ? ' ' : '') + text;
        interimText = '';
      },
      onError: (err) => {
        if (err !== 'no-speech' && err !== 'aborted') {
          saveError = 'Microphone error: ' + err;
          state = 'result';
        }
      },
      onEnd: () => {
        if (state === 'listening') {
          processTranscript(fullTranscript || interimText);
        }
      }
    });
  }

  function stopListening() {
    stopSTT();
    processTranscript(fullTranscript || interimText);
  }

  function processTranscript(text: string) {
    state = 'processing';
    const t = text.trim();
    if (!t) {
      state = 'result';
      return;
    }
    transcript = t;
    const parsed = parseFoodText(t);
    parsedMeal = parsed.mealType || guessMealType();
    parsedFoods = parsed.foods;
    state = 'result';
  }

  async function confirmEntry() {
    if (parsedFoods.length === 0) return;
    saveError = '';
    try {
      const now = new Date().toISOString();
      await createEntry(now, transcript, parsedFoods, parsedMeal);
      speak(parsedFoods.slice(0, 2).join(' and ') + ', ' + parsedMeal);
      onSaved();
      reset();
    } catch {
      saveError = 'Failed to save';
    }
  }

  function startEditFood(i: number) {
    editingFood = i;
    editingValue = parsedFoods[i];
  }

  function confirmEditFood() {
    if (editingFood === null) return;
    const val = editingValue.trim().toLowerCase();
    if (val) {
      parsedFoods[editingFood] = val;
    }
    editingFood = null;
    editingValue = '';
  }

  function removeFood(index: number) {
    parsedFoods = parsedFoods.filter((_, i) => i !== index);
  }

  function reset() {
    stopSTT();
    state = 'listening';
    transcript = '';
    interimText = '';
    fullTranscript = '';
    parsedMeal = null;
    parsedFoods = [];
    saveError = '';
    editingFood = null;
    showMealPicker = false;
  }

  function handleBackgroundTap() {
    if (state === 'listening') stopListening();
    else if (state === 'result') reset();
    else onClose();
  }

  function selectMeal(meal: MealType) {
    parsedMeal = meal;
    showMealPicker = false;
  }

  $effect(() => {
    if (state === 'listening') {
      startListening();
      return () => stopSTT();
    }
  });
</script>

{#if state === 'listening'}
  <div
    onclick={handleBackgroundTap}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBackgroundTap(); }}
    role="button"
    tabindex="-1"
    class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-900/98 cursor-pointer"
  >
    <button
      onclick={(e) => { e.stopPropagation(); stopSTT(); onClose(); }}
      class="close-btn"
      aria-label="Cancel"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>

    <GlowingOrb active={true} size={200} />

    <div class="mt-8 px-8 text-center max-w-md">
      <p class="text-accent text-lg font-light min-h-[2rem] transition-all">
        {interimText || fullTranscript || '...'}
      </p>
    </div>

    <p class="mt-6 text-text-softer text-xs">Tap to stop</p>
  </div>

{:else if state === 'processing'}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-surface-900">
    <p class="text-accent text-sm animate-pulse">Processing</p>
  </div>

{:else if state === 'result'}
  <div
    onclick={handleBackgroundTap}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBackgroundTap(); }}
    role="button"
    tabindex="-1"
    class="fixed inset-0 z-50 flex flex-col bg-surface-800/90"
    style="backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);"
  >
    <button
      onclick={(e) => { e.stopPropagation(); stopSTT(); onClose(); }}
      class="close-btn"
      aria-label="Cancel"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>

    <div class="flex-1 flex flex-col items-center justify-center px-6">
      <button
        onclick={(e) => { e.stopPropagation(); showMealPicker = !showMealPicker; }}
        class="meal-type-btn"
      >
        <span class="text-4xl">{MEAL_EMOJI[parsedMeal ?? 'snack'] ?? '🍽️'}</span>
        <span class="text-lg font-medium text-text-primary capitalize mt-1">{parsedMeal ?? 'snack'}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {#if showMealPicker}
        <div class="meal-picker">
          {#each MEALS as meal}
            <button
              onclick={(e) => { e.stopPropagation(); selectMeal(meal.type); }}
              class="meal-option {parsedMeal === meal.type ? 'selected' : ''}"
            >
              <span>{MEAL_EMOJI[meal.type]}</span>
              <span>{meal.label}</span>
            </button>
          {/each}
        </div>
      {/if}

      {#if transcript}
        <p class="text-text-dim text-xs mt-4 mb-5 text-center max-w-sm leading-relaxed">"{transcript}"</p>
      {/if}

      <div class="food-chips">
        {#each parsedFoods as food, i}
          {#if editingFood === i}
            <input
              type="text"
              bind:value={editingValue}
              onkeydown={(e) => { if (e.key === 'Enter') confirmEditFood(); if (e.key === 'Escape') { editingFood = null; } }}
              onblur={confirmEditFood}
              onclick={(e) => e.stopPropagation()}
              class="food-edit-input"
            />
          {:else}
            <div class="food-chip">
              <span>{food}</span>
              <button
                onclick={(e) => { e.stopPropagation(); startEditFood(i); }}
                class="chip-btn"
                aria-label="Edit {food}"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button
                onclick={(e) => { e.stopPropagation(); removeFood(i); }}
                class="chip-btn remove"
                aria-label="Remove {food}"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          {/if}
        {/each}
        {#if parsedFoods.length === 0}
          <p class="text-text-softer text-xs text-center py-4">No foods recognized. Tap retry.</p>
        {/if}
      </div>

      <div class="actions-row">
        <button
          onclick={(e) => { e.stopPropagation(); reset(); }}
          class="action-btn"
          aria-label="Retry"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </button>

        <button
          onclick={(e) => { e.stopPropagation(); confirmEntry(); }}
          disabled={parsedFoods.length === 0}
          class="confirm-btn"
          aria-label="Confirm"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      </div>

      {#if saveError}
        <p class="mt-3 text-error text-xs">{saveError}</p>
      {/if}
    </div>


  </div>
{/if}

<style>
  .meal-type-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: inherit;
    font-family: inherit;
    cursor: pointer;
    padding: 4px 12px;
    border-radius: 10px;
    transition: background 0.15s;
  }

  .meal-type-btn:hover {
    background: oklch(70% 0.02 30 / 0.06);
  }

  .meal-type-btn svg {
    color: var(--color-text-softer);
    margin-top: 2px;
  }

  .meal-picker {
    display: flex;
    gap: 6px;
    margin-top: 8px;
    background: oklch(18% 0.015 30 / 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid var(--color-border-glass);
    border-radius: 12px;
    padding: 6px;
  }

  .meal-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 0.72rem;
    font-weight: 450;
    font-family: inherit;
    color: var(--color-text-dim);
    transition: background 0.12s, color 0.12s;
  }

  .meal-option.selected {
    background: var(--color-accent-subtle);
    color: var(--color-accent);
  }

  .meal-option:not(.selected):hover {
    background: oklch(70% 0.02 30 / 0.06);
  }

  .food-chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
    margin-bottom: 20px;
    min-height: 40px;
  }

  .food-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border-radius: 999px;
    background: var(--color-accent-subtle);
    border: 1px solid oklch(68% 0.13 75 / 0.1);
    font-size: 0.82rem;
    font-weight: 450;
    color: var(--color-text-primary);
  }

  .chip-btn {
    color: var(--color-text-softer);
    line-height: 0;
    padding: 2px;
    opacity: 0.4;
    transition: opacity 0.12s, color 0.12s;
  }

  .food-chip:hover .chip-btn {
    opacity: 1;
  }

  .chip-btn:hover {
    color: var(--color-accent);
  }

  .chip-btn.remove:hover {
    color: var(--color-error);
  }

  .food-edit-input {
    background: var(--color-surface-800);
    border: 1px solid var(--color-accent);
    border-radius: 999px;
    padding: 6px 12px;
    color: var(--color-text-primary);
    font-size: 0.82rem;
    font-family: inherit;
    outline: none;
    width: 120px;
    text-align: center;
  }

  .actions-row {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .action-btn {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--color-surface-glass);
    color: var(--color-text-softer);
    transition: color 0.15s, background 0.15s;
  }

  .action-btn:hover {
    color: var(--color-accent);
    background: oklch(30% 0.02 30 / 0.5);
  }

  .confirm-btn {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--color-accent);
    color: var(--color-surface-900);
    transition: opacity 0.15s, transform 0.1s;
  }

  .confirm-btn:active {
    transform: scale(0.94);
  }

  .confirm-btn:disabled {
    opacity: 0.25;
  }

  .close-btn {
    position: fixed;
    top: max(16px, env(safe-area-inset-top, 16px));
    left: 16px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--color-surface-glass);
    color: var(--color-text-softer);
    z-index: 60;
    transition: color 0.15s, background 0.15s;
  }

  .close-btn:hover {
    color: var(--color-text-primary);
    background: oklch(30% 0.02 30 / 0.5);
  }
</style>
