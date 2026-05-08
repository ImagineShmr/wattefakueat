<script lang="ts">
  import { getAllergens, removeAllergen, addAllergen, updateAllergen } from '$lib/db/queries';
  import { onMount } from 'svelte';
  import type { Allergen } from '$lib/types';

  let allergens = $state<Allergen[]>([]);
  let newAllergen = $state('');
  let adding = $state(false);
  let editing: number | null = $state(null);
  let editValue = $state('');
  let menuOpen: number | null = $state(null);

  async function load() {
    allergens = await getAllergens();
  }

  async function handleAdd() {
    const name = newAllergen.trim().toLowerCase();
    if (!name || adding) return;
    if (allergens.some(a => a.foodName === name)) {
      newAllergen = '';
      return;
    }
    adding = true;
    await addAllergen(name);
    newAllergen = '';
    await load();
    adding = false;
  }

  async function handleRemove(id: number) {
    menuOpen = null;
    await removeAllergen(id);
    await load();
  }

  function toggleMenu(id: number) {
    menuOpen = menuOpen === id ? null : id;
  }

  function startEdit(id: number, name: string) {
    menuOpen = null;
    editing = id;
    editValue = name;
  }

  async function confirmEdit() {
    const name = editValue.trim().toLowerCase();
    if (!name || editing === null) { cancelEdit(); return; }
    await updateAllergen(editing, name);
    editing = null;
    editValue = '';
    await load();
  }

  function cancelEdit() {
    editing = null;
    editValue = '';
  }

  function handleEditKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') confirmEdit();
    if (e.key === 'Escape') cancelEdit();
  }

  function handleOverlayClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.menu-btn') && !target.closest('.menu-dropdown')) {
      menuOpen = null;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleOverlayClick);
    return () => document.removeEventListener('click', handleOverlayClick);
  });

  onMount(load);
</script>

<div class="allergens-page">
  <div class="page-heading">
    <h1 class="page-title">Allergens</h1>
    <p class="page-desc">Flagged foods trigger a warning when you log them</p>
  </div>

  <form onsubmit={(e) => { e.preventDefault(); handleAdd(); }} class="add-form">
    <input
      type="text"
      bind:value={newAllergen}
      placeholder="Add a food to watch"
      class="input"
    />
    <button type="submit" disabled={!newAllergen.trim() || adding} class="add-btn" aria-label="Add">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>
  </form>

  {#if allergens.length === 0}
    <div class="empty-wrap">
      <div class="empty-icon">i</div>
      <p class="empty-text">No foods watched yet</p>
      <p class="empty-sub">Add foods you suspect may cause reactions</p>
    </div>
  {:else}
    <div class="list">
      {#each allergens as a (a.id)}
        <div class="allergen-card">
          <div class="card-left">
            <span class="alert-dot"></span>
            {#if editing === a.id}
              <input
                type="text"
                bind:value={editValue}
                onkeydown={handleEditKeydown}
                onblur={confirmEdit}
                class="edit-input"
              />
            {:else}
              <span class="food-name">{a.foodName}</span>
            {/if}
          </div>
          <div class="card-right">
            <button
              onclick={(e) => { e.stopPropagation(); toggleMenu(a.id); }}
              class="menu-btn"
              aria-label="Actions for {a.foodName}"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
              </svg>
            </button>
            {#if menuOpen === a.id}
              <div class="menu-dropdown" role="menu">
                <button
                  onclick={(e) => { e.stopPropagation(); startEdit(a.id, a.foodName); }}
                  class="menu-item"
                  role="menuitem"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Rename
                </button>
                <div class="menu-divider"></div>
                <button
                  onclick={(e) => { e.stopPropagation(); handleRemove(a.id); }}
                  class="menu-item danger"
                  role="menuitem"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  Remove
                </button>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .allergens-page {
    padding: 4px 16px 100px;
  }

  .page-heading {
    margin-bottom: 20px;
    padding-left: 4px;
  }

  .page-title {
    font-size: 1.3rem;
    font-weight: 500;
    color: var(--color-text-primary);
    letter-spacing: -0.01em;
    margin-bottom: 3px;
  }

  .page-desc {
    font-size: 0.75rem;
    color: var(--color-text-softer);
    line-height: 1.4;
  }

  .add-form {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }

  .input {
    flex: 1;
    background: var(--color-surface-glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--color-border-glass);
    border-radius: 10px;
    padding: 10px 14px;
    color: var(--color-text-primary);
    font-size: 0.85rem;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s ease-out;
  }

  .input:focus {
    border-color: oklch(68% 0.13 75 / 0.3);
  }

  .input::placeholder {
    color: var(--color-text-softer);
  }

  .add-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: var(--color-accent);
    color: var(--color-surface-900);
    flex-shrink: 0;
    transition: opacity 0.15s;
  }

  .add-btn:disabled {
    opacity: 0.3;
  }

  .empty-wrap {
    text-align: center;
    padding: 48px 20px;
  }

  .empty-icon {
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: oklch(55% 0.15 25 / 0.08);
    color: var(--color-error);
    font-size: 0.75rem;
    font-weight: 600;
    font-style: italic;
    margin-bottom: 12px;
  }

  .empty-text {
    font-size: 0.9rem;
    font-weight: 450;
    color: var(--color-text-dim);
    margin-bottom: 4px;
  }

  .empty-sub {
    font-size: 0.75rem;
    color: var(--color-text-softer);
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .allergen-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: var(--color-surface-glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--color-border-glass);
    border-radius: 10px;
    position: relative;
  }

  .allergen-card:hover {
    border-color: oklch(55% 0.15 25 / 0.2);
  }

  .card-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    flex: 1;
  }

  .card-right {
    position: relative;
    flex-shrink: 0;
  }

  .alert-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-error);
    flex-shrink: 0;
  }

  .food-name {
    font-size: 0.85rem;
    font-weight: 450;
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .edit-input {
    flex: 1;
    background: var(--color-surface-800);
    border: 1px solid var(--color-accent);
    border-radius: 6px;
    padding: 4px 8px;
    color: var(--color-text-primary);
    font-size: 0.85rem;
    font-family: inherit;
    outline: none;
    min-width: 0;
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

  .menu-dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 4px);
    min-width: 140px;
    background: oklch(18% 0.015 30 / 0.95);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--color-border-glass);
    border-radius: 10px;
    padding: 4px;
    z-index: 30;
    box-shadow: 0 8px 32px oklch(0% 0 0 / 0.4);
    animation: menuIn 0.12s ease-out;
  }

  @keyframes menuIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 0.8rem;
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
</style>
