<template>
  <div
    :class="[
      'inline-flex items-center gap-2.5',
      vertical ? 'flex-col justify-center' : 'flex-row',
      overlay ? 'absolute inset-0 z-20 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-[2px] rounded-[inherit]' : ''
    ]"
    role="status"
    :aria-label="text || 'Loading'"
  >
    <!-- Vector Dual-Ring Momentum Spinner -->
    <div
      class="relative shrink-0 flex items-center justify-center"
      :style="{ width: `${dimension}px`, height: `${dimension}px` }"
    >
      <svg
        class="animate-spin w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style="animation-duration: 0.85s; animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);"
      >
        <!-- Faint Track Ring -->
        <circle
          v-if="track"
          cx="12"
          cy="12"
          r="9.5"
          :stroke="trackColor"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          class="opacity-25"
        />

        <!-- Active Glowing Arc Head -->
        <path
          d="M12 2.5C17.2467 2.5 21.5 6.75329 21.5 12C21.5 14.321 20.6675 16.4478 19.2783 18.1006"
          :stroke="activeColor"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
        />

        <!-- Center accent beacon for md and above -->
        <circle
          v-if="size === 'lg' || size === 'xl'"
          cx="12"
          cy="12"
          r="2"
          :fill="activeColor"
          class="animate-pulse"
        />
      </svg>
    </div>

    <!-- Optional Label -->
    <span
      v-if="text"
      :class="[
        'font-medium tracking-tight select-none leading-none',
        textSizeClass,
        textColorClass
      ]"
    >
      {{ text }}
    </span>

    <span class="sr-only">{{ text || 'Loading...' }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: String,
    default: 'sm', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v),
  },
  color: {
    type: String,
    default: 'primary', // 'primary' | 'white' | 'blue' | 'slate' | 'current'
  },
  text: {
    type: String,
    default: '',
  },
  vertical: {
    type: Boolean,
    default: false,
  },
  track: {
    type: Boolean,
    default: true,
  },
  overlay: {
    type: Boolean,
    default: false,
  },
});

const dimension = computed(() => {
  switch (props.size) {
    case 'xs': return 14;
    case 'sm': return 18;
    case 'md': return 24;
    case 'lg': return 32;
    case 'xl': return 44;
    default: return 18;
  }
});

const strokeWidth = computed(() => {
  switch (props.size) {
    case 'xs': return 3.2;
    case 'sm': return 3;
    case 'md': return 2.8;
    case 'lg': return 2.6;
    case 'xl': return 2.4;
    default: return 3;
  }
});

const activeColor = computed(() => {
  switch (props.color) {
    case 'primary': return '#10b981'; // Emerald/Forest Accent
    case 'blue': return '#3b82f6';
    case 'white': return '#ffffff';
    case 'slate': return '#64748b';
    case 'current': return 'currentColor';
    default: return '#10b981';
  }
});

const trackColor = computed(() => {
  if (props.color === 'white') return '#ffffff';
  if (props.color === 'current') return 'currentColor';
  return '#94a3b8';
});

const textSizeClass = computed(() => {
  switch (props.size) {
    case 'xs': return 'text-[11px]';
    case 'sm': return 'text-xs';
    case 'md': return 'text-sm';
    case 'lg': return 'text-base';
    case 'xl': return 'text-lg';
    default: return 'text-xs';
  }
});

const textColorClass = computed(() => {
  if (props.color === 'white') return 'text-white';
  if (props.color === 'current') return 'text-current';
  return 'text-slate-600 dark:text-slate-300';
});
</script>
