<script lang="ts">
  import '../app.css';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import VoiceInput from '$lib/components/VoiceInput.svelte';
  import { showVoiceInput, refreshTrigger } from '$lib/stores';

  let { children }: { children: () => any } = $props();

  let voiceOpen = $state(false);
  showVoiceInput.subscribe(v => voiceOpen = v);

  function onSaved() {
    refreshTrigger.update(n => n + 1);
    showVoiceInput.set(false);
  }
</script>

<svelte:head>
  <meta name="theme-color" content="#1a1410" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍽️</text></svg>" />
</svelte:head>

<div class="app-shell">
  <header class="app-header">
    <div class="header-inner">
      <h1 class="app-title">Wattefakueat</h1>
      <span class="header-accent"></span>
    </div>
  </header>

  <main class="app-main">
    {@render children()}
  </main>

  {#if !voiceOpen}
    <button
      onclick={() => showVoiceInput.set(true)}
      class="fab"
      aria-label="Add entry"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="22"/>
        <line x1="9" y1="22" x2="15" y2="22"/>
      </svg>
    </button>
  {/if}

  <BottomNav />
</div>

{#if voiceOpen}
  <VoiceInput onSaved={onSaved} onClose={() => showVoiceInput.set(false)} />
{/if}

<style>
  .app-shell {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  .app-header {
    position: sticky;
    top: 0;
    z-index: 50;
    padding: 18px 20px 14px;
    background: linear-gradient(180deg, var(--color-surface-900) 60%, transparent);
  }

  .header-inner {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  .app-title {
    font-family: var(--font-family-brand);
    font-size: 1.5rem;
    font-weight: 400;
    color: var(--color-accent);
    letter-spacing: 0.02em;
    line-height: 1;
  }

  .header-accent {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--color-accent) 0%, transparent 100%);
    opacity: 0.15;
  }

  .app-main {
    flex: 1;
  }

  .fab {
    position: fixed;
    bottom: calc(80px + max(16px, env(safe-area-inset-bottom, 16px)));
    left: 50%;
    transform: translateX(-50%);
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: var(--color-accent);
    color: var(--color-surface-900);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 24px var(--color-accent-glow);
    z-index: 90;
    transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
  }

  .fab:active {
    transform: translateX(-50%) scale(0.92);
    box-shadow: 0 2px 12px var(--color-accent-glow);
  }
</style>
