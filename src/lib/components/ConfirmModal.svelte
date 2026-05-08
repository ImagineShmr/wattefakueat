<script lang="ts">
  let {
    show = false,
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    danger = false,
    onConfirm = () => {},
    onCancel = () => {}
  }: {
    show: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  } = $props();

  let closing = $state(false);

  function handleCancel() {
    closing = true;
    setTimeout(() => { closing = false; onCancel(); }, 200);
  }

  function handleConfirm() {
    closing = true;
    setTimeout(() => { closing = false; onConfirm(); }, 200);
  }

  function handleOverlay(e: MouseEvent) {
    if (e.target === e.currentTarget) handleCancel();
  }
</script>

{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="overlay {closing ? 'closing' : ''}"
    onclick={handleOverlay}
    onkeydown={(e) => { if (e.key === 'Escape') handleCancel(); }}
    role="dialog"
    aria-modal="true"
    aria-label={title}
    tabindex="-1"
  >
    <div class="modal {closing ? 'closing' : ''}">
      <div class="icon-wrap {danger ? 'danger' : ''}">
        {#if danger}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        {:else}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        {/if}
      </div>

      <h2 class="modal-title">{title}</h2>
      <p class="modal-desc">{description}</p>

      <div class="actions">
        <button onclick={handleCancel} class="btn btn-cancel">{cancelText}</button>
        <button onclick={handleConfirm} class="btn {danger ? 'btn-danger' : 'btn-confirm'}">{confirmText}</button>
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
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: oklch(0% 0 0 / 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease-out;
  }

  .overlay.closing {
    animation: fadeOut 0.15s ease-in forwards;
  }

  .modal {
    width: 100%;
    max-width: 300px;
    background: oklch(16% 0.012 30 / 0.92);
    backdrop-filter: blur(32px);
    -webkit-backdrop-filter: blur(32px);
    border: 1px solid var(--color-border-glass);
    border-radius: 18px;
    padding: 28px 24px 20px;
    text-align: center;
    animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .modal.closing {
    animation: scaleOut 0.15s ease-in forwards;
  }

  .icon-wrap {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin: 0 auto 16px;
    background: var(--color-accent-subtle);
    color: var(--color-accent);
  }

  .icon-wrap.danger {
    background: oklch(55% 0.15 25 / 0.1);
    color: var(--color-error);
  }

  .modal-title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--color-text-primary);
    margin-bottom: 6px;
    line-height: 1.3;
  }

  .modal-desc {
    font-size: 0.8rem;
    color: var(--color-text-dim);
    line-height: 1.45;
    margin-bottom: 24px;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .btn {
    flex: 1;
    padding: 11px 0;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 450;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s ease-out, opacity 0.15s ease-out;
  }

  .btn-cancel {
    background: var(--color-surface-glass);
    color: var(--color-text-dim);
  }

  .btn-cancel:hover {
    background: oklch(30% 0.02 30 / 0.5);
  }

  .btn-confirm {
    background: var(--color-accent);
    color: var(--color-surface-900);
  }

  .btn-confirm:hover {
    opacity: 0.9;
  }

  .btn-danger {
    background: var(--color-error);
    color: white;
  }

  .btn-danger:hover {
    opacity: 0.9;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes scaleIn {
    from { transform: scale(0.92); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes scaleOut {
    from { transform: scale(1); opacity: 1; }
    to { transform: scale(0.92); opacity: 0; }
  }
</style>
