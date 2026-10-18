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
        <h4 class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Student Profile & Academic Details</h4>
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
            <label class="modal-form-label">Primary Mobile <span class="required-star">*</span></label>
            <input
              v-model="form.mobile"
              required
              placeholder="e.g. 9876543210"
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Alternate Phone</label>
            <input
              v-model="form.alternativeMobile"
              placeholder="e.g. 9876543299"
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group col-span-full">
            <label class="modal-form-label">{{ getFieldLabel('schoolName', 'School / College Name') }} <span class="required-star">*</span></label>
            <input
              v-model="form.schoolName"
              required
              :placeholder="getFieldPlaceholder('schoolName', 'e.g. Delhi Public School / St. Xavier\'s College')"
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">{{ getFieldLabel('institutionType', 'Institution Type') }}</label>
            <select
              v-model="form.institutionType"
              class="modal-form-select"
            >
              <option value="">{{ getFieldPlaceholder('institutionType', 'Select Institution Type') }}</option>
              <option v-for="opt in institutionTypeOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">{{ getFieldLabel('educationBoard', 'Education Board') }}</label>
            <select
              v-model="form.educationBoard"
              class="modal-form-select"
            >
              <option value="">{{ getFieldPlaceholder('educationBoard', 'Select Board') }}</option>
              <option v-for="opt in educationBoardOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">{{ getFieldLabel('standard', 'Standard / Grade') }}</label>
            <select
              v-model="form.standard"
              class="modal-form-select"
            >
              <option value="">{{ getFieldPlaceholder('standard', 'Select Standard / Grade') }}</option>
              <option v-for="opt in standardOptions" :key="opt" :value="opt">{{ opt }}</option>
              <option
                v-if="form.standard && !standardOptions.includes(String(form.standard))"
                :value="form.standard"
              >
                {{ form.standard }}
              </option>
            </select>
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">{{ getFieldLabel('academicStream', 'Academic Stream') }}</label>
            <select
              v-model="form.academicStream"
              class="modal-form-select"
            >
              <option value="">{{ getFieldPlaceholder('academicStream', 'Select Stream') }}</option>
              <option v-for="opt in streamOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
          <div class="modal-form-group col-span-full">
            <label class="modal-form-label">Current Coaching / Private Classes</label>
            <input
              v-model="form.currentCoaching"
              placeholder="e.g. Allen, Aakash, Mahesh Tutorials (if enrolled)"
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group col-span-full">
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
        <h4 class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inquiry Source</h4>
        <div class="modal-form-grid">
          <div class="modal-form-group col-span-full">
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

      <!-- Custom Fields Section (Salesforce Object Manager) -->
      <div v-if="customFieldsList.length > 0" class="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div class="flex items-center justify-between">
          <h4 class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Custom Attributes</h4>
          <span class="text-[10px] text-slate-400 font-medium">Object Manager Fields</span>
        </div>
        <div class="modal-form-grid">
          <div
            v-for="cf in customFieldsList"
            :key="cf.key"
            class="modal-form-group"
          >
            <label class="modal-form-label">
              {{ cf.label }}
              <span v-if="cf.required" class="required-star">*</span>
            </label>
            <!-- Dropdown Select -->
            <select
              v-if="cf.type === 'select'"
              v-model="form.customFields[cf.key]"
              :required="cf.required"
              class="modal-form-select"
            >
              <option value="" :disabled="cf.required">{{ cf.placeholder ? cf.placeholder : `Select ${cf.label}` }}</option>
              <option
                v-for="(opt, idx) in (cf.options || [])"
                :key="idx"
                :value="getOptionValue(opt)"
              >
                {{ getOptionLabel(opt) }}
              </option>
            </select>
            <!-- Text Input -->
            <input
              v-else
              v-model="form.customFields[cf.key]"
              :required="cf.required"
              :placeholder="cf.placeholder || `Enter ${cf.label}`"
              class="modal-form-input"
            />
            <p v-if="cf.helpText" class="text-[10px] text-slate-400 mt-0.5">{{ cf.helpText }}</p>
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
} from "../api/endpoints";
import { fetchCustomFields } from "@/api/customFields";
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
const allFieldsList = ref([]);
const customFieldsList = ref([]);

function getFieldConfig(key) {
  return allFieldsList.value.find(f => f.key === key);
}

function getFieldLabel(key, fallback) {
  const cfg = getFieldConfig(key);
  return cfg?.label || fallback;
}

function getFieldPlaceholder(key, fallback) {
  const cfg = getFieldConfig(key);
  return cfg?.placeholder || fallback;
}

function getFieldOptions(key, fallback = []) {
  const cfg = getFieldConfig(key);
  if (cfg && Array.isArray(cfg.options) && cfg.options.length > 0) {
    return cfg.options.map(o => typeof o === 'object' ? (o.value || o.label) : String(o));
  }
  return fallback;
}

function getOptionValue(opt) {
  if (opt === null || opt === undefined) return '';
  if (typeof opt === 'object') return String(opt.value ?? opt.label ?? '');
  return String(opt);
}

function getOptionLabel(opt) {
  if (opt === null || opt === undefined) return '';
  if (typeof opt === 'object') return String(opt.label ?? opt.value ?? '');
  return String(opt);
}

const institutionTypeOptions = computed(() => getFieldOptions('institutionType', ['School', 'Private Classes']));
const educationBoardOptions = computed(() => getFieldOptions('educationBoard', ['CBSE', 'ICSE', 'State Board']));
const standardOptions = computed(() => getFieldOptions('standard', ['8', '9', '10', '11', '12']));
const streamOptions = computed(() => getFieldOptions('academicStream', ['Science', 'Commerce']));

async function loadCustomFields() {
  try {
    const list = await fetchCustomFields('leads', { includeStandard: true });
    allFieldsList.value = Array.isArray(list) ? list : [];
    customFieldsList.value = allFieldsList.value.filter(f => !f.isStandard && f.isActive !== false);
    if (!form.value.customFields) {
      form.value.customFields = {};
    }
    for (const cf of customFieldsList.value) {
      if (form.value.customFields[cf.key] === undefined || form.value.customFields[cf.key] === null) {
        form.value.customFields[cf.key] = "";
      }
    }
  } catch (e) {
    allFieldsList.value = [];
    customFieldsList.value = [];
  }
}

const form = ref({
  firstName: "",
  lastName: "",
  mobile: "",
  email: "",
  parentName: "",
  parentMobile: "",
  source: "walk_in",
  status: "interested",
  subStatus: "",
  customerInterest: "",
  customFields: {},
});

const availableSubStatuses = computed(() => {
  return EDUCATION_SUB_STATUS_MAP[form.value.status] || [];
});

function handleStatusChange() {
  const subs = EDUCATION_SUB_STATUS_MAP[form.value.status] || [];
  form.value.subStatus = subs[0] || "";
}

async function loadLead() {
  if (!props.leadId) return;
  loading.value = true;
  error.value = "";
  try {
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
      alternativeMobile: lead.value.alternativeMobile || "",
      schoolName: lead.value.schoolName || "",
      institutionType: lead.value.institutionType || "",
      educationBoard: lead.value.educationBoard || "",
      standard: lead.value.standard || "",
      academicStream: lead.value.academicStream || "",
      currentCoaching: lead.value.currentCoaching || "",
      email: lead.value.email || "",
      parentName: lead.value.parentName || "",
      parentMobile: lead.value.parentMobile || "",
      source: lead.value.source || "walk_in",
      status: normStatus,
      subStatus: resolvedSub,
      customerInterest:
        lead.value.customerFeedback ||
        lead.value.customerInterest ||
        lead.value.qualification?.notesRemarks ||
        "",
      customFields: { ...(lead.value.customFields || {}) },
    };

    for (const cf of customFieldsList.value) {
      if (form.value.customFields[cf.key] === undefined || form.value.customFields[cf.key] === null) {
        form.value.customFields[cf.key] = "";
      }
    }
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
      loadCustomFields().then(() => {
        loadLead();
      });
    } else {
      lead.value = null;
    }
  },
);

async function handleSave() {
  if (!lead.value) return;
  saving.value = true;
  error.value = "";

  if (!form.value.firstName.trim() || !form.value.mobile.trim()) {
    error.value = "Student first name and primary mobile are required.";
    saving.value = false;
    return;
  }

  if (!form.value.schoolName?.trim()) {
    error.value = "School / College Name is mandatory.";
    saving.value = false;
    return;
  }

  // Validate required custom fields configured in Salesforce Object Manager
  for (const cf of customFieldsList.value) {
    if (cf.required) {
      const val = form.value.customFields?.[cf.key];
      if (val === undefined || val === null || String(val).trim() === '') {
        error.value = `${cf.label} is mandatory.`;
        saving.value = false;
        return;
      }
    }
  }

  try {
    const payload = {
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      mobile: form.value.mobile.trim(),
      alternativeMobile: form.value.alternativeMobile.trim() || undefined,
      schoolName: form.value.schoolName.trim(),
      institutionType: form.value.institutionType || undefined,
      educationBoard: form.value.educationBoard || undefined,
      standard: form.value.standard || undefined,
      academicStream: form.value.academicStream || undefined,
      currentCoaching: form.value.currentCoaching.trim() || undefined,
      email: form.value.email.trim() || undefined,
      parentName: form.value.parentName.trim() || undefined,
      parentMobile: form.value.parentMobile.trim() || undefined,
      source: form.value.source,
      status: form.value.status,
      subStatus: form.value.subStatus,
      customerFeedback: form.value.customerInterest,
      customFields: form.value.customFields || {},
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

