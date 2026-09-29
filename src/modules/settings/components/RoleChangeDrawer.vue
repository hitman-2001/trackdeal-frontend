<template>
  <AppDrawer
    :isOpen="isOpen"
    :title="`Modify User Access Role: ${user?.name || ''}`"
    width="480px"
    @close="$emit('close')"
  >
    <div v-if="user" class="space-y-6 text-xs">
      <!-- Current Status -->
      <div class="bg-slate-50 p-4 border border-default rounded-xl space-y-1">
        <div class="text-[10px] text-slate-400 font-bold uppercase">Current Assignment</div>
        <div class="text-xs font-bold text-slate-700">Name: <span class="text-slate-900 font-extrabold">{{ user.name }}</span></div>
        <div class="text-xs font-semibold text-slate-650">Current Role: <span class="text-primary font-bold capitalize">{{ userRoleDisplayName.replace('_', ' ') }}</span></div>
        <div class="text-[10px] text-slate-500">Branch: {{ user.branch || user.branchId?.name || '' }}</div>
      </div>

      <!-- Role Selector -->
      <div class="space-y-1">
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
      <div v-if="showWarning" class="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl space-y-2 flex flex-col">
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

      <div v-if="targetRole && targetRole === userRoleCode" class="text-slate-450 italic text-[10px]">
        Selected role matches user's current role assignment.
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
        @click="onUpdateRole"
        :disabled="isPending || !targetRole || targetRole === userRoleCode"
        class="btn-md btn-primary"
      >
        <span v-if="isPending">Updating Role...</span>
        <span v-else>Confirm Role Swap</span>
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { PhWarning } from '@phosphor-icons/vue';
import { useChangeUserRoleMutation } from '../queries';
import AppDrawer from '@/components/AppDrawer.vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  user: { type: Object, default: null },
  roles: { type: Array, required: true }
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const targetRole = ref('');

const userRoleCode = computed(() => {
  if (!props.user?.role) return '';
  if (typeof props.user.role === 'object') {
    return props.user.role.id || props.user.role._id || props.user.role.code || '';
  }
  return String(props.user.role);
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
  if (!props.user?.role) return '';
  let val = '';
  if (typeof props.user.role === 'object') {
    val = props.user.role.name || props.user.role.code || '';
  } else {
    val = String(props.user.role);
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
  }
});

const { mutateAsync: changeRole, isPending } = useChangeUserRoleMutation();

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

  try {
    await changeRole({
      id: props.user.id,
      role: targetRole.value
    });
    store.dispatch('notifications/triggerToast', {
      message: `Access role for ${props.user.name} successfully updated to ${roleName}.`,
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
</script>
