<template>
  <span 
    class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize transition-colors"
    :class="stageClasses"
  >
    <span class="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0" :class="dotClasses"></span>
    {{ formatStage(stage) }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  stage: { type: String, required: true }
});

const stageClasses = computed(() => {
  switch (props.stage) {
    case 'new':
      return 'bg-blue-50/75 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/50';
    case 'assigned':
      return 'bg-indigo-50/75 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/50';
    case 'contacted':
      return 'bg-sky-50/75 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border-sky-200/50 dark:border-sky-900/50';
    case 'follow_up':
      return 'bg-amber-50/75 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50';
    case 'meeting_scheduled':
    case 'counseling_scheduled':
      return 'bg-purple-50/75 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/50';
    case 'qualified':
      return 'bg-teal-50/75 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border-teal-200/50 dark:border-teal-900/50';
    case 'application_trial':
      return 'bg-violet-50/75 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 border-violet-200/50 dark:border-violet-900/50';
    case 'nurturing':
      return 'bg-amber-50/75 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50';
    case 'site_visit_scheduled':
      return 'bg-purple-50/75 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/50';
    case 'site_visit_completed':
      return 'bg-fuchsia-50/75 dark:bg-fuchsia-950/20 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200/50 dark:border-fuchsia-900/50';
    case 'negotiation':
      return 'bg-orange-50/75 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-200/50 dark:border-orange-900/50';
    case 'booking_initiated':
      return 'bg-cyan-50/75 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border-cyan-200/50 dark:border-cyan-900/50';
    case 'booked':
    case 'enrolled':
    case 'converted':
      return 'bg-emerald-50/75 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/50';
    case 'won':
      return 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800';
    case 'lost':
    case 'booking_defaulted':
      return 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50';
    case 'on_hold':
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    default:
      return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  }
});

const dotClasses = computed(() => {
  switch (props.stage) {
    case 'new':
      return 'bg-blue-500';
    case 'assigned':
      return 'bg-indigo-500';
    case 'contacted':
      return 'bg-sky-500';
    case 'follow_up':
      return 'bg-amber-500';
    case 'meeting_scheduled':
    case 'counseling_scheduled':
      return 'bg-purple-500';
    case 'qualified':
      return 'bg-teal-500';
    case 'application_trial':
      return 'bg-violet-500';
    case 'nurturing':
      return 'bg-amber-500';
    case 'site_visit_scheduled':
      return 'bg-purple-500';
    case 'site_visit_completed':
      return 'bg-fuchsia-500';
    case 'negotiation':
      return 'bg-orange-500';
    case 'booking_initiated':
      return 'bg-cyan-500';
    case 'booked':
    case 'enrolled':
    case 'converted':
      return 'bg-emerald-500';
    case 'won':
      return 'bg-green-500';
    case 'lost':
    case 'booking_defaulted':
      return 'bg-red-500';
    case 'on_hold':
      return 'bg-slate-400';
    default:
      return 'bg-slate-400';
  }
});

const formatStage = (val) => {
  if (!val) return '';
  return val.replace(/_/g, ' ');
};
</script>
