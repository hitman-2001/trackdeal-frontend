<template>
  <AppDrawer
    :isOpen="isOpen"
    title="Edit Student Lead"
    subtitle="Update student details, parent contact, class interest, and inquiry status"
    width="520px"
    @close="$emit('close')"
  >
    <div v-if="loading" class="py-12 text-center text-slate-500 text-xs">
      Loading student lead details...
    </div>

    <form
      v-else-if="lead"
      id="edit-student-lead-form"
      class="space-y-4 text-xs pb-4"
      @submit.prevent="handleSave"
    >
      <p
        v-if="error"
        class="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900"
      >
        {{ error }}
      </p>

      <div class="space-y-3">
        <h4 class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Student Profile</h4>
        <div class="grid grid-cols-2 gap-3">
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">
            <span>First name *</span>
            <input
              v-model="form.firstName"
              required
              class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
            />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">
            <span>Last name</span>
            <input
              v-model="form.lastName"
              class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
            />
          </label>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">
            <span>Mobile *</span>
            <input
              v-model="form.mobile"
              required
              class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
            />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">
            <span>Email</span>
            <input
              v-model="form.email"
              type="email"
              placeholder="student@example.com"
              class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
            />
          </label>
        </div>
      </div>

      <div class="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <h4 class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Parent / Guardian Information</h4>
        <div class="grid grid-cols-2 gap-3">
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">
            <span>Parent name</span>
            <input
              v-model="form.parentName"
              placeholder="e.g. Ramesh Kumar"
              class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
            />
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">
            <span>Parent mobile</span>
            <input
              v-model="form.parentMobile"
              placeholder="+91 9876543210"
              class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
            />
          </label>
        </div>
      </div>

      <div class="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <h4 class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Class & Source</h4>
        <div class="grid grid-cols-2 gap-3">
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">
            <span>Interested class</span>
            <select
              v-model="form.classInterestId"
              class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
            >
              <option value="">Select class</option>
              <option v-for="c in classes" :key="c._id" :value="c._id">
                {{ c.name }} ({{ c.code }})
              </option>
            </select>
          </label>
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">
            <span>Inquiry source</span>
            <select
              v-model="form.source"
              class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
            >
              <option value="walk_in">Walk-in</option>
              <option value="website">Website</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="referral">Referral</option>
              <option value="campus">Campus</option>
              <option value="manual_entry">Manual Entry</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
      </div>

      <div class="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <h4 class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stage & Engagement</h4>
        <div class="grid grid-cols-2 gap-3">
          <label class="space-y-1 font-medium text-slate-700 dark:text-slate-300">
            <span>Lead Stage</span>
            <select
              v-model="form.status"
              class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
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
            <span>Interest Level</span>
            <select
              v-model="form.leadTemperature"
              class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
            >
              <option value="hot">🔥 Hot (High Intent)</option>
              <option value="warm">⚡ Warm (In Discussion)</option>
              <option value="cold">❄ Cold (Low Interest)</option>
            </select>
          </label>
        </div>

        <label class="block space-y-1 font-medium text-slate-700 dark:text-slate-300">
          <span>Customer Feedback / Interest Remarks</span>
          <input
            v-model="form.customerInterest"
            type="text"
            placeholder="e.g. Seeking weekend batch, inquired about NEET crash course"
            class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
          />
        </label>
      </div>
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
        form="edit-student-lead-form"
        class="btn btn-primary btn-sm"
        :disabled="saving"
      >
        {{ saving ? "Saving Changes..." : "Save Changes" }}
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, watch } from "vue";
import { useStore } from "vuex";
import AppDrawer from "@/components/AppDrawer.vue";
import {
  fetchEducationLead,
  updateEducationLead,
  fetchEducationClasses,
} from "../api/endpoints";

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  leadId: { type: String, default: "" },
});

const emit = defineEmits(["close", "success"]);
const store = useStore();

const loading = ref(false);
const saving = ref(false);
const error = ref("");
const lead = ref(null);
const classes = ref([]);

const form = ref({
  firstName: "",
  lastName: "",
  mobile: "",
  email: "",
  parentName: "",
  parentMobile: "",
  classInterestId: "",
  source: "walk_in",
  status: "new",
  leadTemperature: "warm",
  customerInterest: "",
});

async function loadClasses() {
  if (classes.value.length > 0) return;
  try {
    const res = await fetchEducationClasses({ limit: 100 });
    classes.value = res.data || [];
  } catch {
    classes.value = [];
  }
}

async function loadLead() {
  if (!props.leadId) return;
  loading.value = true;
  error.value = "";
  try {
    await loadClasses();
    const res = await fetchEducationLead(props.leadId);
    lead.value = res.data || res;

    form.value = {
      firstName: lead.value.firstName || "",
      lastName: lead.value.lastName || "",
      mobile: lead.value.mobile || "",
      email: lead.value.email || "",
      parentName: lead.value.parentName || "",
      parentMobile: lead.value.parentMobile || "",
      classInterestId:
        lead.value.classInterestId?._id || lead.value.classInterestId || "",
      source: lead.value.source || "walk_in",
      status: lead.value.status || "new",
      leadTemperature: lead.value.qualification?.leadTemperature || "warm",
      customerInterest:
        lead.value.customerFeedback ||
        lead.value.customerInterest ||
        lead.value.qualification?.notesRemarks ||
        "",
    };
  } catch (err) {
    error.value = "Failed to load student details for editing.";
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      loadLead();
    } else {
      lead.value = null;
    }
  },
);

async function handleSave() {
  if (!lead.value) return;
  saving.value = true;
  error.value = "";
  try {
    const payload = {
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      mobile: form.value.mobile.trim(),
      email: form.value.email.trim() || undefined,
      parentName: form.value.parentName.trim() || undefined,
      parentMobile: form.value.parentMobile.trim() || undefined,
      classInterestId: form.value.classInterestId || null,
      source: form.value.source,
      status: form.value.status,
      customerFeedback: form.value.customerInterest,
      qualification: {
        ...(lead.value.qualification || {}),
        leadTemperature: form.value.leadTemperature,
        notesRemarks: form.value.customerInterest,
      },
    };

    await updateEducationLead(lead.value._id, payload);

    store.dispatch("notifications/triggerToast", {
      message: "Student lead updated successfully.",
      type: "success",
    });

    emit("success");
    emit("close");
  } catch (err) {
    error.value = err.data?.message || err.message || "Failed to save student lead.";
  } finally {
    saving.value = false;
  }
}
</script>

