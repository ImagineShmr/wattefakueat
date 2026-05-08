<script lang="ts">
  import { MEAL_EMOJI, type FoodEntry } from '$lib/types';
  import { deleteEntry } from '$lib/db/queries';
  import ConfirmModal from './ConfirmModal.svelte';
  import EditEntry from './EditEntry.svelte';

  let { entry, onDeleted = () => {} }: { entry: FoodEntry; onDeleted?: () => void } = $props();

  let showMenu = $state(false);
  let showDeleteModal = $state(false);
  let showEditModal = $state(false);
  let deleting = $state(false);

  let formattedTime = $derived(new Date(entry.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  }));

  async function confirmDelete() {
    showDeleteModal = false;
    deleting = true;
    try {
      await deleteEntry(entry.id);
      onDeleted();
    } catch {
      deleting = false;
    }
  }

  function toggleMenu(e: MouseEvent) {
    e.stopPropagation();
    showMenu = !showMenu;
  }

  function handleEdit() {
    showMenu = false;
    showEditModal = true;
  }

  function handleDeleteClick() {
    showMenu = false;
    showDeleteModal = true;
  }

  function handleSaved() {
    showEditModal = false;
    onDeleted();
  }
</script>

<div class="entry-card">
  <div class="card-header">
    <div class="header-left">
      <span class="meal-emoji">{MEAL_EMOJI[entry.mealType ?? 'snack'] ?? '🍽️'}</span>
      <span class="meal-name">{entry.mealType ?? 'snack'}</span>
    </div>
    <div class="header-right">
      <span class="time">{formattedTime}</span>
      <div class="menu-wrap">
        <button
          onclick={toggleMenu}
          class="menu-btn"
          aria-label="Actions"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
          </svg>
        </button>
        {#if showMenu}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div onclick={() => showMenu = false} class="menu-backdrop"></div>
          <div class="menu-dropdown" role="menu">
            <button onclick={handleEdit} class="menu-item" role="menuitem">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
            <div class="menu-divider"></div>
            <button onclick={handleDeleteClick} class="menu-item danger" role="menuitem">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Delete
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="food-chips">
    {#each entry.foods as food}
      <span class="chip">{food}</span>
    {/each}
  </div>


</div>

<ConfirmModal
  show={showDeleteModal}
  title="Delete this entry?"
  description="This will permanently remove '{entry.rawText || entry.foods.join(', ')}' from your log."
  confirmText="Delete"
  danger
  onCancel={() => showDeleteModal = false}
  onConfirm={confirmDelete}
/>

<EditEntry
  {entry}
  show={showEditModal}
  onSaved={handleSaved}
  onCancel={() => showEditModal = false}
/>

<style>
  .entry-card {
    background: var(--color-surface-glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--color-border-glass);
    border-radius: 14px;
    padding: 14px 16px;
    transition: border-color 0.2s ease-out;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 6px;
    position: relative;
  }

  .meal-emoji {
    font-size: 1rem;
  }

  .meal-name {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--color-text-primary);
    text-transform: capitalize;
  }

  .time {
    font-size: 0.7rem;
    color: var(--color-text-softer);
    font-variant-numeric: tabular-nums;
  }

  .menu-wrap {
    position: relative;
  }

  .menu-btn {
    color: var(--color-text-softer);
    padding: 4px;
    line-height: 0;
    border-radius: 6px;
    transition: color 0.15s, background 0.15s;
  }

  .menu-btn:hover {
    color: var(--color-text-primary);
    background: oklch(70% 0.02 30 / 0.08);
  }

  .menu-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10;
  }

  .menu-dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 4px);
    min-width: 120px;
    background: oklch(18% 0.015 30 / 0.95);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--color-border-glass);
    border-radius: 10px;
    padding: 4px;
    z-index: 20;
    box-shadow: 0 8px 32px oklch(0% 0 0 / 0.4);
    animation: menuIn 0.1s ease-out;
  }

  @keyframes menuIn {
    from { opacity: 0; transform: translateY(-3px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 7px;
    width: 100%;
    padding: 7px 9px;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 450;
    font-family: inherit;
    color: var(--color-text-primary);
    text-align: left;
    transition: background 0.1s;
  }

  .menu-item:hover {
    background: oklch(70% 0.02 30 / 0.08);
  }

  .menu-item.danger {
    color: var(--color-error);
  }

  .menu-item.danger:hover {
    background: oklch(55% 0.15 25 / 0.1);
  }

  .menu-divider {
    height: 1px;
    background: var(--color-border-glass);
    margin: 3px 8px;
  }

  .food-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 6px;
  }

  .chip {
    font-size: 0.76rem;
    padding: 3px 10px;
    border-radius: 999px;
    background: oklch(68% 0.13 75 / 0.08);
    color: var(--color-accent);
    border: 1px solid oklch(68% 0.13 75 / 0.1);
    font-weight: 450;
  }

</style>
