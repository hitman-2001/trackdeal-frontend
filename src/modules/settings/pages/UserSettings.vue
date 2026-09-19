<template>
  <div class="space-y-6 text-xs">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1
          class="font-heading text-xl font-extrabold text-slate-800 dark:text-slate-100"
        >
          {{
            isEducationWorkspace
              ? "Staff Management & Access Logs"
              : "User Management & Audit Trails"
          }}
        </h1>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">
          {{
            isEducationWorkspace
              ? "Onboard counselors and staff, manage account access, assign campus branches, and review audit logs."
              : "Onboard team members, manage account suspensions, transfer regional branches, and review activity audit logs."
          }}
        </p>
      </div>
      <button @click="openInviteDrawer" class="btn-md btn-primary gap-1.5">
        <PhPlus :size="14" />
        <span>{{
          isEducationWorkspace ? "Onboard Staff" : "Onboard User"
        }}</span>
      </button>
    </div>

    <!-- Inner Tabs -->
    <div
      class="flex border-b border-default overflow-x-auto space-x-4 pb-0.5 scrollbar-none"
    >
      <button
        @click="activeTab = 'directory'"
        class="py-2.5 px-1.5 border-b-2 font-bold text-xs transition-colors shrink-0"
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
        class="py-2.5 px-1.5 border-b-2 font-bold text-xs transition-colors shrink-0"
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
        class="py-2.5 px-1.5 border-b-2 font-bold text-xs transition-colors shrink-0"
        :class="
          activeTab === 'audit'
            ? 'border-primary text-primary'
            : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
        "
      >
        Immutable Audit Logs
      </button>
    </div>

    <!-- Tab Contents -->
    <div class="space-y-6">
      <!-- 1. User Directory Tab -->
      <div
        v-if="activeTab === 'directory'"
        class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-4"
      >
        <!-- Users Table -->
        <div class="overflow-x-auto border border-default rounded-lg">
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
              <tr
                v-for="user in users"
                :key="user._id || user.id"
                class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td class="p-3 font-bold text-slate-850 dark:text-slate-200">
                  {{ user.name || user.fullName }}
                </td>
                <td class="p-3 text-slate-600 dark:text-slate-400 font-mono">
                  {{ user.email }}
                </td>
                <td
                  class="p-3 text-slate-750 dark:text-slate-300 capitalize font-semibold"
                >
                  <span
                    class="px-2 py-0.5 rounded text-[10px] border"
                    :class="getRoleBadgeClass(getRoleCode(user.role))"
                  >
                    {{ getRoleDisplayName(user.role) }}
                  </span>
                </td>
                <td
                  v-if="isEnterprise"
                  class="p-3 font-semibold text-slate-600 dark:text-slate-400"
                >
                  {{ user.branch || user.branchId?.name || "" }}
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
                            ? `Deactivate ${user.name || user.fullName || 'user'}`
                            : `Activate ${user.name || user.fullName || 'user'}`
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
                    <div class="space-x-1 flex items-center justify-center">
                      <button
                        v-if="isEnterprise"
                        @click="triggerTransfer(user)"
                        class="btn btn-sm btn-ghost text-primary text-[10px] h-6 px-1.5 gap-1 font-bold"
                        :disabled="user.status !== 'active'"
                        :class="
                          user.status !== 'active'
                            ? 'opacity-40 cursor-not-allowed'
                            : ''
                        "
                      >
                        <PhMapPin :size="10" />
                        <span>Transfer Office</span>
                      </button>
                      <button
                        @click="triggerRoleSwap(user)"
                        class="btn btn-sm btn-ghost text-slate-600 dark:text-slate-400 text-[10px] h-6 px-1.5 gap-1 font-bold"
                        :disabled="user.status !== 'active'"
                        :class="
                          user.status !== 'active'
                            ? 'opacity-40 cursor-not-allowed'
                            : ''
                        "
                      >
                        <PhKey :size="10" />
                        <span>Adjust Role</span>
                      </button>
                    </div>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
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
import { PhPlus, PhMapPin, PhKey } from "@phosphor-icons/vue";
import Swal from "sweetalert2";
import {
  useUsersQuery,
  useRolesQuery,
  useBranchesQuery,
  useAuditLogsQuery,
  useUpdateUserStatusMutation,
} from "../queries";
import UserInviteDrawer from "../components/UserInviteDrawer.vue";
import BranchTransferDrawer from "../components/BranchTransferDrawer.vue";
import RoleChangeDrawer from "../components/RoleChangeDrawer.vue";
import AuditTimeline from "../components/AuditTimeline.vue";
import UserPermissionsTab from "../components/UserPermissionsTab.vue";

const store = useStore();
const queryClient = useQueryClient();

const activeTab = ref("directory");
const isEnterprise = computed(
  () => store.getters["organization/isEnterpriseAgency"],
);
const isEducationWorkspace = computed(
  () => store.getters["organization/isEducationTenant"],
);
const isOrgAdmin = computed(
  () => store.getters["auth/userRole"] === "org_admin",
);

// TanStack queries
const { data: users } = useUsersQuery();
const { data: roles } = useRolesQuery();
const { data: branches } = useBranchesQuery();
const { data: auditLogs } = useAuditLogsQuery();
const { mutateAsync: updateUserStatus } = useUpdateUserStatusMutation();

// Drawer visibility states
const inviteDrawerOpen = ref(false);
const transferDrawerOpen = ref(false);
const roleDrawerOpen = ref(false);
const activeUser = ref(null);
const updatingUserIds = ref(new Set());

function openInviteDrawer() {
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

function getRoleCode(role) {
  if (!role) return "";
  if (typeof role === "object") {
    return role.code || "";
  }
  return String(role);
}

function getRoleDisplayName(role) {
  if (!role) return "";
  const val =
    typeof role === "object" ? role.name || role.code || "" : String(role);
  const formatted = val.replace(/_/g, " ");
  return isEducationWorkspace.value
    ? formatted.replace(/agent/gi, "Staff")
    : formatted;
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
