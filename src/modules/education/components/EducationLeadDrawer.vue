<template>
  <AppDrawer
    :isOpen="isOpen"
    title="Student Lead"
    :subtitle="lead ? `${lead.firstName} ${lead.lastName || ''}`.trim() : 'Inquiry details'"
    width="620px"
    @close="$emit('close')"
  >
    <div v-if="loading" class="py-16 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
      <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span>Loading student lead details...</span>
    </div>

    <div v-else-if="lead" class="space-y-5 text-xs pb-4">
      <!-- 1. Lead Identity Card with Quick Actions (Section 11) -->
      <div class="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3.5">
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Student Lead</span>
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {{ lead.firstName }} {{ lead.lastName || '' }}
              </h2>
              <StatusBadge :status="lead.status" />
              <span
                v-if="lead.leadTemperature"
                class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border"
                :class="tempBadgeClass(lead.leadTemperature)"
              >
                {{ tempLabel(lead.leadTemperature) }}
              </span>
            </div>

            <!-- Phone & Class -->
            <div class="flex items-center gap-2.5 text-slate-600 dark:text-slate-300 text-xs pt-0.5 flex-wrap">
              <a
                v-if="lead.mobile"
                :href="'tel:' + lead.mobile"
                class="font-mono text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
                title="Click to call"
              >
                <PhPhone :size="13" weight="bold" />
                <span>{{ lead.mobile }}</span>
              </a>
              <span
                v-if="lead.classInterestId?.name"
                class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold text-[11px] border border-blue-200/60 dark:border-blue-800/60"
              >
                {{ lead.classInterestId.name }}
              </span>
            </div>
          </div>
        </div>

        <!-- Mini Key Meta Summary -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70 text-[11px]">
          <div>
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Parent / Guardian</span>
            <span class="font-medium text-slate-800 dark:text-slate-200 truncate block">
              {{ lead.parentName || '—' }}
            </span>
          </div>

          <div>
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Assigned Staff</span>
            <span class="font-medium text-slate-800 dark:text-slate-200 truncate flex items-center gap-1">
              <PhUser :size="12" class="text-slate-400 shrink-0" />
              <span class="truncate">{{ staffName }}</span>
            </span>
          </div>

          <div>
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Inquiry Source</span>
            <span class="font-medium capitalize text-slate-800 dark:text-slate-200 truncate block">
              {{ lead.source ? lead.source.replace(/_/g, ' ') : '—' }}
            </span>
          </div>
        </div>

        <!-- Quick Action Buttons (Section 11: [ Call ] [ WhatsApp ] [ Log Update ]) -->
        <div class="pt-2 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center gap-2 flex-wrap">
          <a
            v-if="lead.mobile"
            :href="'tel:' + lead.mobile"
            class="h-9 px-3 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 shadow-xs"
            title="Initiate phone call"
          >
            <PhPhoneCall :size="14" weight="bold" class="text-emerald-600" />
            <span>Call</span>
          </a>

          <a
            v-if="lead.mobile"
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="h-9 px-3 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 shadow-xs"
            title="Chat via WhatsApp"
          >
            <PhWhatsappLogo :size="15" weight="fill" class="text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            @click="triggerLogUpdate"
            class="btn btn-primary h-9 px-3 text-xs font-medium inline-flex items-center gap-1.5 ml-auto"
          >
            <PhNotePencil :size="14" weight="bold" />
            <span>Log Update</span>
          </button>
        </div>
      </div>

      <!-- 2. Follow-up Attention Alert (Section 13) -->
      <div
        v-if="upcomingFollowUp"
        class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/80 flex items-start gap-3 text-amber-900 dark:text-amber-100"
      >
        <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
          <PhCalendarCheck :size="17" weight="bold" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <span class="text-xs font-bold text-amber-950 dark:text-amber-200">Follow-up Required</span>
            <span class="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
              {{ formatDateTime(upcomingFollowUp.scheduledAt) }}
            </span>
          </div>
          <p v-if="upcomingFollowUp.notes" class="text-xs text-amber-900/90 dark:text-amber-200/90 mt-1 leading-relaxed">
            {{ upcomingFollowUp.notes }}
          </p>
          <div class="text-[11px] text-amber-800/80 dark:text-amber-400 mt-1.5 flex items-center gap-1">
            <PhUser :size="11" />
            <span>Assigned to: <strong class="text-amber-950 dark:text-amber-200">{{ upcomingFollowUp.assignedTo?.firstName ? `${upcomingFollowUp.assignedTo.firstName} ${upcomingFollowUp.assignedTo.lastName || ''}`.trim() : staffName }}</strong></span>
          </div>
        </div>
      </div>

      <!-- 3. Lead Information Card (Section 11: 2 columns on desktop, 1 on mobile) -->
      <div class="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-surface p-4 space-y-3">
        <h4 class="font-semibold text-sm text-slate-900 dark:text-slate-100">Lead Information</h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
          <!-- Stage -->
          <div class="flex flex-col gap-0.5">
            <span class="text-[11px] text-slate-400 font-medium">Stage</span>
            <div class="font-medium text-slate-800 dark:text-slate-200 capitalize">
              <StatusBadge :status="lead.status" />
            </div>
          </div>

          <!-- Interest Level -->
          <div class="flex flex-col gap-0.5">
            <span class="text-[11px] text-slate-400 font-medium">Interest Level</span>
            <span class="font-medium text-slate-800 dark:text-slate-200 capitalize">
              {{ lead.leadTemperature ? tempLabel(lead.leadTemperature) : '—' }}
            </span>
          </div>

          <!-- Interested Class -->
          <div class="flex flex-col gap-0.5">
            <span class="text-[11px] text-slate-400 font-medium">Interested Class</span>
            <span class="font-medium text-slate-800 dark:text-slate-200">
              {{ lead.classInterestId?.name || '—' }}
            </span>
          </div>

          <!-- Inquiry Source -->
          <div class="flex flex-col gap-0.5">
            <span class="text-[11px] text-slate-400 font-medium">Inquiry Source</span>
            <span class="font-medium text-slate-800 dark:text-slate-200 capitalize">
              {{ lead.source ? lead.source.replace(/_/g, ' ') : '—' }}
            </span>
          </div>

          <!-- Parent / Guardian -->
          <div class="flex flex-col gap-0.5">
            <span class="text-[11px] text-slate-400 font-medium">Parent / Guardian</span>
            <span class="font-medium text-slate-800 dark:text-slate-200">
              {{ lead.parentName || '—' }}
              <a
                v-if="lead.parentMobile"
                :href="'tel:' + lead.parentMobile"
                class="text-emerald-600 hover:underline font-mono text-[11px] ml-1"
              >
                ({{ lead.parentMobile }})
              </a>
            </span>
          </div>

          <!-- Assigned Staff -->
          <div class="flex flex-col gap-0.5">
            <span class="text-[11px] text-slate-400 font-medium">Assigned Staff</span>
            <span class="font-medium text-slate-800 dark:text-slate-200">
              {{ staffName }}
            </span>
          </div>

          <!-- Email if present -->
          <div v-if="lead.email" class="flex flex-col gap-0.5">
            <span class="text-[11px] text-slate-400 font-medium">Email Address</span>
            <span class="font-medium text-slate-800 dark:text-slate-200 break-all">
              {{ lead.email }}
            </span>
          </div>

          <!-- City / Address if present -->
          <div v-if="lead.city || lead.address" class="flex flex-col gap-0.5">
            <span class="text-[11px] text-slate-400 font-medium">Location</span>
            <span class="font-medium text-slate-800 dark:text-slate-200">
              {{ [lead.city, lead.address].filter(Boolean).join(', ') }}
            </span>
          </div>
        </div>
      </div>

      <!-- 4. Conversation History (Section 12) -->
      <div class="space-y-3 pt-1">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-2">
            <h4 class="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <PhClockCounterClockwise :size="15" weight="bold" class="text-brand-blue-600 dark:text-brand-blue-400" />
              <span>Conversation History</span>
            </h4>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {{ filteredTimeline.length }}
            </span>
          </div>

          <!-- Compact Channel Filter Tabs (Section 12) -->
          <div class="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5">
            <button
              v-for="tab in filterTabs"
              :key="tab.key"
              type="button"
              @click="activeFilter = tab.key"
              class="px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1"
              :class="activeFilter === tab.key
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'"
            >
              <span>{{ tab.label }}</span>
              <span
                class="text-[9px] px-1 py-0.2 rounded"
                :class="activeFilter === tab.key ? 'bg-white/20 dark:bg-slate-900/20' : 'bg-slate-200/60 dark:bg-slate-700/60'"
              >
                {{ tab.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- Empty State (Section 12) -->
        <div
          v-if="filteredTimeline.length === 0"
          class="text-center py-10 px-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700"
        >
          <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
            <PhChatCircleDots :size="20" />
          </div>
          <p class="font-semibold text-xs text-slate-800 dark:text-slate-200">No conversation records yet</p>
          <p class="text-[11px] text-slate-500 max-w-xs mx-auto mt-1 mb-3">
            Calls, WhatsApp messages, counselling sessions and remarks will appear here.
          </p>
          <button
            type="button"
            @click="triggerLogUpdate"
            class="btn btn-primary btn-sm inline-flex items-center gap-1.5"
          >
            <PhPlus :size="13" weight="bold" />
            <span>Log First Interaction</span>
          </button>
        </div>

        <!-- Clean CRM-style Activity Timeline (Section 12) -->
        <div v-else class="space-y-4 pt-1">
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
              <div class="flex-1 border-t border-slate-200/80 dark:border-slate-700/80"></div>
            </div>

            <!-- Interaction Items Timeline -->
            <div class="relative pl-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-200 dark:before:bg-slate-700/60 space-y-2.5">
              <div
                v-for="item in group"
                :key="item._id || item.id"
                class="bg-surface rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-3.5 shadow-2xs relative"
              >
                <!-- Timeline Dot Indicator -->
                <div
                  class="absolute -left-5 top-3.5 w-2 h-2 rounded-full ring-4 ring-white dark:ring-slate-900"
                  :class="getTimelineDotColor(item)"
                ></div>

                <!-- Item Header -->
                <div class="flex items-start justify-between gap-2 mb-1.5">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span
                      class="w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0"
                      :class="getChannelIconBg(item)"
                    >
                      <component :is="getChannelIcon(item)" :size="13" weight="bold" />
                    </span>
                    <span class="font-bold text-xs text-slate-800 dark:text-slate-100">
                      {{ getChannelTitle(item) }}
                    </span>

                    <span
                      v-if="item.customerResponse || item.summary !== item.description"
                      class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
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

                <!-- Remarks / Notes Body -->
                <p
                  v-if="item.description || item.notes || item.content"
                  class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-8 mt-1 whitespace-pre-line font-normal"
                >
                  {{ item.description || item.notes || item.content }}
                </p>

                <!-- Follow-up Information if Scheduled -->
                <div
                  v-if="item.nextFollowUpAt"
                  class="mt-2 ml-8 flex items-center gap-1.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200/60 dark:border-amber-800/60 w-fit"
                >
                  <PhCalendarCheck :size="12" weight="bold" class="text-amber-600" />
                  <span>Follow-up: {{ formatDateTime(item.nextFollowUpAt) }}</span>
                </div>

                <!-- Footer: Staff Attribution -->
                <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 pl-8 flex items-center justify-between text-[10px] text-slate-400">
                  <span class="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                    <PhUser :size="11" />
                    <span>By: {{ getAuthorName(item) }}</span>
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
  PhChatCircleDots,
  PhPlus,
} from '@phosphor-icons/vue';
import AppDrawer from '@/components/AppDrawer.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import { fetchEducationLead, fetchEducationLeadActivityCenter } from '../api/endpoints';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  leadId: { type: String, default: '' },
});

const emit = defineEmits(['close', 'log-interaction']);

const loading = ref(false);
const lead = ref(null);
const activityData = ref({ activities: [], notes: [], followUps: [] });
const activeFilter = ref('all');

const staffName = computed(() => {
  if (lead.value?.assignedTo) {
    return `${lead.value.assignedTo.firstName || ''} ${lead.value.assignedTo.lastName || ''}`.trim() || 'Assigned Staff';
  }
  return 'Unassigned';
});

const whatsappUrl = computed(() => {
  if (!lead.value?.mobile) return '#';
  const cleanPhone = String(lead.value.mobile).replace(/\D/g, '');
  const phone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${phone}`;
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

function triggerLogUpdate() {
  emit('log-interaction', lead.value);
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

function tempLabel(t) {
  if (t === 'hot') return 'Hot';
  if (t === 'cold') return 'Cold';
  return 'Warm';
}

function tempBadgeClass(t) {
  if (t === 'hot') return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
  if (t === 'cold') return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
  return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
}

function getChannelTitle(item) {
  if (item.type === 'call' || item.type === 'phone_call') return 'Phone Call';
  if (item.type === 'whatsapp') return 'WhatsApp';
  if (item.type === 'meeting') return 'Counselling';
  if (item.type === 'reminder' || item.type === 'follow_up') return 'Follow-up';
  if (item.type === 'note') return 'Remark';
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

function getTimelineDotColor(item) {
  if (item.type === 'call' || item.type === 'phone_call') return 'bg-blue-500';
  if (item.type === 'whatsapp') return 'bg-emerald-500';
  if (item.type === 'meeting') return 'bg-purple-500';
  if (item.type === 'reminder' || item.type === 'follow_up') return 'bg-amber-500';
  return 'bg-slate-400';
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
