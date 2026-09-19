<template>
  <AppModal
    :isOpen="isOpen"
    :title="modalTitle"
    maxSize="440px"
    @cancel="$emit('close')"
    @confirm="handleConfirm"
  >
    <div class="space-y-4 text-xs">
      <div
        class="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-3 text-indigo-800 dark:text-indigo-400"
      >
        <p class="text-[10px] leading-relaxed">
          <span v-if="isBulk">
            You are bulk reassigning <b>{{ leadIds.length }} {{ entityLabel }}s</b>.
          </span>
          <span v-else>
            You are reassigning this {{ entityLabel }}'s primary {{ ownerLabel }}.
          </span>
          {{ staffMode
            ? 'The selected staff member will own follow-ups and admissions tasks for this inquiry.'
            : 'This updates dashboard assignments and sends notification alerts.' }}
        </p>
      </div>

      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">
          {{ selectLabel }} *
        </label>
        <select
          v-model="assignedTo"
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.assignedTo ? 'border-red-500' : 'border-default'"
          :disabled="loadingStaff"
        >
          <option value="">{{ placeholderOption }}</option>
          <option
            v-for="member in staffMembers"
            :key="member._id || member.id"
            :value="member._id || member.id"
          >
            {{ formatMemberLabel(member) }}
          </option>
        </select>
        <span v-if="errors.assignedTo" class="text-[9px] text-red-500 mt-1 block">
          {{ errors.assignedTo }}
        </span>
        <span
          v-else-if="!loadingStaff && staffMembers.length === 0"
          class="text-[9px] text-amber-600 mt-1 block"
        >
          No team members found. Invite staff from Settings → Team.
        </span>
      </div>

      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">
          Assignment reason *
        </label>
        <input
          v-model="reason"
          type="text"
          :placeholder="staffMode
            ? 'e.g. Counselling handoff, batch allocation...'
            : 'e.g. Allocation re-balancing, lead rotation...'"
          class="w-full bg-surface border rounded-lg px-3 py-1.5 outline-none focus:border-primary"
          :class="errors.reason ? 'border-red-500' : 'border-default'"
        />
        <span v-if="errors.reason" class="text-[9px] text-red-500 mt-1 block">
          {{ errors.reason }}
        </span>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        class="px-3.5 py-2 border border-default text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
        @click="$emit('close')"
      >
        Cancel
      </button>
      <button
        type="button"
        :disabled="isPending || loadingStaff"
        class="px-3.5 py-2 text-xs font-semibold text-white bg-primary rounded-lg disabled:bg-slate-350 transition-colors flex items-center justify-center min-w-[90px]"
        @click="handleConfirm"
      >
        <span v-if="isPending">Assigning...</span>
        <span v-else>Confirm assignment</span>
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue';
import { useStore } from 'vuex';
import apiClient from '@/api/client';
import AppModal from '@/components/AppModal.vue';
import { useAssignLeadMutation, useBulkAssignLeadsMutation } from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  leadIds: { type: Array, default: () => [] },
  /** Education vertical: staff wording and institute-focused copy */
  staffMode: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'success']);

const store = useStore();
const assignedTo = ref('');
const reason = ref('');
const staffMembers = ref([]);
const loadingStaff = ref(false);
const errors = reactive({
  assignedTo: '',
  reason: '',
});

const isBulk = computed(() => props.leadIds.length > 1);
const entityLabel = computed(() => (props.staffMode ? 'student lead' : 'lead'));
const ownerLabel = computed(() => (props.staffMode ? 'staff owner' : 'owner agent'));
const modalTitle = computed(() => {
  if (props.staffMode) {
    return isBulk.value ? 'Bulk assign staff' : 'Assign staff';
  }
  return isBulk.value ? 'Bulk assign owner agent' : 'Assign owner agent';
});
const selectLabel = computed(() =>
  props.staffMode ? 'Select staff member' : 'Select new owner agent',
);
const placeholderOption = computed(() =>
  props.staffMode ? 'Select staff member' : 'Select agent',
);

const currentUser = computed(() => store.state.auth.user || {});

const { mutateAsync: assignOwner, isPending: assignPending } = useAssignLeadMutation();
const { mutateAsync: bulkAssign, isPending: bulkPending } = useBulkAssignLeadsMutation();

const isPending = computed(() => assignPending.value || bulkPending.value);

function formatRoleLabel(member) {
  const role = member.roleId || member.role;
  const raw = role?.name || role?.code || member.roleName || '';
  if (!raw) return props.staffMode ? 'Staff' : 'Agent';
  const normalized = String(raw).replace(/_/g, ' ');
  if (props.staffMode && /^agent$/i.test(normalized.trim())) return 'Staff';
  return normalized.replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatMemberLabel(member) {
  const name = [member.firstName, member.lastName].filter(Boolean).join(' ').trim() || member.email || 'Team member';
  return `${name} (${formatRoleLabel(member)})`;
}

async function loadStaffMembers() {
  loadingStaff.value = true;
  const hasUsersPerm =
    store.getters['permissions/hasCapability']('users:read') ||
    store.getters['permissions/hasCapability']('users.read');

  if (!hasUsersPerm) {
    staffMembers.value = currentUser.value?.id ? [currentUser.value] : [];
    loadingStaff.value = false;
    return;
  }

  try {
    const response = await apiClient.get('/users', { params: { limit: 200, status: 'active' } });
    staffMembers.value = response.data?.data || [];
  } catch (error) {
    console.error('Failed to load team members:', error);
    staffMembers.value = currentUser.value?.id ? [currentUser.value] : [];
  } finally {
    loadingStaff.value = false;
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      assignedTo.value = '';
      reason.value = '';
      errors.assignedTo = '';
      errors.reason = '';
      loadStaffMembers();
    }
  },
);

const handleConfirm = async () => {
  errors.assignedTo = '';
  errors.reason = '';
  let valid = true;

  if (!assignedTo.value) {
    errors.assignedTo = props.staffMode
      ? 'Staff selection is required.'
      : 'Agent selection is required.';
    valid = false;
  }
  if (!reason.value.trim()) {
    errors.reason = 'Assignment reason is required.';
    valid = false;
  }

  if (!valid) return;

  try {
    if (isBulk.value) {
      await bulkAssign({
        leadIds: props.leadIds,
        assignedTo: assignedTo.value,
        reason: reason.value,
      });
    } else {
      await assignOwner({
        id: props.leadIds[0],
        assignedTo: assignedTo.value,
        reason: reason.value,
      });
    }

    store.dispatch('notifications/triggerToast', {
      message: props.staffMode
        ? 'Staff assignment updated successfully.'
        : 'Owner agent reassigned successfully.',
      type: 'success',
    });

    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Assignment update failed.',
      type: 'error',
    });
  }
};
</script>
