<script lang="ts">
  import { getDb, clearDb, importDb } from '$lib/db';
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';

  let exportSuccess = $state(false);
  let showClearModal = $state(false);
  let importing = $state(false);
  let importResult: { entries: number; allergens: number } | null = $state(null);
  let importError = $state('');

  async function handleExport() {
    exportSuccess = false;
    try {
      const db = await getDb();
      const data = db.export();
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wattefakueat-${new Date().toISOString().split('T')[0]}.sqlite`;
      a.click();
      URL.revokeObjectURL(url);
      exportSuccess = true;
      setTimeout(() => exportSuccess = false, 3000);
    } catch {}
  }

  function handleImport() {
    importError = '';
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.sqlite,.db';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      importing = true;
      try {
        const buffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(buffer);
        const result = await importDb(uint8);
        importResult = result;
      } catch (e) {
        importError = 'Failed to import: ' + (e instanceof Error ? e.message : 'invalid file');
      } finally {
        importing = false;
      }
    };
    input.click();
  }

  function dismissImportResult() {
    importResult = null;
    window.location.reload();
  }

  async function handleClear() {
    showClearModal = true;
  }

  async function confirmClear() {
    showClearModal = false;
    await clearDb();
    window.location.reload();
  }
</script>

<div class="settings-page">
  <div class="page-heading">
    <h1 class="page-title">Settings</h1>
  </div>

  <div class="section">
    <h2 class="section-label">Data</h2>
    <div class="glass-card">
      <button onclick={handleExport} class="action-row">
        <div class="action-left">
          <div class="action-icon export-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>
          <div class="action-text">
            <span class="action-title">Export Database</span>
            <span class="action-desc">Download a .sqlite backup file</span>
          </div>
        </div>
        {#if exportSuccess}
          <span class="badge badge-success">Exported</span>
        {/if}
      </button>

      <div class="divider"></div>

      <button onclick={handleImport} class="action-row">
        <div class="action-left">
          <div class="action-icon import-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 5 17 10"/><line x1="12" y1="5" x2="12" y2="15"/></svg>
          </div>
          <div class="action-text">
            <span class="action-title">Import Database</span>
            <span class="action-desc">Restore from a backup file</span>
          </div>
        </div>
        {#if importing}
          <div class="spinner"></div>
        {:else if importError}
          <span class="badge badge-error">{importError}</span>
        {/if}
      </button>
    </div>
  </div>

  <div class="section">
    <h2 class="section-label">Danger</h2>
    <div class="glass-card danger-card">
      <button onclick={handleClear} class="action-row">
        <div class="action-left">
          <div class="action-icon danger-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </div>
          <div class="action-text">
            <span class="action-title">Clear All Data</span>
            <span class="action-desc">Remove all entries and reset the database</span>
          </div>
        </div>
      </button>
    </div>
  </div>

  <div class="section">
    <h2 class="section-label">About</h2>
    <div class="glass-card about-card">
      <div class="about-row">
        <span class="about-key">Version</span>
        <span class="about-value">0.1.0</span>
      </div>
      <div class="divider"></div>
      <div class="about-row">
        <span class="about-key">Storage</span>
        <span class="about-value">Local only</span>
      </div>
    </div>
  </div>
</div>

<ConfirmModal
  show={showClearModal}
  title="Clear all data?"
  description="This will permanently delete every entry and reset the database. Your data cannot be recovered."
  confirmText="Clear everything"
  danger
  onCancel={() => showClearModal = false}
  onConfirm={confirmClear}
/>

{#if importing}
  <div class="import-overlay">
    <div class="import-modal">
      <div class="w-6 h-6 border border-accent/30 border-t-accent rounded-full animate-spin mb-4"></div>
      <p class="text-text-primary text-sm font-450">Importing database</p>
      <p class="text-text-softer text-xs mt-1">This will take a moment</p>
    </div>
  </div>
{/if}

{#if importResult}
  <div class="import-overlay">
    <div class="import-modal">
      <div class="icon-wrap success-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h3 class="text-text-primary text-sm font-500 mb-2">Import complete</h3>
      <div class="import-stats">
        <div class="stat-row">
          <span class="stat-label">Entries</span>
          <span class="stat-value">{importResult.entries}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Allergens</span>
          <span class="stat-value">{importResult.allergens}</span>
        </div>
      </div>
      <button onclick={dismissImportResult} class="import-dismiss">Reload</button>
    </div>
  </div>
{/if}

<style>
  .settings-page {
    padding: 4px 16px 100px;
  }

  .page-heading {
    margin-bottom: 24px;
    padding-left: 4px;
  }

  .page-title {
    font-size: 1.3rem;
    font-weight: 500;
    color: var(--color-text-primary);
    letter-spacing: -0.01em;
  }

  .section {
    margin-bottom: 24px;
  }

  .section-label {
    font-size: 0.65rem;
    font-weight: 500;
    color: var(--color-text-softer);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 8px;
    padding-left: 4px;
  }

  .glass-card {
    background: var(--color-surface-glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--color-border-glass);
    border-radius: 14px;
    overflow: hidden;
  }

  .action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding: 14px 16px;
    text-align: left;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    cursor: pointer;
    transition: background 0.15s ease-out;
  }

  .action-row:hover {
    background: oklch(70% 0.02 30 / 0.04);
  }

  .action-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .action-icon {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .export-icon {
    background: oklch(68% 0.13 75 / 0.1);
    color: var(--color-accent);
  }

  .import-icon {
    background: oklch(62% 0.1 150 / 0.1);
    color: var(--color-success);
  }

  .danger-icon {
    background: oklch(55% 0.15 25 / 0.1);
    color: var(--color-error);
  }

  .action-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .action-title {
    font-size: 0.85rem;
    font-weight: 450;
    color: var(--color-text-primary);
  }

  .action-desc {
    font-size: 0.72rem;
    color: var(--color-text-softer);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .badge {
    font-size: 0.68rem;
    font-weight: 450;
    padding: 2px 8px;
    border-radius: 999px;
    flex-shrink: 0;
  }

  .badge-success {
    background: oklch(62% 0.1 150 / 0.12);
    color: var(--color-success);
  }

  .badge-error {
    background: oklch(55% 0.15 25 / 0.12);
    color: var(--color-error);
  }

  .divider {
    height: 1px;
    background: var(--color-border-glass);
    margin: 0 16px;
  }

  .danger-card {
    border-color: oklch(55% 0.15 25 / 0.15);
  }

  .about-card {
    padding: 4px 0;
  }

  .about-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
  }

  .about-key {
    font-size: 0.82rem;
    color: var(--color-text-softer);
  }

  .about-value {
    font-size: 0.82rem;
    color: var(--color-text-primary);
    font-weight: 450;
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid oklch(62% 0.1 150 / 0.2);
    border-top-color: var(--color-success);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .import-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: oklch(0% 0 0 / 0.5);
    backdrop-filter: blur(4px);
  }

  .import-modal {
    background: oklch(16% 0.012 30 / 0.95);
    backdrop-filter: blur(32px);
    border: 1px solid var(--color-border-glass);
    border-radius: 18px;
    padding: 32px 28px 24px;
    text-align: center;
    max-width: 260px;
    width: 100%;
  }

  .icon-wrap {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin: 0 auto 14px;
  }

  .success-icon {
    background: oklch(62% 0.1 150 / 0.1);
    color: var(--color-success);
  }

  .import-stats {
    margin: 12px 0 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 12px;
    background: oklch(70% 0.02 30 / 0.04);
    border-radius: 6px;
  }

  .stat-label {
    font-size: 0.78rem;
    color: var(--color-text-dim);
  }

  .stat-value {
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .import-dismiss {
    width: 100%;
    padding: 10px 0;
    border-radius: 10px;
    background: var(--color-accent);
    color: var(--color-surface-900);
    font-size: 0.85rem;
    font-weight: 500;
    font-family: inherit;
    transition: opacity 0.15s;
  }

  .import-dismiss:hover {
    opacity: 0.9;
  }
</style>
