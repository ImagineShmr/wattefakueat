<script lang="ts">
  import EntryCard from './EntryCard.svelte';
  import EmptyState from './EmptyState.svelte';
  import { getEntries } from '$lib/db/queries';
  import type { FoodEntry } from '$lib/types';
  import { onMount } from 'svelte';

  let { searchQuery = '', refreshTrigger = 0 } = $props();

  let entries = $state<FoodEntry[]>([]);
  let loading = $state(true);

  let filteredEntries = $derived(
    searchQuery
      ? entries.filter(e =>
          e.rawText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.foods.some(f => f.includes(searchQuery.toLowerCase())) ||
          (e.mealType && e.mealType.includes(searchQuery.toLowerCase()))
        )
      : entries
  );

  let grouped = $derived.by(() => {
    const g: Record<string, FoodEntry[]> = {};
    for (const e of filteredEntries) {
      const date = e.timestamp.split('T')[0];
      if (!g[date]) g[date] = [];
      g[date].push(e);
    }
    return g;
  });

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  }

  async function load() {
    loading = true;
    entries = await getEntries(0, 200);
    loading = false;
  }

  $effect(() => {
    if (refreshTrigger > 0) load();
  });

  onMount(load);
</script>

{#if loading}
  <div class="flex justify-center py-20">
    <div class="w-5 h-5 border border-accent/30 border-t-accent rounded-full animate-spin"></div>
  </div>
{:else if Object.keys(grouped).length === 0}
  <div class="empty-wrapper">
    <EmptyState {searchQuery} />
  </div>
{:else}
  <div class="timeline">
    {#each Object.entries(grouped) as [date, dayEntries]}
      <div class="date-group">
        <h3 class="date-label">{formatDate(date)}</h3>
        <div class="entries-list">
          {#each dayEntries as entry (entry.id)}
            <EntryCard {entry} onDeleted={load} />
          {/each}
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .timeline {
    padding: 0 16px 100px;
  }

  .empty-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 64px 20px;
  }

  .date-group {
    margin-bottom: 24px;
  }

  .date-label {
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--color-text-softer);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 10px;
    padding-left: 4px;
  }

  .entries-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
