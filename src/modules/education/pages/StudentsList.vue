<template>
  <div class="workspace-page education-list space-y-5 text-xs">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-default pb-4">
      <div>
        <h1 class="font-heading text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Enrolled Students</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Directory of enrolled students mapped to classes, batches, and parent guardian contacts.
        </p>
      </div>
      <button 
        class="btn btn-primary btn-sm h-9 px-3.5 text-xs font-semibold gap-1.5 self-start sm:self-auto shadow-xs" 
        @click="openCreate"
      >
        <PhPlus :size="15" weight="bold" />
        <span>Add Student</span>
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
            placeholder="Search student, mobile, parent..." 
            class="w-full bg-slate-50 dark:bg-slate-850 border border-default rounded-xl pl-9 pr-3 py-2 text-xs focus:border-primary outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400" 
            @input="handleSearch" 
          />
        </div>

        <!-- Class Filter -->
        <div class="flex items-center gap-1.5">
          <select 
            v-model="classFilter" 
            class="bg-slate-50 dark:bg-slate-850 border border-default rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:border-primary outline-none"
            @change="onFilterChange"
          >
            <option value="">All Classes & Batches</option>
            <option v-for="c in classes" :key="c._id" :value="c._id">{{ c.name }}</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div class="flex items-center gap-1.5">
          <select 
            v-model="statusFilter" 
            class="bg-slate-50 dark:bg-slate-850 border border-default rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:border-primary outline-none"
            @change="onFilterChange"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="dropped">Dropped</option>
          </select>
        </div>
      </div>

      <!-- Results Pill -->
      <div class="flex items-center gap-2 self-end sm:self-auto">
        <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-tabular bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-default/60">
          {{ pagination.total }} {{ pagination.total === 1 ? 'Student' : 'Students' }}
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
        empty-title="No students enrolled yet"
        empty-subtext="No enrolled students match your filters. Directly add a student or enroll from Student Leads."
        @rowClick="openView"
        @pageChange="handlePageChange"
        @pageSizeChange="handlePageSizeChange"
        @sort="handleSort"
      >
        <!-- Cell: Student Name & Lead Reference -->
        <template #cell(student)="{ row }">
          <div class="space-y-0.5">
            <div class="font-bold text-slate-900 dark:text-slate-100 text-xs hover:text-primary transition-colors">
              {{ row.firstName }} {{ row.lastName || '' }}
            </div>
            <div v-if="row.email" class="text-slate-400 text-[10px] truncate max-w-[150px]">
              {{ row.email }}
            </div>
          </div>
        </template>

        <!-- Cell: Contact Phone -->
        <template #cell(contact)="{ row }">
          <div class="font-tabular font-medium text-slate-700 dark:text-slate-300 text-xs">
            {{ row.mobile }}
          </div>
        </template>

        <!-- Cell: Parent / Guardian -->
        <template #cell(parent)="{ row }">
          <div class="space-y-0.5">
            <div class="text-slate-800 dark:text-slate-200 font-medium text-xs">
              {{ row.parentName || '—' }}
            </div>
            <div v-if="row.parentMobile" class="text-slate-400 font-tabular text-[10px]">
              {{ row.parentMobile }}
            </div>
          </div>
        </template>

        <!-- Cell: Enrolled Class -->
        <template #cell(class)="{ row }">
          <span 
            v-if="row.classId?.name"
            class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 inline-flex items-center gap-1"
          >
            {{ row.classId.name }}
          </span>
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

        <!-- Cell: Enrollment Date -->
        <template #cell(enrollmentDate)="{ row }">
          <div class="font-tabular text-slate-600 dark:text-slate-400 text-xs">
            {{ formatDate(row.enrollmentDate) }}
          </div>
        </template>

        <!-- Row Actions Slot -->
        <template #rowActions="{ row }">
          <div class="flex items-center gap-1 justify-end">
            <!-- 1. View Button (Eye) -->
            <button
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
              title="View student details"
              aria-label="View student details"
              @click.stop="openView(row)"
            >
              <PhEye :size="15" weight="bold" />
            </button>

            <!-- 2. Edit Button (Pencil) -->
            <button
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
              title="Edit student"
              aria-label="Edit student"
              @click.stop="openEdit(row)"
            >
              <PhPencilSimple :size="15" weight="bold" />
            </button>

            <!-- 3. Delete Button (Trash) - Admin Only -->
            <button
              v-if="isAdmin"
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete student (Admin only)"
              aria-label="Delete student"
              @click.stop="handleDelete(row)"
            >
              <PhTrash :size="15" weight="bold" />
            </button>
          </div>
        </template>
      </AppTable>
    </div>

    <!-- View Student Details Drawer -->
    <AppDrawer
      :isOpen="showViewDrawer"
      title="Student Profile"
      subtitle="Read-only view of enrolled student details and batch assignment"
      width="520px"
      @close="showViewDrawer = false"
    >
      <div v-if="viewingStudent" class="space-y-4 text-xs">
        <!-- Header Profile Card -->
        <div class="bg-slate-50 dark:bg-slate-850/50 p-4 rounded-xl border border-default space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="font-heading font-extrabold text-base text-slate-900 dark:text-slate-100">
              {{ viewingStudent.firstName }} {{ viewingStudent.lastName || '' }}
            </h3>
            <span
              class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border"
              :class="getStatusClass(viewingStudent.status)"
            >
              {{ viewingStudent.status }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-slate-400 font-mono text-[11px] flex-wrap">
            <span>Enrolled: <strong class="text-slate-700 dark:text-slate-200">{{ formatDate(viewingStudent.enrollmentDate) }}</strong></span>
            <span v-if="viewingStudent.leadId">•</span>
            <span v-if="viewingStudent.leadId" class="text-primary font-semibold">Converted from Lead</span>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 bg-surface border border-default rounded-xl space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mobile Phone</span>
            <p class="font-bold text-slate-900 dark:text-slate-100 text-xs font-tabular">{{ viewingStudent.mobile || '—' }}</p>
          </div>

          <div class="p-3 bg-surface border border-default rounded-xl space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</span>
            <p class="font-medium text-slate-800 dark:text-slate-200 text-xs truncate" :title="viewingStudent.email">{{ viewingStudent.email || '—' }}</p>
          </div>

          <div class="p-3 bg-surface border border-default rounded-xl space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parent / Guardian</span>
            <p class="font-bold text-slate-900 dark:text-slate-100 text-xs">{{ viewingStudent.parentName || '—' }}</p>
          </div>

          <div class="p-3 bg-surface border border-default rounded-xl space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parent Contact</span>
            <p class="font-bold text-slate-900 dark:text-slate-100 text-xs font-tabular">{{ viewingStudent.parentMobile || '—' }}</p>
          </div>

          <div class="p-3 bg-surface border border-default rounded-xl space-y-1 col-span-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrolled Batch / Class</span>
            <p class="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
              {{ viewingStudent.classId?.name || 'Unassigned / Independent Enrollment' }}
            </p>
            <p v-if="viewingStudent.classId?.subject" class="text-[10px] text-slate-500 mt-0.5">
              {{ viewingStudent.classId.subject }} • Grade {{ viewingStudent.classId.grade || 'General' }}
            </p>
          </div>

          <div v-if="viewingStudent.notes" class="p-3 bg-surface border border-default rounded-xl space-y-1 col-span-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Counselor / Academic Notes</span>
            <p class="text-slate-600 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{{ viewingStudent.notes }}</p>
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
          <span>Edit Student</span>
        </button>
      </template>
    </AppDrawer>

    <!-- Create / Edit Student Drawer -->
    <AppDrawer
      :isOpen="showModal"
      :title="editing ? 'Edit Student Record' : 'Enroll New Student'"
      :subtitle="editing ? 'Update enrolled student details and batch mappings' : 'Directly register a student and map to a course batch'"
      width="520px"
      @close="showModal = false"
    >
      <form id="student-form" class="space-y-4 text-xs" @submit.prevent="save">
        <p v-if="error" class="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">{{ error }}</p>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">First Name *
            <input v-model="form.firstName" required class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Last Name
            <input v-model="form.lastName" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Mobile Phone *
            <input v-model="form.mobile" required class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Email Address
            <input v-model="form.email" type="email" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Parent / Guardian Name
            <input v-model="form.parentName" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">Parent Mobile
            <input v-model="form.parentMobile" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none" />
          </label>
          <label class="space-y-1 col-span-2 font-medium text-slate-700 dark:text-slate-300">Enrolled Batch / Class
            <select v-model="form.classId" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none">
              <option value="">Unassigned</option>
              <option v-for="c in classes" :key="c._id" :value="c._id">{{ c.name }}</option>
            </select>
          </label>
          <label class="space-y-1 col-span-2 font-medium text-slate-700 dark:text-slate-300">Student Status
            <select v-model="form.status" class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
              <option value="dropped">Dropped</option>
            </select>
          </label>
          <label class="space-y-1 col-span-2 font-medium text-slate-700 dark:text-slate-300">Academic Notes
            <textarea v-model="form.notes" rows="3" placeholder="Additional student background, goals, or fees schedule..." class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"></textarea>
          </label>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary btn-sm" @click="showModal = false">Cancel</button>
        <button type="submit" form="student-form" class="btn btn-primary btn-sm" :disabled="saving">
          {{ saving ? 'Saving...' : (editing ? 'Save Changes' : 'Enroll Student') }}
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
  createEducationStudent, 
  fetchEducationClasses, 
  fetchEducationStudents,
  updateEducationStudent,
  deleteEducationStudent
} from '../api/endpoints';

const store = useStore();
const isAdmin = computed(() => {
  const role = store.getters['auth/userRole'];
  return ['super_admin', 'org_admin', 'admin'].includes(role);
});

const columns = [
  { key: 'student', label: 'Student', sortable: true },
  { key: 'contact', label: 'Contact', sortable: false },
  { key: 'parent', label: 'Parent / Guardian', sortable: false },
  { key: 'class', label: 'Enrolled Class', sortable: false },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'enrollmentDate', label: 'Enrollment Date', sortable: true },
];

const rows = ref([]);
const classes = ref([]);
const loading = ref(false);
const search = ref('');
const classFilter = ref('');
const statusFilter = ref('');

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
});

const sorting = ref({
  field: 'enrollmentDate',
  direction: 'desc',
});

const showModal = ref(false);
const showViewDrawer = ref(false);
const viewingStudent = ref(null);
const saving = ref(false);
const error = ref('');
const editing = ref(null);
const form = ref({});
let timer = null;

function blank() {
  return { 
    firstName: '', 
    lastName: '', 
    mobile: '', 
    email: '', 
    parentName: '', 
    parentMobile: '', 
    classId: '',
    status: 'active',
    notes: '',
  };
}

function getStatusClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'active') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/20';
  if (s === 'inactive') return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-500/20';
  if (s === 'graduated') return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-500/20';
  if (s === 'dropped') return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-500/20';
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
}

function getStatusDotClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'active') return 'bg-emerald-500';
  if (s === 'inactive') return 'bg-amber-500';
  if (s === 'graduated') return 'bg-blue-500';
  if (s === 'dropped') return 'bg-rose-500';
  return 'bg-slate-400';
}

async function load() {
  loading.value = true;
  try {
    const res = await fetchEducationStudents({
      search: search.value.trim() || undefined,
      classId: classFilter.value || undefined,
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
  viewingStudent.value = row;
  showViewDrawer.value = true;
}

function switchToEditFromView() {
  const target = viewingStudent.value;
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
  form.value = { 
    firstName: row.firstName || '',
    lastName: row.lastName || '',
    mobile: row.mobile || '',
    email: row.email || '',
    parentName: row.parentName || '',
    parentMobile: row.parentMobile || '',
    classId: row.classId?._id || row.classId || '',
    status: row.status || 'active',
    notes: row.notes || '',
  };
  error.value = '';
  showModal.value = true;
}

async function save() {
  saving.value = true;
  error.value = '';
  try {
    const payload = { ...form.value, classId: form.value.classId || undefined };
    if (editing.value) {
      await updateEducationStudent(editing.value._id, payload);
    } else {
      await createEducationStudent(payload);
    }
    showModal.value = false;
    await load();
  } catch (err) {
    error.value = err.data?.message || err.message || 'Unable to save student.';
  } finally {
    saving.value = false;
  }
}

async function handleDelete(row) {
  if (!isAdmin.value) {
    Swal.fire({
      title: 'Access Restricted',
      text: 'Only administrators have rights to delete student records.',
      icon: 'error',
    });
    return;
  }

  const result = await Swal.fire({
    title: `Delete "${row.firstName} ${row.lastName || ''}"?`,
    text: 'Are you sure you want to delete this student record? This action will archive the enrollment.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Yes, delete student',
    cancelButtonText: 'Cancel',
  });

  if (!result.isConfirmed) return;

  try {
    await deleteEducationStudent(row._id);
    Swal.fire({
      title: 'Deleted!',
      text: 'Student record has been deleted successfully.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
    });
    await load();
  } catch (err) {
    Swal.fire({
      title: 'Error',
      text: err.response?.data?.message || err.message || 'Failed to delete student.',
      icon: 'error',
    });
  }
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

onMounted(async () => {
  const res = await fetchEducationClasses({ limit: 100 });
  classes.value = res.data || [];
  await load();
});
</script>

