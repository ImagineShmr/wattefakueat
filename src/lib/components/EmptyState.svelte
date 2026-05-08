<script lang="ts">
  let { searchQuery = '' } = $props();
</script>

<svg class="empty-illustration" width="120" height="120" viewBox="0 0 120 120" fill="none">
  <circle cx="60" cy="60" r="48" stroke="oklch(68% 0.13 75 / 0.12)" stroke-width="1.5"/>
  <circle cx="60" cy="60" r="36" stroke="oklch(68% 0.13 75 / 0.08)" stroke-width="1"/>
  <path d="M40 60 L52 72 L80 44" stroke="oklch(68% 0.13 75 / 0.2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="48" cy="48" r="2.5" fill="oklch(68% 0.13 75 / 0.25)"/>
  <circle cx="72" cy="72" r="2.5" fill="oklch(68% 0.13 75 / 0.25)"/>
  <path d="M30 40 Q 60 28 90 40" stroke="oklch(68% 0.13 75 / 0.1)" stroke-width="1" fill="none" stroke-linecap="round"/>
  <path d="M30 80 Q 60 92 90 80" stroke="oklch(68% 0.13 75 / 0.1)" stroke-width="1" fill="none" stroke-linecap="round"/>
</svg>

{#if searchQuery}
  <h3 class="empty-title">No results for "{searchQuery}"</h3>
  <p class="empty-desc">Try a different word or check the spelling</p>
{:else}
  <h3 class="empty-title">No entries yet</h3>
  <p class="empty-desc">Tap the gold mic button to log your first meal</p>
{/if}

<style>
  .empty-illustration {
    display: block;
    margin: 0 auto 20px;
  }

  .empty-title {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--color-text-dim);
    text-align: center;
    margin-bottom: 6px;
  }

  .empty-desc {
    font-size: 0.78rem;
    color: var(--color-text-softer);
    text-align: center;
    line-height: 1.5;
  }
</style>
