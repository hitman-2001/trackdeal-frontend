<template>
  <AppModal
    :isOpen="isOpen"
    title="Update Status"
    :subtitle="lead ? `Update status for ${lead.firstName} ${lead.lastName || ''}`.trim() : 'Change status & disposition'"
    maxSize="500px"
    @cancel="handleClose"
  >
    <div class="space-y-4 text-xs">
      <!-- Student Context Dossier Pill -->
      <div
        v-if="lead"
        class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs"
      >
        <div>
          <div class="font-bold text-sm text-slate-800 dark:text-slate-100">
            {{ lead.firstName }} {{ lead.lastName || '' }}
          </div>
          <div class="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
            <span>{{ lead.mobile }}</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="text-[11px] text-slate-400 font-medium">Current:</span>
          <StatusBadge :status="lead.status || 'new'" />
        </div>
      </div>

      <!-- Error banner if any -->
      <div
        v-if="errorMessage"
        class="p-3 text-xs bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-900"
      >
        {{ errorMessage }}
      </div>

      <!-- Status Selection - Visual Touch Cards -->
      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Select Stage / Status <span class="text-rose-500">*</span>
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            v-for="st in statusOptions"
            :key="st.value"
            type="button"
            @click="selectStatus(st.value)"
            class="h-11 px-3 rounded-xl border-2 text-xs font-bold flex items-center gap-2 transition-all text-left cursor-pointer"
            :class="[
              selectedStatus === st.value
                ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            ]"
          >
            <component
              :is="st.icon"
              :size="18"
              weight="bold"
              :class="selectedStatus === st.value ? 'text-blue-600 dark:text-blue-400' : st.color"
              class="shrink-0"
            />
            <span class="truncate">{{ st.label }}</span>
          </button>
        </div>
      </div>

      <!-- Sub-Status Selection -->
      <div class="space-y-1.5 pt-1">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Sub-Status / Specific Reason <span class="text-rose-500">*</span>
        </label>
        <select
          v-model="selectedSubStatus"
          class="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100 font-medium transition-all"
        >
          <option value="" disabled>Select Sub-Status</option>
          <option v-for="sub in currentSubStatusList" :key="sub" :value="sub">
            {{ sub }}
          </option>
        </select>
      </div>

      <!-- Remarks / Internal Notes -->
      <div class="space-y-1.5 pt-1">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Remarks / Discussion Notes <span class="text-slate-400 font-normal">(Optional)</span>
        </label>
        <textarea
          v-model="remarks"
          rows="3"
          placeholder="Add discussion notes, callback reason, or parent preferences..."
          class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none leading-relaxed text-slate-800 dark:text-slate-100 transition-all placeholder:text-slate-400"
        ></textarea>
      </div>

      <!-- Optional Next Follow-up -->
      <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <PhCalendar :size="15" weight="bold" class="text-blue-600" />
            <span class="font-bold text-xs text-slate-800 dark:text-slate-200">Schedule Next Follow-up</span>
          </div>
          <button
            type="button"
            @click="scheduleFollowUp = !scheduleFollowUp"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer shrink-0"
            :class="scheduleFollowUp ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'"
            aria-label="Toggle next follow-up schedule"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200"
              :class="scheduleFollowUp ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>

        <template v-if="scheduleFollowUp">
          <div class="flex flex-wrap gap-1.5 pt-1">
            <button
              v-for="quick in quickFollowUps"
              :key="quick.label"
              type="button"
              @click="applyQuickFollowUp(quick)"
              class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer"
              :class="isQuickActive(quick)
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-500 ring-1 ring-blue-500'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400'"
            >
              {{ quick.label }}
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label class="text-[10px] font-semibold text-slate-500 block mb-0.5">Date</label>
              <input
                v-model="followUpDate"
                type="date"
                required
                class="w-full h-9 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="text-[10px] font-semibold text-slate-500 block mb-0.5">Time</label>
              <input
                v-model="followUpTime"
                type="time"
                required
                class="w-full h-9 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Modal Footer Actions -->
    <template #footer>
      <button
        type="button"
        @click="handleClose"
        class="h-10 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
        :disabled="saving"
      >
        Cancel
      </button>
      <button
        type="button"
        @click="handleSave"
        class="btn btn-primary h-10 px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
        :disabled="saving || !selectedSubStatus"
      >
        <span v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <PhCheck v-else :size="16" weight="bold" />
        <span>{{ saving ? 'Updating...' : 'Update Status' }}</span>
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import {
  PhCheck,
  PhStar,
  PhPhoneCall,
  PhClock,
  PhGraduationCap,
  PhXCircle,
  PhCalendar,
} from '@phosphor-icons/vue';
import Swal from 'sweetalert2';
import AppModal from '@/components/AppModal.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import {
  EDUCATION_STATUSES,
  EDUCATION_SUB_STATUS_MAP,
  normalizeStatus,
} from '../constants/leadStatusConfig';
import {
  updateEducationLead,
  logEducationLeadActivity,
  fetchEducationLead,
  fetchEducationLeadActivityCenter,
} from '../api/endpoints';
import { updateLeadFollowUp } from '@/modules/leads/api/endpoints';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  lead:   { type: Object, default: null },
});

const emit = defineEmits(['close', 'saved', 'success']);
const store = useStore();

// Status options with high-end Phosphor vector icons
const statusOptions = [
  { value: 'interested', label: 'Interested', icon: PhStar, color: 'text-amber-500' },
  { value: 'call_back', label: 'Call Back', icon: PhPhoneCall, color: 'text-blue-500' },
  { value: 'future_prospect', label: 'Future Prospect', icon: PhClock, color: 'text-indigo-500' },
  { value: 'enrolled', label: 'Enrolled', icon: PhGraduationCap, color: 'text-emerald-500' },
  { value: 'not_interested', label: 'Not Interested', icon: PhXCircle, color: 'text-rose-500' },
];

// Reactive state
const selectedStatus = ref('interested');
const selectedSubStatus = ref('');
const remarks = ref('');
const saving = ref(false);
const errorMessage = ref('');

// Next Follow-up state
const scheduleFollowUp = ref(false);
const followUpDate = ref(defaultFollowUpDate());
const followUpTime = ref('11:00');
const hasExistingFollowUp = ref(false);
const existingFollowUpId = ref(null);

function defaultFollowUpDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

const quickFollowUps = [
  { label: 'Tomorrow', days: 1, time: '11:00' },
  { label: 'In 2 Days', days: 2, time: '11:00' },
  { label: 'In 3 Days', days: 3, time: '11:00' },
  { label: 'Next Week', days: 7, time: '10:00' },
];

function applyQuickFollowUp(quick) {
  const d = new Date();
  d.setDate(d.getDate() + quick.days);
  followUpDate.value = d.toISOString().split('T')[0];
  followUpTime.value = quick.time;
}

function isQuickActive(quick) {
  const d = new Date();
  d.setDate(d.getDate() + quick.days);
  return followUpDate.value === d.toISOString().split('T')[0] && followUpTime.value === quick.time;
}

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
      scheduleFollowUp.value = false;
      followUpDate.value = defaultFollowUpDate();
      followUpTime.value = '11:00';

      existingFollowUpId.value = leadData.currentFollowUpId || null;
      hasExistingFollowUp.value = Boolean(
        leadData.currentFollowUpId ||
        leadData.nextFollowUpAt ||
        leadData.scheduledAt ||
        leadData.followUpAt ||
        leadData.hasPendingFollowUp
      );

      // Async background check to pre-cache follow-up state
      const leadId = leadData._id || leadData.id;
      if (leadId && !hasExistingFollowUp.value) {
        Promise.allSettled([
          fetchEducationLead(leadId),
          fetchEducationLeadActivityCenter(leadId),
        ]).then(([freshRes, actRes]) => {
          if (freshRes.status === 'fulfilled') {
            const freshLead = freshRes.value?.data || freshRes.value;
            if (freshLead?.nextFollowUpAt) {
              hasExistingFollowUp.value = true;
            }
          }
          if (actRes.status === 'fulfilled') {
            const list = actRes.value?.data?.followUps || actRes.value?.followUps || [];
            const scheduled = list.find((f) => f.status === 'scheduled' && !f.isDeleted);
            if (scheduled) {
              hasExistingFollowUp.value = true;
              existingFollowUpId.value = scheduled._id || scheduled.id;
            }
          }
        }).catch(() => {});
      }
    }
  },
  { immediate: true }
);

// Auto-enable follow-up reminder only when user actively switches to "Follow-Up Needed"
watch(selectedSubStatus, (newVal, oldVal) => {
  if (oldVal && (newVal === 'Follow-Up Needed' || (newVal && newVal.toLowerCase().includes('follow-up')))) {
    scheduleFollowUp.value = true;
  }
});

const currentStatusLabel = computed(() => {
  const match = statusOptions.find(s => s.value === selectedStatus.value);
  return match ? match.label : selectedStatus.value;
});

const currentSubStatusList = computed(() => {
  return EDUCATION_SUB_STATUS_MAP[selectedStatus.value] || [];
});

function selectStatus(val) {
  selectedStatus.value = val;
  const subs = EDUCATION_SUB_STATUS_MAP[val] || [];
  selectedSubStatus.value = subs[0] || '';
  if (val === 'call_back') {
    scheduleFollowUp.value = true;
  }
}

function handleClose() {
  emit('close');
}

async function handleSave() {
  if (!props.lead) return;
  const leadId = props.lead._id || props.lead.id;
  if (!leadId) return;

  saving.value = true;
  errorMessage.value = '';

  try {
    // Check if this lead has a pending follow-up task
    let hasActiveFollowUp = Boolean(
      props.lead.currentFollowUpId ||
      props.lead.nextFollowUpAt ||
      props.lead.scheduledAt ||
      props.lead.followUpAt ||
      props.lead.hasPendingFollowUp ||
      hasExistingFollowUp.value
    );
    let activeFollowUpId = existingFollowUpId.value || props.lead.currentFollowUpId || null;

    if (!hasActiveFollowUp && leadId) {
      try {
        const [freshLeadRes, actRes] = await Promise.allSettled([
          fetchEducationLead(leadId),
          fetchEducationLeadActivityCenter(leadId),
        ]);

        if (freshLeadRes.status === 'fulfilled') {
          const freshLead = freshLeadRes.value?.data || freshLeadRes.value;
          if (freshLead?.nextFollowUpAt) {
            hasActiveFollowUp = true;
          }
        }

        if (actRes.status === 'fulfilled') {
          const list = actRes.value?.data?.followUps || actRes.value?.followUps || [];
          const scheduled = list.find((f) => f.status === 'scheduled' && !f.isDeleted);
          if (scheduled) {
            hasActiveFollowUp = true;
            activeFollowUpId = scheduled._id || scheduled.id;
          }
        }
      } catch (checkErr) {
        console.warn('Could not verify existing follow-up status:', checkErr);
      }
    }

    const payload = {
      status: selectedStatus.value,
      subStatus: selectedSubStatus.value,
      statusRemarks: remarks.value.trim(),
    };

    if (hasActiveFollowUp) {
      // User is updating status on a lead with an active follow-up task.
      // Salesforce / LeadSquared international UX: Ask user whether to complete or keep in agenda.
      saving.value = false;
      const targetName = props.lead.firstName || props.lead.studentName || props.lead.name || 'this student';

      const result = await Swal.fire({
        title: 'Pending Follow-up Task',
        html: `
          <div class="text-slate-600 dark:text-slate-300 text-sm space-y-2 text-left">
            <p><strong>${targetName}</strong> currently has a scheduled follow-up task in your agenda.</p>
            <p class="font-medium text-slate-800 dark:text-slate-100">
              Would you like to mark this follow-up task as <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Completed</span>, or keep it open in your agenda?
            </p>
          </div>
        `,
        icon: 'question',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Mark Task Completed',
        denyButtonText: 'Keep in Agenda',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#10b981',
        denyButtonColor: '#3b82f6',
        cancelButtonColor: '#94a3b8',
        buttonsStyling: true,
        customClass: {
          popup: 'rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 dark:bg-neutral-900',
          title: 'text-base font-bold text-slate-800 dark:text-slate-100',
          confirmButton: 'rounded-xl text-xs font-bold px-4 py-2.5 shadow-sm',
          denyButton: 'rounded-xl text-xs font-bold px-4 py-2.5 shadow-sm',
          cancelButton: 'rounded-xl text-xs font-medium px-3.5 py-2.5',
        },
      });

      if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
        return;
      }

      saving.value = true;

      if (result.isConfirmed) {
        // Mark task completed and remove from scheduled tasks
        if (scheduleFollowUp.value && followUpDate.value) {
          const timeStr = followUpTime.value || '11:00';
          payload.nextFollowUpAt = new Date(`${followUpDate.value}T${timeStr}:00`).toISOString();
        } else {
          payload.nextFollowUpAt = null;
        }

        if (activeFollowUpId && !String(activeFollowUpId).startsWith('fu-')) {
          try {
            await updateLeadFollowUp({
              leadId,
              followUpId: activeFollowUpId,
              status: 'completed',
            });
          } catch (fuErr) {
            console.warn('Could not update individual follow-up record:', fuErr);
          }
        }
      } else if (result.isDenied) {
        // User clicked "Keep in Agenda" -> preserve task, apply new schedule if selected
        if (scheduleFollowUp.value && followUpDate.value) {
          const timeStr = followUpTime.value || '11:00';
          const chosenDate = new Date(`${followUpDate.value}T${timeStr}:00`);
          const existingDate = props.lead.scheduledAt ? new Date(props.lead.scheduledAt) : (props.lead.nextFollowUpAt ? new Date(props.lead.nextFollowUpAt) : null);
          if (existingDate && Math.abs(chosenDate.getTime() - existingDate.getTime()) < 15 * 60 * 1000) {
            saving.value = false;
            const conflictTime = existingDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
            await Swal.fire({
              title: 'Task Already Scheduled',
              html: `
                <div class="text-slate-600 dark:text-slate-300 text-sm space-y-2 text-left">
                  <p>A task is already scheduled for <strong>${targetName}</strong> at <strong>${conflictTime}</strong>.</p>
                  <p class="text-slate-500">The same student cannot have two tasks assigned at the same time. Please choose a different time slot.</p>
                </div>
              `,
              icon: 'warning',
              confirmButtonText: 'Select Different Time',
              confirmButtonColor: '#3b82f6',
              customClass: {
                popup: 'rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 dark:bg-neutral-900',
                title: 'text-base font-bold text-slate-800 dark:text-slate-100',
                confirmButton: 'rounded-xl text-xs font-bold px-4 py-2.5 shadow-sm',
              },
            });
            return;
          }
          payload.nextFollowUpAt = chosenDate.toISOString();
          payload.keepExistingFollowUp = true;
        }
      }
    } else {
      // No active follow-up: apply new schedule if user toggled on
      if (scheduleFollowUp.value && followUpDate.value) {
        const timeStr = followUpTime.value || '11:00';
        payload.nextFollowUpAt = new Date(`${followUpDate.value}T${timeStr}:00`).toISOString();
      }
    }

    const updated = await updateEducationLead(leadId, payload);

    const prevStatusLabel = (() => {
      const norm = normalizeStatus(props.lead?.status);
      const match = statusOptions.find(s => s.value === norm);
      return match ? match.label : (props.lead?.status ? String(props.lead.status).replace(/_/g, ' ') : '');
    })();

    const subText = selectedSubStatus.value ? ` (${selectedSubStatus.value})` : '';
    const cleanSummary = prevStatusLabel && prevStatusLabel.toLowerCase() !== currentStatusLabel.value.toLowerCase()
      ? `Status changed from ${prevStatusLabel} to ${currentStatusLabel.value}${subText}`
      : `Status updated to ${currentStatusLabel.value}${subText}`;

    const cleanDescription = remarks.value.trim() ? remarks.value.trim() : cleanSummary;

    // Record an audit activity log entry
    try {
      const actPayload = {
        type: 'stage_change',
        summary: cleanSummary,
        description: cleanDescription,
        customerResponse: selectedSubStatus.value,
        status: 'completed',
      };
      if (payload.nextFollowUpAt) {
        actPayload.nextFollowUpAt = payload.nextFollowUpAt;
        actPayload.followUpNotes = remarks.value.trim() || `Follow-up: ${currentStatusLabel.value}${subText}`;
      }
      await logEducationLeadActivity(leadId, actPayload);
    } catch (logErr) {
      console.warn('Failed to log activity entry:', logErr);
    }

    store.dispatch('notifications/triggerToast', {
      message: `Status updated to ${currentStatusLabel.value}`,
      type: 'success',
    });

    emit('saved', updated?.lead || updated);
    emit('success', updated?.lead || updated);
    handleClose();
  } catch (err) {
    console.error('Failed to update lead status:', err);
    const msg = err.response?.data?.message || err.message || 'Failed to update status. Please try again.';
    if (msg.includes('already scheduled') || msg.includes('TASK_SCHEDULE_CONFLICT')) {
      Swal.fire({
        title: 'Task Already Scheduled',
        text: msg,
        icon: 'warning',
        confirmButtonText: 'Select Different Time',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 dark:bg-neutral-900',
          title: 'text-base font-bold text-slate-800 dark:text-slate-100',
          confirmButton: 'rounded-xl text-xs font-bold px-4 py-2.5 shadow-sm',
        },
      });
    }
    errorMessage.value = msg;
  } finally {
    saving.value = false;
  }
}
</script>
