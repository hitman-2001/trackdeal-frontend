<template>
  <div class="workspace-page education-list space-y-5 text-xs">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-default pb-4">
      <div>
        <h1 class="font-heading text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Classes & Batches</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage course offerings, class schedules, fees, and batch enrollment capacities.
        </p>
      </div>
      <button 
        class="btn btn-primary btn-sm h-9 px-3.5 text-xs font-semibold gap-1.5 self-start sm:self-auto shadow-xs" 
        @click="openCreate"
      >
        <PhPlus :size="15" weight="bold" />
        <span>Add Class</span>
      </button>
    </div>

    <!-- Filter & Search Bar -->
    <div class="p-3.5 rounded-xl bg-surface border border-default shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-2.5 flex-1 flex-wrap">
        <!-- Search Field -->
        <div class="relative w-full sm:w-80">
          <PhMagnifyingGlass :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="search"
            type="text"
            placeholder="Search class, code, subject, grade..."
            class="w-full bg-slate-50 dark:bg-slate-850 border border-default rounded-xl pl-9 pr-3 py-2 text-xs focus:border-primary outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            @input="handleSearch"
          />
        </div>

        <!-- Status Filter -->
        <div class="flex items-center gap-1.5">
          <select 
            v-model="statusFilter" 
            class="bg-slate-50 dark:bg-slate-850 border border-default rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:border-primary outline-none"
            @change="onFilterChange"
          >
            <option value="">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <!-- Results Pill -->
      <div class="flex items-center gap-2 self-end sm:self-auto">
        <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-tabular bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-default/60">
          {{ pagination.total }} {{ pagination.total === 1 ? 'Class' : 'Classes' }}
        </span>
      </div>
    </div>

    <!-- AppTable Data Table Component -->
    <div class="rounded-xl bg-surface border border-default overflow-hidden shadow-xs">
      <AppTable
        :rows="rows"
        :columns="columns"
        :isLoading="loading"
        :pagination="pagination"
        :sorting="sorting"
        row-actions-label="Actions"
        empty-title="No classes found"
        empty-subtext="No classes or batches match your filters. Create a new class to get started."
        @rowClick="openView"
        @pageChange="handlePageChange"
        @pageSizeChange="handlePageSizeChange"
        @sort="handleSort"
      >
        <!-- Cell: Class / Batch Name -->
        <template #cell(name)="{ row }">
          <div class="space-y-0.5">
            <div class="font-bold text-slate-900 dark:text-slate-100 text-xs hover:text-primary transition-colors">
              {{ row.name }}
            </div>
            <div v-if="row.code" class="flex items-center gap-1">
              <span class="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                {{ row.code }}
              </span>
            </div>
          </div>
        </template>

        <!-- Cell: Subject / Target Grade -->
        <template #cell(subjectGrade)="{ row }">
          <div class="text-slate-700 dark:text-slate-300 text-xs">
            <span class="font-medium">{{ row.subject || '—' }}</span>
            <span v-if="row.grade" class="text-slate-400 font-normal"> • {{ row.grade }}</span>
          </div>
        </template>

        <!-- Cell: Fees -->
        <template #cell(fees)="{ row }">
          <div class="font-tabular font-bold text-slate-900 dark:text-slate-100 text-xs">
            ₹{{ Number(row.fees || 0).toLocaleString('en-IN') }}
          </div>
        </template>

        <!-- Cell: Batch Capacity -->
        <template #cell(capacity)="{ row }">
          <div class="font-tabular text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
            <span class="font-bold">{{ row.capacity || 0 }}</span>
            <span class="text-slate-400 text-[10px]">seats</span>
          </div>
        </template>

        <!-- Cell: Instructor / Faculty -->
        <template #cell(instructor)="{ row }">
          <div v-if="row.instructorName" class="text-slate-700 dark:text-slate-300 font-medium text-xs truncate max-w-[140px]" :title="row.instructorName">
            {{ row.instructorName }}
          </div>
          <span v-else class="text-slate-400 italic text-[11px]">Unassigned</span>
        </template>

        <!-- Cell: Status Badge -->
        <template #cell(status)="{ row }">
          <span
            class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1"
            :class="getStatusClass(row.status)"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(row.status)"></span>
            {{ row.status }}
          </span>
        </template>

        <!-- Row Actions Slot -->
        <template #rowActions="{ row }">
          <div class="flex items-center gap-1 justify-end">
            <!-- 1. View Button (Eye) -->
            <button
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
              title="View class details"
              aria-label="View class details"
              @click.stop="openView(row)"
            >
              <PhEye :size="15" weight="bold" />
            </button>

            <!-- 2. Edit Button (Pencil) -->
            <button
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
              title="Edit class"
              aria-label="Edit class"
              @click.stop="openEdit(row)"
            >
              <PhPencilSimple :size="15" weight="bold" />
            </button>

            <!-- 3. Delete Button (Trash) - Admin Only -->
            <button
              v-if="isAdmin"
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete class (Admin only)"
              aria-label="Delete class"
              @click.stop="handleDelete(row)"
            >
              <PhTrash :size="15" weight="bold" />
            </button>
          </div>
        </template>
      </AppTable>
    </div>

    <!-- View Class Details Drawer -->
    <AppDrawer
      :isOpen="showViewDrawer"
      title="Class Details"
      subtitle="Read-only view of course offering and batch configuration"
      width="520px"
      @close="showViewDrawer = false"
    >
      <div v-if="viewingClass" class="space-y-4 text-xs">
        <!-- Header Card -->
        <div class="bg-slate-50 dark:bg-slate-850/50 p-4 rounded-xl border border-default space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="font-heading font-extrabold text-base text-slate-900 dark:text-slate-100">
              {{ viewingClass.name }}
            </h3>
            <span
              class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border"
              :class="getStatusClass(viewingClass.status)"
            >
              {{ viewingClass.status }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-slate-400 font-mono text-[11px] flex-wrap">
            <span>Code: <strong class="text-slate-700 dark:text-slate-200">{{ viewingClass.code || 'None' }}</strong></span>
            <span>•</span>
            <span>Created: {{ formatDate(viewingClass.createdAt) }}</span>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 bg-surface border border-default rounded-xl space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject</span>
            <p class="font-bold text-slate-900 dark:text-slate-100 text-xs">{{ viewingClass.subject || '—' }}</p>
          </div>

          <div class="p-3 bg-surface border border-default rounded-xl space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Grade</span>
            <p class="font-bold text-slate-900 dark:text-slate-100 text-xs">{{ viewingClass.grade || '—' }}</p>
          </div>

          <div class="p-3 bg-surface border border-default rounded-xl space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Course Fees</span>
            <p class="font-bold text-emerald-600 dark:text-emerald-400 text-sm font-tabular">₹{{ Number(viewingClass.fees || 0).toLocaleString('en-IN') }}</p>
          </div>

          <div class="p-3 bg-surface border border-default rounded-xl space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Max Batch Capacity</span>
            <p class="font-bold text-slate-900 dark:text-slate-100 text-sm font-tabular">{{ viewingClass.capacity || 0 }} Seats</p>
          </div>

          <div class="p-3 bg-surface border border-default rounded-xl space-y-1 col-span-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Instructor / Faculty</span>
            <p class="font-bold text-slate-900 dark:text-slate-100 text-xs">{{ viewingClass.instructorName || 'Not Assigned' }}</p>
          </div>

          <div class="p-3 bg-surface border border-default rounded-xl space-y-1 col-span-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Class Schedule & Timings</span>
            <p class="font-medium text-slate-700 dark:text-slate-300 text-xs">{{ viewingClass.schedule || 'Flexible / To be announced' }}</p>
          </div>

          <div v-if="viewingClass.description" class="p-3 bg-surface border border-default rounded-xl space-y-1 col-span-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Course Description & Curriculum</span>
            <p class="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{{ viewingClass.description }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <button type="button" class="btn btn-secondary btn-sm" @click="showViewDrawer = false">Close</button>
        <button
          type="button"
          class="btn btn-primary btn-sm gap-1.5"
          @click="switchToEditFromView"
        >
          <PhPencilSimple :size="14" />
          <span>Edit Class</span>
        </button>
      </template>
    </AppDrawer>

    <!-- Create / Edit Class Drawer -->
    <AppDrawer
      :isOpen="showModal"
      :title="editing ? 'Edit Class' : 'Create Class'"
      :subtitle="editing ? 'Update class and batch information' : 'Create a new batch or course offering'"
      width="520px"
      @close="showModal = false"
    >
      <form id="class-form" class="space-y-4 text-xs" @submit.prevent="save">
        <p v-if="error" class="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">{{ error }}</p>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <label class="space-y-1 col-span-2 font-medium text-slate-700 dark:text-slate-300">Name *
            <input v-model="form.name" required class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Code
            <input v-model="form.code" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Subject
            <input v-model="form.subject" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Grade
            <input v-model="form.grade" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Fees (₹)
            <input v-model="form.fees" type="number" min="0" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Capacity
            <input v-model="form.capacity" type="number" min="1" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Instructor
            <input v-model="form.instructorName" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Status
            <select v-model="form.status" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none">
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label class="space-y-1 col-span-2 font-medium text-slate-700 dark:text-slate-300">Schedule
            <input v-model="form.schedule" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 col-span-2 font-medium text-slate-700 dark:text-slate-300">Description
            <textarea v-model="form.description" rows="3" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"></textarea>
          </label>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary btn-sm" @click="showModal = false">Cancel</button>
        <button type="submit" form="class-form" class="btn btn-primary btn-sm" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Class' }}
        </button>
      </template>
    </AppDrawer>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { 
  PhEye, 
  PhPencilSimple, 
  PhTrash, 
  PhPlus, 
  PhMagnifyingGlass 
} from '@phosphor-icons/vue';
import Swal from 'sweetalert2';
import AppTable from '@/components/AppTable.vue';
import AppDrawer from '@/components/AppDrawer.vue';
import {
  createEducationClass,
  fetchEducationClasses,
  updateEducationClass,
  deleteEducationClass
} from '../api/endpoints';

const store = useStore();
const isAdmin = computed(() => {
  const role = store.getters['auth/userRole'];
  return ['super_admin', 'org_admin', 'admin'].includes(role);
});

const columns = [
  { key: 'name', label: 'Class / Batch', sortable: true },
  { key: 'subjectGrade', label: 'Subject & Grade', sortable: false },
  { key: 'fees', label: 'Fees', sortable: true },
  { key: 'capacity', label: 'Capacity', sortable: true },
  { key: 'instructor', label: 'Instructor', sortable: false },
  { key: 'status', label: 'Status', sortable: true },
];

const rows = ref([]);
const loading = ref(false);
const search = ref('');
const statusFilter = ref('');

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
});

const sorting = ref({
  field: 'name',
  direction: 'asc',
});

const showModal = ref(false);
const showViewDrawer = ref(false);
const viewingClass = ref(null);
const saving = ref(false);
const error = ref('');
const editing = ref(null);
const form = ref({});
let timer = null;

function blank() {
  return {
    name: '',
    code: '',
    subject: '',
    grade: '',
    fees: 0,
    capacity: 30,
    instructorName: '',
    schedule: '',
    description: '',
    status: 'upcoming'
  };
}

function getStatusClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'active') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/20';
  if (s === 'upcoming') return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-500/20';
  if (s === 'completed') return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-500/20';
  if (s === 'cancelled') return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-500/20';
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
}

function getStatusDotClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'active') return 'bg-emerald-500';
  if (s === 'upcoming') return 'bg-amber-500';
  if (s === 'completed') return 'bg-blue-500';
  if (s === 'cancelled') return 'bg-rose-500';
  return 'bg-slate-400';
}

async function load() {
  loading.value = true;
  try {
    const res = await fetchEducationClasses({ 
      search: search.value.trim() || undefined,
      status: statusFilter.value || undefined,
      page: pagination.value.page,
      limit: pagination.value.limit,
    });
    rows.value = res.data || [];
    const p = res.pagination || {};
    pagination.value = {
      page: Number(p.page) || pagination.value.page,
      limit: Number(p.limit) || pagination.value.limit,
      total: Number(p.total) || rows.value.length,
      totalPages: Number(p.pages || p.totalPages) || 1,
    };
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    pagination.value.page = 1;
    load();
  }, 300);
}

function onFilterChange() {
  pagination.value.page = 1;
  load();
}

function handlePageChange(page) {
  pagination.value.page = page;
  load();
}

function handlePageSizeChange(limit) {
  pagination.value.limit = limit;
  pagination.value.page = 1;
  load();
}

function handleSort({ field, direction }) {
  sorting.value = { field, direction };
  // Client-side quick sort for currently loaded data
  rows.value.sort((a, b) => {
    const valA = a[field] ?? '';
    const valB = b[field] ?? '';
    if (direction === 'asc') {
      return valA > valB ? 1 : -1;
    } else {
      return valA < valB ? 1 : -1;
    }
  });
}

function openView(row) {
  viewingClass.value = row;
  showViewDrawer.value = true;
}

function switchToEditFromView() {
  const target = viewingClass.value;
  showViewDrawer.value = false;
  if (target) {
    openEdit(target);
  }
}

function openCreate() {
  editing.value = null;
  form.value = blank();
  error.value = '';
  showModal.value = true;
}

function openEdit(row) {
  editing.value = row;
  form.value = { ...blank(), ...row };
  error.value = '';
  showModal.value = true;
}

async function save() {
  saving.value = true;
  error.value = '';
  try {
    if (editing.value) await updateEducationClass(editing.value._id, form.value);
    else await createEducationClass(form.value);
    showModal.value = false;
    await load();
  } catch (err) {
    error.value = err.data?.message || err.message || 'Unable to save class.';
  } finally {
    saving.value = false;
  }
}

async function handleDelete(row) {
  if (!isAdmin.value) {
    Swal.fire({
      title: 'Access Restricted',
      text: 'Only administrators have rights to delete classes.',
      icon: 'error',
    });
    return;
  }

  const result = await Swal.fire({
    title: `Delete "${row.name}"?`,
    text: 'Are you sure you want to delete this class? This will archive the batch.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Yes, delete class',
    cancelButtonText: 'Cancel',
  });

  if (!result.isConfirmed) return;

  try {
    await deleteEducationClass(row._id);
    Swal.fire({
      title: 'Deleted!',
      text: 'Class has been deleted successfully.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
    });
    await load();
  } catch (err) {
    Swal.fire({
      title: 'Error',
      text: err.response?.data?.message || err.message || 'Failed to delete class.',
      icon: 'error',
    });
  }
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  const date = new Date(isoStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

onMounted(load);
</script>
