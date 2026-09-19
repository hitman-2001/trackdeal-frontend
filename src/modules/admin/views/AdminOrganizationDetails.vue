<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Breadcrumb & Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <router-link
            to="/admin/organizations"
            class="hover:text-primary dark:hover:text-accent-400 transition"
            >Organizations</router-link
          >
          <span>/</span>
          <span class="text-slate-800 dark:text-slate-200 font-semibold">{{
            org?.name || "Organization Details"
          }}</span>
        </div>
        <h1
          class="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3"
        >
          {{ org?.name }}
          <span
            v-if="org?.status"
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
        </h1>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="openResetPasswordModal"
          class="btn btn-secondary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <AppIcon name="key" :size="14" />
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
          {{
            org?.status === "suspended" ? "Activate Tenant" : "Suspend Tenant"
          }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !org" class="py-24 text-center">
      <div
        class="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"
      ></div>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Loading organization details...
      </p>
    </div>

    <div v-else class="space-y-6">
      <!-- STATS STRIP -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-center"
        >
          <div class="text-label text-slate-500 dark:text-slate-400">Users</div>
          <div
            class="text-xl font-black text-slate-900 dark:text-white mt-1 font-heading"
          >
            {{ org?.stats?.totalUsers || 0 }}
          </div>
        </div>
        <div
          class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-center"
        >
          <div class="text-label text-slate-500 dark:text-slate-400">Leads</div>
          <div
            class="text-xl font-black text-slate-900 dark:text-white mt-1 font-heading"
          >
            {{ org?.stats?.totalLeads || 0 }}
          </div>
        </div>
        <div
          class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-center"
        >
          <div class="text-label text-slate-500 dark:text-slate-400">
            Properties
          </div>
          <div
            class="text-xl font-black text-slate-900 dark:text-white mt-1 font-heading"
          >
            {{ org?.stats?.totalProperties || 0 }}
          </div>
        </div>
        <div
          class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-center"
        >
          <div class="text-label text-slate-500 dark:text-slate-400">
            Projects
          </div>
          <div
            class="text-xl font-black text-slate-900 dark:text-white mt-1 font-heading"
          >
            {{ org?.stats?.totalProjects || 0 }}
          </div>
        </div>
        <div
          class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-center"
        >
          <div class="text-label text-slate-500 dark:text-slate-400">Deals</div>
          <div
            class="text-xl font-black text-slate-900 dark:text-white mt-1 font-heading"
          >
            {{ org?.stats?.totalDeals || 0 }}
          </div>
        </div>
        <div
          class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-center"
        >
          <div class="text-label text-slate-500 dark:text-slate-400">
            Channel Partners
          </div>
          <div
            class="text-xl font-black text-slate-900 dark:text-white mt-1 font-heading"
          >
            {{ org?.stats?.totalAgents || 0 }}
          </div>
        </div>
      </div>

      <!-- TABS -->
      <div
        class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2"
      >
        <button
          @click="activeTab = 'overview'"
          class="px-4 py-2 rounded-xl text-xs font-semibold transition"
          :class="
            activeTab === 'overview'
              ? 'bg-primary text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          "
        >
          Overview & Settings
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
        <div
          class="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5"
        >
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
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >Organization Name</label
                >
                <input
                  v-model="editForm.name"
                  type="text"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >Tenant Code</label
                >
                <input
                  :value="org?.code"
                  disabled
                  class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-500 dark:text-slate-400 font-mono"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300">{{
                  org?.vertical === "education" ? "Institute Type" : "Plan Tier"
                }}</label>
                <select
                  v-model="editForm.organizationType"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <template v-if="org?.vertical === 'education'">
                    <option value="INDIVIDUAL_AGENT">Independent Tutor</option>
                    <option value="AGENCY">Coaching Institute</option>
                    <option value="ENTERPRISE_AGENCY">
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
                  >Max Users Quota</label
                >
                <input
                  v-model="editForm.maxUsers"
                  type="number"
                  min="1"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >Phone</label
                >
                <input
                  v-model="editForm.phone"
                  type="text"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >City</label
                >
                <input
                  v-model="editForm.city"
                  type="text"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >State</label
                >
                <input
                  v-model="editForm.state"
                  type="text"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div
              class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end"
            >
              <button
                type="submit"
                :disabled="saving"
                class="btn btn-primary px-5 py-2.5 rounded-xl font-bold text-white flex items-center gap-2"
              >
                <span
                  v-if="saving"
                  class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></span>
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Owner Profile Card (1 Col) -->
        <div
          class="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4"
        >
          <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 class="text-sm font-bold text-slate-900 dark:text-white">
              Owner Information
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Primary administrative contact
            </p>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <div class="text-[10px] uppercase font-bold text-slate-500">
                Name
              </div>
              <div class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {{ org?.ownerId?.firstName }} {{ org?.ownerId?.lastName }}
              </div>
            </div>
            <div>
              <div class="text-[10px] uppercase font-bold text-slate-500">
                Email Address
              </div>
              <div class="font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                {{ org?.ownerId?.email }}
              </div>
            </div>
            <div>
              <div class="text-[10px] uppercase font-bold text-slate-500">
                Mobile
              </div>
              <div class="text-slate-700 dark:text-slate-300 mt-0.5">
                {{ org?.ownerId?.mobile || "Not set" }}
              </div>
            </div>
            <div>
              <div class="text-[10px] uppercase font-bold text-slate-500">
                Created At
              </div>
              <div class="text-slate-700 dark:text-slate-300 mt-0.5">
                {{ formatDate(org?.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: ORGANIZATION USERS -->
      <div
        v-else-if="activeTab === 'users'"
        class="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4"
      >
        <div
          class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3"
        >
          <div>
            <h2 class="text-sm font-bold text-slate-900 dark:text-white">
              Users under {{ org?.name }}
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Manage individual user accounts within this tenant scope.
            </p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead
              class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800"
            >
              <tr>
                <th class="py-2.5 px-3">Name</th>
                <th class="py-2.5 px-3">Email</th>
                <th class="py-2.5 px-3">Role</th>
                <th class="py-2.5 px-3">Status</th>
                <th class="py-2.5 px-3">Created</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60">
              <tr
                v-for="user in orgUsers"
                :key="user._id"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
              >
                <td
                  class="py-3 px-3 font-bold text-slate-800 dark:text-slate-200"
                >
                  {{ user.firstName }} {{ user.lastName }}
                </td>
                <td
                  class="py-3 px-3 font-mono text-slate-700 dark:text-slate-300"
                >
                  {{ user.email }}
                </td>
                <td class="py-3 px-3">
                  <span
                    class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {{ user.roleId?.code || user.roleId?.name || "Agent" }}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
                    :class="
                      user.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    "
                  >
                    {{ user.status }}
                  </span>
                </td>
                <td class="py-3 px-3 text-slate-500 dark:text-slate-400">
                  {{ formatDate(user.createdAt) }}
                </td>
              </tr>
              <tr v-if="orgUsers.length === 0">
                <td colspan="5" class="py-8 text-center text-xs text-slate-500">
                  No users found under this organization.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- RESET OWNER PASSWORD MODAL -->
    <Teleport to="body">
      <div
        v-if="showResetModal"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
        @click.self="showResetModal = false"
      >
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4"
        >
          <h2 class="text-sm font-bold text-slate-900 dark:text-white">
            Reset Owner Password
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Set a new password for {{ org?.ownerId?.email }}.
          </p>
          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-600 dark:text-slate-300"
              >New Password</label
            >
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
import Swal from "sweetalert2";
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
