<script lang="ts">
  import { MEAL_EMOJI, type FoodEntry, type MealType } from '$lib/types';
  import { updateEntry } from '$lib/db/queries';

  let {
    entry,
    show = false,
    onSaved = () => {},
    onCancel = () => {}
  }: {
    entry: FoodEntry | null;
    show: boolean;
    onSaved: () => void;
    onCancel: () => void;
  } = $props();

  let mealType = $state<MealType | null>(null);
  let foods = $state<string[]>([]);
  let editingIndex = $state<number | null>(null);
  let editingValue = $state('');
  let newFood = $state('');
  let showMealPicker = $state(false);
  let saving = $state(false);

  const MEALS: { type: MealType; label: string }[] = [
    { type: 'breakfast', label: 'Breakfast' },
    { type: 'lunch', label: 'Lunch' },
    { type: 'dinner', label: 'Dinner' },
    { type: 'snack', label: 'Snack' }
  ];

  $effect(() => {
    if (show && entry) {
      mealType = entry.mealType;
      foods = [...entry.foods];
      editingIndex = null;
      editingValue = '';
      newFood = '';
      showMealPicker = false;
      saving = false;
    }
  });

  function selectMeal(m: MealType) {
    mealType = m;
    showMealPicker = false;
  }

  function startEditFood(i: number) {
    editingIndex = i;
    editingValue = foods[i];
  }

  function confirmEditFood() {
    if (editingIndex === null) return;
    const val = editingValue.trim().toLowerCase();
    if (val) foods[editingIndex] = val;
    editingIndex = null;
    editingValue = '';
  }

  function removeFood(i: number) {
    foods = foods.filter((_, idx) => idx !== i);
  }

  function addFood() {
    const val = newFood.trim().toLowerCase();
    if (!val || foods.includes(val)) return;
    foods = [...foods, val];
    newFood = '';
  }

  async function save() {
    if (!entry) return;
    saving = true;
    try {
      await updateEntry(entry.id, {
        mealType,
        foods,
        rawText: entry.rawText
      });
      onSaved();
    } catch {
      saving = false;
    }
  }

  function handleOverlay(e: MouseEvent) {
    if (e.target === e.currentTarget) onCancel();
  }
</script>

{#if show && entry}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    onclick={handleOverlay}
    onkeydown={(e) => { if (e.key === 'Escape') onCancel(); }}
    role="dialog"
    aria-modal="true"
    aria-label="Edit entry"
    tabindex="-1"
    class="overlay"
  >
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Edit entry</h2>
        <button onclick={onCancel} class="modal-close" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="modal-body">
        <button
          onclick={(e) => { e.stopPropagation(); showMealPicker = !showMealPicker; }}
          class="meal-type-btn"
        >
          <span class="meal-emoji">{MEAL_EMOJI[mealType ?? 'snack'] ?? '🍽️'}</span>
          <span class="meal-label capitalize">{mealType ?? 'snack'}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        {#if showMealPicker}
          <div class="meal-picker">
            {#each MEALS as m}
              <button
                onclick={() => selectMeal(m.type)}
                class="meal-option {mealType === m.type ? 'selected' : ''}"
              >
                <span>{MEAL_EMOJI[m.type]}</span>
                <span>{m.label}</span>
              </button>
            {/each}
          </div>
        {/if}

        {#if entry.rawText}
          <p class="raw-text">"{entry.rawText}"</p>
        {/if}

        <div class="foods-section">
          <label class="section-label">Foods</label>
          <div class="foods-list">
            {#each foods as food, i}
              {#if editingIndex === i}
                <input
                  type="text"
                  bind:value={editingValue}
                  onkeydown={(e) => { if (e.key === 'Enter') confirmEditFood(); if (e.key === 'Escape') editingIndex = null; }}
                  onblur={confirmEditFood}
                  class="food-input"
                />
              {:else}
                <div class="food-chip">
                  <span>{food}</span>
                  <button onclick={() => startEditFood(i)} class="chip-action" aria-label="Edit {food}">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onclick={() => removeFood(i)} class="chip-action remove" aria-label="Remove {food}">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              {/if}
            {/each}
          </div>

          <form onsubmit={(e) => { e.preventDefault(); addFood(); }} class="add-food-form">
            <input
              type="text"
              bind:value={newFood}
              placeholder="Add food"
              class="add-food-input"
            />
            <button type="submit" disabled={!newFood.trim()} class="add-food-btn" aria-label="Add food">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </form>
        </div>
      </div>

      <div class="modal-footer">
        <button onclick={onCancel} class="btn btn-cancel">Cancel</button>
        <button onclick={save} disabled={foods.length === 0 || saving} class="btn btn-save">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 24px;
    background: oklch(0% 0 0 / 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    animation: fadeIn 0.15s ease-out;
  }

  .modal {
    width: 100%;
    max-width: 360px;
    max-height: 80vh;
    background: oklch(16% 0.012 30 / 0.95);
    backdrop-filter: blur(32px);
    -webkit-backdrop-filter: blur(32px);
    border: 1px solid var(--color-border-glass);
    border-radius: 18px;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(12px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px 0;
  }

  .modal-title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .modal-close {
    color: var(--color-text-softer);
    padding: 4px;
    line-height: 0;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
  }

  .meal-type-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: inherit;
    font-family: inherit;
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.12s;
    margin-bottom: 4px;
  }

  .meal-type-btn:hover {
    background: oklch(70% 0.02 30 / 0.06);
  }

  .meal-type-btn svg {
    color: var(--color-text-softer);
  }

  .meal-emoji {
    font-size: 1.2rem;
  }

  .meal-label {
    font-size: 0.9rem;
    font-weight: 450;
  }

  .meal-picker {
    display: flex;
    gap: 4px;
    margin-bottom: 12px;
    background: oklch(20% 0.015 30 / 0.6);
    border-radius: 10px;
    padding: 5px;
  }

  .meal-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    flex: 1;
    padding: 6px 4px;
    border-radius: 7px;
    font-size: 0.65rem;
    font-weight: 450;
    font-family: inherit;
    color: var(--color-text-dim);
    transition: background 0.12s, color 0.12s;
  }

  .meal-option.selected {
    background: var(--color-accent-subtle);
    color: var(--color-accent);
  }

  .raw-text {
    font-size: 0.72rem;
    color: var(--color-text-softer);
    font-style: italic;
    margin: 4px 0 14px;
    line-height: 1.4;
  }

  .foods-section {
    margin-top: 4px;
  }

  .section-label {
    font-size: 0.68rem;
    font-weight: 500;
    color: var(--color-text-softer);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
    display: block;
  }

  .foods-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 8px;
    min-height: 32px;
  }

  .food-chip {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 5px 9px;
    border-radius: 999px;
    background: var(--color-accent-subtle);
    border: 1px solid oklch(68% 0.13 75 / 0.1);
    font-size: 0.78rem;
    font-weight: 450;
    color: var(--color-text-primary);
  }

  .chip-action {
    color: var(--color-text-softer);
    line-height: 0;
    padding: 2px;
    opacity: 0.4;
    transition: opacity 0.1s, color 0.1s;
  }

  .food-chip:hover .chip-action {
    opacity: 1;
  }

  .chip-action:hover {
    color: var(--color-accent);
  }

  .chip-action.remove:hover {
    color: var(--color-error);
  }

  .food-input {
    background: var(--color-surface-800);
    border: 1px solid var(--color-accent);
    border-radius: 999px;
    padding: 5px 11px;
    color: var(--color-text-primary);
    font-size: 0.78rem;
    font-family: inherit;
    outline: none;
    width: 110px;
  }

  .add-food-form {
    display: flex;
    gap: 6px;
  }

  .add-food-input {
    flex: 1;
    background: var(--color-surface-glass);
    border: 1px solid var(--color-border-glass);
    border-radius: 8px;
    padding: 7px 10px;
    color: var(--color-text-primary);
    font-size: 0.78rem;
    font-family: inherit;
    outline: none;
  }

  .add-food-input:focus {
    border-color: oklch(68% 0.13 75 / 0.3);
  }

  .add-food-input::placeholder {
    color: var(--color-text-softer);
  }

  .add-food-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: var(--color-accent);
    color: var(--color-surface-900);
    flex-shrink: 0;
  }

  .add-food-btn:disabled {
    opacity: 0.3;
  }

  .modal-footer {
    display: flex;
    gap: 8px;
    padding: 12px 20px 18px;
  }

  .btn {
    flex: 1;
    padding: 10px 0;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 450;
    font-family: inherit;
    transition: background 0.12s, opacity 0.12s;
  }

  .btn-cancel {
    background: var(--color-surface-glass);
    color: var(--color-text-dim);
  }

  .btn-save {
    background: var(--color-accent);
    color: var(--color-surface-900);
  }

  .btn-save:disabled {
    opacity: 0.3;
  }
</style>
