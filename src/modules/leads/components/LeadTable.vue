<template>
  <div class="space-y-4">
    <!-- Leads List Grid Table -->
    <AppTable 
      :columns="columns"
      :rows="rows"
      :selectable="true"
      :selectedRows="selectedLeads"
      :isLoading="isLoading"
      :pagination="pagination"
      @selectionChange="handleSelectionChange"
      @sort="handleSort"
      @pageChange="$emit('pageChange', $event)"
      @pageSizeChange="$emit('pageSizeChange', $event)"
      :sorting="sorting"
    >
      <!-- Slot for Lead Profile -->
      <template #cell(name)="{ row }">
        <div class="flex items-center space-x-2.5">
          <!-- User Initials Avatar -->
          <div class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0 uppercase">
            {{ (row.firstName?.charAt(0) || '') + (row.lastName?.charAt(0) || '') }}
          </div>
          <div class="min-w-0">
            <router-link 
              :to="`/app/leads/${row._id || row.id}`" 
              class="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block text-xs"
            >
              {{ row.firstName }} {{ row.lastName || '' }}
            </router-link>
            <div class="text-[10px] text-slate-400 font-mono truncate flex items-center gap-1">
              <AppIcon v-if="row.isTransferred" name="lock" :size="10" />
              {{ row.isTransferred ? 'Contact protected' : (row.mobile || row.phone || 'No phone') }}
            </div>
          </div>
        </div>
      </template>

      <!-- Slot for Requirement -->
      <template #cell(requirement)="{ row }">
        <div class="text-xs">
          <span class="font-semibold text-slate-800 dark:text-slate-200 block truncate">
            {{ row.preferredPropertyType || row.propertyType || '3 BHK Apartment' }}
          </span>
          <span class="text-[10px] text-slate-400 block truncate">
            {{ row.preferredLocation || row.city || 'Pune / Mumbai' }}
          </span>
        </div>
      </template>

      <!-- Slot for Budget -->
      <template #cell(budget)="{ row }">
        <div class="text-xs font-semibold text-slate-800 dark:text-slate-200">
          <span v-if="row.budgetMin || row.budgetMax">
            ₹{{ formatBudget(row.budgetMin) }} – ₹{{ formatBudget(row.budgetMax) }}
          </span>
          <span v-else class="text-slate-400 italic">Budget Flexible</span>
        </div>
      </template>

      <!-- Slot for Stage Badge -->
      <template #cell(status)="{ value }">
        <LeadStageBadge :stage="value" />
      </template>

      <!-- Slot for Temperature Badge -->
      <template #cell(temperature)="{ row }">
        <span 
          class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1"
          :class="getTemperatureClass(row.temperature)"
        >
          <AppIcon :name="row.temperature === 'hot' ? 'flame' : row.temperature === 'warm' ? 'lightning' : 'snowflake'" :size="10" />
          <span>{{ row.temperature || 'WARM' }}</span>
        </span>
      </template>

      <!-- Slot for Next Follow-up -->
      <template #cell(nextFollowup)="{ row }">
        <div class="text-[10px]">
          <span v-if="row.nextFollowupDate" class="font-semibold text-indigo-600 dark:text-indigo-400 block">
            {{ formatDate(row.nextFollowupDate) }}
          </span>
          <span v-else class="text-slate-400 italic block">Not Scheduled</span>
          <span v-if="row.nextFollowupTime" class="text-slate-400">{{ row.nextFollowupTime }}</span>
        </div>
      </template>

      <!-- Slot for Owner Agent -->
      <template #cell(assignedTo)="{ value }">
        <div v-if="value" class="flex items-center space-x-1.5">
          <div class="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-700 dark:text-slate-300 uppercase">
            {{ value.firstName?.charAt(0) || 'A' }}
          </div>
          <span class="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
            {{ value.firstName }} {{ value.lastName || '' }}
          </span>
        </div>
        <span v-else class="text-[10px] text-slate-400 italic">Unassigned</span>
      </template>

      <!-- Slot for Actions -->
      <template #cell(actions)="{ row }">
        <div class="flex items-center gap-1.5 justify-end">
          <router-link 
            :to="`/app/leads/${row._id || row.id}`"
            class="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-700 transition-colors"
          >
            View 360°
          </router-link>
          <button
            type="button"
            @click.stop="$emit('delete', row)"
            class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete Lead"
          >
            <PhTrash :size="14" />
          </button>
        </div>
      </template>
    </AppTable>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { PhTrash } from '@phosphor-icons/vue';
import AppTable from '@/components/AppTable.vue';
import LeadStageBadge from './LeadStageBadge.vue';

const props = defineProps({
  rows: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  selectedLeads: { type: Array, default: () => [] },
  pagination: { type: Object, default: null }
});

const emit = defineEmits(['sort', 'selectionChange', 'pageChange', 'pageSizeChange', 'delete']);

const sorting = ref({ field: 'createdAt', direction: 'desc' });

const columns = [
  { key: 'name', label: 'Lead Profile', sortable: true },
  { key: 'requirement', label: 'Requirement' },
  { key: 'budget', label: 'Budget' },
  { key: 'status', label: 'Stage', sortable: true },
  { key: 'temperature', label: 'Temperature', sortable: true },
  { key: 'nextFollowup', label: 'Next Follow-up' },
  { key: 'assignedTo', label: 'Assigned To' },
  { key: 'actions', label: 'Actions', align: 'right' },
];

const handleSelectionChange = (updatedSelection) => {
  emit('selectionChange', updatedSelection);
};

const handleSort = (sortOption) => {
  sorting.value = sortOption;
  emit('sort', sortOption);
};

function getTemperatureClass(temp) {
  const t = (temp || '').toLowerCase();
  if (t === 'hot') return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
  if (t === 'warm') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
  return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
}

function formatBudget(val) {
  const n = Number(val) || 0;
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(0)} L`;
  return n.toLocaleString('en-IN');
}

function formatDate(val) {
  if (!val) return '';
  return new Date(val).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  });
}
</script>
