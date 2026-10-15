<template>
  <div class="space-y-6 w-full max-w-full min-w-0 overflow-x-hidden pb-28 sm:pb-16">
    <!-- Section 6: Standardized Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
      <div>
        <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
          Workspace &gt; Property Leads
        </div>
        <h1 class="text-2xl sm:text-[28px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
          Property Leads
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage, allocate, and transition property sales prospects.
        </p>
      </div>

      <!-- Action buttons & Views toggle -->
      <div class="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
        <!-- View Toggle buttons -->
        <div class="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-0.5">
          <button 
            type="button"
            @click="viewMode = 'table'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
            :class="viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'"
            title="Table View"
          >
            <PhTable :size="14" weight="bold" />
            <span>Table</span>
          </button>
          <button 
            type="button"
            @click="viewMode = 'kanban'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
            :class="viewMode === 'kanban' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'"
            title="Kanban View"
          >
            <PhColumns :size="14" weight="bold" />
            <span>Kanban</span>
          </button>
        </div>

        <!-- Bulk Import Leads (Excel/CSV) for Org Admin / Authorized Staff -->
        <button
          v-if="canBulkUpload"
          type="button"
          @click="isBulkUploadOpen = true"
          class="btn btn-secondary h-[42px] px-3.5 text-xs font-semibold gap-2 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
          title="Bulk Upload Leads from Excel (.xlsx, .csv)"
        >
          <PhFileArrowUp :size="16" weight="bold" />
          <span>Import Excel</span>
        </button>

        <!-- Create Lead button -->
        <button 
          v-if="canCreateLead"
          type="button"
          @click="isCreateOpen = true"
          class="btn btn-primary h-[42px] px-4 text-xs font-medium gap-2 shadow-xs"
        >
          <PhPlus :size="16" weight="bold" />
          <span>Add Lead</span>
        </button>
      </div>
    </div>

    <!-- Filters component panel -->
    <LeadFilters @change="handleFilterChange" />

    <!-- Grid View Switcher -->
    <div v-if="isLoading" class="animate-pulse space-y-4">
      <div class="h-10 bg-slate-200 dark:bg-slate-850 rounded w-full"></div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="h-64 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
      </div>
    </div>

    <!-- Active View Area -->
    <div v-else class="space-y-4">
      <!-- Bulk Selection Toolbar (When Leads are Selected) -->
      <div
        v-if="selectedRows.length > 0"
        class="rounded-xl bg-surface border border-default shadow-sm p-3 sm:px-4 sm:py-2.5 transition-all space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between"
      >
        <!-- Left: Counter + Mobile Deselect -->
        <div class="flex items-center justify-between sm:justify-start sm:gap-3">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold font-tabular shadow-2xs shrink-0">
              {{ selectedRows.length }}
            </span>
            <span class="text-xs font-bold text-slate-900 dark:text-slate-100">
              {{ selectedRows.length === 1 ? '1 lead selected' : `${selectedRows.length} leads selected` }}
            </span>
          </div>

          <!-- Mobile Deselect button & Quick Select All -->
          <div class="flex items-center gap-2">
            <button
              v-if="!isAllSelected && leadsList.length > selectedRows.length"
              type="button"
              @click="toggleSelectAll"
              class="text-xs font-semibold text-primary hover:underline px-1 py-0.5 rounded cursor-pointer"
            >
              Select all ({{ leadsList.length }})
            </button>
            <button
              type="button"
              @click="selectedRows = []"
              class="sm:hidden btn btn-ghost btn-sm h-8 px-2 text-xs font-medium"
              title="Clear selection"
            >
              <PhX :size="13" weight="bold" />
              <span>Deselect</span>
            </button>
          </div>
        </div>

        <!-- Right: Action Buttons (Equal width on mobile, inline on desktop) -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button
            v-if="canAssignLeads"
            type="button"
            @click="openBulkAssign"
            class="btn btn-primary btn-sm flex-1 sm:flex-none flex items-center justify-center gap-1.5 shadow-xs font-semibold"
            title="Assign selected leads to agents"
          >
            <PhUserPlus :size="15" weight="bold" />
            <span class="truncate">Assign</span>
          </button>

          <button
            v-if="canBulkDeleteLeads"
            type="button"
            @click="openBulkDelete"
            class="btn btn-danger-outline btn-sm flex-1 sm:flex-none flex items-center justify-center gap-1.5 shadow-xs font-semibold"
            title="Delete selected leads"
          >
            <PhTrash :size="15" weight="bold" />
            <span class="truncate">Delete</span>
          </button>

          <!-- Desktop Deselect button -->
          <button
            type="button"
            @click="selectedRows = []"
            class="hidden sm:inline-flex btn btn-ghost btn-sm flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium ml-1"
          >
            <PhX :size="13" weight="bold" />
            <span>Deselect</span>
          </button>
        </div>
      </div>

      <!-- 1. TABLE VIEW -->
      <div v-if="viewMode === 'table'">
        <!-- Desktop Grid -->
        <div class="hidden lg:block">
          <LeadTable 
            :rows="leadsList"
            :isLoading="isLoading"
            :selectedLeads="selectedRows"
            :pagination="pagination"
            :canDelete="canDeleteLeads"
            :canBulkDelete="canBulkDeleteLeads"
            :canAssign="canAssignLeads"
            @selectionChange="handleSelectionChange"
            @sort="handleSort"
            @pageChange="handlePageChange"
            @pageSizeChange="handlePageSizeChange"
            @delete="handleDeleteLead"
          />
        </div>

        <!-- Responsive Mobile List Cards -->
        <div class="lg:hidden space-y-3">
          <!-- Mobile Bulk Select & Total Counter Bar (< 1024px) -->
          <div
            v-if="leadsList.length > 0 && (canAssignLeads || canBulkDeleteLeads)"
            class="flex items-center justify-between px-3 py-2.5 bg-surface rounded-xl border border-default text-xs shadow-2xs"
          >
            <label class="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200 select-none active:opacity-75">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="w-4.5 h-4.5 rounded text-primary border-slate-300 dark:border-neutral-700 focus:ring-primary cursor-pointer shrink-0"
              />
              <span>{{ isAllSelected ? 'Deselect All' : `Select All (${leadsList.length})` }}</span>
            </label>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {{ pagination.total || leadsList.length }} leads
            </span>
          </div>

          <div 
            v-for="lead in leadsList" 
            :key="lead._id || lead.id"
            class="bg-white dark:bg-neutral-900 border rounded-2xl p-4 space-y-3 active:scale-[0.99] transition-all cursor-pointer"
            :class="isRowSelected(lead)
              ? 'border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/15 dark:bg-emerald-950/20 shadow-md'
              : 'border-slate-200/80 dark:border-neutral-800 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'"
            @click="$router.push(`/app/leads/${lead._id || lead.id}`)"
          >
            <!-- Header: Checkbox + Name + Temperature Dot + Lead Stage Badge -->
            <div class="flex items-start justify-between gap-2.5">
              <div class="flex items-start gap-2.5 min-w-0 flex-1">
                <input
                  v-if="canAssignLeads || canBulkDeleteLeads"
                  type="checkbox"
                  :checked="isRowSelected(lead)"
                  @click.stop="toggleRowSelection(lead)"
                  class="w-4.5 h-4.5 mt-0.5 rounded text-emerald-600 border-slate-300 dark:border-neutral-700 focus:ring-emerald-500 cursor-pointer shrink-0"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span 
                      class="w-2.5 h-2.5 rounded-full shrink-0" 
                      :class="getAgingDotClass(lead.createdAt)"
                      :title="'Lead age indicator'"
                    ></span>
                    <h3 class="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight leading-snug truncate">
                      {{ lead.firstName }} {{ lead.lastName || '' }}
                    </h3>
                    <span
                      v-if="!lead.isAttended && !lead.lastActionAt"
                      class="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/60 shrink-0"
                      title="Unattended: Pending staff contact"
                    >
                      Unattended
                    </span>
                  </div>
                <!-- Phone & Source info -->
                <div class="flex items-center flex-wrap gap-2 mt-1.5 text-xs">
                  <a
                    v-if="lead.mobile"
                    :href="'tel:' + lead.mobile"
                    @click.stop
                    class="inline-flex items-center gap-1 font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <PhPhone :size="12" weight="bold" />
                    <span>{{ lead.mobile }}</span>
                  </a>
                  <span v-if="lead.source" class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300">
                    {{ formatLeadSource(lead.source) }}
                  </span>
                  <span v-if="lead.score" class="inline-flex items-center gap-1 font-bold text-amber-600 text-[10px]">
                    <PhStar :size="12" weight="fill" class="text-amber-500" />
                    {{ lead.score }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Stage Badge -->
            <div class="shrink-0" @click.stop>
              <LeadStageBadge :stage="lead.status" />
            </div>
          </div>

            <!-- Metadata Grid: Assigned Agent / Requirement -->
            <div class="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-slate-100 dark:border-neutral-800 text-xs">
              <div class="min-w-0">
                <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Assigned To</span>
                <span class="font-semibold text-slate-700 dark:text-slate-200 truncate block text-[12px] mt-0.5">
                  {{ lead.assignedTo?.firstName ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName || ''}`.trim() : (lead.agentId?.name || 'Unassigned') }}
                </span>
              </div>
              <div class="min-w-0">
                <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Requirement / City</span>
                <span class="font-semibold text-slate-700 dark:text-slate-200 truncate block text-[12px] mt-0.5">
                  {{ lead.requirement?.propertyType || lead.city || 'Standard Inquiry' }}
                </span>
              </div>
            </div>

            <!-- Touch Action Row -->
            <div class="flex items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-neutral-800" @click.stop>
              <a
                v-if="lead.mobile"
                :href="'tel:' + lead.mobile"
                class="flex-1 h-9 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200/70 dark:border-neutral-700 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-[0.98]"
              >
                <PhPhoneCall :size="14" weight="bold" class="text-slate-500 dark:text-slate-400" />
                <span>Call</span>
              </a>
              <a
                v-if="lead.mobile"
                :href="getWhatsAppUrl(lead.mobile)"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 h-9 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200/70 dark:border-neutral-700 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-[0.98]"
              >
                <PhWhatsappLogo :size="15" weight="fill" class="text-slate-500 dark:text-slate-400" />
                <span>WhatsApp</span>
              </a>
              <button
                type="button"
                @click="openActivityCenter(lead)"
                class="flex-1 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-[0.98]"
              >
                <AppIcon name="house" :size="13" />
                <span>Visits</span>
              </button>
              <button
                v-if="canDeleteLeads"
                type="button"
                @click="handleDeleteLead(lead)"
                class="w-9 h-9 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 border border-slate-200/70 dark:border-neutral-700 flex items-center justify-center transition-all active:scale-[0.98]"
                title="Delete Lead"
              >
                <PhTrash :size="14" />
              </button>
            </div>
          </div>
          
          <div v-if="leadsList.length === 0" class="text-center py-12 text-slate-400">
            No prospects found.
          </div>

          <AppPagination
            :page="pagination.page"
            :page-size="pagination.limit"
            :total="pagination.total"
            :total-pages="pagination.totalPages"
            @page-change="handlePageChange"
            @page-size-change="handlePageSizeChange"
          />
        </div>
      </div>

      <!-- 2. KANBAN VIEW -->
      <div v-else-if="viewMode === 'kanban'">
        <LeadKanbanBoard 
          :leads="leadsList" 
          @stageChange="handleKanbanStageChange"
        />
      </div>
    </div>

    <!-- Drawers & Modals Mounts -->
    <LeadCreateDrawer 
      :isOpen="isCreateOpen" 
      @close="isCreateOpen = false"
      @success="refetch"
      @merge="handleMergeTrigger"
    />

    <LeadAssignModal 
      :isOpen="isAssignOpen" 
      :leadIds="targetAssignIds"
      @close="isAssignOpen = false"
      @success="clearSelection"
    />

    <LeadLostModal 
      :isOpen="isLostOpen" 
      :leadId="activeLeadId"
      @close="isLostOpen = false"
      @success="refetch"
    />

    <LeadClosingModal 
      v-if="activeLead"
      :isOpen="isWonOpen" 
      :lead="activeLead"
      @close="isWonOpen = false"
      @success="refetch"
    />

    <LeadMergeModal
      v-if="isMergeOpen"
      :isOpen="isMergeOpen"
      :leadA="mergeLeadA"
      :leadB="mergeLeadB"
      @close="isMergeOpen = false"
      @success="handleMergeSuccess"
    />

    <!-- Lead Activity Center Drawer -->
    <LeadActivityCenter
      v-if="activityCenterLead"
      :isOpen="isActivityCenterOpen"
      :lead="activityCenterLead"
      :asDrawer="true"
      @close="isActivityCenterOpen = false; activityCenterLead = null"
    />

    <!-- Lead Bulk Upload Modal (Opens from right side) -->
    <LeadBulkUploadModal
      :isOpen="isBulkUploadOpen"
      @close="isBulkUploadOpen = false"
      @success="refetch"
    />

    <!-- Delete Lead Confirmation Modal (Section 19) -->
    <DeleteConfirmModal
      :isOpen="isDeleteModalOpen"
      :title="deleteModalTitle"
      :message="deleteModalMessage"
      :itemName="deleteModalItemName"
      :loading="isDeleting"
      @cancel="isDeleteModalOpen = false; isBulkDelete = false; leadToDelete = null"
      @confirm="confirmDeleteLead"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { PhTable, PhColumns, PhPlus, PhPhone, PhPhoneCall, PhWhatsappLogo, PhStar, PhFileArrowUp, PhTrash, PhX, PhUserPlus } from '@phosphor-icons/vue';
import apiClient from '@/api/client';
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue';
import LeadFilters from '../components/LeadFilters.vue';
import { formatLeadSource } from '@/utils/formatters';

function getWhatsAppUrl(mobile) {
  if (!mobile) return '#';
  const cleanPhone = String(mobile).replace(/\D/g, '');
  const phone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${phone}`;
}
import LeadTable from '../components/LeadTable.vue';
import LeadKanbanBoard from '../components/LeadKanbanBoard.vue';
import LeadStageBadge from '../components/LeadStageBadge.vue';
import LeadCreateDrawer from '../components/LeadCreateDrawer.vue';
import LeadAssignModal from '../components/LeadAssignModal.vue';
import LeadLostModal from '../components/LeadLostModal.vue';
import LeadClosingModal from '../components/LeadClosingModal.vue';
import LeadMergeModal from '../components/LeadMergeModal.vue';
import LeadActivityCenter from '../components/LeadActivityCenter.vue';
import LeadBulkUploadModal from '../components/LeadBulkUploadModal.vue';
import { useLeadsQuery, useChangeLeadStageMutation } from '../queries';

const store = useStore();
const canCreateLead = computed(() =>
  Boolean(store.getters['permissions/hasCapability']?.('leads.create'))
);
const canDeleteLeads = computed(() =>
  Boolean(store.getters['permissions/hasCapability']?.('leads.delete'))
);
const canBulkDeleteLeads = computed(() =>
  Boolean(
    store.getters['permissions/hasCapability']?.('leads.bulk_delete') ||
    store.getters['permissions/hasCapability']?.('leads.delete')
  )
);
const canAssignLeads = computed(() =>
  Boolean(store.getters['permissions/hasCapability']?.('leads.assign'))
);
const canBulkUpload = computed(() =>
  Boolean(store.getters['permissions/hasCapability']?.('leads.bulk_upload'))
);
const isBulkUploadOpen = ref(false);

const activeFilters = ref({
  search: '',
  status: '',
  source: '',
  branchId: '',
  assignedTo: '',
  sort: 'createdAt',
  order: -1,
  page: 1,
  limit: 20
});

// Load Vue Query
const { data, isLoading, refetch } = useLeadsQuery(activeFilters);

const leadsList = computed(() => {
  return data.value?.data || [];
});

const pagination = computed(() => data.value?.pagination || {
  page: activeFilters.value.page,
  limit: activeFilters.value.limit,
  total: leadsList.value.length,
  totalPages: 1,
});

const viewMode = ref('table');
const selectedRows = ref([]);

const isRowSelected = (row) => {
  const rowId = row._id || row.id;
  return selectedRows.value.some((r) => (r._id || r.id) === rowId);
};

const toggleRowSelection = (row) => {
  const rowId = row._id || row.id;
  const idx = selectedRows.value.findIndex((r) => (r._id || r.id) === rowId);
  if (idx >= 0) {
    selectedRows.value.splice(idx, 1);
  } else {
    selectedRows.value.push(row);
  }
};

const isAllSelected = computed(() => {
  if (!leadsList.value.length) return false;
  return leadsList.value.every((lead) => isRowSelected(lead));
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedRows.value = [];
  } else {
    selectedRows.value = [...leadsList.value];
  }
};
const isCreateOpen = ref(false);
const isAssignOpen = ref(false);
const isLostOpen = ref(false);
const isWonOpen = ref(false);

const activeLeadId = ref('');
const targetAssignIds = ref([]);
const isActivityCenterOpen = ref(false);
const activityCenterLead = ref(null);

const activeLead = computed(() => {
  return leadsList.value.find(l => (l._id || l.id) === activeLeadId.value) || null;
});

const openActivityCenter = (lead) => {
  activityCenterLead.value = lead;
  isActivityCenterOpen.value = true;
};

const handleFilterChange = (filters) => {
  activeFilters.value = { ...activeFilters.value, ...filters, page: 1 };
  selectedRows.value = [];
};

const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

const handleSort = ({ field, direction }) => {
  activeFilters.value.sort = field;
  activeFilters.value.order = direction === 'asc' ? 1 : -1;
  activeFilters.value.page = 1;
};

const handlePageChange = (page) => {
  activeFilters.value.page = page;
  selectedRows.value = [];
};

const handlePageSizeChange = (limit) => {
  activeFilters.value = { ...activeFilters.value, page: 1, limit };
  selectedRows.value = [];
};

const openBulkAssign = () => {
  targetAssignIds.value = selectedRows.value.map(row => row._id || row.id);
  isAssignOpen.value = true;
};

const clearSelection = () => {
  selectedRows.value = [];
  refetch();
};

const { mutateAsync: changeStage } = useChangeLeadStageMutation();

const handleKanbanStageChange = async ({ id, status }) => {
  activeLeadId.value = id;

  if (status === 'lost') {
    isLostOpen.value = true;
  } else if (status === 'won') {
    isWonOpen.value = true;
  } else {
    try {
      await changeStage({ id, status });
    } catch (error) {
      console.error('Failed to change stage:', error);
    }
  }
};

const isMergeOpen = ref(false);
const mergeLeadA = ref(null);
const mergeLeadB = ref(null);

const handleMergeTrigger = async ({ leadA, leadB }) => {
  // If leadA is a draft from create form (no ID), pre-save it
  if (!leadA._id && !leadA.id) {
    try {
      const res = await apiClient.post('/leads', leadA);
      const createdLead = res.data?.data || res.data;
      mergeLeadA.value = createdLead;
    } catch (error) {
      store.dispatch('notifications/triggerToast', {
        message: 'Failed to initialize merge: could not save new lead draft.',
        type: 'error'
      });
      return;
    }
  } else {
    mergeLeadA.value = leadA;
  }
  mergeLeadB.value = leadB;
  
  isCreateOpen.value = false;
  isMergeOpen.value = true;
};

const handleMergeSuccess = () => {
  refetch();
};

const getAgingDotClass = (dateStr) => {
  if (!dateStr) return 'bg-slate-300';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 3) return 'bg-green-500';
  if (diffDays <= 7) return 'bg-yellow-400';
  if (diffDays <= 14) return 'bg-orange-500';
  return 'bg-red-500';
};

const isDeleteModalOpen = ref(false);
const leadToDelete = ref(null);
const isBulkDelete = ref(false);
const isDeleting = ref(false);

const deleteModalTitle = computed(() => {
  if (isBulkDelete.value) {
    return `Delete ${selectedRows.value.length} Property Leads?`;
  }
  return 'Delete Property Lead?';
});

const deleteModalMessage = computed(() => {
  if (isBulkDelete.value) {
    return `Are you sure you want to permanently delete these ${selectedRows.value.length} property leads? This action cannot be undone.`;
  }
  return 'This action cannot be undone.';
});

const deleteModalItemName = computed(() => {
  if (isBulkDelete.value) {
    return `${selectedRows.value.length} selected property leads`;
  }
  if (!leadToDelete.value) return '';
  return `${leadToDelete.value.firstName} ${leadToDelete.value.lastName || ''}`.trim();
});

const handleDeleteLead = (lead) => {
  isBulkDelete.value = false;
  leadToDelete.value = lead;
  isDeleteModalOpen.value = true;
};

const openBulkDelete = () => {
  if (selectedRows.value.length === 0) return;
  isBulkDelete.value = true;
  leadToDelete.value = null;
  isDeleteModalOpen.value = true;
};

const confirmDeleteLead = async () => {
  isDeleting.value = true;
  try {
    if (isBulkDelete.value) {
      const ids = selectedRows.value.map((r) => r._id || r.id);
      await Promise.all(ids.map((id) => apiClient.delete(`/leads/${id}`)));
      store.dispatch('notifications/triggerToast', {
        message: `${ids.length} property leads deleted successfully.`,
        type: 'success',
      });
      selectedRows.value = [];
    } else if (leadToDelete.value) {
      await apiClient.delete(`/leads/${leadToDelete.value._id || leadToDelete.value.id}`);
      store.dispatch('notifications/triggerToast', {
        message: 'Property lead deleted successfully.',
        type: 'success',
      });
      leadToDelete.value = null;
    }
    isDeleteModalOpen.value = false;
    isBulkDelete.value = false;
    refetch();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: err.response?.data?.message || err.message || 'Failed to delete lead(s).',
      type: 'error',
    });
  } finally {
    isDeleting.value = false;
  }
};
</script>
