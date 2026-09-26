<template>
  <div class="space-y-6">
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

        <!-- Bulk Assign Action (Shows when items are checked) -->
        <button 
          v-if="selectedRows.length > 0"
          type="button"
          @click="openBulkAssign"
          class="btn btn-secondary h-[42px] px-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40"
        >
          Assign ({{ selectedRows.length }})
        </button>

        <!-- Bulk Import Leads (Excel/CSV) for Org Admin -->
        <button
          v-if="isOrgAdmin"
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
      <!-- 1. TABLE VIEW -->
      <div v-if="viewMode === 'table'">
        <!-- Desktop Grid -->
        <div class="hidden lg:block">
          <LeadTable 
            :rows="leadsList"
            :isLoading="isLoading"
            :selectedLeads="selectedRows"
            :pagination="pagination"
            @selectionChange="handleSelectionChange"
            @sort="handleSort"
            @pageChange="handlePageChange"
            @pageSizeChange="handlePageSizeChange"
            @delete="handleDeleteLead"
          />
        </div>

        <!-- Responsive Mobile List Cards -->
        <div class="lg:hidden grid grid-cols-1 gap-3">
          <div 
            v-for="lead in leadsList" 
            :key="lead._id || lead.id"
            class="bg-surface border border-default rounded-xl p-4 shadow-xs flex items-center justify-between text-xs"
          >
            <div>
              <div class="flex items-center space-x-1.5 mb-1">
                <span 
                  class="w-2 h-2 rounded-full shrink-0" 
                  :class="getAgingDotClass(lead.createdAt)"
                ></span>
                <router-link :to="`/app/leads/${lead._id || lead.id}`" class="font-bold text-primary hover:underline text-sm block">
                  {{ lead.firstName }} {{ lead.lastName || '' }}
                </router-link>
              </div>
              <div class="text-neutral-500 space-y-1 text-caption">
                <span class="flex items-center gap-1">
                  <PhPhone class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  {{ lead.mobile }}
                </span>
                <span class="block">Source: <b class="capitalize">{{ lead.source }}</b></span>
              </div>
            </div>
            <div class="flex flex-col items-end space-y-2">
              <LeadStageBadge :stage="lead.status" />
              <span class="flex items-center gap-1 font-bold text-neutral-700 text-caption">
                <PhStar class="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                {{ lead.score }}
              </span>
              <div class="flex items-center gap-1.5">
                <button
                  @click.stop="openActivityCenter(lead)"
                  class="px-2 py-1 rounded-lg text-[10px] font-bold bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 transition"
                >
                  <AppIcon name="house" :size="12" /> Visits
                </button>
                <button
                  type="button"
                  @click.stop="handleDeleteLead(lead)"
                  class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="Delete Lead"
                >
                  <PhTrash :size="13" />
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="leadsList.length === 0" class="text-center py-12 text-slate-400">
            No prospects found.
          </div>

          <AppPagination
            class="col-span-full"
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
      title="Delete Property Lead?"
      message="This action cannot be undone."
      :itemName="leadToDelete ? `${leadToDelete.firstName} ${leadToDelete.lastName || ''}`.trim() : ''"
      :loading="isDeleting"
      @cancel="isDeleteModalOpen = false; leadToDelete = null"
      @confirm="confirmDeleteLead"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { PhTable, PhColumns, PhPlus, PhPhone, PhStar, PhFileArrowUp, PhTrash } from '@phosphor-icons/vue';
import apiClient from '@/api/client';
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue';
import LeadFilters from '../components/LeadFilters.vue';
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
const isOrgAdmin = computed(() =>
  ['super_admin', 'system_admin', 'org_admin', 'organization_admin'].includes(
    String(store.getters['auth/userRole'] || '').toLowerCase()
  )
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
const isDeleting = ref(false);

const handleDeleteLead = (lead) => {
  leadToDelete.value = lead;
  isDeleteModalOpen.value = true;
};

const confirmDeleteLead = async () => {
  if (!leadToDelete.value) return;
  isDeleting.value = true;
  try {
    await apiClient.delete(`/leads/${leadToDelete.value._id || leadToDelete.value.id}`);
    store.dispatch('notifications/triggerToast', {
      message: 'Property lead deleted successfully.',
      type: 'success'
    });
    isDeleteModalOpen.value = false;
    leadToDelete.value = null;
    refetch();
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: err.response?.data?.message || 'Failed to delete lead.',
      type: 'error'
    });
  } finally {
    isDeleting.value = false;
  }
};
</script>
