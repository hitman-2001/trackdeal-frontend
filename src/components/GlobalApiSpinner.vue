<template>
  <div aria-live="polite">
    <!-- ── 1. Top Horizon Ambient Progress Beam ─────────────────────── -->
    <Transition name="beam-fade">
      <div
        v-if="showSpinner"
        class="fixed top-0 left-0 right-0 z-[99999] h-[2.5px] overflow-hidden bg-emerald-950/20 dark:bg-emerald-950/40 pointer-events-none"
      >
        <div class="horizon-beam" />
      </div>
    </Transition>

    <!-- ── 2. Centered Backdrop Blur & Glassmorphic Loader Card ───── -->
    <Transition name="center-modal">
      <div
        v-if="showSpinner && showCenterLoader"
        class="fixed inset-0 z-[99998] flex items-center justify-center p-4 select-none bg-slate-900/25 dark:bg-black/50 backdrop-blur-md transition-all duration-300"
      >
        <!-- Glassmorphic Center Card -->
        <div
          class="relative flex flex-col items-center justify-center gap-4 px-8 py-7 rounded-2xl sm:rounded-3xl bg-white/92 dark:bg-slate-900/92 backdrop-blur-2xl border border-white/60 dark:border-slate-800/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] min-w-[210px] max-w-[320px] text-center transform transition-all duration-300"
        >
          <!-- Ambient Glow Radial Ring behind Spinner -->
          <div
            class="absolute w-28 h-28 -top-4 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 blur-xl pointer-events-none"
          />

          <!-- High Quality Dual-Ring Momentum Spinner -->
          <div class="relative flex items-center justify-center w-12 h-12">
            <svg
              class="w-12 h-12 animate-spin"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style="animation-duration: 0.9s; animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);"
            >
              <!-- Faint Guide Track -->
              <circle
                cx="24"
                cy="24"
                r="19"
                stroke="currentColor"
                stroke-width="3.5"
                stroke-linecap="round"
                class="text-slate-200 dark:text-slate-800 opacity-60"
              />

              <!-- Active Glowing Emerald Arc -->
              <path
                d="M24 5C34.4934 5 43 13.5066 43 24C43 28.642 39.335 32.8956 36.5566 36.2012"
                stroke="url(#emerald-gradient)"
                stroke-width="3.5"
                stroke-linecap="round"
              />

              <!-- Gradient Definition -->
              <defs>
                <linearGradient id="emerald-gradient" x1="24" y1="5" x2="43" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#10b981" />
                  <stop offset="0.6" stop-color="#254e3b" />
                  <stop offset="1" stop-color="#34d399" />
                </linearGradient>
              </defs>
            </svg>

            <!-- Inner Pulsing Core Dot -->
            <div class="absolute w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>

          <!-- Typography Content -->
          <div class="space-y-1">
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {{ titleText }}
            </h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {{ subtitleText }}
            </p>
          </div>

          <!-- Pill Status Chip -->
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/60 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>{{ badgeText }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { activeApiRequests } from '@/api/client';

const showSpinner = ref(false);
const showCenterLoader = ref(false);
let delayTimer = null;
let minDisplayTimer = null;

const requestCount = computed(() => activeApiRequests.value);

const titleText = computed(() => {
  if (requestCount.value > 1) {
    return 'Resolving Requests';
  }
  return 'Resolving...';
});

const subtitleText = computed(() => {
  if (requestCount.value > 1) {
    return `${requestCount.value} operations in progress`;
  }
  return 'Please wait a moment';
});

const badgeText = computed(() => {
  if (requestCount.value > 1) {
    return 'Synchronizing';
  }
  return 'Processing';
});

watch(
  () => activeApiRequests.value > 0,
  (isBusy) => {
    if (isBusy) {
      showSpinner.value = true;
      clearTimeout(minDisplayTimer);

      // Show the centered backdrop loader if request takes longer than 120ms (prevents flicker on sub-frame cache hits)
      if (!delayTimer) {
        delayTimer = setTimeout(() => {
          if (activeApiRequests.value > 0) {
            showCenterLoader.value = true;
          }
        }, 120);
      }
    } else {
      clearTimeout(delayTimer);
      delayTimer = null;

      // Graceful 250ms hold so transitions look smooth and deliberate
      minDisplayTimer = setTimeout(() => {
        showSpinner.value = false;
        showCenterLoader.value = false;
      }, 250);
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  clearTimeout(delayTimer);
  clearTimeout(minDisplayTimer);
});
</script>

<style scoped>
/* ── Top Beam Progress Slide ──────────────────────────────────── */
.horizon-beam {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 40%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #10b981 50%,
    #34d399 80%,
    #6ee7b7 100%
  );
  box-shadow: 0 0 12px #10b981, 0 0 4px #34d399;
  border-radius: 9999px;
  animation: beam-slide 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes beam-slide {
  0% {
    left: -40%;
    width: 30%;
  }
  50% {
    width: 60%;
  }
  100% {
    left: 100%;
    width: 30%;
  }
}

/* ── Transitions ──────────────────────────────────────────────── */
.beam-fade-enter-active,
.beam-fade-leave-active {
  transition: opacity 0.3s ease;
}
.beam-fade-enter-from,
.beam-fade-leave-to {
  opacity: 0;
}

/* Centered Modal Backdrop & Card Transition */
.center-modal-enter-active {
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.center-modal-enter-active > div {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out;
}

.center-modal-leave-active {
  transition: opacity 0.22s ease-in;
}
.center-modal-leave-active > div {
  transition: transform 0.2s ease-in, opacity 0.2s ease-in;
}

.center-modal-enter-from {
  opacity: 0;
}
.center-modal-enter-from > div {
  opacity: 0;
  transform: scale(0.92) translateY(8px);
}

.center-modal-leave-to {
  opacity: 0;
}
.center-modal-leave-to > div {
  opacity: 0;
  transform: scale(0.94) translateY(4px);
}
</style>
