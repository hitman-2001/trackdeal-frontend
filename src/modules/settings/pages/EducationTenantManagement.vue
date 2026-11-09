<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="font-heading text-lg font-extrabold text-slate-900 dark:text-white">
            Education Tenant Directory
          </h2>
          <span class="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
            Manch Admin
          </span>
        </div>
        <p class="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          View Education organizations and control their access to TrackDeal.
        </p>
      </div>
      <div class="flex items-center gap-2 rounded-xl border border-default bg-surface px-3 py-2 shadow-xs">
        <PhBuildings :size="16" class="text-primary" />
        <div>
          <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Education tenants</p>
          <p class="font-tabular text-sm font-black text-slate-900 dark:text-white">{{ pagination.total || 0 }}</p>
        </div>
      </div>
    </div>

    <div
      v-if="error"
      class="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
    >
      <PhWarningCircle :size="16" class="mt-0.5 shrink-0" />
      <span>{{ error }}</span>
    </div>

    <div class="flex flex-col gap-3 rounded-xl border border-default bg-surface p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <div class="relative w-full sm:max-w-sm">
        <PhMagnifyingGlass :size="15" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          v-model="search"
          type="search"
          placeholder="Search institute, code, city, or email..."
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          @input="scheduleSearch"
        />
      </div>
      <select
        v-model="status"
        class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:w-40"
        @change="reloadFromFirstPage"
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="trial">Trial</option>
        <option value="inactive">Inactive</option>
        <option value="suspended">Disabled</option>
      </select>
    </div>

    <div class="overflow-hidden rounded-xl border border-default bg-surface shadow-xs">
      <AppTable
        :rows="tenants"
        :columns="columns"
        :is-loading="loading"
        :pagination="pagination"
        row-actions-label="Access"
        empty-title="No Education tenants found"
        empty-subtext="No organizations match the current search and status filters."
        @pageChange="changePage"
        @pageSizeChange="changePageSize"
      >
        <template #cell(name)="{ row }">
          <div class="py-0.5">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-slate-900 dark:text-slate-100">{{ row.name }}</span>
              <span v-if="row.isCurrentOrganization" class="rounded bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary">
                Current
              </span>
            </div>
            <p class="mt-0.5 text-[10px] text-slate-400">{{ row.city || 'Location not set' }}<span v-if="row.state">, {{ row.state }}</span></p>
          </div>
        </template>

        <template #cell(code)="{ row }">
          <span class="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {{ row.code }}
          </span>
        </template>

        <template #cell(plan)="{ row }">
          <span class="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{{ formatPlan(row.organizationType) }}</span>
        </template>

        <template #cell(usersCount)="{ row }">
          <span class="font-tabular text-xs font-bold text-slate-800 dark:text-slate-200">
            {{ row.usersCount || 0 }}
            <span class="font-normal text-slate-400">/ {{ row.maxUsers || row.subscription?.maxUsers || 0 }}</span>
          </span>
        </template>

        <template #cell(leadsCount)="{ row }">
          <span class="font-tabular text-xs font-bold text-slate-800 dark:text-slate-200">{{ row.leadsCount || 0 }}</span>
        </template>

        <template #cell(status)="{ row }">
          <span
            class="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
            :class="statusClasses(row.status)"
          >
            <span class="h-1.5 w-1.5 rounded-full" :class="row.status === 'suspended' ? 'bg-rose-500' : row.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'"></span>
            {{ row.status === 'suspended' ? 'Disabled' : row.status }}
          </span>
        </template>

        <template #rowActions="{ row }">
          <div class="flex items-center justify-end">
            <span v-if="row.isCurrentOrganization" class="text-[10px] font-semibold text-slate-400">Protected</span>
            <button
              v-else
              type="button"
              role="switch"
              :aria-checked="row.status !== 'suspended'"
              :aria-label="`${row.status === 'suspended' ? 'Enable' : 'Disable'} ${row.name}`"
              :disabled="updatingId === row._id"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition disabled:cursor-wait disabled:opacity-60"
              :class="row.status === 'suspended' ? 'bg-slate-300 dark:bg-slate-700' : 'bg-emerald-500'"
              @click="confirmStatusChange(row)"
            >
              <span class="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform" :class="row.status === 'suspended' ? 'translate-x-1' : 'translate-x-6'"></span>
            </button>
          </div>
        </template>
      </AppTable>
    </div>

    <div class="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-[10px] leading-relaxed text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300">
      <PhShieldCheck :size="15" class="mt-0.5 shrink-0" />
      Disabling a tenant immediately blocks its users from signing in and using authenticated APIs. The action is recorded in the audit log and can be reversed here.
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import Swal from 'sweetalert2';
import {
  PhBuildings,
  PhMagnifyingGlass,
  PhShieldCheck,
  PhWarningCircle,
} from '@phosphor-icons/vue';
import AppTable from '@/components/AppTable.vue';
import {
  fetchEducationTenants,
  setEducationTenantEnabled,
} from '@/modules/settings/api/endpoints';

const tenants = ref([]);
const loading = ref(false);
const updatingId = ref(null);
const error = ref('');
const search = ref('');
const status = ref('');
const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 });
let searchTimer = null;

const columns = [
  { key: 'name', label: 'Institute' },
  { key: 'code', label: 'Tenant Code' },
  { key: 'plan', label: 'Plan' },
  { key: 'usersCount', label: 'Staff', align: 'center' },
  { key: 'leadsCount', label: 'Leads', align: 'center' },
  { key: 'status', label: 'Status' },
];

function apiErrorMessage(err, fallback) {
  return err.response?.data?.error?.message || err.response?.data?.message || fallback;
}

async function loadTenants() {
  loading.value = true;
  error.value = '';
  try {
    const result = await fetchEducationTenants({
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: search.value.trim() || undefined,
      status: status.value || undefined,
    });
    tenants.value = result.data;
    pagination.value = { ...pagination.value, ...result.pagination };
  } catch (err) {
    tenants.value = [];
    error.value = apiErrorMessage(err, 'Unable to load the Education tenant directory.');
  } finally {
    loading.value = false;
  }
}

function reloadFromFirstPage() {
  pagination.value.page = 1;
  loadTenants();
}

function scheduleSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(reloadFromFirstPage, 300);
}

function changePage(page) {
  pagination.value.page = page;
  loadTenants();
}

function changePageSize(limit) {
  pagination.value.limit = limit;
  reloadFromFirstPage();
}

function formatPlan(type) {
  return {
    INDIVIDUAL_AGENT: 'Independent Tutor',
    AGENCY: 'Coaching Institute',
    ENTERPRISE_AGENCY: 'Multi-campus Institute',
  }[type] || 'Coaching Institute';
}

function statusClasses(value) {
  if (value === 'suspended') return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300';
  if (value === 'active') return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
  return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
}

async function confirmStatusChange(tenant) {
  const enabling = tenant.status === 'suspended';
  const result = await Swal.fire({
    title: `${enabling ? 'Enable' : 'Disable'} ${tenant.name}?`,
    text: enabling
      ? 'Staff will regain access to this tenant immediately.'
      : 'All users in this tenant will immediately lose access until it is enabled again.',
    icon: enabling ? 'question' : 'warning',
    showCancelButton: true,
    confirmButtonText: enabling ? 'Enable tenant' : 'Disable tenant',
    cancelButtonText: 'Cancel',
    confirmButtonColor: enabling ? '#10b981' : '#e11d48',
  });
  if (!result.isConfirmed) return;

  updatingId.value = tenant._id;
  error.value = '';
  try {
    await setEducationTenantEnabled(tenant._id, enabling);
    await loadTenants();
  } catch (err) {
    error.value = apiErrorMessage(err, `Unable to ${enabling ? 'enable' : 'disable'} this tenant.`);
  } finally {
    updatingId.value = null;
  }
}

onMounted(loadTenants);
onBeforeUnmount(() => clearTimeout(searchTimer));
</script>
