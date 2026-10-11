<template>
  <div class="space-y-6 text-xs">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-1">
      <div class="min-w-0">
        <h1
          class="font-heading text-xl font-extrabold text-slate-800 dark:text-slate-100 break-words"
        >
          {{
            isEducationWorkspace
              ? "Staff Management & Access Logs"
              : "User Management & Audit Trails"
          }}
        </h1>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
          {{
            isEducationWorkspace
              ? "Onboard counselors and staff, manage account access, assign campus branches, and review audit logs."
              : "Onboard team members, manage account suspensions, transfer regional branches, and review activity audit logs."
          }}
        </p>
      </div>
      <button
        @click="openInviteDrawer"
        :title="isUserQuotaReached ? `User limit reached (${users?.length || 0}/${maxUserQuota})` : ''"
        class="btn-primary h-9 px-3.5 text-xs font-semibold gap-1.5 self-start sm:self-auto shrink-0 shadow-xs rounded-xl flex items-center"
      >
        <PhPlus :size="14" weight="bold" />
        <span>{{
          isEducationWorkspace ? "Onboard Staff" : "Onboard User"
        }}</span>
      </button>
    </div>

    <!-- Inner Tabs -->
    <div
      class="flex border-b border-default overflow-x-auto gap-1 sm:gap-4 pb-0.5 scrollbar-none w-full min-w-0"
      style="-webkit-overflow-scrolling: touch;"
    >
      <button
        @click="activeTab = 'directory'"
        class="py-2.5 px-2.5 border-b-2 font-bold text-xs transition-colors shrink-0 whitespace-nowrap"
        :class="
          activeTab === 'directory'
            ? 'border-primary text-primary'
            : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
        "
      >
        User Directory ({{ users?.length || 0 }})
      </button>
      <button
        v-if="isOrgAdmin"
        @click="activeTab = 'permissions'"
        class="py-2.5 px-2.5 border-b-2 font-bold text-xs transition-colors shrink-0 whitespace-nowrap"
        :class="
          activeTab === 'permissions'
            ? 'border-primary text-primary'
            : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
        "
      >
        {{ isEducationWorkspace ? "Staff Permissions" : "User Permissions" }}
      </button>
      <button
        @click="activeTab = 'audit'"
        class="py-2.5 px-2.5 border-b-2 font-bold text-xs transition-colors shrink-0 whitespace-nowrap"
        :class="
          activeTab === 'audit'
            ? 'border-primary text-primary'
            : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
        "
      >
        {{ isEducationWorkspace ? "Audit Logs" : "Immutable Audit Logs" }}
      </button>
    </div>

    <!-- Tab Contents -->
    <div class="space-y-6">
      <!-- 1. User Directory Tab -->
      <div
        v-if="activeTab === 'directory'"
        class="bg-surface border border-default rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-4"
      >
        <!-- Search and Counter Header -->
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="relative flex-1 min-w-[200px] max-w-sm">
            <PhMagnifyingGlass :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="isEducationWorkspace ? 'Search staff by name, email, or role...' : 'Search users by name, email, or role...'"
              class="w-full bg-slate-50 dark:bg-slate-850 border border-default rounded-xl pl-9 pr-3 py-2 text-xs focus:border-primary outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
          <div class="text-[11px] font-semibold text-slate-500 font-tabular bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-default/60 shrink-0 flex items-center gap-1">
            <span>
              {{ filteredUsers.length }} {{ isEducationWorkspace ? (filteredUsers.length === 1 ? 'Staff Member' : 'Staff Members') : (filteredUsers.length === 1 ? 'User' : 'Users') }}
            </span>
            <span v-if="maxUserQuota" class="text-slate-400 font-normal">
              / {{ maxUserQuota }} limit
            </span>
          </div>
        </div>

        <!-- Desktop Users Table (>= md) -->
        <div class="hidden md:block overflow-x-auto border border-default rounded-xl">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                class="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-b border-default font-semibold"
              >
                <th class="p-3">Full Name</th>
                <th class="p-3">Official Email</th>
                <th class="p-3">Access Role</th>
                <th v-if="isEnterprise" class="p-3">Assigned Branch</th>
                <th class="p-3 text-center">Status</th>
                <th class="p-3 text-center">Operations</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-if="filteredUsers.length === 0">
                <td :colspan="isEnterprise ? 6 : 5" class="p-6 text-center text-slate-400">
                  No {{ isEducationWorkspace ? 'staff' : 'users' }} found matching "{{ searchQuery }}"
                </td>
              </tr>
              <tr
                v-else
                v-for="user in filteredUsers"
                :key="user._id || user.id"
                class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td class="p-3 font-bold text-slate-850 dark:text-slate-200">
                  {{ getUserDisplayName(user) }}
                </td>
                <td class="p-3 text-slate-600 dark:text-slate-400 font-mono">
                  {{ user.email }}
                </td>
                <td
                  class="p-3 text-slate-750 dark:text-slate-300 capitalize font-semibold"
                >
                  <span
                    class="px-2 py-0.5 rounded text-[10px] border"
                    :class="getRoleBadgeClass(getRoleCode(user.role, user))"
                  >
                    {{ getRoleDisplayName(user.role, user) }}
                  </span>
                </td>
                <td
                  v-if="isEnterprise"
                  class="p-3 font-semibold text-slate-600 dark:text-slate-400"
                >
                  {{ user.branch || user.branchId?.name || "—" }}
                </td>
                <td class="p-3 text-center">
                  <span
                    v-if="isSuperAdminSelf(user)"
                    class="px-2.5 py-0.5 rounded-full text-micro font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                  >
                    Active
                  </span>
                  <div v-else class="flex items-center justify-center gap-2">
                    <label
                      class="relative inline-flex items-center cursor-pointer"
                      :title="
                        user.status === 'active'
                          ? 'Click to Deactivate'
                          : 'Click to Activate'
                      "
                    >
                      <input
                        type="checkbox"
                        :checked="user.status === 'active'"
                        :disabled="isUserStatusUpdating(user)"
                        :aria-label="
                          user.status === 'active'
                            ? `Deactivate ${getUserDisplayName(user)}`
                            : `Activate ${getUserDisplayName(user)}`
                        "
                        @click.prevent="toggleUserStatus(user)"
                        class="sr-only peer"
                      />
                      <div
                        class="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"
                      ></div>
                    </label>
                    <span
                      class="text-[10px] font-bold uppercase transition-colors"
                      :class="
                        user.status === 'active'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-500 dark:text-slate-400'
                      "
                    >
                      {{ user.status === "active" ? "Active" : "Inactive" }}
                    </span>
                  </div>
                </td>
                <td class="p-3 text-center">
                  <template v-if="isSuperAdminSelf(user)">
                    <span
                      class="text-micro font-bold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md"
                    >
                      System Generated
                    </span>
                  </template>
                  <template v-else>
                    <div class="flex items-center justify-center gap-1.5">
                      <button
                        v-if="isEnterprise"
                        @click="triggerTransfer(user)"
                        type="button"
                        title="Transfer Office"
                        aria-label="Transfer Office"
                        class="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-primary hover:bg-primary/10 hover:border-primary/30 flex items-center justify-center transition-all shadow-2xs"
                        :disabled="user.status !== 'active'"
                        :class="
                          user.status !== 'active'
                            ? 'opacity-40 cursor-not-allowed'
                            : ''
                        "
                      >
                        <PhMapPin :size="13" weight="bold" />
                      </button>
                      <button
                        @click="triggerRoleSwap(user)"
                        type="button"
                        title="Adjust Role"
                        aria-label="Adjust Role"
                        class="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary/30 hover:bg-primary/10 flex items-center justify-center transition-all shadow-2xs"
                        :disabled="user.status !== 'active'"
                        :class="
                          user.status !== 'active'
                            ? 'opacity-40 cursor-not-allowed'
                            : ''
                        "
                      >
                        <PhGear :size="13" weight="bold" />
                      </button>
                      <button
                        v-if="isOrgAdmin"
                        @click="confirmDeleteUser(user)"
                        type="button"
                        title="Delete User"
                        aria-label="Delete User"
                        class="w-7 h-7 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 text-rose-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 flex items-center justify-center transition-all shadow-2xs"
                      >
                        <PhTrash :size="13" weight="bold" />
                      </button>
                    </div>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile User Cards Feed (< md) -->
        <div class="block md:hidden space-y-3">
          <div
            v-if="filteredUsers.length === 0"
            class="text-center py-10 text-slate-400 text-xs bg-slate-50/50 dark:bg-slate-850/30 rounded-xl border border-dashed border-default"
          >
            No {{ isEducationWorkspace ? 'staff' : 'users' }} found matching "{{ searchQuery }}"
          </div>

          <div
            v-else
            v-for="user in filteredUsers"
            :key="user._id || user.id"
            class="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-3"
          >
            <!-- Top Row: Avatar + Name & Role + Status Toggle -->
            <div class="flex items-start justify-between gap-2.5">
              <div class="flex items-center gap-2.5 min-w-0 flex-1">
                <!-- Avatar Initials -->
                <div
                  class="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-primary/20"
                >
                  {{ (getUserDisplayName(user) || 'U').charAt(0) }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <h3 class="font-heading font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {{ getUserDisplayName(user) }}
                    </h3>
                    <span
                      v-if="isSuperAdminSelf(user)"
                      class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-750 text-slate-600 dark:text-slate-300 uppercase tracking-wider"
                    >
                      You
                    </span>
                  </div>
                  <span
                    class="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold border leading-tight"
                    :class="getRoleBadgeClass(getRoleCode(user.role, user))"
                  >
                    {{ getRoleDisplayName(user.role, user) }}
                  </span>
                </div>
              </div>

              <!-- Status Toggle / System Badge -->
              <div class="shrink-0 pt-0.5">
                <span
                  v-if="isSuperAdminSelf(user)"
                  class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20"
                >
                  Active
                </span>
                <div v-else class="flex items-center gap-1.5">
                  <label
                    class="relative inline-flex items-center cursor-pointer"
                    :title="user.status === 'active' ? 'Click to Deactivate' : 'Click to Activate'"
                  >
                    <input
                      type="checkbox"
                      :checked="user.status === 'active'"
                      :disabled="isUserStatusUpdating(user)"
                      :aria-label="user.status === 'active' ? `Deactivate ${getUserDisplayName(user)}` : `Activate ${getUserDisplayName(user)}`"
                      @click.prevent="toggleUserStatus(user)"
                      class="sr-only peer"
                    />
                    <div
                      class="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"
                    ></div>
                  </label>
                  <span
                    class="text-[10px] font-bold uppercase"
                    :class="user.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'"
                  >
                    {{ user.status === 'active' ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Details: Email & Branch -->
            <div class="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5 text-xs">
              <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300 min-w-0">
                <PhEnvelopeSimple :size="13" class="text-slate-400 shrink-0" />
                <a
                  :href="`mailto:${user.email}`"
                  class="font-mono text-[11px] truncate hover:text-primary transition-colors text-slate-700 dark:text-slate-300"
                >
                  {{ user.email }}
                </a>
              </div>

              <div
                v-if="user.mobile || user.phone"
                class="flex items-center gap-2 text-slate-600 dark:text-slate-300 min-w-0"
              >
                <PhPhone :size="13" class="text-slate-400 shrink-0" />
                <a
                  :href="`tel:${user.mobile || user.phone}`"
                  class="font-mono text-[11px] hover:text-primary transition-colors text-slate-700 dark:text-slate-300"
                >
                  {{ user.mobile || user.phone }}
                </a>
              </div>

              <div
                v-if="isEnterprise && (user.branch || user.branchId?.name)"
                class="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]"
              >
                <PhMapPin :size="13" class="text-slate-400 shrink-0" />
                <span>Branch: <strong class="text-slate-700 dark:text-slate-200 font-semibold">{{ user.branch || user.branchId?.name }}</strong></span>
              </div>
            </div>

            <!-- Operations Actions Footer -->
            <div
              v-if="!isSuperAdminSelf(user)"
              class="pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2"
            >
              <button
                @click="triggerRoleSwap(user)"
                type="button"
                :disabled="user.status !== 'active'"
                class="flex-1 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <PhGear :size="13" weight="bold" class="text-slate-500" />
                <span>Adjust Role</span>
              </button>

              <button
                v-if="isEnterprise"
                @click="triggerTransfer(user)"
                type="button"
                :disabled="user.status !== 'active'"
                class="flex-1 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <PhMapPin :size="13" weight="bold" class="text-primary" />
                <span>Transfer Office</span>
              </button>

              <button
                v-if="isOrgAdmin"
                @click="confirmDeleteUser(user)"
                type="button"
                class="h-8 px-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-[0.98] shadow-2xs hover:bg-rose-100"
              >
                <PhTrash :size="12" weight="bold" class="text-rose-500" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <UserPermissionsTab
        v-else-if="activeTab === 'permissions' && isOrgAdmin"
        :users="users || []"
        :roles="roles || []"
        @saved="refetchData"
      />

      <!-- 2. Audit logs Tab -->
      <div v-if="activeTab === 'audit'">
        <AuditTimeline :logs="auditLogs || []" />
      </div>
    </div>

    <!-- Invite User Drawer -->
    <UserInviteDrawer
      :isOpen="inviteDrawerOpen"
      :roles="roles || []"
      :branches="branches || []"
      @close="inviteDrawerOpen = false"
      @success="refetchData"
    />

    <!-- Transfer Branch Drawer -->
    <BranchTransferDrawer
      :isOpen="transferDrawerOpen"
      :user="activeUser"
      :branches="branches || []"
      @close="transferDrawerOpen = false"
      @success="refetchData"
    />

    <!-- Change Role Drawer -->
    <RoleChangeDrawer
      :isOpen="roleDrawerOpen"
      :user="activeUser"
      :roles="roles || []"
      @close="roleDrawerOpen = false"
      @success="refetchData"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useQueryClient } from "@tanstack/vue-query";
import {
  PhPlus,
  PhMapPin,
  PhGear,
  PhEnvelopeSimple,
  PhPhone,
  PhMagnifyingGlass,
  PhTrash,
} from "@phosphor-icons/vue";
import Swal from "sweetalert2";
import {
  useUsersQuery,
  useRolesQuery,
  useBranchesQuery,
  useAuditLogsQuery,
  useOrgSettingsQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} from "../queries";
import UserInviteDrawer from "../components/UserInviteDrawer.vue";
import BranchTransferDrawer from "../components/BranchTransferDrawer.vue";
import RoleChangeDrawer from "../components/RoleChangeDrawer.vue";
import AuditTimeline from "../components/AuditTimeline.vue";
import UserPermissionsTab from "../components/UserPermissionsTab.vue";

const store = useStore();
const queryClient = useQueryClient();

const activeTab = ref("directory");
const searchQuery = ref("");

function getUserDisplayName(user) {
  if (!user) return "User";
  return (
    user.name ||
    user.fullName ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "User"
  );
}

const isEnterprise = computed(
  () => store.getters["organization/isEnterpriseAgency"],
);
const isEducationWorkspace = computed(
  () => store.getters["organization/isEducationTenant"],
);
const isOrgAdmin = computed(() => {
  const role = String(store.getters["auth/userRole"] || "").toLowerCase();
  return ["super_admin", "system_admin", "org_admin", "organization_admin"].includes(role);
});

// TanStack queries
const { data: users } = useUsersQuery();
const { data: roles } = useRolesQuery();
const { data: branches } = useBranchesQuery();
const { data: auditLogs } = useAuditLogsQuery();
const { data: orgData } = useOrgSettingsQuery();
const { mutateAsync: updateUserStatus } = useUpdateUserStatusMutation();
const { mutateAsync: deleteUserMutation } = useDeleteUserMutation();

const maxUserQuota = computed(() => {
  const org = orgData.value?.data || orgData.value;
  if (!org) return null;
  const limits = [];
  if (typeof org.maxUsers === "number" && org.maxUsers > 0) limits.push(org.maxUsers);
  if (typeof org.subscription?.maxUsers === "number" && org.subscription.maxUsers > 0) limits.push(org.subscription.maxUsers);
  return limits.length > 0 ? Math.min(...limits) : null;
});

const isUserQuotaReached = computed(() => {
  if (!maxUserQuota.value) return false;
  const count = users.value?.length || 0;
  return count >= maxUserQuota.value;
});

const filteredUsers = computed(() => {
  const list = users.value || [];
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((user) => {
    const name = getUserDisplayName(user).toLowerCase();
    const email = String(user.email || "").toLowerCase();
    const role = getRoleDisplayName(user.role, user).toLowerCase();
    const branch = String(user.branch || user.branchId?.name || "").toLowerCase();
    return (
      name.includes(q) ||
      email.includes(q) ||
      role.includes(q) ||
      branch.includes(q)
    );
  });
});

// Drawer visibility states
const inviteDrawerOpen = ref(false);
const transferDrawerOpen = ref(false);
const roleDrawerOpen = ref(false);
const activeUser = ref(null);
const updatingUserIds = ref(new Set());

function openInviteDrawer() {
  if (isUserQuotaReached.value) {
    Swal.fire({
      title: "User Quota Reached",
      text: `Your organization has reached its maximum user limit of ${maxUserQuota.value}. Please upgrade or contact support to increase your user limit.`,
      icon: "warning",
      confirmButtonText: "Understood",
    });
    return;
  }
  inviteDrawerOpen.value = true;
}

function triggerTransfer(user) {
  activeUser.value = user;
  transferDrawerOpen.value = true;
}

function triggerRoleSwap(user) {
  activeUser.value = user;
  roleDrawerOpen.value = true;
}

function isSuperAdminSelf(user) {
  // Prevent logged in user from suspending self or changing self super admin role
  const loggedInEmail = store.state.auth?.currentUser?.email || "";
  return user.email === loggedInEmail;
}

function getUserId(user) {
  return user._id || user.id;
}

function isUserStatusUpdating(user) {
  return updatingUserIds.value.has(getUserId(user));
}

function setUserStatusUpdating(user, isUpdating) {
  const userId = getUserId(user);
  const next = new Set(updatingUserIds.value);
  if (isUpdating) next.add(userId);
  else next.delete(userId);
  updatingUserIds.value = next;
}

async function toggleUserStatus(user) {
  if (isSuperAdminSelf(user) || isUserStatusUpdating(user)) return;

  const currentlyActive = user.status === "active";
  const targetState = !currentlyActive;
  const targetStatusStr = targetState ? "active" : "inactive";
  const actionWord = targetState ? "activate" : "deactivate";
  const statusWord = targetState ? "Active" : "Inactive";
  const userName = user.name || user.fullName || "this user";

  const result = await Swal.fire({
    title: `Set as ${statusWord}`,
    text: `Are you sure you want to ${actionWord} ${userName}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
  });

  if (!result.isConfirmed) return;

  const userId = getUserId(user);
  if (!userId) {
    store.dispatch("notifications/triggerToast", {
      message: "Unable to update this user because its ID is missing.",
      type: "error",
    });
    return;
  }

  setUserStatusUpdating(user, true);
  try {
    await updateUserStatus({ id: userId, status: targetStatusStr });

    store.dispatch("notifications/triggerToast", {
      message: `User profile is now ${statusWord}.`,
      type: "success",
    });
  } catch (err) {
    queryClient.invalidateQueries({ queryKey: ["settings", "users"] });
    store.dispatch("notifications/triggerToast", {
      message: "Failed to toggle user activation status.",
      type: "error",
    });
  } finally {
    setUserStatusUpdating(user, false);
  }
}

function getRoleBadgeClass(role) {
  switch (role) {
    case "super_admin":
      return "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-900/40";
    case "branch_manager":
      return "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/40";
    default:
      return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-700";
  }
}

function getRoleCode(role, user) {
  const r = role || user?.roleId;
  if (!r) return "";
  if (typeof r === "object") {
    return r.code || "";
  }
  const roleIdStr = String(r);
  const foundRole = (roles.value || []).find(
    (item) => String(item._id || item.id) === roleIdStr || item.code === roleIdStr
  );
  if (foundRole) {
    return foundRole.code || "";
  }
  if (/^[0-9a-fA-F]{24}$/.test(roleIdStr)) {
    return "staff";
  }
  return roleIdStr;
}

function getRoleDisplayName(role, user) {
  const r = role || user?.roleId;
  if (!r) return isEducationWorkspace.value ? "Staff" : "User";
  if (typeof r === "object") {
    const val = r.name || r.code || "";
    const formatted = val.replace(/_/g, " ");
    return isEducationWorkspace.value
      ? formatted.replace(/agent/gi, "Staff")
      : formatted;
  }
  const roleIdStr = String(r);
  const foundRole = (roles.value || []).find(
    (item) => String(item._id || item.id) === roleIdStr || item.code === roleIdStr
  );
  if (foundRole) {
    const val = foundRole.name || foundRole.code || "";
    const formatted = val.replace(/_/g, " ");
    return isEducationWorkspace.value
      ? formatted.replace(/agent/gi, "Staff")
      : formatted;
  }
  if (/^[0-9a-fA-F]{24}$/.test(roleIdStr)) {
    return isEducationWorkspace.value ? "Staff" : "Member";
  }
  const formatted = roleIdStr.replace(/_/g, " ");
  return isEducationWorkspace.value
    ? formatted.replace(/agent/gi, "Staff")
    : formatted;
}


async function confirmDeleteUser(user) {
  if (isSuperAdminSelf(user)) {
    store.dispatch("notifications/triggerToast", {
      message: "You cannot delete your own account.",
      type: "warning",
    });
    return;
  }
  if (!isOrgAdmin.value) {
    store.dispatch("notifications/triggerToast", {
      message: "Only Organization Administrators can delete users.",
      type: "error",
    });
    return;
  }

  const name = getUserDisplayName(user);
  const result = await Swal.fire({
    title: "Delete User Account",
    text: `Are you sure you want to delete ${name}? This action will revoke their access immediately.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e11d48",
    confirmButtonText: "Yes, Delete User",
    cancelButtonText: "Cancel",
  });

  if (!result.isConfirmed) return;

  const userId = getUserId(user);
  try {
    await deleteUserMutation(userId);
    store.dispatch("notifications/triggerToast", {
      message: `User ${name} has been deleted successfully.`,
      type: "success",
    });
  } catch (err) {
    store.dispatch("notifications/triggerToast", {
      message: err.response?.data?.message || "Failed to delete user account.",
      type: "error",
    });
  }
}

function refetchData() {
  queryClient.invalidateQueries({ queryKey: ["settings", "users"] });
  queryClient.invalidateQueries({ queryKey: ["settings", "audit"] });
}
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
