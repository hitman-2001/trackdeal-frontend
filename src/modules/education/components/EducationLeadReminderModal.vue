<template>
  <AppModal
    :isOpen="isOpen"
    :title="props.lead?.currentFollowUpId ? 'Reschedule follow-up reminder' : 'Set follow-up reminder'"
    maxSize="440px"
    @cancel="$emit('close')"
    @confirm="save"
  >
    <div class="space-y-4 text-xs">
      <p class="text-[11px] text-slate-500 leading-relaxed">
        Schedule the next touchpoint for
        <strong class="text-slate-700 dark:text-slate-200">{{ leadName }}</strong>.
        This appears on the student lead timeline and tasks list.
      </p>

      <div class="modal-form-group">
        <label class="modal-form-label">Reminder date & time <span class="required-star">*</span></label>
        <input
          v-model="scheduledAt"
          type="datetime-local"
          required
          class="modal-form-input"
        />
      </div>

      <div class="modal-form-group">
        <label class="modal-form-label">Type</label>
        <select v-model="type" class="modal-form-select">
          <option value="call">Phone call</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="meeting">Counselling / demo class</option>
          <option value="email">Email</option>
        </select>
      </div>

      <div class="modal-form-group">
        <label class="modal-form-label">Notes for staff <span class="required-star">*</span></label>
        <textarea
          v-model="notes"
          rows="3"
          placeholder="What to discuss on the next call..."
          class="modal-form-textarea"
        />
      </div>

      <p v-if="error" class="text-[11px] text-red-500">{{ error }}</p>
    </div>

    <template #footer>
      <button type="button" class="btn btn-secondary btn-sm" @click="$emit('close')">Cancel</button>
      <button type="button" class="btn btn-primary btn-sm" :disabled="saving" @click="save">
        {{ saving ? 'Saving...' : (props.lead?.currentFollowUpId ? 'Update & Reschedule' : 'Set reminder') }}
      </button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useStore } from 'vuex';
import AppModal from '@/components/AppModal.vue';
import { addLeadFollowUp, updateLeadFollowUp, logLeadActivity } from '@/modules/leads/api/endpoints';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  lead: { type: Object, default: null },
});

const emit = defineEmits(['close', 'success']);

const store = useStore();
const scheduledAt = ref('');
const type = ref('call');
const notes = ref('');
const saving = ref(false);
const error = ref('');

const leadName = computed(() => {
  if (!props.lead) return 'this student';
  return [props.lead.firstName, props.lead.lastName].filter(Boolean).join(' ') || 'this student';
});

function defaultDateTime() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const z = (n) => (n < 10 ? '0' : '') + n;
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`;
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      const followUpDate = props.lead?.currentFollowUpDate || props.lead?.nextFollowUpAt;
      if (followUpDate) {
        const d = new Date(followUpDate);
        if (!isNaN(d.getTime())) {
          const z = (n) => (n < 10 ? '0' : '') + n;
          scheduledAt.value = `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`;
        } else {
          scheduledAt.value = defaultDateTime();
        }
      } else {
        scheduledAt.value = defaultDateTime();
      }
      type.value = props.lead?.currentType || props.lead?.lastActivityType || 'call';
      notes.value = props.lead?.currentNotes || props.lead?.notesRemarks || '';
      error.value = '';
    }
  },
);

async function save() {
  const leadId = props.lead?._id || props.lead?.id;
  if (!leadId) return;
  if (!scheduledAt.value) {
    error.value = 'Pick a date and time for the reminder.';
    return;
  }
  if (!notes.value.trim()) {
    error.value = 'Add a short note so staff know what to follow up on.';
    return;
  }

  saving.value = true;
  error.value = '';
  try {
    const iso = new Date(scheduledAt.value).toISOString();
    const isSynthetic = String(props.lead?.currentFollowUpId || '').startsWith('fu-');

    if (props.lead?.currentFollowUpId && !isSynthetic) {
      await updateLeadFollowUp({
        leadId,
        followUpId: props.lead.currentFollowUpId,
        scheduledAt: iso,
        type: type.value,
        notes: notes.value.trim(),
        status: 'scheduled',
      });
    } else {
      await addLeadFollowUp({
        id: leadId,
        scheduledAt: iso,
        type: type.value,
        notes: notes.value.trim(),
      });
    }

    // Optional audit log into lead activity timeline
    try {
      await logLeadActivity({
        id: leadId,
        type: type.value === 'whatsapp' ? 'whatsapp' : (type.value === 'meeting' ? 'meeting' : 'call'),
        summary: `Follow-up reminder: ${notes.value.trim()}`,
        description: notes.value.trim(),
        status: 'completed',
      });
    } catch (logErr) {
      console.warn('Activity logging non-fatal:', logErr);
    }

    store.dispatch('notifications/triggerToast', {
      message: props.lead?.currentFollowUpId ? 'Follow-up reminder rescheduled.' : 'Follow-up reminder saved.',
      type: 'success',
    });
    emit('success');
    emit('close');
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Could not save reminder.';
  } finally {
    saving.value = false;
  }
}
</script>
