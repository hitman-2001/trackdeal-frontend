<template>
  <div
    class="fixed top-4 sm:top-5 right-3 sm:right-6 left-3 sm:left-auto z-[99999] flex flex-col gap-2.5 max-w-[420px] sm:w-full pointer-events-none"
    role="region"
    aria-live="polite"
    aria-label="Notifications"
  >
    <TransitionGroup name="global-toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border-l-[4px] shadow-[0_12px_32px_rgba(15,23,42,0.10)] pointer-events-auto bg-white dark:bg-slate-900 backdrop-blur-md text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800"
        :class="getToastCardClasses(toast.type)"
      >
        <div
          class="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5"
          :class="getToastIconWrapClasses(toast.type)"
        >
          <component
            :is="getToastIcon(toast.type)"
            :size="18"
            weight="bold"
          />
        </div>
        <div class="flex-1 min-w-0 pt-1 pr-1">
          <p class="text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 leading-snug break-words">
            {{ toast.message }}
          </p>
        </div>
        <button
          @click="dismissToast(toast.id)"
          class="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mt-0.5"
          aria-label="Dismiss notification"
        >
          <PhX :size="14" weight="bold" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import {
  PhCheckCircle,
  PhXCircle,
  PhWarningCircle,
  PhInfo,
  PhX,
} from "@phosphor-icons/vue";

const store = useStore();
const toasts = computed(() => store.state.notifications.toasts);

function dismissToast(id) {
  store.commit("notifications/REMOVE_TOAST", id);
}

function getToastCardClasses(type) {
  switch (type) {
    case "error":
      return "border-l-rose-500 bg-gradient-to-r from-rose-50/40 via-white to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900";
    case "warning":
      return "border-l-amber-500 bg-gradient-to-r from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900";
    case "info":
      return "border-l-[#0a6ef0] bg-gradient-to-r from-blue-50/40 via-white to-white dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900";
    case "success":
    default:
      return "border-l-emerald-500 bg-gradient-to-r from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900";
  }
}

function getToastIconWrapClasses(type) {
  switch (type) {
    case "error":
      return "bg-rose-100/90 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400";
    case "warning":
      return "bg-amber-100/90 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400";
    case "info":
      return "bg-blue-100/90 text-[#0a6ef0] dark:bg-blue-950/60 dark:text-blue-400";
    case "success":
    default:
      return "bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400";
  }
}

function getToastIcon(type) {
  switch (type) {
    case "error":
      return PhXCircle;
    case "warning":
      return PhWarningCircle;
    case "info":
      return PhInfo;
    case "success":
    default:
      return PhCheckCircle;
  }
}
</script>

<style scoped>
.global-toast-enter-active {
  animation: toast-slide-down 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.global-toast-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.global-toast-leave-to {
  opacity: 0;
  transform: translateY(-14px) scale(0.96);
}

@keyframes toast-slide-down {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.94);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
