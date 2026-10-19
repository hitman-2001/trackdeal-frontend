<template>
  <AppModal
    :isOpen="isOpen"
    :title="modalTitle"
    maxSize="500px"
    @cancel="$emit('close')"
    @confirm="handleConfirm"
  >
    <div class="space-y-4 text-xs">
      <!-- Bulk Mode Tabs (Single Staff Assignment vs Batch Round-Robin) -->
      <div v-if="isBulk" class="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 gap-1 shadow-inner">
        <button
          type="button"
          @click="assignMode = 'single'"
          class="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
          :class="assignMode === 'single'
            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700 ring-1 ring-black/5 dark:ring-white/5'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800 border border-transparent'"
        >
          <PhUser :size="15" weight="bold" class="shrink-0" :class="assignMode === 'single' ? 'text-primary' : 'text-slate-400'" />
          <span>Single Staff Assignment</span>
        </button>
        <button
          type="button"
          @click="assignMode = 'round_robin'"
          class="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
          :class="assignMode === 'round_robin'
            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700 ring-1 ring-black/5 dark:ring-white/5'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800 border border-transparent'"
        >
          <PhArrowsClockwise :size="15" weight="bold" class="shrink-0" :class="assignMode === 'round_robin' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'" />
          <span>Batch Round-Robin</span>
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
        <!-- Customizable Batch Size Setting -->
        <div class="p-3 bg-slate-50 dark:bg-slate-850 border border-default rounded-xl space-y-2.5">
          <div class="flex items-center justify-between gap-3">
            <div>
              <label class="modal-form-label mb-0 flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                <span>Batch Size per Staff</span>
                <span class="text-rose-500">*</span>
              </label>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                Number of leads allocated to each staff member per cycle.
              </p>
            </div>
            <!-- Quick Stepper Input -->
            <div class="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shrink-0 shadow-2xs">
              <button
                type="button"
                @click="decrementBatchSize"
                class="px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Decrease batch size"
              >
                <PhMinus :size="12" weight="bold" />
              </button>
              <input
                v-model.number="batchSize"
                type="number"
                min="1"
                :max="Math.max(500, leadIds.length)"
                class="w-12 text-center text-xs font-bold text-slate-800 dark:text-slate-100 bg-transparent border-x border-slate-200 dark:border-slate-700 py-1 focus:outline-none"
              />
              <button
                type="button"
                @click="incrementBatchSize"
                class="px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Increase batch size"
              >
                <PhPlus :size="12" weight="bold" />
              </button>
            </div>
          </div>

          <!-- Quick Preset Pills -->
          <div class="flex items-center gap-1.5 pt-0.5 overflow-x-auto scrollbar-none">
            <span class="text-[10px] text-slate-400 font-semibold mr-1">Presets:</span>
            <button
              v-for="size in [5, 10, 15, 20, 25, 50]"
              :key="size"
              type="button"
              @click="batchSize = size"
              class="px-2.5 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer"
              :class="validBatchSize === size
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 border-default text-slate-600 dark:text-slate-300 hover:border-slate-400'"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <div
          class="bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl p-3 text-indigo-900 dark:text-indigo-200 space-y-1"
        >
          <div class="font-bold text-[11px] flex items-center justify-between">
            <span>Round-Robin Rule (Batches of {{ validBatchSize }})</span>
            <span class="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold">
              {{ totalBatchesCount }} {{ totalBatchesCount === 1 ? 'batch' : 'batches' }}
            </span>
          </div>
          <p class="text-[10px] leading-relaxed text-indigo-800 dark:text-indigo-300">
            Leads are assigned in batches of {{ validBatchSize }} cyclically across selected staff members. Out of {{ leadIds.length }} {{ entityLabel }}s, the first {{ Math.min(validBatchSize, leadIds.length) }} go to Staff 1, the next {{ Math.min(validBatchSize, Math.max(0, leadIds.length - validBatchSize)) }} to Staff 2, and the cycle continues.
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
                class="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                Select all
              </button>
              <span class="text-slate-300">|</span>
              <button
                type="button"
                @click="selectedStaffIds = []"
                class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline cursor-pointer"
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
            <span>{{ leadIds.length }} leads &bull; {{ totalBatchesCount }} batches ({{ validBatchSize }}/batch)</span>
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
import { PhUser, PhArrowsClockwise, PhPlus, PhMinus } from '@phosphor-icons/vue';
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
const batchSize = ref(10);
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

const validBatchSize = computed(() => {
  const val = parseInt(batchSize.value, 10);
  return isNaN(val) || val < 1 ? 1 : val;
});

const totalBatchesCount = computed(() => {
  if (!props.leadIds.length) return 0;
  return Math.ceil(props.leadIds.length / validBatchSize.value);
});

function incrementBatchSize() {
  batchSize.value = (validBatchSize.value || 1) + 1;
}

function decrementBatchSize() {
  if (validBatchSize.value > 1) {
    batchSize.value = validBatchSize.value - 1;
  }
}

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
  const bSize = validBatchSize.value;
  const staffCount = selectedStaffIds.value.length;
  const counts = {};
  const batchIndices = {};

  selectedStaffIds.value.forEach((sid) => {
    counts[sid] = 0;
    batchIndices[sid] = [];
  });

  for (let i = 0; i < props.leadIds.length; i++) {
    const batchIdx = Math.floor(i / bSize);
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
      batchSize.value = 10;
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
  () => [assignMode.value, validBatchSize.value],
  ([newMode, currentSize]) => {
    if (newMode === 'round_robin') {
      if (!reason.value || reason.value.startsWith('Round-Robin batch allocation')) {
        reason.value = `Round-Robin batch allocation (Batches of ${currentSize})`;
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
        batchSize: validBatchSize.value,
        reason: reason.value,
      });

      store.dispatch('notifications/triggerToast', {
        message: `Successfully distributed ${props.leadIds.length} leads in batches of ${validBatchSize.value} across staff.`,
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
