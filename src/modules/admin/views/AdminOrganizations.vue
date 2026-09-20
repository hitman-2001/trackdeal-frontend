<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-accent-400">
          Tenant Directory
        </p>
        <h1 class="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
          Tenant Organizations
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage organizations, onboard new tenants, and assign Real Estate or Education verticals.
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="btn btn-primary px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
      >
        <PhPlus :size="14" weight="bold" />
        <span>Create Organization</span>
      </button>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="p-4 rounded-xl bg-surface border border-default flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
      <div class="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        <!-- Search input -->
        <div class="relative w-full sm:w-72">
          <PhMagnifyingGlass :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Search by name, code, city, email..."
            class="w-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>

        <!-- Status filter -->
        <select
          v-model="statusFilter"
          @change="loadOrganizations"
          class="bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div class="text-xs text-slate-500 dark:text-slate-400 self-end sm:self-auto font-medium">
        Total:
        <span class="font-bold text-slate-900 dark:text-white font-tabular">{{ pagination.total || 0 }}</span>
        organizations
      </div>
    </div>

    <!-- Organizations Table with AppTable -->
    <div class="rounded-xl bg-surface border border-default overflow-hidden shadow-xs">
      <AppTable
        :rows="organizations"
        :columns="columns"
        :isLoading="loading"
        :pagination="pagination"
        row-actions-label="Actions"
        empty-title="No organizations found"
        empty-subtext="No organizations match your current search or filter criteria."
        @pageChange="changePage"
        @pageSizeChange="handlePageSizeChange"
      >
        <!-- Cell: Organization Name & Location -->
        <template #cell(name)="{ row }">
          <div class="space-y-0.5 py-0.5">
            <router-link
              :to="`/admin/organizations/${row._id}`"
              class="font-bold text-slate-900 dark:text-slate-100 hover:text-primary dark:hover:text-accent-400 transition-colors block text-xs"
            >
              {{ row.name }}
            </router-link>
            <div class="text-[10px] text-slate-400">
              {{ row.address?.city || "City" }}, {{ row.address?.state || "India" }}
            </div>
          </div>
        </template>

        <!-- Cell: Tenant Code -->
        <template #cell(code)="{ row }">
          <span class="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-primary dark:text-accent-400 border border-slate-200/80 dark:border-slate-700/80">
            {{ row.code }}
          </span>
        </template>

        <!-- Cell: Admin Contact -->
        <template #cell(owner)="{ row }">
          <div class="space-y-0.5 text-xs">
            <div class="font-medium text-slate-800 dark:text-slate-200">
              {{ row.ownerId?.firstName }} {{ row.ownerId?.lastName }}
            </div>
            <div class="text-[10px] text-slate-400 truncate max-w-[150px]">
              {{ row.ownerId?.email }}
            </div>
          </div>
        </template>

        <!-- Cell: Vertical -->
        <template #cell(vertical)="{ row }">
          <span
            class="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border inline-flex items-center gap-1"
            :class="row.vertical === 'education' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'"
          >
            {{ row.vertical === 'education' ? 'Education' : 'Real Estate' }}
          </span>
        </template>

        <!-- Cell: Plan / Type -->
        <template #cell(plan)="{ row }">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
            {{ formatPlanLabel(row) }}
          </span>
        </template>

        <!-- Cell: Users / Quota -->
        <template #cell(usersCount)="{ row }">
          <span class="font-tabular font-bold text-slate-800 dark:text-slate-200 text-xs">
            {{ row.usersCount || 0 }}
            <span class="text-[10px] text-slate-400 font-normal">/ {{ row.maxUsers || row.subscription?.maxUsers || 10 }}</span>
          </span>
        </template>

        <!-- Cell: Leads -->
        <template #cell(leadsCount)="{ row }">
          <span class="font-tabular font-bold text-slate-800 dark:text-slate-200 text-xs">
            {{ row.leadsCount || 0 }}
          </span>
        </template>

        <!-- Cell: Properties -->
        <template #cell(propertiesCount)="{ row }">
          <span class="font-tabular font-bold text-slate-800 dark:text-slate-200 text-xs">
            {{ row.propertiesCount || 0 }}
          </span>
        </template>

        <!-- Cell: Status -->
        <template #cell(status)="{ row }">
          <span
            class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1"
            :class="{
              'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800': row.status === 'active',
              'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800': row.status === 'inactive',
              'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800': row.status === 'suspended',
            }"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="{
                'bg-emerald-500': row.status === 'active',
                'bg-amber-500': row.status === 'inactive',
                'bg-rose-500': row.status === 'suspended',
              }"
            ></span>
            {{ row.status }}
          </span>
        </template>

        <!-- Row Actions -->
        <template #rowActions="{ row }">
          <div class="flex items-center justify-end gap-1">
            <router-link
              :to="`/admin/organizations/${row._id}`"
              title="View organization"
              aria-label="View organization"
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
            >
              <PhEye :size="15" />
            </router-link>
            <button
              type="button"
              @click="toggleOrgStatus(row)"
              :title="row.status === 'suspended' ? 'Activate organization' : 'Suspend organization'"
              :aria-label="row.status === 'suspended' ? 'Activate organization' : 'Suspend organization'"
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
              :class="
                row.status === 'suspended'
                  ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              "
            >
              <component
                :is="row.status === 'suspended' ? PhPlay : PhPause"
                :size="14"
                weight="bold"
              />
            </button>
          </div>
        </template>
      </AppTable>
    </div>

    <!-- CREATE ORGANIZATION MODAL -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        @click.self="showCreateModal = false"
      >
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-white">
                Create Organization
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {{
                  createForm.vertical === "education"
                    ? "Onboard an institute and assign the Education vertical."
                    : "Onboard a real-estate brokerage and assign the Real Estate vertical."
                }}
              </p>
            </div>
            <button
              @click="showCreateModal = false"
              class="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Close"
            >
              <PhX :size="16" weight="bold" />
            </button>
          </div>

          <div
            v-if="createError"
            class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300"
          >
            {{ createError }}
          </div>

          <form @submit.prevent="handleCreateOrg" class="space-y-4 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Organization Name *</label>
                <input
                  v-model="createForm.name"
                  type="text"
                  required
                  :placeholder="
                    createForm.vertical === 'education'
                      ? 'e.g. Bright Minds Institute'
                      : 'e.g. Skyline Real Estate'
                  "
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Organization Code (Optional)</label>
                <input
                  v-model="createForm.code"
                  type="text"
                  placeholder="e.g. SKYLINE"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 uppercase"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Admin Full Name *</label>
                <input
                  v-model="createForm.ownerName"
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Admin Email Address *</label>
                <input
                  v-model="createForm.ownerEmail"
                  type="email"
                  required
                  placeholder="admin@skyline.com"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Admin Mobile Number</label>
                <input
                  v-model="createForm.ownerMobile"
                  type="text"
                  placeholder="+91 9876543210"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Initial Password</label>
                <input
                  v-model="createForm.password"
                  type="text"
                  placeholder="Enter initial password"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="font-bold text-slate-700 dark:text-slate-300">Vertical *</label>
              <div class="grid grid-cols-2 gap-2">
                <label
                  class="flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition-colors"
                  :class="
                    createForm.vertical === 'realEstate'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-slate-200 dark:border-slate-700'
                  "
                >
                  <input
                    v-model="createForm.vertical"
                    type="radio"
                    value="realEstate"
                    class="mt-0.5"
                    @change="onVerticalChange"
                  />
                  <span>
                    <span class="block font-bold text-slate-800 dark:text-slate-200">Real Estate</span>
                    <span class="block text-[11px] text-slate-500">Brokers, agents, inventory &amp; commissions</span>
                  </span>
                </label>

                <label
                  class="flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition-colors"
                  :class="
                    createForm.vertical === 'education'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-slate-200 dark:border-slate-700'
                  "
                >
                  <input
                    v-model="createForm.vertical"
                    type="radio"
                    value="education"
                    class="mt-0.5"
                    @change="onVerticalChange"
                  />
                  <span>
                    <span class="block font-bold text-slate-800 dark:text-slate-200">Education</span>
                    <span class="block text-[11px] text-slate-500">Classes, batches, inquiries &amp; admissions</span>
                  </span>
                </label>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">City</label>
                <input
                  v-model="createForm.city"
                  type="text"
                  placeholder="Pune"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Max Users Quota</label>
                <input
                  v-model.number="createForm.maxUsers"
                  type="number"
                  min="1"
                  max="500"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                @click="showCreateModal = false"
                class="btn btn-secondary px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="creating"
                class="btn btn-primary px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2"
              >
                <span
                  v-if="creating"
                  class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></span>
                <span>Create &amp; Onboard</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  PhPlus,
  PhMagnifyingGlass,
  PhEye,
  PhPlay,
  PhPause,
  PhX,
} from "@phosphor-icons/vue";
import Swal from "sweetalert2";
import AppTable from "@/components/AppTable.vue";
import {
  fetchAdminOrganizations,
  createAdminOrganization,
  updateAdminOrganization,
} from "../api/endpoints";

const loading = ref(false);
const organizations = ref([]);
const pagination = ref({ page: 1, limit: 10, total: 0, pages: 1 });
const searchQuery = ref("");
const statusFilter = ref("");

const columns = [
  { key: "name", label: "Organization Name" },
  { key: "code", label: "Tenant Code" },
  { key: "owner", label: "Admin Contact" },
  { key: "vertical", label: "Vertical" },
  { key: "plan", label: "Plan / Type" },
  { key: "usersCount", label: "Users / Quota", align: "center" },
  { key: "leadsCount", label: "Leads", align: "center" },
  { key: "propertiesCount", label: "Properties", align: "center" },
  { key: "status", label: "Status" },
];

const showCreateModal = ref(false);
const creating = ref(false);
const createError = ref("");
const createForm = ref({
  name: "",
  code: "",
  ownerName: "",
  ownerEmail: "",
  ownerMobile: "",
  password: "",
  vertical: "realEstate",
  plan: "AGENCY",
  maxUsers: 10,
  city: "Pune",
});

let searchTimer = null;
function handleSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    pagination.value.page = 1;
    loadOrganizations();
  }, 300);
}

async function loadOrganizations() {
  loading.value = true;
  try {
    const res = await fetchAdminOrganizations({
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: searchQuery.value.trim() || undefined,
      status: statusFilter.value || undefined,
    });
    organizations.value = res?.data || [];
    if (res?.pagination) {
      pagination.value = res.pagination;
    }
  } catch (err) {
    console.error("Failed to load organizations:", err);
  } finally {
    loading.value = false;
  }
}

function onVerticalChange() {
  createForm.value.plan =
    createForm.value.vertical === "education" ? "COACHING_INSTITUTE" : "AGENCY";
}

function formatPlanLabel(org) {
  const type = org.organizationType || org.subscriptionPlan || "";
  if (org.vertical === "education") {
    if (type === "INDIVIDUAL_AGENT") return "Independent Tutor";
    if (type === "ENTERPRISE_AGENCY") return "Multi-campus Institute";
    return "Coaching Institute";
  }
  if (type === "INDIVIDUAL_AGENT") return "Individual Agent";
  if (type === "ENTERPRISE_AGENCY") return "Enterprise Agency";
  return type || "Agency";
}

function changePage(p) {
  pagination.value.page = p;
  loadOrganizations();
}

function handlePageSizeChange(size) {
  pagination.value.limit = size;
  pagination.value.page = 1;
  loadOrganizations();
}

function openCreateModal() {
  createError.value = "";
  createForm.value = {
    name: "",
    code: "",
    ownerName: "",
    ownerEmail: "",
    ownerMobile: "",
    password: "",
    vertical: "realEstate",
    plan: "AGENCY",
    maxUsers: 10,
    city: "Pune",
  };
  showCreateModal.value = true;
}

async function handleCreateOrg() {
  creating.value = true;
  createError.value = "";
  try {
    await createAdminOrganization(createForm.value);
    showCreateModal.value = false;
    await loadOrganizations();
  } catch (err) {
    createError.value =
      err.response?.data?.error?.message ||
      err.message ||
      "Failed to create organization.";
  } finally {
    creating.value = false;
  }
}

async function toggleOrgStatus(org) {
  const newStatus = org.status === "suspended" ? "active" : "suspended";
  const confirmMsg = `Are you sure you want to ${newStatus === "suspended" ? "SUSPEND" : "ACTIVATE"} organization '${org.name}'?`;
  const result = await Swal.fire({
    title: "Confirm",
    text: confirmMsg,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
  });
  if (!result.isConfirmed) return;

  try {
    await updateAdminOrganization(org._id, { status: newStatus });
    await loadOrganizations();
  } catch (err) {
    Swal.fire({
      text:
        err.response?.data?.error?.message ||
        err.message ||
        "Failed to update organization status.",
      icon: "error",
    });
  }
}

onMounted(() => {
  loadOrganizations();
});
</script>
