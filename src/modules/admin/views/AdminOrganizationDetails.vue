<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Breadcrumb & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <router-link
            to="/admin/organizations"
            class="hover:text-primary dark:hover:text-accent-400 transition"
          >
            Organizations
          </router-link>
          <span>/</span>
          <span class="text-slate-800 dark:text-slate-200 font-semibold">
            {{ org?.name || "Organization Details" }}
          </span>
        </div>
        <h1 class="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          {{ org?.name }}
          <span
            v-if="org?.status"
            class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1"
            :class="{
              'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800': org.status === 'active',
              'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800': org.status === 'inactive',
              'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800': org.status === 'suspended',
            }"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="{
                'bg-emerald-500': org.status === 'active',
                'bg-amber-500': org.status === 'inactive',
                'bg-rose-500': org.status === 'suspended',
              }"
            ></span>
            {{ org.status }}
          </span>
        </h1>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button
          @click="openResetPasswordModal"
          class="btn btn-secondary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <PhKey :size="14" />
          <span>Reset owner password</span>
        </button>
        <button
          @click="toggleStatus"
          class="px-3.5 py-2 rounded-xl border text-xs font-semibold transition"
          :class="
            org?.status === 'suspended'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300'
          "
        >
          {{ org?.status === "suspended" ? "Activate Tenant" : "Suspend Tenant" }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !org" class="py-24 text-center">
      <div class="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-xs text-slate-500 dark:text-slate-400">Loading organization details...</p>
    </div>

    <div v-else class="space-y-6">
      <!-- STATS STRIP -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="p-4 rounded-xl bg-surface border border-default shadow-xs text-center">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Users</div>
          <div class="text-xl font-black text-slate-900 dark:text-white mt-1 font-heading font-tabular">
            {{ org?.stats?.totalUsers || 0 }}
          </div>
        </div>
        <div class="p-4 rounded-xl bg-surface border border-default shadow-xs text-center">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Leads</div>
          <div class="text-xl font-black text-slate-900 dark:text-white mt-1 font-heading font-tabular">
            {{ org?.stats?.totalLeads || 0 }}
          </div>
        </div>
        <div class="p-4 rounded-xl bg-surface border border-default shadow-xs text-center">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Properties</div>
          <div class="text-xl font-black text-slate-900 dark:text-white mt-1 font-heading font-tabular">
            {{ org?.stats?.totalProperties || 0 }}
          </div>
        </div>
        <div class="p-4 rounded-xl bg-surface border border-default shadow-xs text-center">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Projects</div>
          <div class="text-xl font-black text-slate-900 dark:text-white mt-1 font-heading font-tabular">
            {{ org?.stats?.totalProjects || 0 }}
          </div>
        </div>
        <div class="p-4 rounded-xl bg-surface border border-default shadow-xs text-center">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Deals</div>
          <div class="text-xl font-black text-slate-900 dark:text-white mt-1 font-heading font-tabular">
            {{ org?.stats?.totalDeals || 0 }}
          </div>
        </div>
        <div class="p-4 rounded-xl bg-surface border border-default shadow-xs text-center">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Partners</div>
          <div class="text-xl font-black text-slate-900 dark:text-white mt-1 font-heading font-tabular">
            {{ org?.stats?.totalAgents || 0 }}
          </div>
        </div>
      </div>

      <!-- TABS -->
      <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          @click="activeTab = 'overview'"
          class="px-4 py-2 rounded-xl text-xs font-semibold transition"
          :class="
            activeTab === 'overview'
              ? 'bg-primary text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          "
        >
          Overview &amp; Settings
        </button>
        <button
          @click="activeTab = 'users'"
          class="px-4 py-2 rounded-xl text-xs font-semibold transition"
          :class="
            activeTab === 'users'
              ? 'bg-primary text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          "
        >
          Organization Users ({{ orgUsers.length }})
        </button>
      </div>

      <!-- TAB 1: OVERVIEW & SETTINGS -->
      <div
        v-if="activeTab === 'overview'"
        class="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <!-- Main Settings Form (2 Cols) -->
        <div class="lg:col-span-2 p-6 rounded-xl bg-surface border border-default shadow-xs space-y-5">
          <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 class="text-sm font-bold text-slate-900 dark:text-white">
              Organization Configuration
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Update plan, maximum users quota, and contact parameters.
            </p>
          </div>

          <form @submit.prevent="handleSaveOrg" class="space-y-4 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Organization Name</label>
                <input
                  v-model="editForm.name"
                  type="text"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Tenant Code</label>
                <input
                  :value="org?.code"
                  disabled
                  class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-500 dark:text-slate-400 font-mono"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">
                  {{ org?.vertical === "education" ? "Institute Type" : "Plan Tier" }}
                </label>
                <select
                  v-model="editForm.organizationType"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <template v-if="org?.vertical === 'education'">
                    <option value="INDIVIDUAL_AGENT">Independent Tutor</option>
                    <option value="AGENCY">Coaching Institute</option>
                    <option value="ENTERPRISE_AGENCY">Multi-campus Institute</option>
                  </template>
                  <template v-else>
                    <option value="INDIVIDUAL_AGENT">Individual Agent</option>
                    <option value="AGENCY">Agency</option>
                    <option value="ENTERPRISE_AGENCY">Enterprise Agency</option>
                  </template>
                </select>
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Max Users Quota</label>
                <input
                  v-model.number="editForm.maxUsers"
                  type="number"
                  min="1"
                  max="1000"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Contact Phone</label>
                <input
                  v-model="editForm.phone"
                  type="text"
                  placeholder="+91 9876543210"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">City</label>
                <input
                  v-model="editForm.city"
                  type="text"
                  placeholder="Pune"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                :disabled="saving"
                class="btn btn-primary px-5 py-2 rounded-xl font-bold text-white text-xs flex items-center gap-2"
              >
                <span
                  v-if="saving"
                  class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></span>
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Sidebar Info Card (1 Col) -->
        <div class="p-6 rounded-xl bg-surface border border-default shadow-xs space-y-4 text-xs">
          <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 class="font-bold text-slate-900 dark:text-white">
              Tenant Summary
            </h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Assigned cluster credentials &amp; contact points.
            </p>
          </div>

          <div class="space-y-3">
            <div>
              <div class="text-[10px] uppercase font-bold text-slate-400">Vertical</div>
              <div class="mt-0.5">
                <span
                  class="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border inline-flex items-center gap-1"
                  :class="org?.vertical === 'education' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'"
                >
                  {{ org?.vertical === "education" ? "Education" : "Real Estate" }}
                </span>
              </div>
            </div>

            <div>
              <div class="text-[10px] uppercase font-bold text-slate-400">Owner Contact</div>
              <div class="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {{ org?.ownerId?.firstName }} {{ org?.ownerId?.lastName }}
              </div>
              <div class="text-[11px] text-slate-500 font-mono">
                {{ org?.ownerId?.email }}
              </div>
              <div v-if="org?.ownerId?.mobile" class="text-[11px] text-slate-500">
                {{ org?.ownerId?.mobile }}
              </div>
            </div>

            <div>
              <div class="text-[10px] uppercase font-bold text-slate-400">Created At</div>
              <div class="text-slate-700 dark:text-slate-300 mt-0.5 font-tabular">
                {{ formatDate(org?.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: ORGANIZATION USERS -->
      <div
        v-else-if="activeTab === 'users'"
        class="space-y-4"
      >
        <div class="rounded-xl bg-surface border border-default overflow-hidden shadow-xs">
          <AppTable
            :rows="orgUsers"
            :columns="userColumns"
            :isLoading="loading"
            empty-title="No users in this organization"
            empty-subtext="No user accounts are currently associated with this tenant."
          >
            <!-- Cell: Name -->
            <template #cell(name)="{ row }">
              <div class="font-bold text-slate-900 dark:text-slate-100 text-xs py-0.5">
                {{ row.firstName }} {{ row.lastName }}
              </div>
            </template>

            <!-- Cell: Email -->
            <template #cell(email)="{ row }">
              <span class="font-mono text-xs text-slate-600 dark:text-slate-400">
                {{ row.email }}
              </span>
            </template>

            <!-- Cell: Role -->
            <template #cell(role)="{ row }">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                {{ row.roleId?.code || row.roleId?.name || "Agent" }}
              </span>
            </template>

            <!-- Cell: Status -->
            <template #cell(status)="{ row }">
              <span
                class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1"
                :class="
                  row.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                "
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="row.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'"
                ></span>
                {{ row.status }}
              </span>
            </template>

            <!-- Cell: Created -->
            <template #cell(createdAt)="{ row }">
              <span class="text-xs font-tabular text-slate-500 dark:text-slate-400">
                {{ formatDate(row.createdAt) }}
              </span>
            </template>
          </AppTable>
        </div>
      </div>
    </div>

    <!-- RESET OWNER PASSWORD MODAL -->
    <Teleport to="body">
      <div
        v-if="showResetModal"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        @click.self="showResetModal = false"
      >
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
          <h2 class="text-sm font-bold text-slate-900 dark:text-white">
            Reset Owner Password
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Set a new password for {{ org?.ownerId?.email }}.
          </p>
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300">New Password</label>
            <input
              v-model="resetPasswordInput"
              type="text"
              placeholder="TrackDeal@123"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              @click="showResetModal = false"
              class="btn btn-secondary px-3 py-1.5 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              @click="executeResetPassword"
              :disabled="resetting"
              class="btn btn-primary px-4 py-1.5 rounded-xl font-bold text-xs text-white"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { PhKey } from "@phosphor-icons/vue";
import Swal from "sweetalert2";
import AppTable from "@/components/AppTable.vue";
import {
  fetchAdminOrganizationById,
  updateAdminOrganization,
  fetchAdminOrganizationUsers,
  resetAdminOwnerPassword,
} from "../api/endpoints";

const route = useRoute();
const loading = ref(false);
const saving = ref(false);
const org = ref(null);
const orgUsers = ref([]);
const activeTab = ref("overview");

const userColumns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created" },
];

const editForm = ref({
  name: "",
  organizationType: "AGENCY",
  maxUsers: 10,
  phone: "",
  city: "",
  state: "",
});

const showResetModal = ref(false);
const resetPasswordInput = ref("TrackDeal@123");
const resetting = ref(false);

async function loadOrgData() {
  const id = route.params.id;
  if (!id) return;

  loading.value = true;
  try {
    const [orgRes, usersRes] = await Promise.all([
      fetchAdminOrganizationById(id),
      fetchAdminOrganizationUsers(id),
    ]);

    org.value = orgRes?.data || orgRes || null;
    orgUsers.value = usersRes?.data || usersRes || [];

    if (org.value) {
      editForm.value = {
        name: org.value.name,
        organizationType: org.value.organizationType || "AGENCY",
        maxUsers: org.value.maxUsers || 10,
        phone: org.value.phone || "",
        city: org.value.address?.city || "",
        state: org.value.address?.state || "",
      };
    }
  } catch (err) {
    console.error("Failed to load organization:", err);
  } finally {
    loading.value = false;
  }
}

async function handleSaveOrg() {
  saving.value = true;
  try {
    await updateAdminOrganization(org.value._id, editForm.value);
    await loadOrgData();
    Swal.fire({ text: "Organization successfully updated!", icon: "success" });
  } catch (err) {
    Swal.fire({
      text:
        err.response?.data?.error?.message ||
        err.message ||
        "Failed to update organization.",
      icon: "error",
    });
  } finally {
    saving.value = false;
  }
}

async function toggleStatus() {
  const newStatus = org.value.status === "suspended" ? "active" : "suspended";
  const result = await Swal.fire({
    title: "Confirm",
    text: `Are you sure you want to ${newStatus === "suspended" ? "SUSPEND" : "ACTIVATE"} this organization?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
  });
  if (!result.isConfirmed) return;

  try {
    await updateAdminOrganization(org.value._id, { status: newStatus });
    await loadOrgData();
  } catch (err) {
    Swal.fire({
      text:
        err.response?.data?.error?.message ||
        err.message ||
        "Failed to update status.",
      icon: "error",
    });
  }
}

function openResetPasswordModal() {
  resetPasswordInput.value = "TrackDeal@123";
  showResetModal.value = true;
}

async function executeResetPassword() {
  resetting.value = true;
  try {
    await resetAdminOwnerPassword(org.value._id, resetPasswordInput.value);
    showResetModal.value = false;
    Swal.fire({
      text: "Owner password successfully updated!",
      icon: "success",
    });
  } catch (err) {
    Swal.fire({
      text:
        err.response?.data?.error?.message ||
        err.message ||
        "Failed to reset password.",
      icon: "error",
    });
  } finally {
    resetting.value = false;
  }
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

onMounted(() => {
  loadOrgData();
});
</script>
