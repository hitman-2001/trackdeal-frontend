<template>
  <AppDrawer
    :isOpen="isOpen"
    title="Log Update"
    :subtitle="drawerSubtitle"
    width="540px"
    @close="$emit('close')"
  >
    <div v-if="loading" class="py-16 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
      <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span>Loading details...</span>
    </div>

    <form
      v-else-if="lead"
      id="log-lead-update-form"
      class="space-y-5 text-sm pb-4"
      @submit.prevent="saveUpdate"
    >
      <!-- Student Name & Status Pill -->
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
        <div>
          <div class="font-bold text-sm text-slate-800 dark:text-slate-100">
            {{ lead.firstName }} {{ lead.lastName || '' }}
          </div>
          <div class="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
            <span class="font-mono font-medium">{{ lead.mobile }}</span>
            <span v-if="lead.classInterestId?.name" class="text-slate-400">· {{ lead.classInterestId.name }}</span>
          </div>
        </div>
        <StatusBadge :status="lead.status || 'new'" />
      </div>

      <!-- Interaction Type — Large Tap Targets -->
      <div class="space-y-2">
        <label class="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          What did you do? *
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            v-for="ch in channels"
            :key="ch.id"
            @click="form.type = ch.id"
            class="h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-150 border-2"
            :class="form.type === ch.id 
              ? 'bg-primary/10 text-primary border-primary shadow-xs' 
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:text-primary'"
          >
            <component :is="ch.icon" :size="18" weight="bold" />
            <span>{{ ch.label }}</span>
          </button>
        </div>
      </div>

      <!-- ================= 1. PHONE CALL FIELDS ================= -->
      <template v-if="form.type === 'call'">
        <div class="space-y-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
          <div class="space-y-1.5">
            <label class="font-semibold text-slate-700 dark:text-slate-300 text-sm block">
              What happened on the call? *
            </label>
            <select
              v-model="form.outcome"
              required
              class="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="" disabled>Select call outcome...</option>
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

          <div class="space-y-1.5">
            <label class="font-semibold text-slate-700 dark:text-slate-300 text-sm block">
              Notes / Remarks *
            </label>
            <textarea
              v-model="form.remarks"
              rows="3"
              required
              placeholder="What did they say? Any questions? Next steps discussed..."
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
            ></textarea>
          </div>

          <!-- Status & Sub-Status (2 columns only, no interest level) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div class="space-y-1.5">
              <label class="font-semibold text-slate-700 dark:text-slate-300 text-sm block">Status</label>
              <select
                v-model="form.status"
                class="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                @change="handleLogStatusChange"
              >
                <option v-for="st in EDUCATION_STATUSES" :key="st.value" :value="st.value">
                  {{ st.label }}
                </option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="font-semibold text-slate-700 dark:text-slate-300 text-sm block">Sub-Status</label>
              <select
                v-model="form.subStatus"
                class="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Sub-Status</option>
                <option v-for="sub in availableSubStatuses" :key="sub" :value="sub">
                  {{ sub }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </template>

      <!-- ================= 2. WHATSAPP FIELDS ================= -->
      <template v-else-if="form.type === 'whatsapp'">
        <div class="space-y-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
          <div class="space-y-1.5">
            <label class="font-semibold text-slate-700 dark:text-slate-300 text-sm block">
              Quick Template
            </label>
            <select
              v-model="form.template"
              class="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              @change="handleTemplateChange"
            >
              <option value="">Write custom message</option>
              <option value="fee_structure">Fee Structure & Syllabus</option>
              <option value="admission_followup">Admission Follow-up</option>
              <option value="demo_invite">Demo Class Invite</option>
              <option value="scholarship_test">Scholarship Test Details</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="font-semibold text-slate-700 dark:text-slate-300 text-sm block">
              Message *
            </label>
            <textarea
              v-model="form.message"
              rows="3"
              required
              placeholder="Type your WhatsApp message here..."
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="font-semibold text-slate-700 dark:text-slate-300 text-sm block">
                Message Status
              </label>
              <select
                v-model="form.messageStatus"
                class="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="font-semibold text-slate-700 dark:text-slate-300 text-sm block">
                Update Stage
              </label>
              <select
                v-model="form.status"
                class="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="contacted">Contacted</option>
                <option value="follow_up">Follow Up</option>
                <option value="meeting_scheduled">Meeting Scheduled</option>
                <option value="qualified">Qualified</option>
              </select>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="font-semibold text-slate-700 dark:text-slate-300 text-sm block">
              Remarks
            </label>
            <textarea
              v-model="form.remarks"
              rows="2"
              placeholder="Any additional notes..."
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
            ></textarea>
          </div>
        </div>
      </template>

      <!-- ================= 3. COUNSELLING FIELDS ================= -->
      <template v-else-if="form.type === 'meeting'">
        <div class="space-y-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="font-semibold text-slate-700 dark:text-slate-300 text-sm block">
                Counsellor *
              </label>
              <select
                v-model="form.counsellorId"
                required
                class="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="" disabled>Select counsellor</option>
                <option v-for="s in staffList" :key="s._id || s.id" :value="s._id || s.id">
                  {{ s.firstName }} {{ s.lastName || '' }}
                </option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="font-semibold text-slate-700 dark:text-slate-300 text-sm block">
                Date *
              </label>
              <input
                v-model="form.counsellingDate"
                type="date"
                required
                class="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="font-semibold text-slate-700 dark:text-slate-300 text-sm block">
                Course / Class *
              </label>
              <select
                v-model="form.courseDiscussed"
                required
                class="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="" disabled>Select course</option>
                <option v-for="c in classesList" :key="c._id" :value="c.name">
                  {{ c.name }} ({{ c.code }})
                </option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="font-semibold text-slate-700 dark:text-slate-300 text-sm block">
                Outcome *
              </label>
              <select
                v-model="form.outcome"
                required
                class="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="" disabled>Select outcome</option>
                <option value="Completed & Ready to Enroll">Ready to Enroll</option>
                <option value="Completed & Considering">Still Considering</option>
                <option value="Fee Negotiation Ongoing">Fee Negotiation</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Absent / No Show">No Show</option>
              </select>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="font-semibold text-slate-700 dark:text-slate-300 text-sm block">
              Notes *
            </label>
            <textarea
              v-model="form.remarks"
              rows="3"
              required
              placeholder="Discussion points, fee details, batch preferences..."
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
            ></textarea>
          </div>
        </div>
      </template>

      <!-- ================= 4. REMARK FIELDS ================= -->
      <template v-else-if="form.type === 'note'">
        <div class="space-y-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
          <div class="space-y-1.5">
            <label class="font-semibold text-slate-700 dark:text-slate-300 text-sm block">
              Remark Type *
            </label>
            <select
              v-model="form.remarkType"
              required
              class="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="General">General Note</option>
              <option value="Academic Query">Academic Query</option>
              <option value="Financial & Fees">Fees Discussion</option>
              <option value="Parent Concern">Parent Concern</option>
              <option value="Documentation">Documentation</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="font-semibold text-slate-700 dark:text-slate-300 text-sm block">
              Your Note *
            </label>
            <textarea
              v-model="form.remarks"
              rows="4"
              required
              placeholder="Write your remark or note here..."
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
            ></textarea>
          </div>
        </div>
      </template>

      <!-- ================= NEXT FOLLOW-UP (Simplified) ================= -->
      <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <PhCalendar :size="16" weight="bold" class="text-primary" />
            <span class="font-bold text-sm text-slate-800 dark:text-slate-100">Next Follow-up</span>
          </div>
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <span class="text-xs font-medium text-slate-500">{{ form.scheduleFollowUp ? 'Scheduled' : 'Not Set' }}</span>
            <button
              type="button"
              @click="form.scheduleFollowUp = !form.scheduleFollowUp"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
              :class="form.scheduleFollowUp ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200"
                :class="form.scheduleFollowUp ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </label>
        </div>

        <template v-if="form.scheduleFollowUp">
          <!-- Quick-Pick Buttons -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="quick in quickFollowUps"
              :key="quick.label"
              type="button"
              @click="applyQuickFollowUp(quick)"
              class="px-3 py-2 rounded-lg text-xs font-semibold border transition-all"
              :class="isQuickActive(quick)
                ? 'bg-primary/10 text-primary border-primary'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/40'"
            >
              {{ quick.label }}
            </button>
          </div>

          <!-- Manual Date & Time -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Date</label>
              <input
                v-model="form.followUpDate"
                type="date"
                required
                class="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Time</label>
              <input
                v-model="form.followUpTime"
                type="time"
                required
                class="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <!-- Assigned Staff (only for admins) -->
          <div v-if="canAssignLeads" class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Assign To</label>
            <select
              v-model="form.assignedToStaffId"
              class="w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Current Staff (Me)</option>
              <option v-for="s in staffList" :key="s._id || s.id" :value="s._id || s.id">
                {{ s.firstName }} {{ s.lastName || '' }}
              </option>
            </select>
          </div>
        </template>
      </div>

      <p v-if="error" class="text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900">
        {{ error }}
      </p>
    </form>

    <template #footer v-if="!loading && lead">
      <button
        type="button"
        class="h-11 px-5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
        :disabled="saving"
        @click="$emit('close')"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="log-lead-update-form"
        class="h-11 px-6 rounded-xl bg-primary text-white text-sm font-bold flex items-center gap-2 shadow-xs hover:opacity-90 transition-opacity disabled:opacity-50"
        :disabled="saving || isSubmitDisabled"
      >
        <span v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <PhPaperPlaneTilt v-else :size="16" weight="bold" />
        <span>{{ saving ? "Saving..." : "Save Update" }}</span>
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
  PhCalendar,
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
import {
  EDUCATION_STATUSES,
  EDUCATION_SUB_STATUS_MAP,
  normalizeStatus,
} from '../constants/leadStatusConfig';

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
  status: 'interested',
  subStatus: '',
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

// Quick follow-up presets
const quickFollowUps = [
  { label: 'Tomorrow', days: 1, time: '11:00' },
  { label: 'In 2 Days', days: 2, time: '11:00' },
  { label: 'In 3 Days', days: 3, time: '11:00' },
  { label: 'Next Week', days: 7, time: '10:00' },
  { label: 'In 2 Weeks', days: 14, time: '10:00' },
];

function applyQuickFollowUp(quick) {
  const d = new Date();
  d.setDate(d.getDate() + quick.days);
  form.value.followUpDate = d.toISOString().split('T')[0];
  form.value.followUpTime = quick.time;
}

function isQuickActive(quick) {
  const d = new Date();
  d.setDate(d.getDate() + quick.days);
  return form.value.followUpDate === d.toISOString().split('T')[0] && form.value.followUpTime === quick.time;
}

const canAssignLeads = computed(() => {
  return Boolean(store.getters["permissions/hasCapability"]?.("leads.assign"));
});

const drawerSubtitle = computed(() => {
  if (!lead.value) return 'Record update';
  return `Record update for ${lead.value.firstName} ${lead.value.lastName || ''}`.trim();
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
      form.value.message = `Hello ${name}, thank you for your interest in ${course}. Here is our detailed brochure and fee structure. Please let us know if you'd like to schedule a trial demo.`;
      break;
    case 'admission_followup':
      form.value.message = `Hi ${name}, following up on our recent discussion regarding your admission for ${course}. Our upcoming batch commences shortly. Would you like to confirm your enrollment today?`;
      break;
    case 'demo_invite':
      form.value.message = `Dear ${name}, we have arranged a complimentary counselling and demo session for ${course}. Please reply to confirm your preferred time slot.`;
      break;
    case 'scholarship_test':
      form.value.message = `Greetings ${name}! Registrations are now open for the Merit Assessment & Scholarship test. Outstanding performers receive up to 50% fee concessions.`;
      break;
    default:
      form.value.message = '';
  }
}

async function loadSupportData() {
  try {
    const [classesRes, staffRes] = await Promise.all([
      fetchEducationClasses({ limit: 100 }).catch(() => ({ data: [] })),
      apiClient.get('/users', { params: { limit: 200, status: 'active' }, silent: true, skipErrorToast: true }).catch(() => ({ data: { data: [] } })),
    ]);
    classesList.value = classesRes.data || [];
    const fetchedStaff = staffRes.data?.data || [];
    if (fetchedStaff.length > 0) {
      staffList.value = fetchedStaff;
    } else {
      const user = store.state.auth?.currentUser;
      if (user) {
        staffList.value = [{
          _id: user._id || user.id,
          id: user._id || user.id,
          firstName: user.firstName || 'Current',
          lastName: user.lastName || 'Staff',
        }];
      }
    }
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

const availableSubStatuses = computed(() => {
  return EDUCATION_SUB_STATUS_MAP[form.value.status] || [];
});

function handleLogStatusChange() {
  const subs = EDUCATION_SUB_STATUS_MAP[form.value.status] || [];
  form.value.subStatus = subs[0] || '';
}

function resetFormForLead(currentLead) {
  const normStatus = normalizeStatus(currentLead?.status);
  form.value.status = normStatus;
  const validSubs = EDUCATION_SUB_STATUS_MAP[normStatus] || [];
  form.value.subStatus = currentLead?.subStatus && validSubs.includes(currentLead.subStatus)
    ? currentLead.subStatus
    : (validSubs[0] || '');
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
    }

    // 1. Log Activity Record
    await logEducationLeadActivity(targetLeadId, payload);

    // 2. Update Lead Stage & Sub-Status
    const leadUpdates = {};
    if (form.value.status) {
      leadUpdates.status = form.value.status;
    }
    if (form.value.subStatus) {
      leadUpdates.subStatus = form.value.subStatus;
    }
    if (form.value.scheduleFollowUp && payload.nextFollowUpAt) {
      leadUpdates.nextFollowUpAt = payload.nextFollowUpAt;
    }
    if (canAssignLeads.value && form.value.assignedToStaffId && form.value.assignedToStaffId !== (lead.value?.assignedTo?._id || lead.value?.assignedTo)) {
      leadUpdates.assignedTo = form.value.assignedToStaffId;
    }
    leadUpdates.notesRemarks = description;

    await updateEducationLead(targetLeadId, leadUpdates);

    store.dispatch('notifications/triggerToast', {
      message: 'Update saved successfully!',
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
</script>
