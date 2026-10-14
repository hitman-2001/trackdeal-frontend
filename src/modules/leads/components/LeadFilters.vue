<template>
  <section class="filter-panel" aria-label="Lead filters">
    <!-- Desktop Filter Panel (sm and above) -->
    <div class="hidden sm:flex flex-col gap-4">
      <div class="flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-center lg:justify-between" style="border-color: hsl(var(--neutral-100));">
        <div class="flex items-center gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0 scrollbar-none" style="-webkit-overflow-scrolling: touch;">
          <button
            v-for="view in savedViews"
            :key="view.id"
            type="button"
            class="h-9 shrink-0 rounded-lg px-3.5 text-xs font-semibold transition-colors"
            :class="activeSavedView === view.id ? 'text-white' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'"
            :style="activeSavedView === view.id
              ? 'background-color: hsl(var(--accent-600)); box-shadow: 0 5px 14px hsl(var(--accent-600) / 0.18);'
              : 'color: hsl(var(--neutral-500));'"
            @click="selectSavedView(view)"
          >
            {{ view.name }}
          </button>
        </div>

        <label class="flex shrink-0 items-center justify-between sm:justify-start gap-2.5 text-xs font-medium w-full sm:w-auto" style="color: hsl(var(--neutral-450));">
          <span>Registered</span>
          <select v-model="activeDateRange" class="filter-control flex-1 sm:flex-initial sm:!w-40" @change="handleFilterChange">
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="ytd">Year to date</option>
          </select>
        </label>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2" :class="canFilterAgents ? 'xl:grid-cols-5' : 'xl:grid-cols-4'">
        <label class="relative block sm:col-span-2 xl:col-span-1">
          <span class="sr-only">Search leads</span>
          <AppIcon name="search" :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style="color: hsl(var(--neutral-350));" />
          <input
            v-model="filtersState.search"
            type="search"
            placeholder="Search name, phone or city"
            class="filter-control !pl-9"
            @input="debounceSearch"
          />
        </label>

        <label>
          <span class="sr-only">Lead stage</span>
          <select v-model="filtersState.status" class="filter-control" @change="handleFilterChange">
            <option value="">All stages</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="property_shared">Property shared</option>
            <option value="site_visit_scheduled">Site visit</option>
            <option value="negotiation">Negotiation</option>
            <option value="booked">Booking</option>
            <option value="won">Closed won</option>
            <option value="lost">Closed lost</option>
          </select>
        </label>

        <label>
          <span class="sr-only">Lead temperature</span>
          <select v-model="filtersState.temperature" class="filter-control" @change="handleFilterChange">
            <option value="">All temperatures</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
        </label>

        <label>
          <span class="sr-only">Lead source</span>
          <select v-model="filtersState.source" class="filter-control" @change="handleFilterChange">
            <option value="">All sources</option>
            <option value="website">Website</option>
            <option value="magicbricks">MagicBricks</option>
            <option value="99acres">99acres</option>
            <option value="housing">Housing.com</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="referral">Referral</option>
            <option value="walk_in">Walk-in</option>
            <option value="manual_entry">Direct input</option>
          </select>
        </label>

        <label v-if="canFilterAgents">
          <span class="sr-only">Assigned agent</span>
          <select v-model="filtersState.assignedTo" class="filter-control" @change="handleFilterChange">
            <option value="">All assigned agents</option>
            <option :value="currentUser.id">Me (my assigned)</option>
            <option v-for="user in agentsList" :key="user.id || user._id" :value="user.id || user._id">
              {{ user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <!-- Mobile Streamlined Search & Filter (< 640px) -->
    <div class="sm:hidden space-y-2.5">
      <!-- Search Input + Filter Modal Trigger Button -->
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <AppIcon name="search" :size="15" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="filtersState.search"
            type="search"
            placeholder="Search name, phone or city..."
            class="w-full h-10 pl-9 pr-8 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-500 transition-all"
            @input="debounceSearch"
          />
          <button
            v-if="filtersState.search"
            type="button"
            @click="filtersState.search = ''; debounceSearch()"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-1"
          >
            <PhX :size="14" weight="bold" />
          </button>
        </div>

        <button
          type="button"
          @click="isMobileFilterOpen = true"
          class="h-10 px-3.5 rounded-xl border font-semibold text-xs inline-flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
          :class="activeFilterCount > 0
            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold'
            : 'border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-700 dark:text-slate-200'"
        >
          <PhSlidersHorizontal :size="15" weight="bold" />
          <span>Filters</span>
          <span
            v-if="activeFilterCount > 0"
            class="w-4.5 h-4.5 rounded-full bg-blue-600 text-white text-[10px] font-bold inline-flex items-center justify-center shrink-0"
          >
            {{ activeFilterCount }}
          </span>
        </button>
      </div>

      <!-- Quick Saved View Pills (Horizontal Scroll) -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" style="-webkit-overflow-scrolling: touch;">
        <button
          v-for="view in savedViews"
          :key="view.id"
          type="button"
          class="h-7 shrink-0 rounded-lg px-2.5 text-[11px] font-semibold transition-all"
          :class="activeSavedView === view.id
            ? 'bg-blue-600 text-white shadow-2xs'
            : 'bg-white dark:bg-neutral-850 border border-slate-200/80 dark:border-neutral-800 text-slate-600 dark:text-slate-300'"
          @click="selectSavedView(view)"
        >
          {{ view.name }}
        </button>
      </div>
    </div>

    <!-- Mobile Filter Sheet Modal -->
    <AppModal
      :isOpen="isMobileFilterOpen"
      title="Filter Property Leads"
      subtitle="Refine prospects by stage, temperature, source, and agent"
      maxSize="460px"
      @cancel="isMobileFilterOpen = false"
    >
      <div class="space-y-4 text-xs">
        <!-- Lead Stage -->
        <div>
          <label class="modal-form-label">Lead Stage</label>
          <select v-model="filtersState.status" class="modal-form-select">
            <option value="">All stages</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="property_shared">Property shared</option>
            <option value="site_visit_scheduled">Site visit</option>
            <option value="negotiation">Negotiation</option>
            <option value="booked">Booking</option>
            <option value="won">Closed won</option>
            <option value="lost">Closed lost</option>
          </select>
        </div>

        <!-- Lead Temperature -->
        <div>
          <label class="modal-form-label">Lead Temperature</label>
          <select v-model="filtersState.temperature" class="modal-form-select">
            <option value="">All temperatures</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
        </div>

        <!-- Lead Source -->
        <div>
          <label class="modal-form-label">Lead Source</label>
          <select v-model="filtersState.source" class="modal-form-select">
            <option value="">All sources</option>
            <option value="website">Website</option>
            <option value="magicbricks">MagicBricks</option>
            <option value="99acres">99acres</option>
            <option value="housing">Housing.com</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="referral">Referral</option>
            <option value="walk_in">Walk-in</option>
            <option value="manual_entry">Direct input</option>
          </select>
        </div>

        <!-- Registration Date -->
        <div>
          <label class="modal-form-label">Registration Period</label>
          <select v-model="activeDateRange" class="modal-form-select">
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="ytd">Year to date</option>
          </select>
        </div>

        <!-- Assigned Agent (Elevated roles) -->
        <div v-if="canFilterAgents">
          <label class="modal-form-label">Assigned Agent</label>
          <select v-model="filtersState.assignedTo" class="modal-form-select">
            <option value="">All assigned agents</option>
            <option :value="currentUser.id">Me (my assigned)</option>
            <option v-for="user in agentsList" :key="user.id || user._id" :value="user.id || user._id">
              {{ user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() }}
            </option>
          </select>
        </div>
      </div>

      <template #footer>
        <div class="grid grid-cols-2 gap-2.5 w-full">
          <button
            type="button"
            @click="clearAllMobileFilters"
            class="h-10 px-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-200 font-bold text-xs"
          >
            Clear All
          </button>
          <button
            type="button"
            @click="applyMobileFilters"
            class="h-10 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs"
          >
            Apply Filters {{ activeFilterCount > 0 ? `(${activeFilterCount})` : '' }}
          </button>
        </div>
      </template>
    </AppModal>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { PhSlidersHorizontal, PhX } from '@phosphor-icons/vue';
import AppModal from '@/components/AppModal.vue';
import AppIcon from '@/components/AppIcon.vue';
import { useUsersQuery } from '@/modules/settings/queries';

const store = useStore();

const canFilterAgents = computed(() => {
  const role = String(store.getters['auth/userRole'] || '').toLowerCase();
  const isElevated = ['super_admin', 'system_admin', 'org_admin', 'organization_admin', 'manager', 'branch_manager'].includes(role);
  const canAssign = Boolean(store.getters['permissions/hasCapability']?.('leads.assign'));
  return isElevated && canAssign;
});

const { data: usersData } = useUsersQuery();
const agentsList = computed(() => {
  const data = usersData.value?.data || usersData.value;
  return Array.isArray(data) ? data.filter(user => user.active) : [];
});

const emit = defineEmits(['change']);
const currentUser = computed(() => store.state.auth.user || {});
const savedViews = computed(() => {
  const views = [];
  if (canFilterAgents.value) {
    views.push({ id: 'all', name: 'All leads', filters: { status: '', assignedTo: '', source: '', temperature: '', search: '' } });
  }
  views.push(
    { id: 'my', name: 'My leads', filters: { status: '', assignedTo: currentUser.value.id || '', source: '', temperature: '', search: '' } },
    { id: 'hot', name: 'Hot', filters: { status: '', assignedTo: '', source: '', temperature: 'hot', search: '' } },
    { id: 'followup', name: 'Follow-up', filters: { status: 'contacted', assignedTo: '', source: '', temperature: '', search: '' } },
    { id: 'received', name: 'Received', filters: { status: 'new', assignedTo: '', source: '', temperature: '', search: '' } },
    { id: 'closed', name: 'Closed', filters: { status: 'won', assignedTo: '', source: '', temperature: '', search: '' } }
  );
  return views;
});

const activeSavedView = ref(canFilterAgents.value ? 'all' : 'my');
const activeDateRange = ref('all');
const filtersState = reactive({ search: '', status: '', temperature: '', source: '', assignedTo: '' });
const isMobileFilterOpen = ref(false);

const activeFilterCount = computed(() => {
  let count = 0;
  if (filtersState.status) count++;
  if (filtersState.temperature) count++;
  if (filtersState.source) count++;
  if (filtersState.assignedTo) count++;
  if (activeDateRange.value && activeDateRange.value !== 'all') count++;
  return count;
});

function clearAllMobileFilters() {
  filtersState.status = '';
  filtersState.temperature = '';
  filtersState.source = '';
  filtersState.assignedTo = '';
  activeDateRange.value = 'all';
}

function applyMobileFilters() {
  isMobileFilterOpen.value = false;
  handleFilterChange();
}

let searchDebounce;

const handleFilterChange = () => emit('change', { ...filtersState, dateRange: activeDateRange.value });
const debounceSearch = () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(handleFilterChange, 300);
};
const selectSavedView = (view) => {
  activeSavedView.value = view.id;
  Object.assign(filtersState, view.filters);
  handleFilterChange();
};

onBeforeUnmount(() => clearTimeout(searchDebounce));
</script>
