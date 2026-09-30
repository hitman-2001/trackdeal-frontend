<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="isOpen"
        class="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto premium-backdrop"
        :style="{ zIndex: Number(zIndex) }"
        @click.self="$emit('cancel')"
      >
        <!-- Modal Dialog (Bottom sheet on mobile, Centered on desktop) -->
        <Transition name="modal-spring">
          <div
            v-if="isOpen"
            ref="panel"
            class="relative border premium-modal flex flex-col w-full max-w-full sm:my-auto rounded-t-[26px] sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh]"
            :style="{ zIndex: Number(zIndex) + 10, maxWidth: maxSize, backgroundColor: 'hsl(var(--bg-surface))', borderColor: 'hsl(var(--neutral-100))' }"
            role="dialog"
            aria-modal="true"
            :aria-label="title"
            tabindex="-1"
          >
            <!-- Mobile Drag Handle -->
            <div class="sm:hidden flex justify-center pt-3 pb-1 shrink-0" @click="$emit('cancel')">
              <div class="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
            </div>

            <!-- Header -->
            <div
              class="flex items-start justify-between px-4 sm:px-6 pt-3 sm:pt-5 pb-3 sm:pb-4 border-b shrink-0"
              style="border-color: hsl(var(--neutral-100));"
            >
              <div class="flex-1 min-w-0 pr-4">
                <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{{ title }}</h3>
                <p v-if="subtitle" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ subtitle }}</p>
              </div>
              <button
                @click="$emit('cancel')"
                class="w-8 h-8 flex items-center justify-center rounded-full sm:rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                aria-label="Close"
              >
                <PhX :size="16" weight="bold" />
              </button>
            </div>

            <!-- Content -->
            <div class="px-4 sm:px-6 py-4 sm:py-5 text-sm flex-1 overflow-y-auto leading-relaxed text-slate-600 dark:text-slate-300" style="-webkit-overflow-scrolling: touch;">
              <slot />
            </div>

            <!-- Footer -->
            <div
              class="px-4 sm:px-6 py-3.5 sm:py-4 border-t flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-850/50"
              style="border-color: hsl(var(--neutral-100)); padding-bottom: max(16px, env(safe-area-inset-bottom));"
            >
              <slot name="footer">
                <button
                  type="button"
                  @click="$emit('cancel')"
                  class="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  @click="$emit('confirm')"
                  class="btn btn-sm"
                  :class="isDestructive ? 'btn-danger' : 'btn-primary'"
                >
                  {{ confirmLabel }}
                </button>
              </slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { nextTick, onUnmounted, ref, watch } from 'vue';
import { PhX } from '@phosphor-icons/vue';

const props = defineProps({
  isOpen:       { type: Boolean, required: true },
  title:        { type: String,  default: 'Confirm' },
  subtitle:     { type: String,  default: '' },
  confirmLabel: { type: String,  default: 'Confirm' },
  maxSize:      { type: String,  default: '480px' },
  isDestructive:{ type: Boolean, default: false },
  zIndex:       { type: [Number, String], default: 1200 },
});

const emit = defineEmits(['confirm', 'cancel']);
const panel = ref(null);
const previousFocus = ref(null);
const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.isOpen) emit('cancel');
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
.backdrop-enter-active { transition: opacity 220ms ease; }
.backdrop-leave-active { transition: opacity 180ms ease; }
.backdrop-enter-from,
.backdrop-leave-to     { opacity: 0; }

.modal-spring-enter-active,
.modal-spring-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (max-width: 639px) {
  .modal-spring-enter-from,
  .modal-spring-leave-to {
    opacity: 0;
    transform: translateY(100%);
  }
}

@media (min-width: 640px) {
  .modal-spring-enter-from,
  .modal-spring-leave-to {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
}
</style>
