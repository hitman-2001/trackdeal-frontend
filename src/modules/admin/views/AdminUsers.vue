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
          Platform Users Directory
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage user accounts, roles, security status, and tenant organization
          mapping across the platform.
        </p>
      </div>
      <button
        @click="openCreateUserModal"
        class="btn btn-primary px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 self-start sm:self-auto"
      >
        <AppIcon name="add" :size="14" weight="bold" />
        <span>Create User</span>
      </button>
    </div>

    <!-- Filters & Toolbar -->
    <div
      class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs"
    >
      <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Search name, email, mobile..."
          class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 w-full sm:w-64"
        />

        <select
          v-model="selectedOrgId"
          @change="loadUsers"
          class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Organizations</option>
          <option v-for="org in orgList" :key="org._id" :value="org._id">
            {{ org.name }}
          </option>
        </select>

        <select
          v-model="statusFilter"
          @change="loadUsers"
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
        users
      </div>
    </div>

    <!-- Users Table -->
    <div
      class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead
            class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800"
          >
            <tr>
              <th class="py-3 px-4">User</th>
              <th class="py-3 px-4">Organization</th>
              <th class="py-3 px-4">Role</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4">Created Date</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr
              v-for="u in users"
              :key="u._id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
            >
              <td class="py-3.5 px-4">
                <div class="font-bold text-slate-900 dark:text-slate-100">
                  {{ u.firstName }} {{ u.lastName }}
                </div>
                <div
                  class="text-[10px] font-mono text-slate-500 dark:text-slate-400"
                >
                  {{ u.email }} <span v-if="u.mobile">• {{ u.mobile }}</span>
                </div>
              </td>
              <td class="py-3.5 px-4">
                <div
                  v-if="u.organizationId"
                  class="font-semibold text-slate-800 dark:text-slate-200"
                >
                  {{ u.organizationId.name }}
                </div>
                <div v-else class="text-slate-500 italic">Platform Root</div>
              </td>
              <td class="py-3.5 px-4">
                <span
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {{ u.roleId?.code || u.roleId?.name || "Agent" }}
                </span>
              </td>
              <td class="py-3.5 px-4">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize"
                  :class="
                    u.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                  "
                >
                  {{ u.status }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                {{ formatDate(u.createdAt) }}
              </td>
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    title="Edit user"
                    aria-label="Edit user"
                    @click="openEditModal(u)"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-accent-400 transition"
                  >
                    <AppIcon name="note" :size="15" />
                  </button>
                  <button
                    type="button"
                    title="Move organization"
                    aria-label="Move organization"
                    @click="openMoveModal(u)"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-accent-400 transition"
                  >
                    <AppIcon name="move" :size="15" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="6" class="py-12 text-center text-xs text-slate-500">
                No users found.
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

    <!-- CREATE USER MODAL -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
        @click.self="showCreateModal = false"
      >
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
        >
          <div
            class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3"
          >
            <h2 class="text-sm font-bold text-slate-900 dark:text-white">
              Create User Account
            </h2>
            <button
              @click="showCreateModal = false"
              class="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
              aria-label="Close"
            >
              <AppIcon name="close" :size="14" weight="bold" />
            </button>
          </div>

          <form @submit.prevent="handleCreateUser" class="space-y-3 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-600 dark:text-slate-300"
                >Tenant Organization *</label
              >
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
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >First Name *</label
                >
                <input
                  v-model="createForm.firstName"
                  type="text"
                  required
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >Last Name</label
                >
                <input
                  v-model="createForm.lastName"
                  type="text"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >Email Address *</label
                >
                <input
                  v-model="createForm.email"
                  type="email"
                  required
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >Mobile</label
                >
                <input
                  v-model="createForm.mobile"
                  type="text"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >Role *</label
                >
                <select
                  v-model="createForm.role"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="org_admin">
                    Organization Admin (ORG_ADMIN)
                  </option>
                  <option value="branch_manager">
                    Branch Manager (BRANCH_MANAGER)
                  </option>
                  <option value="manager">Manager (MANAGER)</option>
                  <option value="agent">Agent (AGENT)</option>
                  <option value="read_only">Read Only (READ_ONLY)</option>
                </select>
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

            <div
              class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2"
            >
              <button
                type="button"
                @click="showCreateModal = false"
                class="btn btn-secondary px-4 py-2 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="btn btn-primary px-5 py-2 rounded-xl font-bold text-white text-xs"
              >
                Create User
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
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
        @click.self="showEditModal = false"
      >
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
        >
          <h2 class="text-sm font-bold text-slate-900 dark:text-white">
            Edit User: {{ selectedUser?.email }}
          </h2>

          <form @submit.prevent="handleUpdateUser" class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >First Name</label
                >
                <input
                  v-model="editForm.firstName"
                  type="text"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >Last Name</label
                >
                <input
                  v-model="editForm.lastName"
                  type="text"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >Role</label
                >
                <select
                  v-model="editForm.role"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                >
                  <option value="org_admin">
                    Organization Admin (ORG_ADMIN)
                  </option>
                  <option value="branch_manager">
                    Branch Manager (BRANCH_MANAGER)
                  </option>
                  <option value="manager">Manager (MANAGER)</option>
                  <option value="agent">Agent (AGENT)</option>
                  <option value="read_only">Read Only (READ_ONLY)</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-600 dark:text-slate-300"
                  >Status</label
                >
                <select
                  v-model="editForm.status"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div class="space-y-1">
              <label class="font-bold text-slate-600 dark:text-slate-300"
                >Reset Password (Optional)</label
              >
              <input
                v-model="editForm.password"
                type="text"
                placeholder="Leave empty to keep unchanged"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div
              class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2"
            >
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
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
        @click.self="showMoveModal = false"
      >
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
        >
          <h2 class="text-sm font-bold text-slate-900 dark:text-white">
            Move User Organization
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Transfer user
            <strong class="text-slate-800 dark:text-slate-200">{{
              selectedUser?.email
            }}</strong>
            to a different tenant organization.
          </p>

          <div class="space-y-2 text-xs">
            <label class="font-bold text-slate-700 dark:text-slate-300"
              >Target Organization *</label
            >
            <select
              v-model="targetMoveOrgId"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="" disabled>
                -- Select Target Organization --
              </option>
              <option v-for="org in orgList" :key="org._id" :value="org._id">
                {{ org.name }}
              </option>
            </select>
          </div>

          <div
            class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 text-xs"
          >
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
import Swal from "sweetalert2";
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
