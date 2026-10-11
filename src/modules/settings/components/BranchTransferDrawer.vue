<template>
  <AppDrawer
    :isOpen="isOpen"
    :title="`Transfer Branch: ${userDisplayName}`"
    width="480px"
    @close="$emit('close')"
  >
    <div v-if="user" class="space-y-6 text-xs">
      <!-- Current Status -->
      <div class="bg-slate-50 p-4 border border-default rounded-xl space-y-1">
        <div class="text-[10px] text-slate-400 font-bold uppercase">Current Assignment</div>
        <div class="text-xs font-bold text-slate-700">Staff: <span class="text-slate-900 font-extrabold">{{ userDisplayName }}</span></div>
        <div class="text-xs font-semibold text-slate-650">Branch: <span class="text-primary font-extrabold">{{ userBranchName || 'None' }}</span></div>
        <div class="text-xs font-semibold text-slate-605">Current Role: <span class="capitalize">{{ userRoleDisplayName.replace('_', ' ') }}</span></div>
      </div>

      <!-- Target Branch Selector -->
      <div class="space-y-1">
        <label class="block text-[10px] font-bold text-slate-500 uppercase">Target Branch *</label>
        <select
          v-model="targetBranchId"
          class="w-full bg-surface border border-default rounded-lg px-3 py-2 text-xs outline-none focus:border-primary text-slate-800 font-semibold"
        >
          <option value="" disabled>Select Target Branch</option>
          <option
            v-for="b in filteredBranches"
            :key="b.id"
            :value="b.id"
          >
            {{ b.name }} ({{ b.code }})
          </option>
        </select>
        <span v-if="errors.targetBranch" class="text-[9px] text-red-500 block mt-1 font-semibold">{{ errors.targetBranch }}</span>
      </div>

      <!-- Reassignment Rules -->
      <div class="space-y-3">
        <label class="block text-[10px] font-bold text-slate-500 uppercase">Leads Reassignment Rule *</label>
        <div class="space-y-2 bg-slate-50 p-3 rounded-lg border border-default">
          <label class="flex items-start cursor-pointer">
            <input
              type="radio"
              v-model="leadsReassignment"
              value="reassign"
              class="mt-0.5 text-primary focus:ring-primary border-default"
            />
            <span class="ml-2 font-semibold text-slate-700">Reassign all active leads to target branch agents/pool</span>
          </label>
          <label class="flex items-start cursor-pointer">
            <input
              type="radio"
              v-model="leadsReassignment"
              value="retain"
              class="mt-0.5 text-primary focus:ring-primary border-default"
            />
            <span class="ml-2 font-semibold text-slate-600">Retain leads assignment (allow cross-branch visibility permissions)</span>
          </label>
        </div>
      </div>

      <!-- Action Confirmation message -->
      <div class="text-[10px] text-amber-600 bg-amber-50 border border-amber-200/50 p-3 rounded-lg font-semibold leading-relaxed flex items-start gap-1.5">
        <PhWarning :size="14" class="shrink-0 text-amber-500 mt-0.5" />
        <div>
          <strong>Note:</strong> Transferring a user changes their data partitioning scopes. Any active deals they are coordinating will remain owned by them but will reflect in the new branch analytics pipeline reports MTD.
        </div>
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
        @click="onTransfer"
        :disabled="isPending || !targetBranchId"
        class="btn-md btn-primary"
      >
        <span v-if="isPending">Transferring...</span>
        <span v-else>Confirm Transfer</span>
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { PhWarning } from '@phosphor-icons/vue';
import { useTransferUserBranchMutation } from '../queries';
import AppDrawer from '@/components/AppDrawer.vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  user: { type: Object, default: null },
  branches: { type: Array, required: true }
});

const emit = defineEmits(['close', 'success']);
const store = useStore();

const targetBranchId = ref('');
const leadsReassignment = ref('reassign');
const errors = ref({ targetBranch: '' });

const isEducationWorkspace = computed(
  () => store.getters['organization/isEducationTenant']
);

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

const userBranchName = computed(() => {
  if (!props.user) return '';
  return props.user.branch || props.user.branchId?.name || '';
});

// Filter out user's current branch to prevent transfer to the same branch
const filteredBranches = computed(() => {
  if (!props.user) return props.branches;
  return props.branches.filter(b => b.name !== userBranchName.value);
});

watch(() => props.isOpen, (open) => {
  if (open) {
    targetBranchId.value = '';
    leadsReassignment.value = 'reassign';
    errors.value.targetBranch = '';
  }
});

const { mutateAsync: transferBranch, isPending } = useTransferUserBranchMutation();

async function onTransfer() {
  if (!targetBranchId.value) {
    errors.value.targetBranch = 'Target branch is required';
    return;
  }

  const selectedBranch = props.branches.find(b => b.id === targetBranchId.value);
  if (!selectedBranch) return;

  const userId = props.user._id || props.user.id;

  try {
    await transferBranch({
      id: userId,
      branchId: targetBranchId.value,
      leadsReassignment: leadsReassignment.value
    });
    store.dispatch('notifications/triggerToast', {
      message: `Successfully transferred ${userDisplayName.value} to ${selectedBranch.name}.`,
      type: 'success'
    });
    emit('success');
    emit('close');
  } catch (error) {
    store.dispatch('notifications/triggerToast', {
      message: error.response?.data?.message || 'Failed to complete user branch transfer.',
      type: 'error'
    });
  }
}
</script>
