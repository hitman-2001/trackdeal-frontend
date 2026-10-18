<template>
  <div class="workspace-page tasks-page w-full max-w-full min-w-0 pb-28 sm:pb-16 space-y-4 sm:space-y-5">
    <!-- Page Header (Education Section 6 Standard) -->
    <div class="flex items-center justify-between gap-3 sm:gap-4">
      <div>
        <h1 class="text-xl sm:text-[28px] font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          Tasks
        </h1>
        <p class="text-xs sm:text-[13px] text-slate-500 mt-0.5 hidden sm:block">
          Daily follow-ups, site visits, meetings, and client action items.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 shrink-0">
        <button 
          v-if="selectedRows.length > 0"
          type="button"
          @click="openBulkAssign"
          class="btn btn-secondary btn-sm rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
        >
          <PhUserPlus :size="14" weight="bold" />
          <span>Assign ({{ selectedRows.length }})</span>
        </button>

        <button 
          type="button"
          @click="isCreateOpen = true"
          class="btn btn-primary btn-sm rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition-transform"
        >
          <PhPlus :size="15" weight="bold" />
          <span>Add Task</span>
        </button>
      </div>
    </div>

    <!-- Mobile Mini KPI Strip (< 640px) -->
    <div class="sm:hidden grid grid-cols-4 gap-1.5 bg-surface border border-default rounded-2xl p-2.5 shadow-2xs text-center">
      <div class="px-1">
        <div class="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
          {{ openTasksCount }}
        </div>
        <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">Open</span>
      </div>

      <div class="px-1 border-l border-slate-100 dark:border-neutral-800">
        <div class="text-base font-bold leading-tight" :class="overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'">
          {{ overdueCount }}
        </div>
        <span class="text-[10px] font-medium block mt-0.5" :class="overdueCount > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-500 dark:text-slate-400'">
          Overdue
        </span>
      </div>

      <div class="px-1 border-l border-slate-100 dark:border-neutral-800">
        <div class="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
          {{ dueTodayCount }}
        </div>
        <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">Today</span>
      </div>

      <div class="px-1 border-l border-slate-100 dark:border-neutral-800">
        <div class="text-base font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
          {{ completionRate }}%
        </div>
        <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">Done</span>
      </div>
    </div>

    <!-- Desktop KPI Cards Grid (>= 640px) -->
    <div class="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-surface border border-default rounded-2xl p-4 shadow-xs">
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Open Tasks</span>
        <div class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
          {{ openTasksCount }}
        </div>
        <span class="text-[11px] text-blue-600 dark:text-blue-400 font-medium block mt-1">
          Pending / in progress
        </span>
      </div>

      <div class="bg-surface border border-default rounded-2xl p-4 shadow-xs" :class="{ 'border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10': overdueCount > 0 }">
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 block">SLA Overdue</span>
        <div class="text-2xl font-bold tracking-tight mt-1" :class="overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'">
          {{ overdueCount }}
        </div>
        <span class="text-[11px] font-medium block mt-1" :class="overdueCount > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-400'">
          {{ overdueCount > 0 ? 'Requires attention' : 'All caught up' }}
        </span>
      </div>

      <div class="bg-surface border border-default rounded-2xl p-4 shadow-xs">
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Due Today</span>
        <div class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
          {{ dueTodayCount }}
        </div>
        <span class="text-[11px] text-slate-400 font-medium block mt-1">
          Scheduled today
        </span>
      </div>

      <div class="bg-surface border border-default rounded-2xl p-4 shadow-xs">
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Completion Rate</span>
        <div class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
          {{ completionRate }}%
        </div>
        <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
          Overall completed
        </span>
      </div>
    </div>

    <!-- Filter Bar Component -->
    <TaskFilters @change="handleFilterChange" />

    <!-- Bulk Selection Toolbar (When tasks are selected) -->
    <div
      v-if="selectedRows.length > 0"
      class="rounded-xl bg-surface border border-default shadow-sm p-3 sm:px-4 sm:py-2.5 transition-all flex items-center justify-between gap-3 flex-wrap"
    >
      <div class="flex items-center gap-2">
        <span class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold font-tabular shadow-2xs shrink-0">
          {{ selectedRows.length }}
        </span>
        <span class="text-xs font-bold text-slate-900 dark:text-slate-100">
          {{ selectedRows.length === 1 ? '1 task selected' : `${selectedRows.length} tasks selected` }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="selectedRows.length < mappedTasks.length"
          type="button"
          @click="selectAllRows"
          class="text-xs font-semibold text-primary hover:underline px-1 py-0.5 cursor-pointer"
        >
          Select all ({{ mappedTasks.length }})
        </button>

        <button
          type="button"
          @click="openBulkAssign"
          class="btn btn-primary btn-sm flex items-center gap-1.5 rounded-lg text-xs font-semibold shadow-xs"
        >
          <PhUserPlus :size="14" weight="bold" />
          <span>Assign</span>
        </button>

        <button
          type="button"
          @click="clearSelection"
          class="btn btn-ghost btn-sm text-xs font-medium"
        >
          <PhX :size="13" weight="bold" />
          <span>Deselect</span>
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="animate-pulse space-y-3">
      <div class="h-10 bg-slate-200 dark:bg-neutral-850 rounded-xl w-full"></div>
      <div class="h-64 bg-slate-200 dark:bg-neutral-850 rounded-2xl"></div>
    </div>

    <!-- Content Area -->
    <div v-else class="space-y-4">
      <!-- Desktop Table Card (>= 1024px) -->
      <div class="hidden lg:block bg-surface border border-default rounded-2xl overflow-hidden shadow-xs">
        <TaskTable 
          :rows="mappedTasks"
          :isLoading="isLoading"
          :selectedTasks="selectedRows"
          :pagination="pagination"
          @selectionChange="handleSelectionChange"
          @sort="handleSort"
          @pageChange="handlePageChange"
          @pageSizeChange="handlePageSizeChange"
          @select="handleTaskSelect"
          @complete="openCompleteModal"
          @cancelTask="openCancelModal"
        />
      </div>

      <!-- Mobile & Tablet Task Cards (< 1024px) -->
      <div class="lg:hidden space-y-3">
        <!-- Select All Header Row on Mobile when tasks exist -->
        <div
          v-if="mappedTasks.length > 0"
          class="flex items-center justify-between px-3 py-2 bg-surface rounded-xl border border-default text-xs shadow-2xs"
        >
          <label class="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200 select-none active:opacity-75">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
              class="w-4.5 h-4.5 rounded text-primary border-slate-300 dark:border-neutral-700 focus:ring-primary cursor-pointer shrink-0"
            />
            <span>{{ isAllSelected ? 'Deselect All' : `Select All (${mappedTasks.length})` }}</span>
          </label>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {{ pagination.total || mappedTasks.length }} tasks
          </span>
        </div>

        <!-- Task Cards Feed -->
        <div
          v-for="task in mappedTasks" 
          :key="task.id"
          @click="handleTaskSelect(task)"
          class="bg-surface border rounded-2xl p-4 shadow-xs space-y-3 transition-all cursor-pointer active:scale-[0.99]"
          :class="[
            isTaskSelected(task) ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-default hover:border-slate-300 dark:hover:border-neutral-700',
            isTaskOverdue(task.dueDate, task.status) && !isTaskSelected(task) ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/10' : ''
          ]"
        >
          <!-- Top Row: Checkbox + Title + Priority Pill -->
          <div class="flex items-start justify-between gap-2.5">
            <div class="flex items-start gap-2.5 min-w-0 flex-1">
              <input
                type="checkbox"
                :checked="isTaskSelected(task)"
                @click.stop="toggleTaskSelection(task)"
                class="w-4.5 h-4.5 mt-0.5 rounded text-primary border-slate-300 dark:border-neutral-700 focus:ring-primary cursor-pointer shrink-0"
              />
              <div class="min-w-0 flex-1">
                <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug break-words">
                  {{ task.title }}
                </h3>
                <p v-if="task.description" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {{ task.description }}
                </p>
              </div>
            </div>

            <span :class="['px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider shrink-0', getPriorityBadgeClass(task.priority)]">
              {{ task.priority }}
            </span>
          </div>

          <!-- Context Row: Related Lead or Deal -->
          <div v-if="task.leadId || task.dealId" class="flex items-center gap-2 flex-wrap text-xs">
            <span v-if="task.leadId" class="inline-flex items-center text-[10px] bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900/40 px-2 py-0.5 rounded-md font-semibold gap-1">
              <PhUser :size="11" />
              <span>Lead: {{ getLeadName(task.leadId) }}</span>
            </span>
            <span v-if="task.dealId" class="inline-flex items-center text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5 rounded-md font-semibold gap-1">
              <PhHandshake :size="11" />
              <span>Deal: {{ task.dealId.title || 'View Deal' }}</span>
            </span>
          </div>

          <!-- Metadata Row: Type, Due Date, Agent -->
          <div class="flex items-center justify-between text-xs text-slate-500 pt-1.5 border-t border-slate-100 dark:border-neutral-800/80 flex-wrap gap-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span :class="['px-2 py-0.5 rounded-md text-[10px] font-semibold border capitalize inline-flex items-center gap-1', getTypeBadgeClass(task.type)]">
                <component :is="getTypeIcon(task.type)" :size="12" class="shrink-0" />
                <span>{{ task.type ? task.type.replace('_', ' ') : 'Task' }}</span>
              </span>

              <span :class="['text-[11px] font-semibold inline-flex items-center gap-1', isTaskOverdue(task.dueDate, task.status) ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400']">
                <PhClock :size="12" />
                <span>{{ formatTime(task.dueDate) }}</span>
                <span v-if="isTaskOverdue(task.dueDate, task.status)" class="text-[9px] uppercase px-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold ml-0.5">Overdue</span>
              </span>
            </div>

            <!-- Agent -->
            <div class="flex items-center gap-1.5 text-xs">
              <span class="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[9px] font-bold text-primary uppercase shrink-0">
                {{ (task.assignedTo?.firstName || 'M').charAt(0) }}
              </span>
              <span class="text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                {{ task.assignedTo?.firstName || 'Me' }}
              </span>
            </div>
          </div>

          <!-- Action buttons for active tasks -->
          <div v-if="['pending', 'in_progress'].includes(task.status)" class="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-neutral-800/80">
            <button 
              type="button"
              @click.stop="openCompleteModal(task)"
              class="h-7 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              <PhCheck :size="12" weight="bold" />
              <span>Complete</span>
            </button>
            <button 
              type="button"
              @click.stop="openCancelModal(task)"
              class="h-7 px-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold inline-flex items-center gap-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
            >
              <PhX :size="12" weight="bold" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="mappedTasks.length === 0" class="py-16 text-center space-y-3">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mx-auto">
            <PhCheckSquare :size="28" />
          </div>
          <div>
            <p class="font-bold text-slate-800 dark:text-slate-200 text-base">No tasks found</p>
            <p class="text-sm text-slate-400 mt-1">Try adjusting your filters or click Add Task to create a new one.</p>
          </div>
        </div>

        <!-- Mobile Pagination -->
        <AppPagination
          class="col-span-full pt-2"
          :page="pagination.page"
          :page-size="pagination.limit"
          :total="pagination.total"
          :total-pages="pagination.totalPages || pagination.pages"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </div>
    </div>

    <!-- Drawers & Modals mounts -->
    <TaskCreateDrawer 
      :isOpen="isCreateOpen" 
      @close="isCreateOpen = false"
      @success="refetch"
    />

    <TaskEditDrawer 
      v-if="isEditOpen"
      :isOpen="isEditOpen" 
      :task="activeTask"
      @close="isEditOpen = false"
      @success="refetch"
    />

    <TaskDetailsDrawer 
      v-if="isDetailsOpen"
      :isOpen="isDetailsOpen"
      :task="activeTask"
      @close="isDetailsOpen = false"
      @edit="openEditDrawer"
      @complete="openCompleteModalFromDetails"
      @cancelTask="openCancelModalFromDetails"
      @success="refetch"
    />

    <TaskCompleteModal 
      v-if="isCompleteOpen"
      :isOpen="isCompleteOpen"
      :task="activeTask"
      @close="isCompleteOpen = false"
      @success="handleTaskActionSuccess"
    />

    <TaskCancelModal 
      v-if="isCancelOpen"
      :isOpen="isCancelOpen"
      :task="activeTask"
      @close="isCancelOpen = false"
      @success="handleTaskActionSuccess"
    />

    <BulkAssignModal 
      :isOpen="isBulkAssignOpen"
      :taskIds="targetAssignIds"
      @close="isBulkAssignOpen = false"
      @success="clearSelection"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import TaskFilters from '../components/TaskFilters.vue';
import TaskTable from '../components/TaskTable.vue';
import TaskCreateDrawer from '../components/TaskCreateDrawer.vue';
import TaskEditDrawer from '../components/TaskEditDrawer.vue';
import TaskDetailsDrawer from '../components/TaskDetailsDrawer.vue';
import TaskCompleteModal from '../components/TaskCompleteModal.vue';
import TaskCancelModal from '../components/TaskCancelModal.vue';
import BulkAssignModal from '../components/BulkAssignModal.vue';
import { useTasksQuery } from '../queries';

import {
  PhPlus,
  PhUserPlus,
  PhCheck,
  PhX,
  PhClock,
  PhUser,
  PhHandshake,
  PhCheckSquare,
  PhPhone,
  PhChatCircle,
  PhEnvelope,
  PhHouse,
  PhFileText,
  PhCreditCard,
  PhGear
} from '@phosphor-icons/vue';

const queryClient = useQueryClient();

const activeFilters = ref({
  search: '',
  status: '',
  priority: '',
  type: '',
  assignedTo: '',
  dateRange: 'all',
  page: 1,
  limit: 20
});

const { data, isLoading, refetch } = useTasksQuery(activeFilters);

const rawTasksList = computed(() => {
  return data.value?.data || [];
});

const pagination = computed(() => data.value?.pagination || {
  page: activeFilters.value.page,
  limit: activeFilters.value.limit,
  total: rawTasksList.value.length,
  totalPages: 1,
});

const mappedTasks = computed(() => {
  return rawTasksList.value.map(task => ({
    ...task,
    id: task._id || task.id
  }));
});

// KPI Calculations
const openTasksCount = computed(() => {
  return rawTasksList.value.filter(t => ['pending', 'in_progress'].includes(t.status)).length;
});

const overdueCount = computed(() => {
  return rawTasksList.value.filter(t => 
    ['pending', 'in_progress'].includes(t.status) && 
    new Date(t.dueDate).getTime() < Date.now()
  ).length;
});

const dueTodayCount = computed(() => {
  const todayStr = new Date().toDateString();
  return rawTasksList.value.filter(t => 
    ['pending', 'in_progress'].includes(t.status) && 
    new Date(t.dueDate).toDateString() === todayStr
  ).length;
});

const completionRate = computed(() => {
  const list = rawTasksList.value;
  if (list.length === 0) return 0;
  const completed = list.filter(t => t.status === 'completed').length;
  return Math.round((completed / list.length) * 100);
});

// Modals / Drawers Toggles
const selectedRows = ref([]);
const isCreateOpen = ref(false);
const isEditOpen = ref(false);
const isDetailsOpen = ref(false);
const isCompleteOpen = ref(false);
const isCancelOpen = ref(false);
const isBulkAssignOpen = ref(false);

const activeTask = ref(null);
const targetAssignIds = ref([]);

const handleFilterChange = (filters) => {
  activeFilters.value = { ...activeFilters.value, ...filters, page: 1 };
  selectedRows.value = [];
};

const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

const isTaskSelected = (task) => {
  const taskId = task._id || task.id;
  return selectedRows.value.some(row => (row._id || row.id) === taskId);
};

const toggleTaskSelection = (task) => {
  const taskId = task._id || task.id;
  const idx = selectedRows.value.findIndex(row => (row._id || row.id) === taskId);
  if (idx > -1) {
    selectedRows.value.splice(idx, 1);
  } else {
    selectedRows.value.push(task);
  }
};

const isAllSelected = computed(() => {
  return mappedTasks.value.length > 0 && selectedRows.value.length === mappedTasks.value.length;
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedRows.value = [];
  } else {
    selectedRows.value = [...mappedTasks.value];
  }
};

const selectAllRows = () => {
  selectedRows.value = [...mappedTasks.value];
};

const clearSelection = () => {
  selectedRows.value = [];
  refetch();
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

const handleTaskSelect = (task) => {
  activeTask.value = task;
  isDetailsOpen.value = true;
};

const openEditDrawer = (task) => {
  activeTask.value = task;
  isDetailsOpen.value = false;
  isEditOpen.value = true;
};

const openCompleteModal = (task) => {
  activeTask.value = task;
  isCompleteOpen.value = true;
};

const openCompleteModalFromDetails = (task) => {
  activeTask.value = task;
  isDetailsOpen.value = false;
  isCompleteOpen.value = true;
};

const openCancelModal = (task) => {
  activeTask.value = task;
  isCancelOpen.value = true;
};

const openCancelModalFromDetails = (task) => {
  activeTask.value = task;
  isDetailsOpen.value = false;
  isCancelOpen.value = true;
};

const handleTaskActionSuccess = () => {
  refetch();
  queryClient.invalidateQueries({ queryKey: ['leads'] });
};

const openBulkAssign = () => {
  targetAssignIds.value = selectedRows.value.map(row => row._id || row.id);
  isBulkAssignOpen.value = true;
};

const isTaskOverdue = (dateStr, status) => {
  if (!dateStr || ['completed', 'cancelled'].includes(status)) return false;
  return new Date(dateStr).getTime() < Date.now();
};

const getLeadName = (lead) => {
  if (!lead) return 'Lead';
  if (typeof lead === 'string') return 'View Lead';
  return `${lead.firstName} ${lead.lastName || ''}`.trim();
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'call': return PhPhone;
    case 'whatsapp': return PhChatCircle;
    case 'email': return PhEnvelope;
    case 'site_visit': return PhHouse;
    case 'meeting': return PhHandshake;
    case 'document': return PhFileText;
    case 'payment': return PhCreditCard;
    default: return PhGear;
  }
};

const getTypeBadgeClass = (type) => {
  switch (type) {
    case 'call':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800';
    case 'whatsapp':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800';
    case 'email':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800';
    case 'site_visit':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800';
    case 'meeting':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800';
    case 'document':
      return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-800';
    case 'payment':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-neutral-800 dark:text-slate-300 dark:border-neutral-700';
  }
};

const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case 'low': return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-neutral-800 dark:text-slate-400 dark:border-neutral-700';
    case 'medium': return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800';
    case 'high': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800';
    case 'urgent': return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800 font-bold';
    default: return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-neutral-800 dark:border-neutral-700';
  }
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>
