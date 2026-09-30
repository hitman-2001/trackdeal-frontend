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
        <div class="modal-form-grid">
          <div class="modal-form-group">
            <label class="modal-form-label">First name <span class="required-star">*</span></label>
            <input
              v-model="form.firstName"
              required
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Last name</label>
            <input
              v-model="form.lastName"
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Mobile <span class="required-star">*</span></label>
            <input
              v-model="form.mobile"
              required
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="student@example.com"
              class="modal-form-input"
            />
          </div>
        </div>
      </div>

      <div class="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <h4 class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Parent / Guardian Information</h4>
        <div class="modal-form-grid">
          <div class="modal-form-group">
            <label class="modal-form-label">Parent name</label>
            <input
              v-model="form.parentName"
              placeholder="e.g. Ramesh Kumar"
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Parent mobile</label>
            <input
              v-model="form.parentMobile"
              placeholder="+91 9876543210"
              class="modal-form-input"
            />
          </div>
        </div>
      </div>

      <div class="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <h4 class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Class & Source</h4>
        <div class="modal-form-grid">
          <div class="modal-form-group">
            <label class="modal-form-label">Interested class</label>
            <select
              v-model="form.classInterestId"
              class="modal-form-select"
            >
              <option value="">Select class</option>
              <option v-for="c in classes" :key="c._id" :value="c._id">
                {{ c.name }} ({{ c.code }})
              </option>
            </select>
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Inquiry source</label>
            <select
              v-model="form.source"
              class="modal-form-select"
            >
              <option value="walk_in">Walk-in</option>
              <option value="website">Website</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="referral">Referral</option>
              <option value="campus">Campus</option>
              <option value="manual_entry">Manual Entry</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div class="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <h4 class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stage & Status</h4>
        <div class="modal-form-grid">
          <div class="modal-form-group">
            <label class="modal-form-label">Status</label>
            <select
              v-model="form.status"
              class="modal-form-select"
              @change="handleStatusChange"
            >
              <option v-for="st in EDUCATION_STATUSES" :key="st.value" :value="st.value">
                {{ st.label }}
              </option>
            </select>
          </div>

          <div class="modal-form-group">
            <label class="modal-form-label">Sub-Status</label>
            <select
              v-model="form.subStatus"
              class="modal-form-select"
            >
              <option value="">Select Sub-Status</option>
              <option v-for="sub in availableSubStatuses" :key="sub" :value="sub">
                {{ sub }}
              </option>
            </select>
          </div>

        </div>

        <div class="modal-form-group mt-2">
          <label class="modal-form-label">Customer Feedback / Interest Remarks</label>
          <input
            v-model="form.customerInterest"
            type="text"
            placeholder="e.g. Seeking weekend batch, inquired about NEET crash course"
            class="modal-form-input"
          />
        </div>
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
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";
import AppDrawer from "@/components/AppDrawer.vue";
import {
  fetchEducationLead,
  updateEducationLead,
  fetchEducationClasses,
} from "../api/endpoints";
import {
  EDUCATION_STATUSES,
  EDUCATION_SUB_STATUS_MAP,
  normalizeStatus,
} from "../constants/leadStatusConfig";

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
  status: "interested",
  subStatus: "",
  customerInterest: "",
});

const availableSubStatuses = computed(() => {
  return EDUCATION_SUB_STATUS_MAP[form.value.status] || [];
});

function handleStatusChange() {
  const subs = EDUCATION_SUB_STATUS_MAP[form.value.status] || [];
  form.value.subStatus = subs[0] || "";
}

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

    const normStatus = normalizeStatus(lead.value.status);
    const validSubs = EDUCATION_SUB_STATUS_MAP[normStatus] || [];
    const resolvedSub = lead.value.subStatus && validSubs.includes(lead.value.subStatus)
      ? lead.value.subStatus
      : (validSubs[0] || "");

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
      status: normStatus,
      subStatus: resolvedSub,
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
      subStatus: form.value.subStatus,
      customerFeedback: form.value.customerInterest,
      qualification: {
        ...(lead.value.qualification || {}),
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

