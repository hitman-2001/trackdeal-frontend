<template>
  <AppDrawer
    :isOpen="isOpen"
    title="Log Update / Conversation"
    :subtitle="drawerSubtitle"
    width="540px"
    @close="$emit('close')"
  >
    <div v-if="loading" class="py-16 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
      <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span>Loading student lead details...</span>
    </div>

    <form
      v-else-if="lead"
      id="log-lead-update-form"
      class="space-y-4 text-xs pb-4"
      @submit.prevent="saveUpdate"
    >
      <!-- Student Summary Dossier Pill -->
      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 shadow-2xs">
        <div>
          <div class="font-bold text-xs text-slate-800 dark:text-slate-100">
            {{ lead.firstName }} {{ lead.lastName || '' }}
          </div>
          <div class="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
            <span class="font-mono font-medium">{{ lead.mobile }}</span>
            <span v-if="lead.classInterestId?.name" class="text-slate-400">· {{ lead.classInterestId.name }}</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <StatusBadge :status="lead.status || 'new'" />
          <span
            v-if="lead.leadTemperature"
            class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border"
            :class="tempBadgeClass(lead.leadTemperature)"
          >
            {{ tempLabel(lead.leadTemperature) }}
          </span>
        </div>
      </div>

      <!-- Section 10: Compact Interaction Selector (KokonutUI style) -->
      <div class="space-y-1.5">
        <label class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
          Interaction Type *
        </label>
        <div class="grid grid-cols-4 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 gap-1 select-none">
          <button
            type="button"
            v-for="ch in channels"
            :key="ch.id"
            @click="form.type = ch.id"
            class="h-9 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold transition-all duration-150"
            :class="form.type === ch.id 
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200/80 dark:border-slate-700' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50'"
          >
            <component :is="ch.icon" :size="15" weight="bold" :class="form.type === ch.id ? 'text-primary' : 'text-slate-400'" />
            <span class="truncate">{{ ch.label }}</span>
          </button>
        </div>
      </div>

      <!-- ================= 1. PHONE CALL FIELDS ================= -->
      <template v-if="form.type === 'call'">
        <div class="space-y-3 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-surface shadow-2xs">
          <div class="space-y-1">
            <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
              Call Outcome *
            </label>
            <select
              v-model="form.outcome"
              required
              class="filter-control w-full"
            >
              <option value="" disabled>Select call outcome</option>
              <option value="Connected & Interested">Connected & Interested</option>
              <option value="Callback Requested">Callback Requested</option>
              <option value="Demo Scheduled">Demo / Trial Scheduled</option>
              <option value="Fee Structure Shared">Fee Structure Shared</option>
              <option value="Follow-up Required">Follow-up Required</option>
              <option value="Busy / Not Reachable">Busy / Not Reachable</option>
              <option value="Wrong Number / Invalid">Wrong Number / Invalid</option>
              <option value="Not Interested">Not Interested</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
              Remarks *
            </label>
            <textarea
              v-model="form.remarks"
              rows="3"
              required
              placeholder="Record call summary, student questions, parent preferences, agreed next steps..."
              class="w-full bg-surface border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 resize-none leading-relaxed"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-1">
            <label class="space-y-1 font-semibold text-slate-700 dark:text-slate-300 block">
              <span>Update Stage</span>
              <select
                v-model="form.status"
                class="filter-control w-full"
              >
                <option value="new">New</option>
                <option value="assigned">Assigned</option>
                <option value="contacted">Contacted</option>
                <option value="follow_up">Follow Up</option>
                <option value="meeting_scheduled">Demo / Meeting Scheduled</option>
                <option value="qualified">Qualified</option>
                <option value="application_trial">Application / Trial</option>
                <option value="on_hold">On Hold</option>
                <option value="lost">Lost</option>
              </select>
            </label>

            <label class="space-y-1 font-semibold text-slate-700 dark:text-slate-300 block">
              <span>Interest Level</span>
              <select
                v-model="form.temperature"
                class="filter-control w-full"
              >
                <option value="hot">🔥 Hot (High Intent)</option>
                <option value="warm">⚡ Warm (In Discussion)</option>
                <option value="cold">❄ Cold (Low Interest)</option>
              </select>
            </label>
          </div>
        </div>
      </template>

      <!-- ================= 2. WHATSAPP FIELDS ================= -->
      <template v-else-if="form.type === 'whatsapp'">
        <div class="space-y-3 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-surface shadow-2xs">
          <div class="space-y-1">
            <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
              Message / Template
            </label>
            <select
              v-model="form.template"
              class="filter-control w-full"
              @change="handleTemplateChange"
            >
              <option value="">Custom Message</option>
              <option value="fee_structure">Fee Structure & Syllabus Brochure</option>
              <option value="admission_followup">Admission Inquiry Follow-up</option>
              <option value="demo_invite">Demo Class & Counselling Invite</option>
              <option value="scholarship_test">Scholarship & Assessment Test Details</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
              Message Content *
            </label>
            <textarea
              v-model="form.message"
              rows="3"
              required
              placeholder="Type message content or template text..."
              class="w-full bg-surface border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 resize-none leading-relaxed"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
                Message Status
              </label>
              <select
                v-model="form.messageStatus"
                class="filter-control w-full"
              >
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="read">Read</option>
                <option value="replied">Replied by Parent/Student</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
                Update Stage
              </label>
              <select
                v-model="form.status"
                class="filter-control w-full"
              >
                <option value="contacted">Contacted</option>
                <option value="follow_up">Follow Up</option>
                <option value="meeting_scheduled">Meeting Scheduled</option>
                <option value="qualified">Qualified</option>
              </select>
            </div>
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
              Remarks
            </label>
            <textarea
              v-model="form.remarks"
              rows="2"
              placeholder="Additional internal notes on WhatsApp interaction..."
              class="w-full bg-surface border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 resize-none leading-relaxed"
            ></textarea>
          </div>
        </div>
      </template>

      <!-- ================= 3. COUNSELLING FIELDS ================= -->
      <template v-else-if="form.type === 'meeting'">
        <div class="space-y-3 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-surface shadow-2xs">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
                Counsellor *
              </label>
              <select
                v-model="form.counsellorId"
                required
                class="filter-control w-full"
              >
                <option value="" disabled>Select counsellor</option>
                <option v-for="s in staffList" :key="s._id || s.id" :value="s._id || s.id">
                  {{ s.firstName }} {{ s.lastName || '' }}
                </option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
                Counselling Date *
              </label>
              <input
                v-model="form.counsellingDate"
                type="date"
                required
                class="filter-control w-full"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
                Course Discussed *
              </label>
              <select
                v-model="form.courseDiscussed"
                required
                class="filter-control w-full"
              >
                <option value="" disabled>Select course / class</option>
                <option v-for="c in classesList" :key="c._id" :value="c.name">
                  {{ c.name }} ({{ c.code }})
                </option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
                Outcome *
              </label>
              <select
                v-model="form.outcome"
                required
                class="filter-control w-full"
              >
                <option value="" disabled>Select outcome</option>
                <option value="Completed & Ready to Enroll">Completed & Ready to Enroll</option>
                <option value="Completed & Considering">Completed & Considering</option>
                <option value="Fee Negotiation Ongoing">Fee Negotiation Ongoing</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Absent / No Show">Absent / No Show</option>
              </select>
            </div>
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
              Remarks *
            </label>
            <textarea
              v-model="form.remarks"
              rows="3"
              required
              placeholder="Record counselling discussion points, academic performance, batch preferences, agreed discount or fee schedule..."
              class="w-full bg-surface border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 resize-none leading-relaxed"
            ></textarea>
          </div>
        </div>
      </template>

      <!-- ================= 4. REMARK FIELDS ================= -->
      <template v-else-if="form.type === 'note'">
        <div class="space-y-3 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-surface shadow-2xs">
          <div class="space-y-1">
            <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
              Remark Type *
            </label>
            <select
              v-model="form.remarkType"
              required
              class="filter-control w-full"
            >
              <option value="General">General Note</option>
              <option value="Academic Query">Academic Query / Syllabus</option>
              <option value="Financial & Fees">Financial & Fee Discussion</option>
              <option value="Parent Concern">Parent Concern / Requirement</option>
              <option value="Documentation">Documentation & Verification</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-slate-700 dark:text-slate-300 text-xs block">
              Remark Content *
            </label>
            <textarea
              v-model="form.remarks"
              rows="4"
              required
              placeholder="Record detailed remark or internal note regarding this student lead..."
              class="w-full bg-surface border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-xs outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 resize-none leading-relaxed"
            ></textarea>
          </div>
        </div>
      </template>

      <!-- ================= SCHEDULE NEXT FOLLOW-UP CHECKBOX ================= -->
      <div class="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-surface space-y-3">
        <label class="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-slate-800 dark:text-slate-200">
          <input
            type="checkbox"
            v-model="form.scheduleFollowUp"
            class="app-checkbox"
          />
          <span>Schedule next follow-up touchpoint</span>
        </label>

        <!-- Follow-up details (date, time, staff) -->
        <div v-if="form.scheduleFollowUp" class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div class="space-y-1">
            <label class="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">Date *</label>
            <input
              v-model="form.followUpDate"
              type="date"
              required
              class="filter-control w-full"
            />
          </div>
          <div class="space-y-1">
            <label class="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">Time *</label>
            <input
              v-model="form.followUpTime"
              type="time"
              required
              class="filter-control w-full"
            />
          </div>
          <div class="space-y-1">
            <label class="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">Assigned Staff</label>
            <select
              v-model="form.assignedToStaffId"
              class="filter-control w-full"
            >
              <option value="">Default (Current Staff)</option>
              <option v-for="s in staffList" :key="s._id || s.id" :value="s._id || s.id">
                {{ s.firstName }} {{ s.lastName || '' }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <p v-if="error" class="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-lg border border-rose-200 dark:border-rose-900">
        {{ error }}
      </p>
    </form>

    <template #footer v-if="!loading && lead">
      <button
        type="button"
        class="btn btn-secondary btn-sm"
        :disabled="saving"
        @click="$emit('close')"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="log-lead-update-form"
        class="btn btn-primary btn-sm flex items-center gap-1.5"
        :disabled="saving || isSubmitDisabled"
      >
        <span v-if="saving" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <PhPaperPlaneTilt v-else :size="14" weight="bold" />
        <span>{{ saving ? "Saving Update..." : "Save Update" }}</span>
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import {
  PhPhoneCall,
  PhWhatsappLogo,
  PhChalkboardTeacher,
  PhNotePencil,
  PhPaperPlaneTilt,
} from '@phosphor-icons/vue';
import AppDrawer from '@/components/AppDrawer.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import apiClient from '@/api/client';
import {
  fetchEducationLead,
  fetchEducationClasses,
  logEducationLeadActivity,
  updateEducationLead,
} from '../api/endpoints';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  leadId: { type: String, default: '' },
  lead: { type: Object, default: null },
});

const emit = defineEmits(['close', 'success']);

const store = useStore();

const loading = ref(false);
const saving = ref(false);
const error = ref('');
const lead = ref(props.lead || null);
const classesList = ref([]);
const staffList = ref([]);

const channels = [
  { id: 'call', label: 'Call', icon: PhPhoneCall },
  { id: 'whatsapp', label: 'WhatsApp', icon: PhWhatsappLogo },
  { id: 'meeting', label: 'Counselling', icon: PhChalkboardTeacher },
  { id: 'note', label: 'Remark', icon: PhNotePencil },
];

const form = ref({
  type: 'call',
  // Call fields
  outcome: 'Connected & Interested',
  remarks: '',
  status: 'contacted',
  temperature: 'warm',
  // WhatsApp fields
  template: '',
  message: '',
  messageStatus: 'sent',
  // Counselling fields
  counsellorId: '',
  counsellingDate: new Date().toISOString().split('T')[0],
  courseDiscussed: '',
  // Remark fields
  remarkType: 'General',
  // Follow-up
  scheduleFollowUp: false,
  followUpDate: defaultFollowUpDate(),
  followUpTime: '11:00',
  assignedToStaffId: '',
});

function defaultFollowUpDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

const drawerSubtitle = computed(() => {
  if (!lead.value) return 'Record touchpoint details';
  return `Record touchpoint for ${lead.value.firstName} ${lead.value.lastName || ''}`.trim();
});

const isSubmitDisabled = computed(() => {
  if (form.value.type === 'call') {
    return !form.value.outcome || !form.value.remarks.trim();
  }
  if (form.value.type === 'whatsapp') {
    return !form.value.message.trim();
  }
  if (form.value.type === 'meeting') {
    return !form.value.counsellorId || !form.value.courseDiscussed || !form.value.outcome || !form.value.remarks.trim();
  }
  if (form.value.type === 'note') {
    return !form.value.remarks.trim();
  }
  return false;
});

function handleTemplateChange() {
  const name = lead.value?.firstName || 'Student';
  const course = lead.value?.classInterestId?.name || 'our courses';
  switch (form.value.template) {
    case 'fee_structure':
      form.value.message = `Hello ${name}, thank you for your interest in ${course} at TrackDeal Institute. Here is our detailed brochure and fee structure. Please let us know if you'd like to schedule a trial demo.`;
      break;
    case 'admission_followup':
      form.value.message = `Hi ${name}, following up on our recent discussion regarding your admission for ${course}. Our upcoming batch commences shortly. Would you like to confirm your enrollment today?`;
      break;
    case 'demo_invite':
      form.value.message = `Dear ${name}, we have arranged a complimentary counselling and demo session for ${course}. Please reply to confirm your preferred time slot.`;
      break;
    case 'scholarship_test':
      form.value.message = `Greetings ${name}! Registrations are now open for the TrackDeal Merit Assessment & Scholarship test. Outstanding performers receive up to 50% fee concessions.`;
      break;
    default:
      form.value.message = '';
  }
}

async function loadSupportData() {
  try {
    const [classesRes, staffRes] = await Promise.all([
      fetchEducationClasses({ limit: 100 }).catch(() => ({ data: [] })),
      apiClient.get('/users', { params: { limit: 200, status: 'active' } }).catch(() => ({ data: { data: [] } })),
    ]);
    classesList.value = classesRes.data || [];
    staffList.value = staffRes.data?.data || [];
  } catch (err) {
    // fallback
  }
}

async function loadLead() {
  if (!props.leadId) return;
  loading.value = true;
  error.value = '';
  try {
    const res = await fetchEducationLead(props.leadId);
    lead.value = res.data || res;
    resetFormForLead(lead.value);
  } catch (err) {
    error.value = 'Failed to load student lead.';
  } finally {
    loading.value = false;
  }
}

function resetFormForLead(currentLead) {
  form.value.status = currentLead?.status || 'contacted';
  form.value.temperature = currentLead?.leadTemperature || 'warm';
  form.value.remarks = '';
  form.value.message = '';
  form.value.template = '';
  form.value.scheduleFollowUp = false;
  form.value.courseDiscussed = currentLead?.classInterestId?.name || '';
  form.value.counsellorId = currentLead?.assignedTo?._id || currentLead?.assignedTo || '';
  form.value.assignedToStaffId = currentLead?.assignedTo?._id || currentLead?.assignedTo || '';
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      loadSupportData();
      if (props.lead) {
        lead.value = props.lead;
        resetFormForLead(props.lead);
      } else {
        loadLead();
      }
    }
  },
  { immediate: true },
);

async function saveUpdate() {
  if (saving.value) return;
  saving.value = true;
  error.value = '';

  try {
    const targetLeadId = lead.value?._id || props.leadId;
    let summary = '';
    let description = '';

    if (form.value.type === 'call') {
      summary = `Call: ${form.value.outcome}`;
      description = form.value.remarks.trim();
    } else if (form.value.type === 'whatsapp') {
      summary = `WhatsApp (${form.value.messageStatus}): ${form.value.template ? form.value.template.replace(/_/g, ' ') : 'Message'}`;
      description = `${form.value.message}\n\nRemarks: ${form.value.remarks.trim()}`.trim();
    } else if (form.value.type === 'meeting') {
      summary = `Counselling: ${form.value.courseDiscussed} (${form.value.outcome})`;
      description = `Counselling session for ${form.value.courseDiscussed}.\nOutcome: ${form.value.outcome}\n\n${form.value.remarks.trim()}`.trim();
    } else {
      summary = `Remark [${form.value.remarkType}]`;
      description = form.value.remarks.trim();
    }

    const payload = {
      type: form.value.type,
      summary,
      description,
      customerResponse: form.value.outcome || form.value.messageStatus,
      status: 'completed',
      activityDate: new Date().toISOString(),
    };

    if (form.value.scheduleFollowUp && form.value.followUpDate) {
      const timeStr = form.value.followUpTime || '10:00';
      payload.nextFollowUpAt = new Date(`${form.value.followUpDate}T${timeStr}:00`).toISOString();
    } else {
      payload.clearFollowUp = true;
      payload.nextFollowUpAt = null;
    }

    // 1. Log Activity Record
    await logEducationLeadActivity(targetLeadId, payload);

    // 2. Update Lead Stage, Temperature & Staff if modified
    const leadUpdates = {};
    if (form.value.status && form.value.status !== lead.value.status) {
      leadUpdates.status = form.value.status;
    }
    if (form.value.temperature && form.value.temperature !== lead.value.leadTemperature) {
      leadUpdates.leadTemperature = form.value.temperature;
    }
    if (form.value.scheduleFollowUp && payload.nextFollowUpAt) {
      leadUpdates.nextFollowUpAt = payload.nextFollowUpAt;
    } else {
      leadUpdates.nextFollowUpAt = null;
    }
    if (form.value.assignedToStaffId && form.value.assignedToStaffId !== (lead.value.assignedTo?._id || lead.value.assignedTo)) {
      leadUpdates.assignedTo = form.value.assignedToStaffId;
    }
    leadUpdates.notesRemarks = description;

    await updateEducationLead(targetLeadId, leadUpdates);

    store.dispatch('notifications/triggerToast', {
      message: 'Interaction update logged successfully.',
      type: 'success',
    });

    emit('success');
    emit('close');
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Unable to save update.';
  } finally {
    saving.value = false;
  }
}

function tempLabel(t) {
  if (t === 'hot') return '🔥 Hot';
  if (t === 'cold') return '❄ Cold';
  return '⚡ Warm';
}

function tempBadgeClass(t) {
  if (t === 'hot') return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300';
  if (t === 'cold') return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300';
  return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300';
}
</script>
