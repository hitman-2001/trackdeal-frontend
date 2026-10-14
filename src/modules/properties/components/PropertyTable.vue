<template>
  <div class="space-y-4">
    <!-- Desktop Table View (sm and above) -->
    <div class="hidden sm:block">
      <AppTable 
        :columns="columns"
        :rows="rows"
        :selectable="true"
        :selectedRows="selectedProperties"
        :isLoading="isLoading"
        :pagination="pagination"
        @selectionChange="handleSelectionChange"
        @sort="handleSort"
        @pageChange="$emit('pageChange', $event)"
        @pageSizeChange="$emit('pageSizeChange', $event)"
        :sorting="sorting"
      >
        <!-- Slot for Unit Code -->
        <template #cell(unitCode)="{ row }">
          <router-link 
            :to="`/app/properties/${row._id || row.id}`" 
            class="font-semibold text-primary hover:underline block cursor-pointer"
          >
            {{ row.title }}
          </router-link>
          <span class="text-[9px] text-slate-400 font-mono">{{ row._id || row.id }}</span>
        </template>

        <!-- Slot for Project -->
        <template #cell(project)="{ row }">
          <span v-if="row.project && typeof row.project === 'object'">
            <router-link 
              :to="`/app/projects/${row.project._id || row.project.id}`" 
              class="text-slate-800 dark:text-slate-200 hover:underline font-medium"
            >
              {{ row.project.name }}
            </router-link>
          </span>
          <span v-else-if="row.project" class="text-slate-800 dark:text-slate-200 font-medium">
            Linked Project
          </span>
          <span v-else class="text-slate-400 dark:text-slate-500 italic">Independent listing</span>
        </template>

        <!-- Slot for Builder -->
        <template #cell(builder)="{ row }">
          <span v-if="row.project?.builderId" class="text-slate-700 dark:text-slate-350">
            {{ row.project.builderId.name || 'Builder' }}
          </span>
          <span v-else class="text-slate-400 dark:text-slate-500 italic">—</span>
        </template>

        <!-- Slot for Configuration -->
        <template #cell(configuration)="{ row }">
          <span class="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-[10px] font-bold uppercase">
            {{ row.bhk ? `${row.bhk} BHK` : row.type }}
          </span>
        </template>

        <!-- Slot for Price -->
        <template #cell(price)="{ value }">
          <span class="font-bold text-slate-800 dark:text-slate-100 font-heading">
            {{ formatCurrency(value) }}
          </span>
        </template>

        <!-- Slot for Floor / Facing -->
        <template #cell(floorDetails)="{ row }">
          <div class="text-slate-600 dark:text-slate-400 text-xs">
            <span>Floor {{ row.floors || 0 }} of {{ row.totalFloors || 0 }}</span>
            <span v-if="row.facing" class="capitalize block text-[10px] text-slate-400">Facing: {{ row.facing }}</span>
          </div>
        </template>

        <!-- Slot for Area -->
        <template #cell(carpetArea)="{ row }">
          <span class="font-medium text-slate-700 dark:text-slate-300">
            {{ row.area?.carpet || row.area?.superBuiltUp || 0 }} {{ row.area?.unit || 'sqft' }}
          </span>
        </template>

        <!-- Slot for Status Badge -->
        <template #cell(status)="{ value }">
          <span 
            class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase"
            :class="getStatusBadgeClass(value)"
          >
            ● {{ value }}
          </span>
        </template>
      </AppTable>
    </div>

    <!-- Mobile Property Cards Feed (< 640px) -->
    <div class="block sm:hidden space-y-3">
      <div v-if="rows.length === 0" class="py-12 text-center text-slate-400 bg-surface border border-default rounded-2xl p-6">
        <p class="font-bold text-slate-800 dark:text-slate-200 text-sm">No properties found</p>
        <p class="text-xs text-slate-400 mt-1">Adjust your search or add a new property listing.</p>
      </div>

      <div
        v-else
        v-for="prop in rows"
        :key="prop._id || prop.id"
        class="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-3 active:scale-[0.99] transition-all cursor-pointer"
        @click="$router.push(`/app/properties/${prop._id || prop.id}`)"
      >
        <!-- Header: Title + Status Badge -->
        <div class="flex items-start justify-between gap-2.5">
          <div class="min-w-0 flex-1">
            <h3 class="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight leading-snug truncate">
              {{ prop.title }}
            </h3>
            <span class="text-[10px] font-mono text-slate-400 block mt-0.5">
              {{ prop._id || prop.id }}
            </span>
          </div>
          <span
            class="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase"
            :class="getStatusBadgeClass(prop.status)"
          >
            ● {{ prop.status }}
          </span>
        </div>

        <!-- Project & Builder Details -->
        <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-850 border border-slate-100 dark:border-neutral-800/80 text-xs flex items-center justify-between">
          <div class="min-w-0 pr-2">
            <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Project</span>
            <span class="font-semibold text-slate-800 dark:text-slate-200 truncate block text-xs mt-0.5">
              {{ prop.project?.name || (typeof prop.project === 'string' ? prop.project : 'Independent listing') }}
            </span>
          </div>
          <div v-if="prop.project?.builderId" class="text-right shrink-0">
            <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Builder</span>
            <span class="font-medium text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 block truncate max-w-[100px]">
              {{ prop.project.builderId.name || 'Builder' }}
            </span>
          </div>
        </div>

        <!-- Configuration Specs Row -->
        <div class="flex items-center gap-2 flex-wrap text-xs">
          <span class="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-[10px] font-bold uppercase">
            {{ prop.bhk ? `${prop.bhk} BHK` : prop.type }}
          </span>
          <span v-if="prop.area?.carpet || prop.area?.superBuiltUp" class="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            {{ prop.area?.carpet || prop.area?.superBuiltUp }} {{ prop.area?.unit || 'sqft' }}
          </span>
          <span v-if="prop.floors" class="text-[11px] text-slate-400">
            &bull; Floor {{ prop.floors }}
          </span>
          <span v-if="prop.facing" class="text-[11px] text-slate-400 capitalize">
            &bull; {{ prop.facing }}
          </span>
        </div>

        <!-- Price & Action Footer -->
        <div class="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-neutral-800 text-xs">
          <div>
            <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Price</span>
            <span class="font-extrabold text-base text-slate-900 dark:text-slate-100 block">
              {{ formatCurrency(prop.price) }}
            </span>
          </div>
          <router-link
            :to="`/app/properties/${prop._id || prop.id}`"
            class="h-8 px-3 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold text-xs inline-flex items-center gap-1.5"
            @click.stop
          >
            <span>View Details</span>
          </router-link>
        </div>
      </div>

      <!-- Mobile Pagination Controls -->
      <div v-if="pagination && pagination.totalPages > 1" class="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 shadow-xs text-xs font-semibold">
        <button
          type="button"
          :disabled="pagination.page <= 1"
          @click="$emit('pageChange', pagination.page - 1)"
          class="h-9 px-4 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-300 disabled:opacity-40"
        >
          Previous
        </button>
        <span class="text-slate-400 font-medium">{{ pagination.page }} / {{ pagination.totalPages }}</span>
        <button
          type="button"
          :disabled="pagination.page >= pagination.totalPages"
          @click="$emit('pageChange', pagination.page + 1)"
          class="h-9 px-4 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-300 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppTable from '@/components/AppTable.vue';

const props = defineProps({
  rows: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  selectedProperties: { type: Array, default: () => [] },
  pagination: { type: Object, default: null }
});

const emit = defineEmits(['sort', 'selectionChange', 'pageChange', 'pageSizeChange']);

const sorting = ref({ field: 'createdAt', direction: 'desc' });

const columns = [
  { key: 'unitCode', label: 'Unit Code', sortable: true },
  { key: 'project', label: 'Project' },
  { key: 'builder', label: 'Builder' },
  { key: 'configuration', label: 'Config' },
  { key: 'price', label: 'Price', sortable: true },
  { key: 'floorDetails', label: 'Floor / Facing' },
  { key: 'carpetArea', label: 'Carpet Area' },
  { key: 'status', label: 'Status', sortable: true }
];

const handleSelectionChange = (updatedSelection) => {
  emit('selectionChange', updatedSelection);
};

const handleSort = (sortOption) => {
  sorting.value = sortOption;
  emit('sort', sortOption);
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'available':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50';
    case 'reserved':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50';
    case 'blocked':
      return 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
    case 'sold':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50';
    default:
      return 'bg-slate-50 text-slate-550 border-slate-200 dark:bg-slate-900 dark:border-slate-800';
  }
};

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};
</script>
