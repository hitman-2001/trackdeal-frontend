<template>
  <AppDrawer
    :isOpen="isOpen"
    :title="isEducation ? 'Education Actions' : 'Workspace Actions'"
    subtitle="Start a common workflow without losing your place."
    width="520px"
    @close="close"
  >
    <div class="grid gap-3 sm:grid-cols-2 content-start text-xs pt-1">
      <router-link
        v-for="action in actions"
        :key="action.title"
        :to="action.to"
        class="quick-action group flex min-h-[110px] flex-col justify-between rounded-xl p-4 border border-slate-200 dark:border-neutral-800 hover:border-sky-500/80 bg-white dark:bg-neutral-900 hover:bg-sky-50/50 dark:hover:bg-sky-950/30 transition-all duration-150 shadow-xs"
        @click="close"
      >
        <div class="flex items-start justify-between">
          <span class="quick-action-icon flex items-center justify-center w-8 h-8 rounded-lg" :class="action.tone">
            <AppIcon :name="action.icon" :size="17" weight="duotone" />
          </span>
          <AppIcon name="arrowRight" :size="14" class="text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-sky-600" />
        </div>
        <div>
          <h3 class="font-heading text-xs font-bold text-slate-800 dark:text-slate-100">{{ action.title }}</h3>
          <p class="mt-1 text-[11px] leading-4 text-slate-500 dark:text-slate-400">{{ action.description }}</p>
        </div>
      </router-link>
    </div>
  </AppDrawer>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import AppDrawer from '@/components/AppDrawer.vue';

defineProps({ isOpen: { type: Boolean, default: false } });
const emit = defineEmits(['close']);

const store = useStore();
const isEducation = computed(() => store.getters['organization/isEducationTenant']);

const realEstateActions = [
  { title: 'New lead', description: 'Capture buyer needs, budget and financing.', to: '/app/leads', icon: 'user', tone: 'tone-accent' },
  { title: 'Add inventory', description: 'Add a unit, villa, plot or commercial space.', to: '/app/properties', icon: 'buildings', tone: 'tone-success' },
  { title: 'Create task', description: 'Schedule a follow-up, visit or internal task.', to: '/app/tasks', icon: 'clipboard', tone: 'tone-warning' },
  { title: 'Loan application', description: 'Manage submissions, sanctions and disbursals.', to: '/app/loans', icon: 'bank', tone: 'tone-info' },
  { title: 'Property agreement', description: 'Generate a sale, resale or rental agreement.', to: '/app/agreements/new', icon: 'agreements', tone: 'tone-success' },
  { title: 'Commission payment', description: 'Record payment, UTR and withholding details.', to: '/app/commissions', icon: 'payment', tone: 'tone-highlight' },
];

const educationActions = [
  { title: 'New student lead', description: 'Capture student inquiry, subject and parent details.', to: '/app/leads', icon: 'user', tone: 'tone-accent' },
  { title: 'Add student', description: 'Directly enroll student into a batch or course.', to: '/app/students', icon: 'user', tone: 'tone-success' },
  { title: 'Add class', description: 'Configure batch, course, fees, schedule & capacity.', to: '/app/classes', icon: 'buildings', tone: 'tone-highlight' },
];

const actions = computed(() => {
  const base = isEducation.value ? educationActions : realEstateActions;
  const isOrgAdmin = [
    'super_admin',
    'system_admin',
    'org_admin',
    'organization_admin',
  ].includes(String(store.getters['auth/userRole'] || '').toLowerCase());
  const hasTaskAccess =
    !isEducation.value &&
    store.getters['organization/isFeatureEnabled']('tasks') &&
    (isOrgAdmin ||
      store.getters['permissions/hasCapability']('tasks:read') ||
      store.getters['permissions/hasCapability']('tasks:create'));
  return base.filter(action => {
    if (action.to === '/app/tasks' && !hasTaskAccess) {
      return false;
    }
    return true;
  });
});

const close = () => emit('close');
</script>

<style scoped>
.quick-action-icon { width: 32px; height: 32px; }
.tone-accent { color: hsl(var(--accent-600)); background: hsl(var(--accent-100)); }
.tone-success { color: hsl(var(--success-text)); background: hsl(var(--success-bg)); }
.tone-warning { color: hsl(var(--warning-text)); background: hsl(var(--warning-bg)); }
.tone-info { color: hsl(var(--info-text)); background: hsl(var(--info-bg)); }
.tone-highlight { color: hsl(30 68% 35%); background: hsl(var(--highlight-100)); }
</style>
