<template>
  <AppModal
    :isOpen="isOpen"
    :title="modalTitle"
    maxSize="500px"
    @cancel="$emit('close')"
    @confirm="handleConfirm"
  >
    <div class="space-y-4 text-xs">
      <!-- Bulk Mode Selector (Single vs Batch Round-Robin) -->
      <div v-if="isBulk" class="flex p-1 bg-slate-150 dark:bg-slate-800 rounded-xl gap-1">
        <button
          type="button"
          @click="assignMode = 'single'"
          class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center"
          :class="assignMode === 'single'
            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
        >
          Single Staff Assignment
        </button>
        <button
          type="button"
          @click="assignMode = 'round_robin'"
          class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center"
          :class="assignMode === 'round_robin'
            ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
        >
          Batch Round-Robin (10 per batch)
        </button>
      </div>

      <!-- Mode 1: Single Staff Assignment -->
      <div v-if="!isBulk || assignMode === 'single'" class="space-y-4">
        <div
          class="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-3 text-indigo-800 dark:text-indigo-400"
        >
          <p class="text-[10px] leading-relaxed">
            <span v-if="isBulk">
              You are bulk reassigning <b>{{ leadIds.length }} {{ entityLabel }}s</b> to a single staff member.
            </span>
            <span v-else>
              You are reassigning this {{ entityLabel }}'s primary {{ ownerLabel }}.
            </span>
            {{ staffMode
              ? 'The selected staff member will own follow-ups and admissions tasks for this inquiry.'
              : 'This updates dashboard assignments and sends notification alerts.' }}
          </p>
        </div>

        <div class="modal-form-group">
          <label class="modal-form-label">
            {{ selectLabel }} <span class="required-star">*</span>
          </label>
          <select
            v-model="assignedTo"
            class="modal-form-select"
            :class="errors.assignedTo ? '!border-red-500' : ''"
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
            No team members found. Invite staff from Settings &rarr; Team.
          </span>
        </div>
      </div>

      <!-- Mode 2: Batch Round-Robin Assignment -->
      <div v-else class="space-y-3.5">
        <div
          class="bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl p-3.5 text-indigo-900 dark:text-indigo-200 space-y-1.5"
        >
          <div class="font-bold text-[11px] flex items-center justify-between">
            <span>Round-Robin Rule (Batches of 10)</span>
            <span class="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px]">Fixed 10/batch</span>
          </div>
          <p class="text-[10px] leading-relaxed text-indigo-800 dark:text-indigo-300">
            Leads are assigned in fixed batches of 10 cyclically across selected staff members. For example, out of {{ leadIds.length }} leads, the first 10 are assigned to Staff 1, the next 10 to Staff 2, and the cycle repeats.
          </p>
        </div>

        <!-- Staff Multi-Selection -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="modal-form-label mb-0">
              Select Staff Members ({{ selectedStaffIds.length }} of {{ staffMembers.length }} selected) <span class="required-star">*</span>
            </label>
            <div class="flex items-center gap-2 text-[10px]">
              <button
                type="button"
                @click="selectAllStaff"
                class="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Select all
              </button>
              <span class="text-slate-300">|</span>
              <button
                type="button"
                @click="selectedStaffIds = []"
                class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div class="max-h-40 overflow-y-auto border border-default rounded-xl p-2 space-y-1 bg-surface">
            <label
              v-for="member in staffMembers"
              :key="member._id || member.id"
              class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors"
              :class="selectedStaffIds.includes(member._id || member.id)
                ? 'bg-indigo-50/60 dark:bg-indigo-950/30'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'"
            >
              <div class="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  :value="member._id || member.id"
                  v-model="selectedStaffIds"
                  class="rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span class="font-medium text-slate-800 dark:text-slate-100">
                  {{ member.firstName }} {{ member.lastName || '' }}
                </span>
              </div>
              <span class="text-[10px] text-slate-400">
                {{ formatRoleLabel(member) }}
              </span>
            </label>
          </div>
          <span v-if="errors.selectedStaff" class="text-[9px] text-red-500 block">
            {{ errors.selectedStaff }}
          </span>
        </div>

        <!-- Live Distribution Preview Card -->
        <div v-if="selectedStaffIds.length > 0" class="p-3 bg-slate-50 dark:bg-slate-850 border border-default rounded-xl space-y-2">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-200">
            <span>Distribution Breakdown</span>
            <span>{{ leadIds.length }} leads &bull; {{ Math.ceil(leadIds.length / 10) }} batches</span>
          </div>
          <div class="space-y-1.5 pt-1">
            <div
              v-for="calc in distributionPreview"
              :key="calc.id"
              class="flex items-center justify-between text-[11px] bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700/60"
            >
              <span class="font-semibold text-slate-800 dark:text-slate-200">{{ calc.name }}</span>
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-slate-400">{{ calc.batches }}</span>
                <span class="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full text-[10px]">
                  {{ calc.count }} leads
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Common: Reason Input -->
      <div class="modal-form-group">
        <label class="modal-form-label">
          Assignment reason <span class="required-star">*</span>
        </label>
        <input
          v-model="reason"
          type="text"
          :placeholder="staffMode
            ? (assignMode === 'round_robin' ? 'Round-Robin batch allocation' : 'e.g. Counselling handoff, batch allocation...')
            : (assignMode === 'round_robin' ? 'Round-Robin batch distribution' : 'e.g. Allocation re-balancing, lead rotation...')"
          class="modal-form-input"
          :class="errors.reason ? '!border-red-500' : ''"
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
        <span v-if="isPending">Processing...</span>
        <span v-else-if="assignMode === 'round_robin'">Distribute Batches</span>
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
import {
  useAssignLeadMutation,
  useBulkAssignLeadsMutation,
  useDistributeLeadsBatchRoundRobinMutation,
} from '../queries';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  leadIds: { type: Array, default: () => [] },
  /** Education vertical: staff wording and institute-focused copy */
  staffMode: { type: Boolean, default: false },
  /** Initial mode: 'single' | 'round_robin' */
  initialMode: { type: String, default: 'single' },
});

const emit = defineEmits(['close', 'success']);

const store = useStore();
const assignMode = ref('single');
const assignedTo = ref('');
const selectedStaffIds = ref([]);
const reason = ref('');
const staffMembers = ref([]);
const loadingStaff = ref(false);
const errors = reactive({
  assignedTo: '',
  selectedStaff: '',
  reason: '',
});

const isBulk = computed(() => props.leadIds.length > 1);
const entityLabel = computed(() => (props.staffMode ? 'student lead' : 'lead'));
const ownerLabel = computed(() => (props.staffMode ? 'staff owner' : 'owner agent'));
const modalTitle = computed(() => {
  if (assignMode.value === 'round_robin') {
    return 'Round-Robin Lead Distribution';
  }
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
const { mutateAsync: distributeRoundRobin, isPending: distributePending } = useDistributeLeadsBatchRoundRobinMutation();

const isPending = computed(() => assignPending.value || bulkPending.value || distributePending.value);

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

function selectAllStaff() {
  selectedStaffIds.value = staffMembers.value.map((m) => m._id || m.id);
}

// Live calculation of Round-Robin batch distribution
const distributionPreview = computed(() => {
  if (!selectedStaffIds.value.length || !props.leadIds.length) return [];
  const batchSize = 10;
  const staffCount = selectedStaffIds.value.length;
  const counts = {};
  const batchIndices = {};

  selectedStaffIds.value.forEach((sid) => {
    counts[sid] = 0;
    batchIndices[sid] = [];
  });

  for (let i = 0; i < props.leadIds.length; i++) {
    const batchIdx = Math.floor(i / batchSize);
    const staffIdx = batchIdx % staffCount;
    const staffId = selectedStaffIds.value[staffIdx];
    counts[staffId] = (counts[staffId] || 0) + 1;
    if (!batchIndices[staffId].includes(batchIdx + 1)) {
      batchIndices[staffId].push(batchIdx + 1);
    }
  }

  return selectedStaffIds.value
    .map((sid) => {
      const member = staffMembers.value.find((m) => (m._id || m.id) === sid);
      const name = member ? [member.firstName, member.lastName].filter(Boolean).join(' ').trim() || member.email : sid;
      const c = counts[sid] || 0;
      const bList = batchIndices[sid] || [];
      const batchStr = bList.length > 0 ? `Batch ${bList.join(', ')}` : '0 batches';
      return {
        id: sid,
        name,
        count: c,
        batches: batchStr,
      };
    })
    .filter((item) => item.count > 0);
});

async function loadStaffMembers() {
  loadingStaff.value = true;
  const hasUsersPerm =
    store.getters['permissions/hasCapability']('users:read') ||
    store.getters['permissions/hasCapability']('users.read');

  if (!hasUsersPerm) {
    staffMembers.value = currentUser.value?.id ? [currentUser.value] : [];
    selectedStaffIds.value = staffMembers.value.map((m) => m._id || m.id);
    loadingStaff.value = false;
    return;
  }

  try {
    const response = await apiClient.get('/users', { params: { limit: 200, status: 'active' } });
    staffMembers.value = response.data?.data || [];
    selectedStaffIds.value = staffMembers.value.map((m) => m._id || m.id);
  } catch (error) {
    console.error('Failed to load team members:', error);
    staffMembers.value = currentUser.value?.id ? [currentUser.value] : [];
    selectedStaffIds.value = staffMembers.value.map((m) => m._id || m.id);
  } finally {
    loadingStaff.value = false;
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      assignMode.value = props.initialMode === 'round_robin' && props.leadIds.length > 1 ? 'round_robin' : 'single';
      assignedTo.value = '';
      reason.value = assignMode.value === 'round_robin' ? 'Round-Robin batch allocation (Batches of 10)' : '';
      errors.assignedTo = '';
      errors.selectedStaff = '';
      errors.reason = '';
      loadStaffMembers();
    }
  },
);

watch(
  assignMode,
  (newMode) => {
    if (newMode === 'round_robin') {
      if (!reason.value || reason.value === 'Single staff handoff') {
        reason.value = 'Round-Robin batch allocation (Batches of 10)';
      }
    } else {
      if (reason.value.includes('Round-Robin')) {
        reason.value = '';
      }
    }
  },
);

const handleConfirm = async () => {
  errors.assignedTo = '';
  errors.selectedStaff = '';
  errors.reason = '';
  let valid = true;

  if (assignMode.value === 'round_robin') {
    if (selectedStaffIds.value.length === 0) {
      errors.selectedStaff = 'Please select at least one staff member for distribution.';
      valid = false;
    }
  } else {
    if (!assignedTo.value) {
      errors.assignedTo = props.staffMode
        ? 'Staff selection is required.'
        : 'Agent selection is required.';
      valid = false;
    }
  }

  if (!reason.value.trim()) {
    errors.reason = 'Assignment reason is required.';
    valid = false;
  }

  if (!valid) return;

  try {
    if (assignMode.value === 'round_robin') {
      await distributeRoundRobin({
        leadIds: props.leadIds,
        staffIds: selectedStaffIds.value,
        batchSize: 10,
        reason: reason.value,
      });

      store.dispatch('notifications/triggerToast', {
        message: `Successfully distributed ${props.leadIds.length} leads in fixed batches of 10 across staff.`,
        type: 'success',
      });
    } else if (isBulk.value) {
      await bulkAssign({
        leadIds: props.leadIds,
        assignedTo: assignedTo.value,
        reason: reason.value,
      });

      store.dispatch('notifications/triggerToast', {
        message: props.staffMode
          ? 'Staff assignment updated successfully.'
          : 'Owner agent reassigned successfully.',
        type: 'success',
      });
    } else {
      await assignOwner({
        id: props.leadIds[0],
        assignedTo: assignedTo.value,
        reason: reason.value,
      });

      store.dispatch('notifications/triggerToast', {
        message: props.staffMode
          ? 'Staff assignment updated successfully.'
          : 'Owner agent reassigned successfully.',
        type: 'success',
      });
    }

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
