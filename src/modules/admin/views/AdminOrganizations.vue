<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <h1
          class="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white"
        >
          Tenant Organizations
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Create organizations and assign Real Estate or Education vertical.
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="btn btn-primary px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 self-start sm:self-auto"
      >
        <AppIcon name="add" :size="14" weight="bold" />
        <span>Create Organization</span>
      </button>
    </div>

    <!-- Filter & Search Toolbar -->
    <div
      class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs"
    >
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <!-- Search input -->
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Search by name, code, city, email..."
          class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 w-full sm:w-72"
        />
        <!-- Status filter -->
        <select
          v-model="statusFilter"
          @change="loadOrganizations"
          class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div
        class="text-xs text-slate-500 dark:text-slate-400 self-end sm:self-auto"
      >
        Total:
        <span class="font-bold text-slate-900 dark:text-white">{{
          pagination.total || 0
        }}</span>
        organizations
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && organizations.length === 0" class="py-24 text-center">
      <div
        class="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"
      ></div>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Loading organizations...
      </p>
    </div>

    <!-- Organizations Table -->
    <div
      v-else
      class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead
            class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800"
          >
            <tr>
              <th class="py-3 px-4">Organization Name</th>
              <th class="py-3 px-4">Tenant Code</th>
              <th class="py-3 px-4">Owner Contact</th>
              <th class="py-3 px-4">Vertical</th>
              <th class="py-3 px-4">Plan / Type</th>
              <th class="py-3 px-4 text-center">Users</th>
              <th class="py-3 px-4 text-center">Leads</th>
              <th class="py-3 px-4 text-center">Properties</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr
              v-for="org in organizations"
              :key="org._id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
            >
              <td class="py-3.5 px-4">
                <router-link
                  :to="`/admin/organizations/${org._id}`"
                  class="font-bold text-slate-900 dark:text-slate-100 hover:text-primary dark:hover:text-accent-400 transition"
                >
                  {{ org.name }}
                </router-link>
                <div class="text-[10px] text-slate-500">
                  {{ org.address?.city || "City" }},
                  {{ org.address?.state || "India" }}
                </div>
              </td>
              <td
                class="py-3.5 px-4 font-mono font-bold text-primary dark:text-accent-400"
              >
                {{ org.code }}
              </td>
              <td class="py-3.5 px-4">
                <div class="font-semibold text-slate-800 dark:text-slate-200">
                  {{ org.ownerId?.firstName }} {{ org.ownerId?.lastName }}
                </div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400">
                  {{ org.ownerId?.email }}
                </div>
              </td>
              <td class="py-3.5 px-4">
                <span
                  class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {{
                    org.vertical === "education" ? "Education" : "Real Estate"
                  }}
                </span>
              </td>
              <td class="py-3.5 px-4">
                <span
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {{ formatPlanLabel(org) }}
                </span>
              </td>
              <td
                class="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200"
              >
                {{ org.usersCount || 0 }}
              </td>
              <td
                class="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200"
              >
                {{ org.leadsCount || 0 }}
              </td>
              <td
                class="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200"
              >
                {{ org.propertiesCount || 0 }}
              </td>
              <td class="py-3.5 px-4">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize"
                  :class="{
                    'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20':
                      org.status === 'active',
                    'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20':
                      org.status === 'inactive',
                    'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20':
                      org.status === 'suspended',
                  }"
                >
                  {{ org.status }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <router-link
                    :to="`/admin/organizations/${org._id}`"
                    title="View organization"
                    aria-label="View organization"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-accent-400 transition"
                  >
                    <AppIcon name="eye" :size="15" />
                  </router-link>
                  <button
                    type="button"
                    @click="toggleOrgStatus(org)"
                    :title="
                      org.status === 'suspended'
                        ? 'Activate organization'
                        : 'Suspend organization'
                    "
                    :aria-label="
                      org.status === 'suspended'
                        ? 'Activate organization'
                        : 'Suspend organization'
                    "
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border transition"
                    :class="
                      org.status === 'suspended'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                    "
                  >
                    <AppIcon
                      :name="org.status === 'suspended' ? 'play' : 'pause'"
                      :size="15"
                      weight="bold"
                    />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="organizations.length === 0">
              <td colspan="10" class="py-12 text-center text-xs text-slate-500">
                No organizations matching current criteria.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppPagination
        :page="pagination.page"
        :page-size="pagination.limit"
        :total="pagination.total"
        :total-pages="pagination.pages"
        :show-page-size="false"
        @page-change="changePage"
      />
    </div>

    <!-- CREATE ORGANIZATION MODAL -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
        @click.self="showCreateModal = false"
      >
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5"
        >
          <div
            class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3"
          >
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-white">
                Create Organization
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{
                  createForm.vertical === "education"
                    ? "Onboard an institute and assign the Education vertical."
                    : "Onboard a real-estate brokerage and assign the Real Estate vertical."
                }}
              </p>
            </div>
            <button
              @click="showCreateModal = false"
              class="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg"
              aria-label="Close"
            >
              <AppIcon name="close" :size="14" weight="bold" />
            </button>
          </div>

          <div
            v-if="createError"
            class="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300"
          >
            {{ createError }}
          </div>

          <form @submit.prevent="handleCreateOrg" class="space-y-4 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >Organization Name *</label
                >
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
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >Organization Code (Optional)</label
                >
                <input
                  v-model="createForm.code"
                  type="text"
                  placeholder="e.g. SKYLINE"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >Owner Full Name *</label
                >
                <input
                  v-model="createForm.ownerName"
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >Owner Email Address *</label
                >
                <input
                  v-model="createForm.ownerEmail"
                  type="email"
                  required
                  placeholder="owner@skyline.com"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >Owner Mobile Number</label
                >
                <input
                  v-model="createForm.ownerMobile"
                  type="text"
                  placeholder="+91 9876543210"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >Initial Password</label
                >
                <input
                  v-model="createForm.password"
                  type="text"
                  placeholder="TrackDeal@123"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="font-bold text-slate-600 dark:text-slate-300"
                >Vertical *</label
              >
              <div class="grid grid-cols-2 gap-2">
                <label
                  class="flex items-start gap-2 p-3 rounded-xl border cursor-pointer"
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
                    <span
                      class="block font-bold text-slate-800 dark:text-slate-200"
                      >Real Estate</span
                    >
                    <span class="block text-[11px] text-slate-500"
                      >Properties, clients, deals.</span
                    >
                  </span>
                </label>
                <label
                  class="flex items-start gap-2 p-3 rounded-xl border cursor-pointer"
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
                    <span
                      class="block font-bold text-slate-800 dark:text-slate-200"
                      >Education</span
                    >
                    <span class="block text-[11px] text-slate-500"
                      >Classes, students, admissions.</span
                    >
                  </span>
                </label>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300">{{
                  createForm.vertical === "education"
                    ? "Institute Type"
                    : "Subscription Plan"
                }}</label>
                <select
                  v-model="createForm.plan"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <template v-if="createForm.vertical === 'education'">
                    <option value="INDEPENDENT_TUTOR">Independent Tutor</option>
                    <option value="COACHING_INSTITUTE">
                      Coaching Institute
                    </option>
                    <option value="MULTI_CAMPUS_INSTITUTE">
                      Multi-campus Institute
                    </option>
                  </template>
                  <template v-else>
                    <option value="INDIVIDUAL_AGENT">Individual Agent</option>
                    <option value="AGENCY">Agency</option>
                    <option value="ENTERPRISE_AGENCY">Enterprise Agency</option>
                  </template>
                </select>
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >Max Users</label
                >
                <input
                  v-model="createForm.maxUsers"
                  type="number"
                  min="1"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >City</label
                >
                <input
                  v-model="createForm.city"
                  type="text"
                  placeholder="Pune"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div
              class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3"
            >
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
                <span>Create & Onboard</span>
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
import Swal from "sweetalert2";
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

const showCreateModal = ref(false);
const creating = ref(false);
const createError = ref("");
const createForm = ref({
  name: "",
  code: "",
  ownerName: "",
  ownerEmail: "",
  ownerMobile: "",
  password: "TrackDeal@123",
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

function openCreateModal() {
  createError.value = "";
  createForm.value = {
    name: "",
    code: "",
    ownerName: "",
    ownerEmail: "",
    ownerMobile: "",
    password: "TrackDeal@123",
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
