<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      @click.self="handleClose"
    >
      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-visible transform transition-all relative"
        @click="closeAllDropdowns"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50 shadow-xs">
              <svg class="w-5 h-5 animate-spin-once" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
              </svg>
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Select Status
              </h3>
              <p v-if="lead" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {{ lead.firstName }} {{ lead.lastName || '' }}
              </p>
            </div>
          </div>

          <!-- Close Button -->
          <button
            type="button"
            @click="handleClose"
            class="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xs"
            title="Close"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-5 space-y-4">
          <!-- Error banner if any -->
          <div
            v-if="errorMessage"
            class="p-3 text-xs bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-900"
          >
            {{ errorMessage }}
          </div>

          <!-- Top Row: Status dropdown & Sub-status button/dropdown -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
            <!-- 1. Status Dropdown -->
            <div class="relative" @click.stop>
              <button
                type="button"
                @click="toggleStatusMenu"
                class="w-full h-11 px-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-medium flex items-center justify-between gap-2 shadow-xs transition-colors"
                :class="{ 'ring-2 ring-blue-500/20 border-blue-500': isStatusOpen }"
              >
                <span class="truncate">{{ currentStatusLabel }}</span>
                <svg
                  class="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200"
                  :class="{ 'rotate-180': isStatusOpen }"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              <!-- Status Popover Menu -->
              <div
                v-if="isStatusOpen"
                class="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 space-y-1 text-xs"
              >
                <!-- Search Box -->
                <div class="relative px-1 pt-1 pb-1.5 border-b border-slate-100 dark:border-slate-700">
                  <div class="relative flex items-center">
                    <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      ref="statusSearchInput"
                      v-model="statusSearch"
                      type="text"
                      placeholder="Search status..."
                      class="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <!-- Status Options List -->
                <div class="max-h-48 overflow-y-auto space-y-0.5 pt-0.5">
                  <button
                    v-for="st in filteredStatusList"
                    :key="st.value"
                    type="button"
                    @click="selectStatus(st.value)"
                    class="w-full px-3 py-2 text-left rounded-lg transition-colors font-medium flex items-center justify-between"
                    :class="selectedStatus === st.value
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'"
                  >
                    <span>{{ st.label }}</span>
                    <span
                      v-if="selectedStatus === st.value"
                      class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                    />
                  </button>
                  <div v-if="filteredStatusList.length === 0" class="px-3 py-2 text-slate-400 italic text-center">
                    No status found
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Sub-Status Dropdown Button (Vibrant Blue per Maglo spec) -->
            <div class="relative" @click.stop>
              <button
                type="button"
                @click="toggleSubStatusMenu"
                class="w-full h-11 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between gap-2 shadow-sm transition-colors"
                :class="{ 'ring-2 ring-blue-400/50': isSubStatusOpen }"
              >
                <span class="truncate">{{ selectedSubStatus || 'Select Sub-Status' }}</span>
                <svg
                  class="w-4 h-4 text-white/90 shrink-0 transition-transform duration-200"
                  :class="{ 'rotate-180': isSubStatusOpen }"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              <!-- Sub-Status Popover Menu -->
              <div
                v-if="isSubStatusOpen"
                class="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 space-y-1 text-xs"
              >
                <!-- Search Box -->
                <div class="relative px-1 pt-1 pb-1.5 border-b border-slate-100 dark:border-slate-700">
                  <div class="relative flex items-center">
                    <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      ref="subStatusSearchInput"
                      v-model="subStatusSearch"
                      type="text"
                      placeholder="Search sub-status..."
                      class="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <!-- Sub-Status Options List -->
                <div class="max-h-52 overflow-y-auto space-y-0.5 pt-0.5">
                  <button
                    v-for="sub in filteredSubStatusList"
                    :key="sub"
                    type="button"
                    @click="selectSubStatus(sub)"
                    class="w-full px-3 py-2 text-left rounded-lg transition-colors font-medium flex items-center justify-between"
                    :class="selectedSubStatus === sub
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'"
                  >
                    <span>{{ sub }}</span>
                    <svg
                      v-if="selectedSubStatus === sub"
                      class="w-3.5 h-3.5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                  <div v-if="filteredSubStatusList.length === 0" class="px-3 py-2 text-slate-400 italic text-center">
                    No matching sub-status
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Remarks Section -->
          <div class="space-y-1.5 pt-1">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Add Remarks
            </label>
            <textarea
              v-model="remarks"
              rows="4"
              placeholder="Add your remark..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-colors shadow-2xs"
            ></textarea>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-800/20 rounded-b-2xl">
          <button
            type="button"
            @click="handleClose"
            class="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            :disabled="saving"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleSave"
            class="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            :disabled="saving"
          >
            <svg v-if="saving" class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor" class="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" class="opacity-75" />
            </svg>
            <span>{{ saving ? 'Updating...' : 'Update Status' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import {
  EDUCATION_STATUSES,
  EDUCATION_SUB_STATUS_MAP,
  normalizeStatus,
} from '../constants/leadStatusConfig';
import { updateEducationLead, logEducationLeadActivity } from '../api/endpoints';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  lead:   { type: Object, default: null },
});

const emit = defineEmits(['close', 'saved']);

// Reactive state
const selectedStatus = ref('interested');
const selectedSubStatus = ref('');
const remarks = ref('');
const saving = ref(false);
const errorMessage = ref('');

// Dropdowns and searches
const isStatusOpen = ref(false);
const statusSearch = ref('');
const isSubStatusOpen = ref(false);
const subStatusSearch = ref('');

const statusSearchInput = ref(null);
const subStatusSearchInput = ref(null);

// Initialize form values from lead prop
watch(
  () => [props.isOpen, props.lead],
  ([open, leadData]) => {
    if (open && leadData) {
      errorMessage.value = '';
      const norm = normalizeStatus(leadData.status);
      selectedStatus.value = norm;

      // Available sub-statuses for this status
      const available = EDUCATION_SUB_STATUS_MAP[norm] || [];
      if (leadData.subStatus && available.includes(leadData.subStatus)) {
        selectedSubStatus.value = leadData.subStatus;
      } else {
        selectedSubStatus.value = available[0] || '';
      }

      remarks.value = leadData.statusRemarks || '';
      isStatusOpen.value = false;
      isSubStatusOpen.value = false;
      statusSearch.value = '';
      subStatusSearch.value = '';
    }
  },
  { immediate: true }
);

const currentStatusLabel = computed(() => {
  const match = EDUCATION_STATUSES.find(s => s.value === selectedStatus.value);
  return match ? match.label : selectedStatus.value;
});

const filteredStatusList = computed(() => {
  if (!statusSearch.value.trim()) return EDUCATION_STATUSES;
  const q = statusSearch.value.toLowerCase().trim();
  return EDUCATION_STATUSES.filter(s => s.label.toLowerCase().includes(q));
});

const currentSubStatusList = computed(() => {
  return EDUCATION_SUB_STATUS_MAP[selectedStatus.value] || [];
});

const filteredSubStatusList = computed(() => {
  const list = currentSubStatusList.value;
  if (!subStatusSearch.value.trim()) return list;
  const q = subStatusSearch.value.toLowerCase().trim();
  return list.filter(s => s.toLowerCase().includes(q));
});

function toggleStatusMenu() {
  isStatusOpen.value = !isStatusOpen.value;
  isSubStatusOpen.value = false;
  if (isStatusOpen.value) {
    statusSearch.value = '';
    nextTick(() => statusSearchInput.value?.focus());
  }
}

function selectStatus(val) {
  selectedStatus.value = val;
  isStatusOpen.value = false;
  statusSearch.value = '';

  // Default to first sub-status for newly picked status
  const subs = EDUCATION_SUB_STATUS_MAP[val] || [];
  selectedSubStatus.value = subs[0] || '';
}

function toggleSubStatusMenu() {
  isSubStatusOpen.value = !isSubStatusOpen.value;
  isStatusOpen.value = false;
  if (isSubStatusOpen.value) {
    subStatusSearch.value = '';
    nextTick(() => subStatusSearchInput.value?.focus());
  }
}

function selectSubStatus(sub) {
  selectedSubStatus.value = sub;
  isSubStatusOpen.value = false;
  subStatusSearch.value = '';
}

function closeAllDropdowns() {
  isStatusOpen.value = false;
  isSubStatusOpen.value = false;
}

function handleClose() {
  closeAllDropdowns();
  emit('close');
}

async function handleSave() {
  if (!props.lead) return;
  const leadId = props.lead._id || props.lead.id;
  if (!leadId) return;

  saving.value = true;
  errorMessage.value = '';

  try {
    const payload = {
      status: selectedStatus.value,
      subStatus: selectedSubStatus.value,
      statusRemarks: remarks.value.trim(),
    };

    const updated = await updateEducationLead(leadId, payload);

    // Also record an audit activity log entry if remarks were provided
    if (remarks.value.trim()) {
      try {
        await logEducationLeadActivity(leadId, {
          type: 'note',
          title: `Status updated to ${currentStatusLabel.value} (${selectedSubStatus.value || 'No sub-status'})`,
          description: remarks.value.trim(),
        });
      } catch (logErr) {
        // Activity log is non-blocking
        console.warn('Failed to log activity entry:', logErr);
      }
    }

    emit('saved', updated?.lead || updated);
    handleClose();
  } catch (err) {
    console.error('Failed to update lead status:', err);
    errorMessage.value = err.response?.data?.message || err.message || 'Failed to update status. Please try again.';
  } finally {
    saving.value = false;
  }
}
</script>
