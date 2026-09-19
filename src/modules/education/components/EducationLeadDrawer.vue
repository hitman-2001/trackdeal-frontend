<template>
  <AppDrawer
    :isOpen="isOpen"
    title="Student Lead Details"
    :subtitle="drawerSubtitle"
    width="580px"
    @close="$emit('close')"
  >
    <div v-if="loading" class="py-16 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
      <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span>Loading student lead details...</span>
    </div>

    <div v-else-if="lead" class="space-y-4 text-xs pb-4">
      <!-- Read-Only Student Dossier Card -->
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-default space-y-3">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">
                {{ lead.firstName }} {{ lead.lastName || '' }}
              </h3>
              <!-- Stage Badge -->
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
                :class="statusBadgeClass(lead.status)"
              >
                {{ formatStatus(lead.status) }}
              </span>
              <!-- Temperature Badge -->
              <span
                v-if="lead.leadTemperature"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                :class="tempBadgeClass(lead.leadTemperature)"
              >
                {{ tempLabel(lead.leadTemperature) }}
              </span>
            </div>

            <!-- Contacts line -->
            <div class="flex items-center gap-3 text-slate-500 text-xs mt-1 flex-wrap">
              <a
                v-if="lead.mobile"
                :href="'tel:' + lead.mobile"
                class="font-mono text-emerald-600 hover:underline font-semibold flex items-center gap-1"
                title="Click to call"
              >
                <PhPhone :size="12" /> {{ lead.mobile }}
              </a>
              <span v-if="lead.email" class="text-slate-400">· {{ lead.email }}</span>
              <span
                v-if="lead.classInterestId?.name"
                class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-semibold text-[10px]"
              >
                {{ lead.classInterestId.name }}
              </span>
            </div>
          </div>
        </div>

        <!-- Secondary Details: Parent, Staff, Source -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400">
          <div>
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Parent / Guardian</span>
            <span class="font-medium text-slate-800 dark:text-slate-200">
              {{ lead.parentName || '—' }}
              <a
                v-if="lead.parentMobile"
                :href="'tel:' + lead.parentMobile"
                class="text-emerald-600 ml-1 hover:underline font-mono"
              >
                ({{ lead.parentMobile }})
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
              {{ lead.source ? lead.source.replace(/_/g, ' ') : '—' }}
            </span>
          </div>
        </div>

        <!-- Next Follow-up Alert (if scheduled) -->
        <div
          v-if="upcomingFollowUp"
          class="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
        >
          <PhCalendarCheck :size="15" weight="bold" class="text-amber-600 shrink-0" />
          <div class="text-[11px]">
            <strong>Scheduled Follow-up:</strong> {{ formatDateTime(upcomingFollowUp.scheduledAt) }}
            <span v-if="upcomingFollowUp.notes" class="text-amber-700 dark:text-amber-300 ml-1">
              — {{ upcomingFollowUp.notes }}
            </span>
          </div>
        </div>
      </div>

      <!-- Chronological Conversation History & Touchpoints (Strictly View-Only) -->
      <div class="space-y-3 pt-1">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-2">
            <h4 class="font-heading font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <PhClockCounterClockwise :size="14" weight="bold" class="text-primary" />
              <span>Conversation & Touchpoint History</span>
            </h4>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {{ filteredTimeline.length }}
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

        <!-- Empty State -->
        <div v-if="filteredTimeline.length === 0" class="text-center py-12 px-4 bg-surface rounded-xl border border-default">
          <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
            <PhNotePencil :size="18" />
          </div>
          <p class="font-bold text-xs text-slate-700 dark:text-slate-300">No conversation records yet</p>
          <p class="text-[11px] text-slate-400 mt-0.5">
            Past calls, WhatsApp messages, counselling sessions, and remarks will appear here.
          </p>
        </div>

        <!-- Grouped Activity Cards -->
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
                class="bg-surface rounded-xl border border-default p-3.5 shadow-2xs relative border-l-4"
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

                    <span
                      v-if="item.customerResponse || item.summary !== item.description"
                      class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {{ item.customerResponse || item.summary }}
                    </span>

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

                <!-- Card Remarks -->
                <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-8 mt-1 whitespace-pre-line font-normal">
                  {{ item.description || item.summary || item.content || item.notes }}
                </p>

                <!-- Next touchpoint pill if scheduled -->
                <div
                  v-if="item.nextFollowUpAt"
                  class="mt-2 ml-8 flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60 w-fit"
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

    <div v-else class="py-12 text-center text-slate-400 text-xs">
      Student lead not found.
    </div>

    <template #footer>
      <button
        type="button"
        class="btn btn-secondary btn-sm"
        @click="$emit('close')"
      >
        Close
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import {
  PhPhone,
  PhPhoneCall,
  PhWhatsappLogo,
  PhChalkboardTeacher,
  PhNotePencil,
  PhBell,
  PhCalendarCheck,
  PhUser,
  PhClockCounterClockwise,
} from '@phosphor-icons/vue';
import AppDrawer from '@/components/AppDrawer.vue';
import { fetchEducationLead, fetchEducationLeadActivityCenter } from '../api/endpoints';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  leadId: { type: String, default: '' },
});

const emit = defineEmits(['close']);

const loading = ref(false);
const lead = ref(null);
const activityData = ref({ activities: [], notes: [], followUps: [] });
const activeFilter = ref('all');

const drawerSubtitle = computed(() => {
  if (!lead.value) return 'Inquiry dossier and conversation history';
  return `Inquiry profile and conversation history for ${lead.value.firstName} ${lead.value.lastName || ''}`.trim();
});

const staffName = computed(() => {
  if (lead.value?.assignedTo) {
    return `${lead.value.assignedTo.firstName || ''} ${lead.value.assignedTo.lastName || ''}`.trim() || 'Assigned Staff';
  }
  return 'Unassigned';
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

async function loadData() {
  if (!props.leadId) return;
  loading.value = true;
  try {
    const [leadRes, actRes] = await Promise.all([
      fetchEducationLead(props.leadId),
      fetchEducationLeadActivityCenter(props.leadId),
    ]);
    lead.value = leadRes.data || leadRes;
    activityData.value = actRes.data || actRes || { activities: [], notes: [], followUps: [] };
  } catch (err) {
    console.error('Failed to load lead details:', err);
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.isOpen,
  (val) => {
    if (val && props.leadId) {
      loadData();
    } else {
      lead.value = null;
    }
  },
  { immediate: true },
);

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
  if (t === 'hot') return '🔥 Hot';
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
