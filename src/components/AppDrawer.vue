<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[1000] premium-backdrop"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Drawer Panel -->
    <Transition name="drawer-slide">
      <div
        v-if="isOpen"
        ref="panel"
        class="fixed right-0 top-0 z-[1010] h-full w-full max-w-full sm:max-w-[calc(100vw-24px)] flex flex-col border-l premium-drawer"
        :style="{ width: 'min(100vw, ' + width + ')', borderColor: 'hsl(var(--neutral-100))', backgroundColor: 'hsl(var(--bg-surface))' }"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
      >
        <!-- Header -->
        <header
          class="flex items-start justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3.5 sm:pb-4 shrink-0 border-b"
          style="border-color: hsl(var(--neutral-100));"
        >
          <div class="flex-1 min-w-0 pr-4">
            <h3 class="text-base sm:text-lg font-semibold leading-snug" style="color: hsl(var(--neutral-900));">{{ title }}</h3>
            <p v-if="subtitle" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5" style="color: hsl(var(--neutral-400));">{{ subtitle }}</p>
          </div>

          <button
            @click="$emit('close')"
            class="w-8 h-8 flex items-center justify-center rounded-[8px] shrink-0 transition-colors duration-80 mt-0.5 btn-icon"
            aria-label="Close"
          >
            <PhX :size="16" weight="bold" />
          </button>
        </header>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
          <slot />
        </div>

        <!-- Footer -->
        <footer
          v-if="$slots.footer"
          class="px-4 sm:px-6 py-3.5 sm:py-4 border-t flex flex-wrap items-center justify-end gap-2.5 shrink-0"
          style="border-color: hsl(var(--neutral-100));"
        >
          <slot name="footer" />
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { nextTick, onUnmounted, ref, watch } from 'vue';
import { PhX } from '@phosphor-icons/vue';

const props = defineProps({
  isOpen:   { type: Boolean, required: true },
  title:    { type: String,  default: '' },
  subtitle: { type: String,  default: '' },
  width:    { type: String,  default: '520px' },
});

const emit = defineEmits(['close']);
const panel = ref(null);
const previousFocus = ref(null);
const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.isOpen) emit('close');
  if (event.key !== 'Tab' || !panel.value) return;
  const focusable = [...panel.value.querySelectorAll(focusableSelector)];
  if (!focusable.length) { event.preventDefault(); panel.value.focus(); return; }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
};

watch(() => props.isOpen, async (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : '';
  if (isOpen) {
    previousFocus.value = document.activeElement;
    window.addEventListener('keydown', handleKeydown);
    await nextTick();
    (panel.value?.querySelector(focusableSelector) || panel.value)?.focus();
  } else {
    window.removeEventListener('keydown', handleKeydown);
    previousFocus.value?.focus?.();
  }
}, { immediate: true });

onUnmounted(() => {
  document.body.style.overflow = '';
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.backdrop-enter-active { transition: opacity 200ms ease; }
.backdrop-leave-active { transition: opacity 150ms ease; }
.backdrop-enter-from,
.backdrop-leave-to     { opacity: 0; }

.drawer-slide-enter-active { transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1); }
.drawer-slide-leave-active { transition: transform 150ms cubic-bezier(0.4, 0, 1, 1); }
.drawer-slide-enter-from   { transform: translateX(100%); }
.drawer-slide-leave-to     { transform: translateX(100%); }
</style>
