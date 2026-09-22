<template>
  <span
    class="inline-flex items-center gap-1.5 text-[11px] font-semibold shrink-0 px-2 py-0.5 rounded-md border"
    :class="computedClasses"
  >
    <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="dotClasses" />
    <slot>{{ formattedStatus }}</slot>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status:  { type: String, required: true },
  variant: { type: String, default: '' }, // success | warning | danger | info | neutral | auto
});

const resolvedVariant = computed(() => {
  if (props.variant) return props.variant;
  const s = String(props.status || '').toLowerCase().replace(/[\s_-]+/g, '');
  if (['completed', 'converted', 'enrolled', 'qualified', 'won', 'approved', 'active'].includes(s)) {
    return 'success';
  }
  if (['warm', 'interested', 'pending', 'followup', 'follow_up', 'contacted', 'meeting', 'inreview'].includes(s)) {
    return 'warning';
  }
  if (['hot', 'danger', 'rejected', 'lost', 'failed', 'cancelled', 'urgent', 'overdue'].includes(s)) {
    return 'danger';
  }
  if (['assigned', 'info', 'processing', 'scheduled'].includes(s)) {
    return 'info';
  }
  return 'neutral';
});

const formattedStatus = computed(() => {
  return String(props.status || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
});

const computedClasses = computed(() => {
  switch (resolvedVariant.value) {
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
    case 'warning':
      return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    case 'danger':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
    case 'info':
      return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
});

const dotClasses = computed(() => {
  switch (resolvedVariant.value) {
    case 'success': return 'bg-emerald-500';
    case 'warning': return 'bg-amber-500';
    case 'danger':  return 'bg-rose-500';
    case 'info':    return 'bg-sky-500';
    default:        return 'bg-slate-400';
  }
});
</script>
