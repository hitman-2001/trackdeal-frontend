<template>
  <div aria-live="polite">
    <!-- ── 1. Top Horizon Ambient Progress Beam ─────────────────────── -->
    <Transition name="beam-fade">
      <div
        v-if="showSpinner"
        class="fixed top-0 left-0 right-0 z-[99999] h-[2.5px] overflow-hidden bg-blue-950/20 dark:bg-blue-950/40 pointer-events-none"
      >
        <div class="horizon-beam" />
      </div>
    </Transition>

    <!-- ── 2. Centered Backdrop Blur & Glassmorphic Loader Card ───── -->
    <Transition name="center-modal">
      <div
        v-if="showSpinner && showCenterLoader"
        class="fixed inset-0 z-[99998] flex items-center justify-center p-4 select-none bg-slate-900/30 dark:bg-black/60 backdrop-blur-md transition-all duration-300"
      >
        <!-- Glassmorphic Center Card -->
        <div
          class="relative flex flex-col items-center justify-center gap-4 px-8 py-7 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/60 dark:border-slate-800/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] min-w-[220px] max-w-[320px] text-center transform transition-all duration-300"
        >
          <!-- Ambient Glow Radial Ring behind Spinner -->
          <div
            class="absolute w-32 h-32 -top-2 rounded-full bg-blue-500/15 dark:bg-blue-500/25 blur-xl pointer-events-none"
          />

          <!-- Brand TD Monogram with Orbiting Momentum Spinner Ring -->
          <div class="relative flex items-center justify-center w-20 h-20 my-1">
            <!-- Outer Spinning Gradient Ring -->
            <svg
              class="absolute inset-0 w-full h-full animate-spin"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style="animation-duration: 1.1s; animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);"
            >
              <!-- Faint Guide Track -->
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                stroke-width="3"
                class="text-slate-200/80 dark:text-slate-800/80"
              />

              <!-- Active Glowing Blue Arc -->
              <path
                d="M 40 6 A 34 34 0 0 1 74 40 A 34 34 0 0 1 54 71"
                stroke="url(#spinner-blue-gradient)"
                stroke-width="3.5"
                stroke-linecap="round"
              />

              <!-- Gradient Definition -->
              <defs>
                <linearGradient id="spinner-blue-gradient" x1="40" y1="6" x2="74" y2="71" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#0a6ef0" />
                  <stop offset="0.6" stop-color="#0056cc" />
                  <stop offset="1" stop-color="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>

            <!-- Centered TD Logo Mark -->
            <div class="relative z-10 w-11 h-11 flex items-center justify-center transition-transform">
              <img
                :src="isDarkMode ? '/trackdeal_mark_dark.png' : '/trackdeal_mark.png'"
                alt="TrackDeal"
                class="w-full h-full object-contain filter drop-shadow-sm select-none"
              />
            </div>
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
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/70 dark:border-blue-800/60 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            <span>{{ badgeText }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { activeApiRequests } from '@/api/client';

const store = useStore();
const isDarkMode = computed(() => store?.state?.ui?.activeThemeMode === 'dark');

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
    #0a6ef0 50%,
    #38bdf8 80%,
    #93c5fd 100%
  );
  box-shadow: 0 0 12px rgba(10, 110, 240, 0.7), 0 0 4px rgba(56, 189, 248, 0.9);
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
