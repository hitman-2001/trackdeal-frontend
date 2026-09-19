<template>
  <div class="education-activity-center flex flex-col h-full">
    <!-- Top Loading State -->
    <div v-if="loading" class="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
      <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span>Loading conversation records...</span>
    </div>

    <div v-else class="space-y-4 text-xs">
      <!-- 1. STUDENT SUMMARY & QUICK ACTION STRIP -->
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-default space-y-3">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">
                {{ studentLead.firstName }} {{ studentLead.lastName || '' }}
              </h3>
              <!-- Stage Badge -->
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
                :class="statusBadgeClass(studentLead.status)"
              >
                {{ formatStatus(studentLead.status) }}
              </span>
              <!-- Temperature Badge -->
              <span
                v-if="studentLead.leadTemperature"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                :class="tempBadgeClass(studentLead.leadTemperature)"
              >
                {{ tempLabel(studentLead.leadTemperature) }}
              </span>
            </div>

            <!-- Contacts line -->
            <div class="flex items-center gap-3 text-slate-500 text-xs mt-1 flex-wrap">
              <span class="font-mono text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                <PhPhone :size="12" /> {{ studentLead.mobile }}
              </span>
              <span v-if="studentLead.email" class="text-slate-400">· {{ studentLead.email }}</span>
              <span v-if="studentLead.classInterestId?.name" class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-semibold text-[10px]">
                {{ studentLead.classInterestId?.name }}
              </span>
            </div>
          </div>

          <!-- Quick Action Buttons for Staff -->
          <div class="flex items-center gap-1.5 shrink-0 flex-wrap">
            <a
              v-if="studentLead.mobile"
              :href="'tel:' + studentLead.mobile"
              @click="selectChannel('call')"
              class="btn-sm btn-secondary h-7 px-2.5 text-[11px] font-bold gap-1 flex items-center text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
              title="Click to call student"
            >
              <PhPhoneCall :size="13" weight="bold" />
              <span>Call</span>
            </a>

            <a
              v-if="studentLead.mobile"
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              @click="selectChannel('whatsapp')"
              class="btn-sm btn-secondary h-7 px-2.5 text-[11px] font-bold gap-1 flex items-center text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
              title="Chat on WhatsApp"
            >
              <PhWhatsappLogo :size="14" weight="fill" />
              <span>WhatsApp</span>
            </a>

            <button
              type="button"
              @click="$emit('openReminder')"
              class="btn-sm btn-secondary h-7 px-2.5 text-[11px] font-bold gap-1 flex items-center text-amber-600 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
              title="Set follow-up reminder"
            >
              <PhBell :size="13" weight="bold" />
              <span>Reminder</span>
            </button>

            <button
              type="button"
              @click="$emit('openEdit')"
              class="btn-sm btn-secondary h-7 px-2.5 text-[11px] font-bold gap-1 flex items-center text-blue-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
              title="Edit student lead"
            >
              <PhPencilSimple :size="13" weight="bold" />
              <span>Edit</span>
            </button>

            <button
              v-if="studentLead.status !== 'enrolled' && studentLead.status !== 'converted'"
              type="button"
              @click="$emit('openEnroll')"
              class="btn-sm btn-primary h-7 px-2.5 text-[11px] font-bold gap-1 flex items-center"
              title="Enroll as student"
            >
              <PhCheckCircle :size="13" weight="bold" />
              <span>Enroll</span>
            </button>
          </div>
        </div>

        <!-- Secondary Details: Parent & Staff -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400">
          <div>
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Parent / Guardian</span>
            <span class="font-medium text-slate-800 dark:text-slate-200">
              {{ studentLead.parentName || '—' }}
              <a
                v-if="studentLead.parentMobile"
                :href="'tel:' + studentLead.parentMobile"
                class="text-emerald-600 ml-1 hover:underline font-mono"
              >
                ({{ studentLead.parentMobile }})
              </a>
            </span>
          </div>

          <div>
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Assigned Staff</span>
            <span class="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <PhUser :size="11" class="text-slate-400" />
              {{ staffName }}
            </span>
          </div>

          <div>
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Inquiry Source</span>
            <span class="font-medium capitalize text-slate-800 dark:text-slate-200">
              {{ studentLead.source ? studentLead.source.replace(/_/g, ' ') : '—' }}
            </span>
          </div>
        </div>

        <!-- Next Scheduled Follow-up Banner -->
        <div
          v-if="upcomingFollowUp"
          class="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
        >
          <div class="flex items-center gap-2">
            <PhCalendarCheck :size="15" weight="bold" class="text-amber-600 shrink-0" />
            <div class="text-[11px]">
              <strong>Next Follow-up:</strong> {{ formatDateTime(upcomingFollowUp.scheduledAt) }}
              <span v-if="upcomingFollowUp.notes" class="text-amber-700 dark:text-amber-300 ml-1">
                — {{ upcomingFollowUp.notes }}
              </span>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('openReminder')"
            class="text-[10px] font-bold text-amber-700 dark:text-amber-300 hover:underline shrink-0"
          >
            Reschedule
          </button>
        </div>
      </div>

      <!-- 2. CONVERSATION COMPOSER: LOG REMARK / CALL / WHATSAPP -->
      <div class="p-4 rounded-xl bg-surface border border-default shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="font-heading font-bold text-xs flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
            <PhPaperPlaneTilt :size="14" weight="bold" class="text-primary" />
            <span>Log Conversation / Add Remark</span>
          </h4>
          <span class="text-[10px] text-slate-400">Records logged with your staff name & timestamp</span>
        </div>

        <!-- Channel Select Buttons -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            v-for="ch in channels"
            :key="ch.id"
            @click="logForm.type = ch.id"
            class="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            :class="logForm.type === ch.id ? 'bg-primary text-white shadow-2xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'"
          >
            <component :is="ch.icon" :size="13" weight="bold" />
            <span>{{ ch.label }}</span>
          </button>
        </div>

        <!-- Quick Outcome Tags -->
        <div class="space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Conversation Outcome</span>
          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              v-for="tag in outcomeTags"
              :key="tag"
              @click="selectOutcome(tag)"
              class="px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors"
              :class="logForm.outcome === tag ? 'bg-indigo-50 border-indigo-400 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold' : 'border-default text-slate-500 hover:border-slate-400'"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <!-- Remarks Textarea -->
        <div class="space-y-1">
          <label class="text-[10px] uppercase font-bold text-slate-400 block">
            Conversation Remarks / Notes *
          </label>
          <textarea
            v-model="logForm.remarks"
            rows="3"
            required
            placeholder="Record what was discussed with student/parent (inquiry details, queries asked, fee discussion, promised follow-up)..."
            class="w-full bg-slate-50 dark:bg-slate-800/70 border border-default rounded-xl px-3 py-2 text-xs outline-none focus:border-primary resize-none"
          ></textarea>
        </div>

        <!-- Quick Status & Temperature Updaters -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <label class="space-y-1 font-medium text-slate-600 dark:text-slate-300 text-[11px]">
            <span>Update Stage</span>
            <select
              v-model="logForm.status"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-primary"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="follow_up">Follow Up</option>
              <option value="meeting_scheduled">Meeting / Demo Scheduled</option>
              <option value="qualified">Qualified</option>
              <option value="application_trial">Application / Trial</option>
              <option value="on_hold">On Hold</option>
              <option value="lost">Lost</option>
            </select>
          </label>

          <label class="space-y-1 font-medium text-slate-600 dark:text-slate-300 text-[11px]">
            <span>Lead Interest Level</span>
            <select
              v-model="logForm.temperature"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-primary"
            >
              <option value="hot">🔥 Hot (High Intent)</option>
              <option value="warm">⚡ Warm (In Discussion)</option>
              <option value="cold">❄ Cold (Low Interest)</option>
            </select>
          </label>
        </div>

        <!-- Inline Follow-up Scheduler Toggle -->
        <div class="pt-1">
          <label class="flex items-center gap-2 cursor-pointer select-none text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              v-model="logForm.setFollowUp"
              class="rounded border-default text-primary focus:ring-0"
            />
            <span>Schedule next follow-up reminder</span>
          </label>

          <div v-if="logForm.setFollowUp" class="mt-2 pl-5 space-y-2">
            <input
              v-model="logForm.followUpDateTime"
              type="datetime-local"
              class="w-full sm:w-64 bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-1.5 text-xs outline-none focus:border-primary"
            />
          </div>
        </div>

        <p v-if="logError" class="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-200">
          {{ logError }}
        </p>

        <!-- Submit Button -->
        <div class="flex justify-end pt-1">
          <button
            type="button"
            @click="submitLog"
            :disabled="logging || !logForm.remarks.trim()"
            class="btn btn-primary btn-sm px-4 h-8 text-xs font-bold gap-1.5 flex items-center shadow-xs"
          >
            <PhPaperPlaneTilt :size="13" weight="bold" />
            <span>{{ logging ? "Saving Record..." : "Log Conversation Record" }}</span>
          </button>
        </div>
      </div>

      <!-- 3. CHRONOLOGICAL CONVERSATION & TOUCHPOINTS TIMELINE -->
      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-2">
            <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <PhClockCounterClockwise :size="14" weight="bold" class="text-primary" />
              <span>Conversation History</span>
            </h4>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {{ filteredTimeline.length }} records
            </span>
          </div>

          <!-- Channel Filter Tabs -->
          <div class="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <button
              v-for="tab in filterTabs"
              :key="tab.key"
              @click="activeFilter = tab.key"
              class="px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors"
              :class="activeFilter === tab.key ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
            >
              {{ tab.label }} ({{ tab.count }})
            </button>
          </div>
        </div>

        <!-- Timeline Cards Container -->
        <div v-if="filteredTimeline.length === 0" class="text-center py-10 px-4 bg-surface rounded-xl border border-default">
          <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
            <PhNotePencil :size="18" />
          </div>
          <p class="font-bold text-xs text-slate-700 dark:text-slate-300">No conversation history yet</p>
          <p class="text-[11px] text-slate-400 mt-0.5">
            Log your first call, WhatsApp discussion, or remark above to build this student's inquiry timeline.
          </p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(group, dateLabel) in groupedTimeline"
            :key="dateLabel"
            class="space-y-2.5"
          >
            <!-- Date Divider -->
            <div class="flex items-center gap-2.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                {{ dateLabel }}
              </span>
              <div class="flex-1 border-t border-default"></div>
            </div>

            <!-- Interaction Cards -->
            <div class="space-y-2 pl-1">
              <div
                v-for="item in group"
                :key="item._id || item.id"
                class="bg-surface rounded-xl border border-default p-3.5 shadow-2xs hover:shadow-xs transition-all relative border-l-4"
                :class="getCardBorderColor(item)"
              >
                <!-- Card Header -->
                <div class="flex items-start justify-between gap-2 mb-1.5">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span
                      class="w-6 h-6 rounded-md flex items-center justify-center text-xs"
                      :class="getChannelIconBg(item)"
                    >
                      <component :is="getChannelIcon(item)" :size="13" weight="bold" />
                    </span>
                    <span class="font-bold text-xs text-slate-800 dark:text-slate-100">
                      {{ getChannelTitle(item) }}
                    </span>

                    <!-- Outcome tag if present -->
                    <span
                      v-if="item.customerResponse || item.summary !== item.description"
                      class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {{ item.customerResponse || item.summary }}
                    </span>

                    <!-- Status badge -->
                    <span
                      v-if="item.status && item.status !== 'completed'"
                      class="px-1.5 py-0.5 rounded text-[9px] font-bold capitalize bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    >
                      {{ item.status }}
                    </span>
                  </div>

                  <span class="text-[10px] text-slate-400 font-medium shrink-0">
                    {{ formatTime(item.activityDate || item.createdAt || item.scheduledAt) }}
                  </span>
                </div>

                <!-- Card Content / Remarks -->
                <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-8 mt-1 whitespace-pre-line font-normal">
                  {{ item.description || item.summary || item.content || item.notes }}
                </p>

                <!-- Next touchpoint pill if scheduled from this activity -->
                <div
                  v-if="item.nextFollowUpAt"
                  class="mt-2.5 ml-8 flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60 w-fit"
                >
                  <PhCalendarCheck :size="12" weight="bold" />
                  <span>Next touchpoint: {{ formatDateTime(item.nextFollowUpAt) }}</span>
                </div>

                <!-- Footer: Staff Attribution -->
                <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 pl-8 flex items-center justify-between text-[10px] text-slate-400">
                  <span class="flex items-center gap-1 font-medium">
                    <PhUser :size="11" />
                    <span>Logged by: {{ getAuthorName(item) }}</span>
                  </span>
                  <span class="text-[10px] text-slate-400">
                    {{ formatRelativeTime(item.activityDate || item.createdAt || item.scheduledAt) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import {
  PhPhone,
  PhPhoneCall,
  PhWhatsappLogo,
  PhBell,
  PhPencilSimple,
  PhCheckCircle,
  PhCalendarCheck,
  PhUser,
  PhPaperPlaneTilt,
  PhClockCounterClockwise,
  PhNotePencil,
  PhChalkboardTeacher,
} from '@phosphor-icons/vue';
import {
  fetchEducationLead,
  fetchEducationLeadActivityCenter,
  logEducationLeadActivity,
  updateEducationLead,
} from '../api/endpoints';

const props = defineProps({
  leadId: { type: String, required: true },
  lead: { type: Object, default: null },
});

const emit = defineEmits(['openReminder', 'openEdit', 'openEnroll', 'leadUpdated']);

const store = useStore();

const loading = ref(false);
const logging = ref(false);
const logError = ref('');
const studentLead = ref(props.lead || {});
const activityData = ref({ activities: [], notes: [], followUps: [], summary: {} });

const activeFilter = ref('all');

// Channel Selector for Logger
const channels = [
  { id: 'call', label: 'Phone Call', icon: PhPhoneCall },
  { id: 'whatsapp', label: 'WhatsApp Chat', icon: PhWhatsappLogo },
  { id: 'meeting', label: 'Counselling / Demo', icon: PhChalkboardTeacher },
  { id: 'note', label: 'Staff Remark', icon: PhNotePencil },
];

const outcomeTags = [
  'Connected & Interested',
  'Callback Requested',
  'Demo Scheduled',
  'Fee Structure Shared',
  'Follow-up Required',
  'Busy / Not Reachable',
  'Not Interested',
];

const logForm = ref({
  type: 'call',
  outcome: '',
  remarks: '',
  status: 'contacted',
  temperature: 'warm',
  setFollowUp: false,
  followUpDateTime: defaultNextFollowUp(),
});

function defaultNextFollowUp() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const z = (n) => (n < 10 ? '0' : '') + n;
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`;
}

const staffName = computed(() => {
  if (studentLead.value.assignedTo) {
    return `${studentLead.value.assignedTo.firstName || ''} ${studentLead.value.assignedTo.lastName || ''}`.trim() || 'Assigned Staff';
  }
  return 'Unassigned';
});

const whatsappUrl = computed(() => {
  const num = String(studentLead.value.mobile || '').replace(/\D/g, '');
  const clean = num.startsWith('91') || num.length > 10 ? num : `91${num}`;
  const studentName = studentLead.value.firstName || 'Student';
  const text = encodeURIComponent(`Hello ${studentName}, following up regarding your admission inquiry.`);
  return `https://wa.me/${clean}?text=${text}`;
});

const upcomingFollowUp = computed(() => {
  const list = activityData.value.followUps || [];
  const now = new Date();
  return list
    .filter((f) => f.status === 'scheduled' && new Date(f.scheduledAt) > now)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0] || null;
});

// Unified Timeline
const timelineItems = computed(() => {
  const items = [];
  (activityData.value.activities || []).forEach((a) => {
    items.push({ ...a, _type: a.type || 'activity' });
  });
  (activityData.value.notes || []).forEach((n) => {
    items.push({ ...n, _type: 'note', type: 'note', summary: n.content });
  });
  (activityData.value.followUps || []).forEach((f) => {
    items.push({ ...f, _type: 'follow_up', type: 'reminder', summary: f.notes });
  });

  return items.sort((a, b) => {
    const da = new Date(a.activityDate || a.createdAt || a.scheduledAt || 0);
    const db = new Date(b.activityDate || b.createdAt || b.scheduledAt || 0);
    return db - da;
  });
});

const filterTabs = computed(() => {
  const all = timelineItems.value;
  return [
    { key: 'all', label: 'All', count: all.length },
    { key: 'call', label: 'Calls', count: all.filter((i) => i.type === 'call' || i.type === 'phone_call').length },
    { key: 'whatsapp', label: 'WhatsApp', count: all.filter((i) => i.type === 'whatsapp').length },
    { key: 'meeting', label: 'Counselling', count: all.filter((i) => i.type === 'meeting').length },
    { key: 'note', label: 'Remarks', count: all.filter((i) => i.type === 'note').length },
    { key: 'reminder', label: 'Reminders', count: all.filter((i) => i.type === 'reminder' || i.type === 'follow_up').length },
  ];
});

const filteredTimeline = computed(() => {
  if (activeFilter.value === 'all') return timelineItems.value;
  if (activeFilter.value === 'call') {
    return timelineItems.value.filter((i) => i.type === 'call' || i.type === 'phone_call');
  }
  return timelineItems.value.filter((i) => i.type === activeFilter.value);
});

const groupedTimeline = computed(() => {
  const groups = {};
  filteredTimeline.value.forEach((item) => {
    const rawDate = item.activityDate || item.createdAt || item.scheduledAt;
    let label = 'Other';
    if (rawDate) {
      const d = new Date(rawDate);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (d.toDateString() === today.toDateString()) {
        label = 'Today';
      } else if (d.toDateString() === yesterday.toDateString()) {
        label = 'Yesterday';
      } else {
        label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });
  return groups;
});

function selectChannel(ch) {
  logForm.value.type = ch;
}

function selectOutcome(tag) {
  logForm.value.outcome = tag;
  if (!logForm.value.remarks) {
    logForm.value.remarks = `${tag}: `;
  }
}

async function loadData() {
  if (!props.leadId) return;
  loading.value = true;
  try {
    const [leadRes, actRes] = await Promise.all([
      fetchEducationLead(props.leadId),
      fetchEducationLeadActivityCenter(props.leadId),
    ]);
    studentLead.value = leadRes.data || leadRes || {};
    activityData.value = actRes.data || actRes || { activities: [], notes: [], followUps: [] };

    // Set initial composer defaults from lead
    logForm.value.status = studentLead.value.status || 'contacted';
    logForm.value.temperature = studentLead.value.leadTemperature || 'warm';
  } catch (err) {
    console.error('Failed to load lead conversation data:', err);
  } finally {
    loading.value = false;
  }
}

watch(() => props.leadId, () => {
  loadData();
});

watch(() => props.lead, (newVal) => {
  if (newVal) studentLead.value = newVal;
});

onMounted(() => {
  loadData();
});

async function submitLog() {
  if (!logForm.value.remarks.trim()) {
    logError.value = 'Please enter conversation remarks.';
    return;
  }

  logging.value = true;
  logError.value = '';

  try {
    const channelLabel = channels.find((c) => c.id === logForm.value.type)?.label || 'Interaction';
    const summary = logForm.value.outcome || `${channelLabel} record`;

    const payload = {
      type: logForm.value.type,
      summary,
      description: logForm.value.remarks.trim(),
      customerResponse: logForm.value.outcome,
      status: 'completed',
      activityDate: new Date().toISOString(),
    };

    if (logForm.value.setFollowUp && logForm.value.followUpDateTime) {
      payload.nextFollowUpAt = new Date(logForm.value.followUpDateTime).toISOString();
    }

    // 1. Log activity record with staff attribution
    await logEducationLeadActivity(props.leadId, payload);

    // 2. Update lead status and temperature if changed
    const leadUpdates = {};
    if (logForm.value.status && logForm.value.status !== studentLead.value.status) {
      leadUpdates.status = logForm.value.status;
    }
    if (logForm.value.temperature && logForm.value.temperature !== studentLead.value.leadTemperature) {
      leadUpdates.leadTemperature = logForm.value.temperature;
    }
    if (payload.nextFollowUpAt) {
      leadUpdates.nextFollowUpAt = payload.nextFollowUpAt;
    }
    leadUpdates.notesRemarks = logForm.value.remarks.trim();

    await updateEducationLead(props.leadId, leadUpdates);

    store.dispatch('notifications/triggerToast', {
      message: 'Conversation recorded and student history updated.',
      type: 'success',
    });

    // Reset remarks and outcome
    logForm.value.remarks = '';
    logForm.value.outcome = '';
    logForm.value.setFollowUp = false;

    // Reload timeline & notify parent
    await loadData();
    emit('leadUpdated');
  } catch (err) {
    logError.value = err.response?.data?.message || err.message || 'Unable to save conversation record.';
  } finally {
    logging.value = false;
  }
}

// Formatting helpers
function formatStatus(st) {
  return String(st || 'new').replace(/_/g, ' ');
}

function statusBadgeClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'enrolled' || s === 'converted') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
  if (s === 'new' || s === 'assigned') return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
  if (s === 'lost') return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
  return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
}

function tempLabel(t) {
  if (t === 'hot') return '🔥 Hot Intent';
  if (t === 'cold') return '❄ Cold';
  return '⚡ Warm';
}

function tempBadgeClass(t) {
  if (t === 'hot') return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300';
  if (t === 'cold') return 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300';
  return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300';
}

function getChannelTitle(item) {
  if (item.type === 'call' || item.type === 'phone_call') return 'Phone Call';
  if (item.type === 'whatsapp') return 'WhatsApp Message';
  if (item.type === 'meeting') return 'Counselling / Demo Class';
  if (item.type === 'reminder' || item.type === 'follow_up') return 'Follow-up Reminder';
  if (item.type === 'note') return 'Staff Remark';
  return item.type ? item.type.replace(/_/g, ' ') : 'Touchpoint';
}

function getChannelIcon(item) {
  if (item.type === 'call' || item.type === 'phone_call') return PhPhoneCall;
  if (item.type === 'whatsapp') return PhWhatsappLogo;
  if (item.type === 'meeting') return PhChalkboardTeacher;
  if (item.type === 'reminder' || item.type === 'follow_up') return PhBell;
  return PhNotePencil;
}

function getChannelIconBg(item) {
  if (item.type === 'call' || item.type === 'phone_call') return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300';
  if (item.type === 'whatsapp') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
  if (item.type === 'meeting') return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300';
  if (item.type === 'reminder' || item.type === 'follow_up') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

function getCardBorderColor(item) {
  if (item.type === 'call' || item.type === 'phone_call') return 'border-l-blue-500';
  if (item.type === 'whatsapp') return 'border-l-emerald-500';
  if (item.type === 'meeting') return 'border-l-purple-500';
  if (item.type === 'reminder' || item.type === 'follow_up') return 'border-l-amber-500';
  return 'border-l-slate-400';
}

function getAuthorName(item) {
  const p = item.performedBy || item.createdBy;
  if (p && (p.firstName || p.lastName)) {
    return `${p.firstName || ''} ${p.lastName || ''}`.trim();
  }
  return 'Staff Member';
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
</script>

