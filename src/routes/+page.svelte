<script lang="ts">
  import Timeline from '$lib/components/Timeline.svelte';
  import { refreshTrigger } from '$lib/stores';

  let searchQuery = $state('');
  let refresh = $state(0);

  refreshTrigger.subscribe(r => refresh = r);
</script>

<div class="home">
  <div class="search-row">
    <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search entries"
      class="search-input"
    />
    {#if searchQuery}
      <button onclick={() => searchQuery = ''} class="clear-btn" aria-label="Clear search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    {/if}
  </div>

  <Timeline {searchQuery} {refreshTrigger} />
</div>

<style>
  .home {
    padding-top: 12px;
  }

  .search-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 16px 16px;
    padding: 9px 12px;
    background: var(--color-surface-glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--color-border-glass);
    border-radius: 10px;
  }

  .search-icon {
    color: var(--color-text-softer);
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: var(--color-text-primary);
    font-size: 0.85rem;
    font-family: inherit;
    min-width: 0;
  }

  .search-input::placeholder {
    color: var(--color-text-softer);
  }

  .clear-btn {
    color: var(--color-text-softer);
    padding: 2px;
    flex-shrink: 0;
    line-height: 0;
  }

  .clear-btn:hover {
    color: var(--color-text-dim);
  }
</style>
