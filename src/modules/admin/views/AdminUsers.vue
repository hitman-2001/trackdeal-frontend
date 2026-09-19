<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-accent-400">
          User Directory
        </p>
        <h1 class="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
          Platform Users Directory
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage user accounts, roles, security status, and tenant organization mapping across the platform.
        </p>
      </div>
      <button
        @click="openCreateUserModal"
        class="btn btn-primary px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
      >
        <PhPlus :size="14" weight="bold" />
        <span>Create User</span>
      </button>
    </div>

    <!-- Filters & Toolbar -->
    <div class="p-4 rounded-xl bg-surface border border-default flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
      <div class="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        <div class="relative w-full sm:w-64">
          <PhMagnifyingGlass :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Search name, email, mobile..."
            class="w-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>

        <select
          v-model="selectedOrgId"
          @change="loadUsers"
          class="bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
        >
          <option value="">All Organizations</option>
          <option v-for="org in orgList" :key="org._id" :value="org._id">
            {{ org.name }}
          </option>
        </select>

        <select
          v-model="statusFilter"
          @change="loadUsers"
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
        users
      </div>
    </div>

    <!-- Users Table with AppTable -->
    <div class="rounded-xl bg-surface border border-default overflow-hidden shadow-xs">
      <AppTable
        :rows="users"
        :columns="columns"
        :isLoading="loading"
        :pagination="pagination"
        row-actions-label="Actions"
        empty-title="No users found"
        empty-subtext="No users match your filter criteria."
        @pageChange="changePage"
        @pageSizeChange="handlePageSizeChange"
      >
        <!-- Cell: User Name, Avatar, Email -->
        <template #cell(user)="{ row }">
          <div class="flex items-center gap-2.5 py-0.5">
            <div class="w-8 h-8 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent-300 font-bold flex items-center justify-center text-xs shrink-0">
              {{ (row.firstName?.[0] || 'U') + (row.lastName?.[0] || '') }}
            </div>
            <div class="space-y-0.5">
              <div class="font-bold text-slate-900 dark:text-slate-100 text-xs">
                {{ row.firstName }} {{ row.lastName }}
              </div>
              <div class="text-[10px] text-slate-400 flex items-center gap-1">
                <span>{{ row.email }}</span>
                <span v-if="row.mobile" class="text-slate-300 dark:text-slate-600">•</span>
                <span v-if="row.mobile">{{ row.mobile }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- Cell: Organization -->
        <template #cell(organization)="{ row }">
          <div v-if="row.organizationId" class="font-semibold text-slate-800 dark:text-slate-200 text-xs">
            {{ row.organizationId.name }}
          </div>
          <div v-else class="text-slate-400 italic text-[11px]">Platform Root</div>
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

        <!-- Cell: Created Date -->
        <template #cell(createdAt)="{ row }">
          <span class="text-xs font-tabular text-slate-500 dark:text-slate-400">
            {{ formatDate(row.createdAt) }}
          </span>
        </template>

        <!-- Row Actions -->
        <template #rowActions="{ row }">
          <div class="flex items-center justify-end gap-1">
            <button
              type="button"
              title="Edit user"
              aria-label="Edit user"
              @click="openEditModal(row)"
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
            >
              <PhPencilSimple :size="15" />
            </button>
            <button
              type="button"
              title="Move organization"
              aria-label="Move organization"
              @click="openMoveModal(row)"
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
            >
              <PhArrowsLeftRight :size="15" />
            </button>
          </div>
        </template>
      </AppTable>
    </div>

    <!-- CREATE USER MODAL -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        @click.self="showCreateModal = false"
      >
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 class="text-sm font-bold text-slate-900 dark:text-white">
              Create User Account
            </h2>
            <button
              @click="showCreateModal = false"
              class="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Close"
            >
              <PhX :size="16" weight="bold" />
            </button>
          </div>

          <form @submit.prevent="handleCreateUser" class="space-y-3 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Tenant Organization *</label>
              <select
                v-model="createForm.organizationId"
                required
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="" disabled>-- Select Organization --</option>
                <option v-for="org in orgList" :key="org._id" :value="org._id">
                  {{ org.name }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">First Name *</label>
                <input
                  v-model="createForm.firstName"
                  type="text"
                  required
                  placeholder="e.g. Rahul"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Last Name</label>
                <input
                  v-model="createForm.lastName"
                  type="text"
                  placeholder="e.g. Verma"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Email Address *</label>
                <input
                  v-model="createForm.email"
                  type="email"
                  required
                  placeholder="user@example.com"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Mobile Number</label>
                <input
                  v-model="createForm.mobile"
                  type="text"
                  placeholder="+91 9876543210"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Role</label>
                <select
                  v-model="createForm.role"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="org_admin">Organization Admin (ORG_ADMIN)</option>
                  <option value="branch_manager">Branch Manager (BRANCH_MANAGER)</option>
                  <option value="manager">Manager (MANAGER)</option>
                  <option value="agent">Agent (AGENT)</option>
                  <option value="read_only">Read Only (READ_ONLY)</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Default Password</label>
                <input
                  v-model="createForm.password"
                  type="text"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                @click="showCreateModal = false"
                class="btn btn-secondary px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="btn btn-primary px-5 py-2 rounded-xl font-bold text-white text-xs"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- EDIT USER MODAL -->
    <Teleport to="body">
      <div
        v-if="showEditModal"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        @click.self="showEditModal = false"
      >
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 class="text-sm font-bold text-slate-900 dark:text-white">
              Edit User: {{ selectedUser?.firstName }} {{ selectedUser?.lastName }}
            </h2>
            <button
              @click="showEditModal = false"
              class="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Close"
            >
              <PhX :size="16" weight="bold" />
            </button>
          </div>

          <form @submit.prevent="handleUpdateUser" class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">First Name</label>
                <input
                  v-model="editForm.firstName"
                  type="text"
                  required
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Last Name</label>
                <input
                  v-model="editForm.lastName"
                  type="text"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Role</label>
                <select
                  v-model="editForm.role"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                >
                  <option value="org_admin">Organization Admin (ORG_ADMIN)</option>
                  <option value="branch_manager">Branch Manager (BRANCH_MANAGER)</option>
                  <option value="manager">Manager (MANAGER)</option>
                  <option value="agent">Agent (AGENT)</option>
                  <option value="read_only">Read Only (READ_ONLY)</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Status</label>
                <select
                  v-model="editForm.status"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Reset Password (Optional)</label>
              <input
                v-model="editForm.password"
                type="text"
                placeholder="Leave empty to keep unchanged"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                @click="showEditModal = false"
                class="btn btn-secondary px-4 py-2 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="btn btn-primary px-5 py-2 rounded-xl font-bold text-white text-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- MOVE USER ORGANIZATION MODAL -->
    <Teleport to="body">
      <div
        v-if="showMoveModal"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        @click.self="showMoveModal = false"
      >
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
          <h2 class="text-sm font-bold text-slate-900 dark:text-white">
            Move User Organization
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Transfer user <strong class="text-slate-800 dark:text-slate-200">{{ selectedUser?.email }}</strong> to a different tenant organization.
          </p>

          <div class="space-y-2 text-xs">
            <label class="font-bold text-slate-700 dark:text-slate-300">Target Organization *</label>
            <select
              v-model="targetMoveOrgId"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="" disabled>-- Select Target Organization --</option>
              <option v-for="org in orgList" :key="org._id" :value="org._id">
                {{ org.name }}
              </option>
            </select>
          </div>

          <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 text-xs">
            <button
              @click="showMoveModal = false"
              class="btn btn-secondary px-4 py-2 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              @click="executeMoveUser"
              :disabled="!targetMoveOrgId || saving"
              class="btn btn-primary px-5 py-2 rounded-xl font-bold text-white text-xs"
            >
              Confirm Move
            </button>
          </div>
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
  PhPencilSimple,
  PhArrowsLeftRight,
  PhX,
} from "@phosphor-icons/vue";
import Swal from "sweetalert2";
import AppTable from "@/components/AppTable.vue";
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  moveAdminUserOrganization,
  fetchAdminOrganizations,
} from "../api/endpoints";

const loading = ref(false);
const saving = ref(false);
const users = ref([]);
const orgList = ref([]);
const pagination = ref({ page: 1, limit: 15, total: 0, pages: 1 });

const searchQuery = ref("");
const selectedOrgId = ref("");
const statusFilter = ref("");

const columns = [
  { key: "user", label: "User Name & Contact" },
  { key: "organization", label: "Organization" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created Date" },
];

const showCreateModal = ref(false);
const createForm = ref({
  organizationId: "",
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  role: "org_admin",
  password: "TrackDeal@123",
});

const showEditModal = ref(false);
const selectedUser = ref(null);
const editForm = ref({
  firstName: "",
  lastName: "",
  role: "org_admin",
  status: "active",
  password: "",
});

const showMoveModal = ref(false);
const targetMoveOrgId = ref("");

let searchTimer = null;
function handleSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    pagination.value.page = 1;
    loadUsers();
  }, 300);
}

async function loadOrganizations() {
  try {
    const res = await fetchAdminOrganizations({ limit: 100 });
    orgList.value = res?.data || [];
  } catch (e) {
    console.error("Failed to load org list:", e);
  }
}

async function loadUsers() {
  loading.value = true;
  try {
    const res = await fetchAdminUsers({
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: searchQuery.value.trim() || undefined,
      organizationId: selectedOrgId.value || undefined,
      status: statusFilter.value || undefined,
    });
    users.value = res?.data || [];
    if (res?.pagination) {
      pagination.value = res.pagination;
    }
  } catch (err) {
    console.error("Failed to load users:", err);
  } finally {
    loading.value = false;
  }
}

function changePage(p) {
  pagination.value.page = p;
  loadUsers();
}

function handlePageSizeChange(size) {
  pagination.value.limit = size;
  pagination.value.page = 1;
  loadUsers();
}

function openCreateUserModal() {
  createForm.value = {
    organizationId: orgList.value[0]?._id || "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    role: "org_admin",
    password: "TrackDeal@123",
  };
  showCreateModal.value = true;
}

async function handleCreateUser() {
  saving.value = true;
  try {
    await createAdminUser(createForm.value);
    showCreateModal.value = false;
    await loadUsers();
  } catch (err) {
    Swal.fire({
      text:
        err.response?.data?.error?.message ||
        err.message ||
        "Failed to create user.",
      icon: "error",
    });
  } finally {
    saving.value = false;
  }
}

function openEditModal(u) {
  selectedUser.value = u;
  editForm.value = {
    firstName: u.firstName,
    lastName: u.lastName || "",
    role: u.roleId?.code || "agent",
    status: u.status || "active",
    password: "",
  };
  showEditModal.value = true;
}

async function handleUpdateUser() {
  saving.value = true;
  try {
    await updateAdminUser(selectedUser.value._id, editForm.value);
    showEditModal.value = false;
    await loadUsers();
  } catch (err) {
    Swal.fire({
      text:
        err.response?.data?.error?.message ||
        err.message ||
        "Failed to update user.",
      icon: "error",
    });
  } finally {
    saving.value = false;
  }
}

function openMoveModal(u) {
  selectedUser.value = u;
  targetMoveOrgId.value = "";
  showMoveModal.value = true;
}

async function executeMoveUser() {
  saving.value = true;
  try {
    await moveAdminUserOrganization(
      selectedUser.value._id,
      targetMoveOrgId.value,
    );
    showMoveModal.value = false;
    await loadUsers();
  } catch (err) {
    Swal.fire({
      text:
        err.response?.data?.error?.message ||
        err.message ||
        "Failed to move user.",
      icon: "error",
    });
  } finally {
    saving.value = false;
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
  loadOrganizations();
  loadUsers();
});
</script>
