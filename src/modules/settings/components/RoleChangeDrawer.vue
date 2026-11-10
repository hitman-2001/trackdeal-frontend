<template>
  <AppDrawer
    :isOpen="isOpen"
    :title="`Manage User: ${userDisplayName}`"
    width="480px"
    @close="$emit('close')"
  >
    <div v-if="user" class="space-y-6 text-xs">
      <!-- Current Status -->
      <div class="bg-slate-50 p-4 border border-default rounded-xl space-y-1">
        <div class="text-[10px] text-slate-400 font-bold uppercase">Current Assignment</div>
        <div class="text-xs font-bold text-slate-700">Name: <span class="text-slate-900 font-extrabold">{{ userDisplayName }}</span></div>
        <div class="text-xs font-semibold text-slate-650">Current Role: <span class="text-primary font-bold capitalize">{{ userRoleDisplayName.replace('_', ' ') }}</span></div>
        <div class="text-[10px] text-slate-500">Branch: {{ userBranchName || 'None' }}</div>
      </div>

      <div class="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1" role="tablist" aria-label="User settings">
        <button
          type="button"
          role="tab"
          :aria-selected="activeSection === 'role'"
          @click="activeSection = 'role'"
          class="h-9 rounded-lg font-bold transition-colors flex items-center justify-center gap-1.5"
          :class="activeSection === 'role' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'"
        >
          <PhUserGear :size="15" weight="bold" /> Access Role
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activeSection === 'password'"
          @click="activeSection = 'password'"
          class="h-9 rounded-lg font-bold transition-colors flex items-center justify-center gap-1.5"
          :class="activeSection === 'password' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'"
        >
          <PhKey :size="15" weight="bold" /> Password
        </button>
      </div>

      <!-- Role Selector -->
      <div v-if="activeSection === 'role'" class="space-y-1">
        <label class="block text-[10px] font-bold text-slate-500 uppercase">Target Role *</label>
        <select
          v-model="targetRole"
          class="w-full bg-surface border border-default rounded-lg px-3 py-2 text-xs outline-none focus:border-primary text-slate-800 font-semibold"
        >
          <option value="" disabled>Select Target Role</option>
          <option
            v-for="r in selectableRoles"
            :key="r.id"
            :value="r.id"
          >
            {{ roleDisplayName(r) }}
          </option>
        </select>
      </div>

      <!-- Visibility Drop / Warning Analysis -->
      <div v-if="activeSection === 'role' && showWarning" class="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl space-y-2 flex flex-col">
        <div class="flex items-center gap-1.5 text-xs font-bold">
          <PhWarning :size="14" class="text-amber-500" />
          <span>Access Level Reduction Warning</span>
        </div>
        <p class="text-[10px] leading-relaxed">
          Demoting this user from <strong class="capitalize">{{ userRoleDisplayName.replace('_', ' ') }}</strong> to <strong class="capitalize">{{ targetRole.replace('_', ' ') }}</strong> will reduce their operational visibility.
        </p>
        <ul class="list-disc list-inside text-[9px] space-y-1 font-semibold pl-1">
          <li v-for="loss in accessLosses" :key="loss">{{ loss }}</li>
        </ul>
      </div>

      <div v-if="activeSection === 'role' && targetRole && targetRole === userRoleCode" class="text-slate-450 italic text-[10px]">
        Selected role matches user's current role assignment.
      </div>

      <div v-if="activeSection === 'password'" class="space-y-4">
        <div class="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/70 dark:bg-blue-950/20 p-4 text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
          Updating the password will immediately sign this user out from all active sessions.
        </div>
        <div class="space-y-1.5">
          <label for="managed-user-password" class="block text-[10px] font-bold text-slate-500 uppercase">New password *</label>
          <input
            id="managed-user-password"
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
            maxlength="100"
            class="w-full bg-surface border border-default rounded-lg px-3 py-2.5 text-xs outline-none focus:border-primary text-slate-800"
            placeholder="At least 8 characters"
          />
        </div>
        <div class="space-y-1.5">
          <label for="managed-user-password-confirm" class="block text-[10px] font-bold text-slate-500 uppercase">Confirm password *</label>
          <input
            id="managed-user-password-confirm"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            maxlength="100"
            class="w-full bg-surface border border-default rounded-lg px-3 py-2.5 text-xs outline-none focus:border-primary text-slate-800"
            placeholder="Enter the password again"
            @keyup.enter="onUpdatePassword"
          />
        </div>
        <p v-if="passwordError" class="text-[10px] font-semibold text-rose-600 dark:text-rose-400">{{ passwordError }}</p>
      </div>
    </div>

    <template #footer>
      <button
        @click="$emit('close')"
        class="btn-md btn-secondary"
      >
        Cancel
      </button>
      <button
        v-if="activeSection === 'role'"
        @click="onUpdateRole"
        :disabled="isRolePending || !targetRole || targetRole === userRoleCode"
        class="btn-md btn-primary"
      >
        <span v-if="isRolePending">Updating Role...</span>
        <span v-else>Confirm Role Swap</span>
      </button>
      <button
        v-else
        @click="onUpdatePassword"
        :disabled="isPasswordPending || !newPassword || !confirmPassword"
        class="btn-md btn-primary"
      >
        <span v-if="isPasswordPending">Updating Password...</span>
        <span v-else>Update Password</span>
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { PhKey, PhUserGear, PhWarning } from '@phosphor-icons/vue';
import { useChangeUserRoleMutation, useUpdateUserPasswordMutation } from '../queries';
import AppDrawer from '@/components/AppDrawer.vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  user: { type: Object, default: null },
  roles: { type: Array, required: true }
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const targetRole = ref('');
const activeSection = ref('role');
const newPassword = ref('');
const confirmPassword = ref('');
const passwordError = ref('');

const userDisplayName = computed(() => {
  if (!props.user) return 'Staff';
  return (
    props.user.name ||
    props.user.fullName ||
    `${props.user.firstName || ''} ${props.user.lastName || ''}`.trim() ||
    props.user.email ||
    'Staff'
  );
});

const userBranchName = computed(() => {
  if (!props.user) return '';
  return props.user.branch || props.user.branchId?.name || '';
});

const userRoleCode = computed(() => {
  if (!props.user?.role && !props.user?.roleId) return '';
  const r = props.user.role || props.user.roleId;
  if (typeof r === 'object') {
    return r.id || r._id || r.code || '';
  }
  return String(r);
});

const isEducationWorkspace = computed(
  () => store.getters['organization/isEducationTenant']
);

const selectableRoles = computed(() => {
  const disallowedCodes = ['super_admin', 'system_admin', 'org_admin', 'organization_admin'];
  return (props.roles || []).filter((r) => {
    const code = String(r.code || r.id || '').toLowerCase().trim();
    const normalizedName = String(r.name || '').toLowerCase().trim().replace(/[\s-]+/g, '_');
    return !disallowedCodes.includes(code) && !disallowedCodes.includes(normalizedName);
  });
});

function roleDisplayName(roleOption) {
  const name = roleOption?.name || roleOption?.code || '';
  return isEducationWorkspace.value ? name.replace(/agent/gi, 'Staff') : name;
}

const userRoleDisplayName = computed(() => {
  const r = props.user?.role || props.user?.roleId;
  if (!r) return '';
  let val = '';
  if (typeof r === 'object') {
    val = r.name || r.code || '';
  } else {
    val = String(r);
  }
  const formatted = val.replace(/_/g, ' ');
  return isEducationWorkspace.value ? formatted.replace(/agent/gi, 'Staff') : formatted;
});

watch(() => props.isOpen, (open) => {
  if (open && props.user) {
    const currentCode = userRoleCode.value;
    const isCurrentSelectable = selectableRoles.value.some(
      r => r.id === currentCode || r.code === currentCode
    );
    targetRole.value = isCurrentSelectable ? currentCode : '';
    activeSection.value = 'role';
    newPassword.value = '';
    confirmPassword.value = '';
    passwordError.value = '';
  }
});

const { mutateAsync: changeRole, isPending: isRolePending } = useChangeUserRoleMutation();
const { mutateAsync: updatePassword, isPending: isPasswordPending } = useUpdateUserPasswordMutation();

const showWarning = computed(() => {
  if (!props.user || !targetRole.value) return false;
  // Simple check: super_admin to anything else, or branch_manager to sales_agent
  const from = userRoleCode.value;
  const to = targetRole.value;
  // Find role codes for comparison
  const fromRoleCode = props.roles.find(r => r.id === from)?.code || from;
  const toRoleCode = props.roles.find(r => r.id === to)?.code || to;

  if (fromRoleCode === 'super_admin' && toRoleCode !== 'super_admin') return true;
  if (fromRoleCode === 'branch_manager' && toRoleCode === 'sales_agent') return true;
  return false;
});

const accessLosses = computed(() => {
  const losses = [];
  if (!props.user) return losses;
  const from = userRoleCode.value;
  const to = targetRole.value;
  const fromRoleCode = props.roles.find(r => r.id === from)?.code || from;
  const toRoleCode = props.roles.find(r => r.id === to)?.code || to;

  if (fromRoleCode === 'super_admin') {
    losses.push('Loss of tenant-wide settings configuration permissions.');
    losses.push('Loss of feature flag control and integration settings modification.');
    losses.push('Loss of user directory modification capabilities (invites, transfers).');
  }
  if (fromRoleCode === 'branch_manager' && toRoleCode === 'sales_agent') {
    losses.push('Loss of branch approvals queue dashboard access.');
    losses.push('Loss of other sales agents leaderboard statistics viewing.');
  }
  if (toRoleCode === 'sales_agent') {
    losses.push('Restriction to own active leads and activities context only.');
  }
  return losses;
});

async function onUpdateRole() {
  if (!targetRole.value || targetRole.value === userRoleCode.value) return;

  const roleName = props.roles.find(r => r.id === targetRole.value)?.name || targetRole.value;
  const userId = props.user._id || props.user.id;

  try {
    await changeRole({
      id: userId,
      role: targetRole.value
    });
    store.dispatch('notifications/triggerToast', {
      message: `Access role for ${userDisplayName.value} successfully updated to ${roleName}.`,
      type: 'success'
    });
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to update user authorization role.',
      type: 'error'
    });
  }
}

async function onUpdatePassword() {
  passwordError.value = '';
  if (newPassword.value.length < 8) {
    passwordError.value = 'Password must contain at least 8 characters.';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'The passwords do not match.';
    return;
  }

  try {
    await updatePassword({
      id: props.user._id || props.user.id,
      newPassword: newPassword.value,
    });
    store.dispatch('notifications/triggerToast', {
      message: `Password updated for ${userDisplayName.value}. Their active sessions were revoked.`,
      type: 'success',
    });
    newPassword.value = '';
    confirmPassword.value = '';
    emit('success');
    emit('close');
  } catch (error) {
    passwordError.value = error.response?.data?.error?.message || error.response?.data?.message || 'Failed to update the user password.';
  }
}
</script>
