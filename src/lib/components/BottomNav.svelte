<script lang="ts">
  import { page } from '$app/stores';

  const items = [
    { path: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/allergens', label: 'Allergens', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z' },
    { path: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
  ];

  let current = $state('/');
  page.subscribe(p => { current = p.url.pathname; });
</script>

<nav class="nav-pill">
  {#each items as item}
    <a
      href={item.path}
      data-sveltekit-preload-data="hover"
      class="nav-item {current === item.path ? 'active' : ''}"
      aria-label={item.label}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        {#each item.icon.split(' M') as segment, i}
          {#if i === 0}
            <path d={segment} />
          {:else}
            <path d={'M' + segment} />
          {/if}
        {/each}
      </svg>
      {#if current === item.path}
        <span class="nav-label">{item.label}</span>
      {/if}
    </a>
  {/each}
</nav>

<style>
  .nav-pill {
    position: fixed;
    bottom: max(16px, env(safe-area-inset-bottom, 16px));
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 5px 8px;
    background: var(--color-surface-glass-strong);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--color-border-glass);
    border-radius: 999px;
    box-shadow: 0 4px 32px oklch(0% 0 0 / 0.35);
    z-index: 100;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border-radius: 999px;
    color: var(--color-text-softer);
    text-decoration: none;
    transition: color 0.2s ease-out, background 0.2s ease-out;
    -webkit-tap-highlight-color: transparent;
  }

  .nav-item.active {
    color: var(--color-accent);
    background: oklch(68% 0.13 75 / 0.12);
  }

  .nav-item:not(.active):active {
    color: var(--color-text-dim);
  }

  .nav-label {
    font-size: 0.72rem;
    font-weight: 450;
  }
</style>
