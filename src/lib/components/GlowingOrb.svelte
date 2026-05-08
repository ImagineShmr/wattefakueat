<script lang="ts">
  let { active = false, size = 200 } = $props();
</script>

<div class="orb-wrapper" style="width: {size}px; height: {size}px;">
  <div class="orb {active ? 'orb-active' : 'orb-idle'}">
    <div class="core"></div>
    <div class="ring r1"></div>
    <div class="ring r2"></div>
    <div class="ring r3"></div>
    <div class="glow"></div>
  </div>
</div>

<style>
  .orb-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .orb {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease-out;
  }

  .orb-idle {
    transform: scale(0.92);
  }

  .orb-active {
    transform: scale(1);
  }

  .core {
    position: absolute;
    width: 45%;
    height: 45%;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #ffd966, #e6a800, #b37800);
    box-shadow:
      0 0 40px oklch(68% 0.13 75 / 0.3),
      0 0 80px oklch(68% 0.13 75 / 0.15),
      inset 0 0 20px oklch(90% 0.05 85 / 0.4);
    transition: all 0.5s ease-out;
  }

  .orb-active .core {
    box-shadow:
      0 0 60px oklch(68% 0.13 75 / 0.5),
      0 0 120px oklch(68% 0.13 75 / 0.25),
      inset 0 0 30px oklch(90% 0.05 85 / 0.5);
    animation: core-pulse 1.5s ease-in-out infinite;
  }

  .ring {
    position: absolute;
    inset: 5%;
    border-radius: 50%;
    border: 1.5px solid oklch(68% 0.13 75 / 0.2);
    transition: all 0.5s ease-out;
  }

  .orb-active .ring {
    border-color: oklch(68% 0.13 75 / 0.45);
  }

  .r1 { animation: ring-expand 2.5s ease-out infinite; }
  .r2 { animation: ring-expand 2.5s ease-out 0.6s infinite; }
  .r3 { animation: ring-expand 2.5s ease-out 1.2s infinite; }

  .orb-active .r1 { animation-duration: 1.8s; border-width: 2px; }
  .orb-active .r2 { animation-duration: 1.8s; animation-delay: 0.4s; border-width: 2px; }
  .orb-active .r3 { animation-duration: 1.8s; animation-delay: 0.8s; border-width: 2px; }

  .glow {
    position: absolute;
    inset: -20%;
    border-radius: 50%;
    background: radial-gradient(circle, oklch(68% 0.13 75 / 0.08), transparent 70%);
    opacity: 0;
    transition: opacity 0.5s ease-out;
  }

  .orb-active .glow {
    opacity: 1;
    animation: glow-pulse 2s ease-in-out infinite;
  }

  @keyframes ring-expand {
    0% { transform: scale(0.85); opacity: 0.6; }
    100% { transform: scale(1.25); opacity: 0; }
  }

  @keyframes core-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes glow-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
</style>
