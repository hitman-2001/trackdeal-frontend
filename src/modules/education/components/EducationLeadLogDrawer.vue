<template>
  <AppDrawer
    :isOpen="isOpen"
    title="Log Update / Conversation"
    :subtitle="drawerSubtitle"
    width="520px"
    @close="$emit('close')"
  >
    <div v-if="loading" class="py-12 text-center text-slate-500 text-xs">
      Loading student lead details...
    </div>

    <form
      v-else-if="lead"
      id="log-lead-update-form"
      class="space-y-4 text-xs pb-4"
      @submit.prevent="saveUpdate"
    >
      <!-- Student Summary Pill -->
      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-default flex items-center justify-between gap-3">
        <div>
          <div class="font-bold text-xs text-slate-800 dark:text-slate-100">
            {{ lead.firstName }} {{ lead.lastName || '' }}
          </div>
          <div class="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
            <span class="font-mono">{{ lead.mobile }}</span>
            <span v-if="lead.classInterestId?.name" class="text-slate-400">· {{ lead.classInterestId.name }}</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            {{ (lead.status || 'new').replace(/_/g, ' ') }}
          </span>
          <span
            v-if="lead.leadTemperature"
            class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
            :class="tempBadgeClass(lead.leadTemperature)"
          >
            {{ tempLabel(lead.leadTemperature) }}
          </span>
        </div>
      </div>

      <!-- Interaction Channel -->
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Interaction Channel *
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            v-for="ch in channels"
            :key="ch.id"
            @click="form.type = ch.id"
            class="p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-all"
            :class="form.type === ch.id ? 'bg-primary text-white border-primary shadow-xs' : 'bg-surface border-default text-slate-600 dark:text-slate-300 hover:border-slate-400'"
          >
            <component :is="ch.icon" :size="16" weight="bold" />
            <span class="text-[11px]">{{ ch.label }}</span>
          </button>
        </div>
      </div>

      <!-- Conversation Outcome Tags -->
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Outcome / Call Status
        </label>
        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            v-for="tag in outcomeTags"
            :key="tag"
            @click="selectOutcome(tag)"
            class="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors"
            :class="form.outcome === tag ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold' : 'border-default text-slate-600 dark:text-slate-300 hover:border-slate-400'"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- Remarks / Discussion Details -->
      <div class="space-y-1.5">
        <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Remarks / Discussion Details *
        </label>
        <textarea
          v-model="form.remarks"
          rows="4"
          required
          placeholder="Record key discussion points with parent/student (course interest, questions, fee discussion, promised next steps)..."
          class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs outline-none focus:border-primary resize-none leading-relaxed"
        ></textarea>
      </div>

      <!-- Stage & Temperature Updates -->
      <div class="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">
          <span class="text-[11px]">Update Stage</span>
          <select
            v-model="form.status"
            class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
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

        <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">
          <span class="text-[11px]">Update Interest Level</span>
          <select
            v-model="form.temperature"
            class="w-full bg-surface border border-default rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
          >
            <option value="hot">🔥 Hot (High Intent)</option>
            <option value="warm">⚡ Warm (In Discussion)</option>
            <option value="cold">❄ Cold (Low Interest)</option>
          </select>
        </label>
      </div>

      <!-- Optional Follow-up Reminder -->
      <div class="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <label class="flex items-center gap-2 cursor-pointer select-none text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            v-model="form.scheduleFollowUp"
            class="rounded border-default text-primary focus:ring-0"
          />
          <span>Schedule next follow-up touchpoint</span>
        </label>

        <div v-if="form.scheduleFollowUp" class="pl-5 pt-1 space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Reminder date & time</span>
          <input
            v-model="form.followUpAt"
            type="datetime-local"
            class="w-full sm:w-64 bg-surface border border-default rounded-xl px-3 py-1.5 text-xs outline-none focus:border-primary"
          />
        </div>
      </div>

      <p v-if="error" class="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200">
        {{ error }}
      </p>
    </form>

    <template #footer v-if="!loading && lead">
      <button
        type="button"
        class="btn btn-secondary btn-sm"
        @click="$emit('close')"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="log-lead-update-form"
        class="btn btn-primary btn-sm font-bold gap-1.5 flex items-center"
        :disabled="saving || !form.remarks.trim()"
      >
        <PhPaperPlaneTilt :size="13" weight="bold" />
        <span>{{ saving ? "Saving Update..." : "Save Update" }}</span>
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import {
  PhPhoneCall,
  PhWhatsappLogo,
  PhChalkboardTeacher,
  PhNotePencil,
  PhPaperPlaneTilt,
} from '@phosphor-icons/vue';
import AppDrawer from '@/components/AppDrawer.vue';
import {
  fetchEducationLead,
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

const channels = [
  { id: 'call', label: 'Phone Call', icon: PhPhoneCall },
  { id: 'whatsapp', label: 'WhatsApp', icon: PhWhatsappLogo },
  { id: 'meeting', label: 'Counselling', icon: PhChalkboardTeacher },
  { id: 'note', label: 'Remark', icon: PhNotePencil },
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

const form = ref({
  type: 'call',
  outcome: '',
  remarks: '',
  status: 'contacted',
  temperature: 'warm',
  scheduleFollowUp: false,
  followUpAt: defaultFollowUp(),
});

function defaultFollowUp() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const z = (n) => (n < 10 ? '0' : '') + n;
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`;
}

const drawerSubtitle = computed(() => {
  if (!lead.value) return 'Record touchpoint details';
  return `Record touchpoint for ${lead.value.firstName} ${lead.value.lastName || ''}`.trim();
});

function selectOutcome(tag) {
  form.value.outcome = tag;
  if (!form.value.remarks) {
    form.value.remarks = `${tag}: `;
  }
}

async function loadLead() {
  if (!props.leadId) return;
  loading.value = true;
  error.value = '';
  try {
    const res = await fetchEducationLead(props.leadId);
    lead.value = res.data || res;
    form.value.status = lead.value.status || 'contacted';
    form.value.temperature = lead.value.leadTemperature || 'warm';
    form.value.remarks = '';
    form.value.outcome = '';
    form.value.scheduleFollowUp = false;
  } catch (err) {
    error.value = 'Failed to load lead.';
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (props.lead) {
        lead.value = props.lead;
        form.value.status = props.lead.status || 'contacted';
        form.value.temperature = props.lead.leadTemperature || 'warm';
        form.value.remarks = '';
        form.value.outcome = '';
        form.value.scheduleFollowUp = false;
      } else {
        loadLead();
      }
    }
  },
  { immediate: true },
);

async function saveUpdate() {
  if (!form.value.remarks.trim()) {
    error.value = 'Please enter conversation remarks.';
    return;
  }

  saving.value = true;
  error.value = '';

  try {
    const targetLeadId = lead.value?._id || props.leadId;
    const channelLabel = channels.find((c) => c.id === form.value.type)?.label || 'Touchpoint';
    const summary = form.value.outcome || `${channelLabel} record`;

    const payload = {
      type: form.value.type,
      summary,
      description: form.value.remarks.trim(),
      customerResponse: form.value.outcome,
      status: 'completed',
      activityDate: new Date().toISOString(),
    };

    if (form.value.scheduleFollowUp && form.value.followUpAt) {
      payload.nextFollowUpAt = new Date(form.value.followUpAt).toISOString();
    }

    // 1. Log Activity Record with staff attribution
    await logEducationLeadActivity(targetLeadId, payload);

    // 2. Update Lead Stage and Temperature if modified
    const leadUpdates = {};
    if (form.value.status && form.value.status !== lead.value.status) {
      leadUpdates.status = form.value.status;
    }
    if (form.value.temperature && form.value.temperature !== lead.value.leadTemperature) {
      leadUpdates.leadTemperature = form.value.temperature;
    }
    if (payload.nextFollowUpAt) {
      leadUpdates.nextFollowUpAt = payload.nextFollowUpAt;
    }
    leadUpdates.notesRemarks = form.value.remarks.trim();

    await updateEducationLead(targetLeadId, leadUpdates);

    store.dispatch('notifications/triggerToast', {
      message: 'Lead update recorded successfully.',
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
  if (t === 'hot') return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300';
  if (t === 'cold') return 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300';
  return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300';
}
</script>

