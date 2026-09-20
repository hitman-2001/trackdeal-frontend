<template>
  <div class="workspace-page education-list pb-16">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <h1 class="font-heading text-xl font-extrabold">Student leads</h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Admission inquiries. Convert a lead into an enrolled student.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="isOrgAdmin && selectedRows.length > 0"
          @click="openBulkAssign"
          class="btn-sm btn-secondary h-9 text-xs font-bold gap-1.5 flex items-center hover:border-blue-500 hover:text-blue-600 transition-colors"
          title="Assign selected leads to staff"
        >
          <PhUserPlus :size="15" weight="bold" />
          <span>Assign staff ({{ selectedRows.length }})</span>
        </button>

        <button
          v-if="canBulkUpload"
          @click="showBulkUpload = true"
          class="btn-sm btn-secondary h-9 text-xs font-bold gap-1.5 flex items-center hover:border-emerald-500 hover:text-emerald-600 transition-colors"
          title="Bulk Upload Student Leads from Excel (.xlsx, .csv)"
        >
          <PhFileArrowUp :size="15" weight="bold" />
          <span>Import Excel</span>
        </button>
        <button
          class="btn btn-primary btn-sm h-9 text-xs font-semibold"
          @click="openCreate"
        >
          Add student lead
        </button>
      </div>
    </div>

    <div
      class="p-4 rounded-xl bg-surface border border-default flex flex-wrap gap-2"
    >
      <input
        v-model="search"
        type="text"
        placeholder="Search student lead..."
        class="w-full sm:w-72 bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs"
        @input="handleSearch"
      />
      <select
        v-model="statusFilter"
        class="bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-3 py-2 text-xs"
        @change="onFilterChange"
      >
        <option value="">All stages</option>
        <option value="new">New</option>
        <option value="assigned">Assigned</option>
        <option value="contacted">Contacted</option>
        <option value="follow_up">Follow Up</option>
        <option value="meeting_scheduled">Meeting Scheduled</option>
        <option value="qualified">Qualified</option>
        <option value="application_trial">Application / Trial</option>
        <option value="converted">Converted</option>
        <option value="lost">Lost</option>
        <option value="on_hold">On Hold</option>
      </select>
    </div>

    <div class="rounded-xl bg-surface border border-default overflow-hidden">
      <AppTable
        :rows="rows"
        :columns="columns"
        :isLoading="loading"
        :pagination="pagination"
        selectable
        :selectedRows="selectedRows"
        row-actions-label="Actions"
        empty-title="No student leads yet"
        empty-subtext="Add an inquiry or import from Excel to get started."
        @selectionChange="handleSelectionChange"
        @rowClick="openDetails"
        @pageChange="handlePageChange"
        @pageSizeChange="handlePageSizeChange"
      >
        <template #cell(student)="{ row }">
          <div class="font-bold text-slate-800 dark:text-slate-200">
            {{ row.firstName }} {{ row.lastName }}
          </div>
          <div class="text-slate-500 text-[10px]">{{ row.mobile }}</div>
        </template>

        <template #cell(parent)="{ row }">
          <div class="text-slate-700 dark:text-slate-300">
            {{ row.parentName || "—" }}
          </div>
        </template>

        <template #cell(class)="{ row }">
          <span
            class="inline-flex max-w-[10rem] truncate px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
            :title="row.classInterestId?.name || ''"
          >
            {{ row.classInterestId?.name || "—" }}
          </span>
        </template>

        <template #cell(staff)="{ row }">
          <div v-if="row.assignedTo" class="flex items-center gap-1.5 min-w-0">
            <span
              class="shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-600 uppercase"
            >
              {{ (row.assignedTo.firstName || "?").charAt(0) }}
            </span>
            <span class="truncate text-slate-700 dark:text-slate-300">
              {{ row.assignedTo.firstName }} {{ row.assignedTo.lastName || "" }}
            </span>
          </div>
          <span v-else class="text-[10px] text-slate-400 italic">Unassigned</span>
        </template>

        <template #cell(status)="{ row }">
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
            :class="statusClass(row.status)"
          >
            {{ formatStatus(row.status) }}
          </span>
        </template>

        <template #rowActions="{ row }">
          <!-- Single 3-Dots Action Menu Trigger -->
          <button
            type="button"
            @click.stop="toggleActionMenu(row, $event)"
            title="Actions"
            class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            :class="{ 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200': activeMenuRowId === (row._id || row.id) }"
          >
            <PhDotsThreeVertical :size="18" weight="bold" />
          </button>
        </template>
      </AppTable>
    </div>

    <!-- Floating 3-Dots Action Dropdown Menu -->
    <Teleport to="body">
      <div
        v-if="activeMenuRowId"
        class="fixed inset-0 z-[1000]"
        @click="closeActionMenu"
      >
        <div
          class="fixed w-52 rounded-xl bg-surface border border-default shadow-xl py-1.5 z-[1001] text-xs space-y-0.5"
          :style="{
            top: menuPosition.top,
            bottom: menuPosition.bottom,
            right: menuPosition.right,
          }"
          @click.stop
        >
          <!-- 1. View Details (Read-only dossier & history) -->
          <button
            type="button"
            @click="handleView(activeMenuRow)"
            class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition-colors font-medium"
          >
            <PhEye :size="15" weight="bold" class="text-indigo-600" />
            <span>View Details</span>
          </button>

          <!-- 2. Edit Lead (Strictly edit details) -->
          <button
            type="button"
            @click="handleEdit(activeMenuRow)"
            class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition-colors font-medium"
          >
            <PhPencilSimple :size="15" weight="bold" class="text-blue-600" />
            <span>Edit Details</span>
          </button>

          <!-- 3. Log Updates / Remarks -->
          <button
            type="button"
            @click="handleLog(activeMenuRow)"
            class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition-colors font-medium"
          >
            <PhNotePencil :size="15" weight="bold" class="text-emerald-600" />
            <span>Log Updates</span>
          </button>

          <!-- 4. Set Reminder -->
          <button
            type="button"
            @click="handleReminder(activeMenuRow)"
            class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition-colors font-medium"
          >
            <PhBell :size="15" weight="bold" class="text-amber-600" />
            <span>Set Reminder</span>
          </button>

          <!-- 5. Enroll Student -->
          <button
            v-if="activeMenuRow?.status !== 'enrolled' && activeMenuRow?.status !== 'converted'"
            type="button"
            @click="handleEnroll(activeMenuRow)"
            class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition-colors font-medium"
          >
            <PhCheckCircle :size="15" weight="bold" class="text-teal-600" />
            <span>Enroll Student</span>
          </button>

          <!-- 6. Assign Staff (Admin only) -->
          <button
            v-if="isOrgAdmin"
            type="button"
            @click="handleAssign(activeMenuRow)"
            class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition-colors font-medium border-t border-slate-100 dark:border-slate-800/80"
          >
            <PhUserPlus :size="15" weight="bold" class="text-purple-600" />
            <span>Assign Staff</span>
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Student Details & Conversation History Drawer (Read-Only View) -->
    <EducationLeadDrawer
      :isOpen="isDetailsOpen"
      :leadId="activeLeadId"
      @close="isDetailsOpen = false"
    />

    <!-- Edit Student Lead Drawer (Strictly Editing) -->
    <EducationLeadEditDrawer
      :isOpen="isEditOpen"
      :leadId="activeEditLeadId"
      @close="isEditOpen = false"
      @success="handleEditSuccess"
    />

    <!-- Log Update / Conversation Drawer (Strictly Logging Updates) -->
    <EducationLeadLogDrawer
      :isOpen="isLogOpen"
      :leadId="activeLogLeadId"
      :lead="activeLogLead"
      @close="isLogOpen = false"
      @success="handleLogSuccess"
    />

    <!-- Set Follow-up Reminder Modal (Strictly Setting Reminder) -->
    <EducationLeadReminderModal
      :isOpen="isReminderOpen"
      :lead="activeReminderLead"
      @close="isReminderOpen = false"
      @success="handleReminderSuccess"
    />

    <!-- Assign Modal -->
    <LeadAssignModal
      :isOpen="isAssignOpen"
      :leadIds="targetAssignIds"
      staff-mode
      @close="isAssignOpen = false"
      @success="handleAssignSuccess"
    />

    <!-- Right-Side Modal Drawer: Add Student Lead -->
    <AppDrawer
      :isOpen="showModal"
      title="Add Student Lead"
      subtitle="Capture inquiry details and associate interested course or class"
      width="520px"
      @close="showModal = false"
    >
      <form id="lead-form" class="space-y-4 text-xs" @submit.prevent="save">
        <p
          v-if="error"
          class="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900"
        >
          {{ error }}
        </p>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <label
            class="space-y-1 font-medium text-slate-700 dark:text-slate-300"
            >First name *
            <input
              v-model="form.firstName"
              required
              class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
            />
          </label>
          <label
            class="space-y-1 font-medium text-slate-700 dark:text-slate-300"
            >Last name
            <input
              v-model="form.lastName"
              class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
            />
          </label>
          <label
            class="space-y-1 font-medium text-slate-700 dark:text-slate-300"
            >Mobile *
            <input
              v-model="form.mobile"
              required
              class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
            />
          </label>
          <label
            class="space-y-1 font-medium text-slate-700 dark:text-slate-300"
            >Source
            <select
              v-model="form.source"
              class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
            >
              <option value="walk_in">Walk-in</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="campus">Campus</option>
              <option value="manual_entry">Manual</option>
            </select>
          </label>
          <label
            class="space-y-1 font-medium text-slate-700 dark:text-slate-300"
            >Parent name
            <input
              v-model="form.parentName"
              class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
            />
          </label>
          <label
            class="space-y-1 font-medium text-slate-700 dark:text-slate-300"
            >Parent mobile
            <input
              v-model="form.parentMobile"
              class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
            />
          </label>
          <label
            class="space-y-1 col-span-2 font-medium text-slate-700 dark:text-slate-300"
            >Interested class
            <select
              v-model="form.classInterestId"
              class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
            >
              <option value="">Select class</option>
              <option v-for="c in classes" :key="c._id" :value="c._id">
                {{ c.name }}
              </option>
            </select>
          </label>
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="showModal = false"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="lead-form"
          class="btn btn-primary btn-sm"
          :disabled="saving"
        >
          {{ saving ? "Saving..." : "Save Student Lead" }}
        </button>
      </template>
    </AppDrawer>

    <!-- Right-Side Modal Drawer: Enroll Student -->
    <AppDrawer
      :isOpen="!!enrollLead"
      :title="
        enrollLead
          ? `Enroll ${enrollLead.firstName} ${enrollLead.lastName || ''}`
          : 'Enroll Student'
      "
      subtitle="Select the batch or class to complete enrollment"
      width="440px"
      @close="enrollLead = null"
    >
      <form id="enroll-form" class="space-y-4 text-xs" @submit.prevent="enroll">
        <p
          v-if="error"
          class="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900"
        >
          {{ error }}
        </p>
        <label
          class="space-y-1 text-xs block font-medium text-slate-700 dark:text-slate-300"
          >Class *
          <select
            v-model="enrollClassId"
            required
            class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
          >
            <option value="" disabled>Select class to enroll into</option>
            <option v-for="c in classes" :key="c._id" :value="c._id">
              {{ c.name }} ({{ c.code }})
            </option>
          </select>
        </label>
      </form>
      <template #footer>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="enrollLead = null"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="enroll-form"
          class="btn btn-primary btn-sm"
          :disabled="saving"
        >
          {{ saving ? "Enrolling..." : "Confirm Enrollment" }}
        </button>
      </template>
    </AppDrawer>

    <!-- Lead Bulk Upload Modal (Opens from right side) -->
    <LeadBulkUploadModal
      :isOpen="showBulkUpload"
      @close="showBulkUpload = false"
      @success="load"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useStore } from "vuex";
import {
  PhFileArrowUp,
  PhCheckCircle,
  PhUserPlus,
  PhEye,
  PhPencilSimple,
  PhBell,
  PhDotsThreeVertical,
  PhNotePencil,
} from "@phosphor-icons/vue";
import AppTable from "@/components/AppTable.vue";
import AppDrawer from "@/components/AppDrawer.vue";
import EducationLeadDrawer from "../components/EducationLeadDrawer.vue";
import EducationLeadEditDrawer from "../components/EducationLeadEditDrawer.vue";
import EducationLeadLogDrawer from "../components/EducationLeadLogDrawer.vue";
import EducationLeadReminderModal from "../components/EducationLeadReminderModal.vue";
import LeadAssignModal from "@/modules/leads/components/LeadAssignModal.vue";
import LeadBulkUploadModal from "@/modules/leads/components/LeadBulkUploadModal.vue";
import {
  createEducationLead,
  enrollEducationLead,
  fetchEducationClasses,
  fetchEducationLeads,
} from "../api/endpoints";

const store = useStore();
const isOrgAdmin = computed(() =>
  ["super_admin", "system_admin", "org_admin", "organization_admin"].includes(
    String(store.getters["auth/userRole"] || "").toLowerCase(),
  ),
);
const canBulkUpload = computed(() => {
  const role = String(store.getters["auth/userRole"] || "").toLowerCase();
  return [
    "super_admin",
    "system_admin",
    "org_admin",
    "organization_admin",
    "manager",
    "branch_manager",
  ].includes(role);
});

const columns = computed(() => {
  const cols = [
    { key: "student", label: "Student" },
    { key: "parent", label: "Parent" },
    { key: "class", label: "Interested class" },
  ];
  // Only show "Assigned staff" to admins/managers overseeing staff allocation
  if (isOrgAdmin.value || canBulkUpload.value) {
    cols.push({ key: "staff", label: "Assigned staff" });
  }
  cols.push({ key: "status", label: "Status" });
  return cols;
});

const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 });

function formatStatus(status) {
  return String(status || "new").replace(/_/g, " ");
}

function statusClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "enrolled" || value === "converted") {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40";
  }
  if (value === "new" || value === "assigned") {
    return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40";
  }
  if (value === "contacted") {
    return "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/40";
  }
  if (value === "follow_up") {
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40";
  }
  if (value === "meeting_scheduled" || value === "counseling_scheduled") {
    return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40";
  }
  if (value === "qualified") {
    return "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40";
  }
  if (value === "application_trial") {
    return "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/40";
  }
  if (value === "lost") {
    return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40";
  }
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
}

const selectedRows = ref([]);
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

const showBulkUpload = ref(false);

const rows = ref([]);
const classes = ref([]);
const loading = ref(false);
const search = ref("");
const statusFilter = ref("");
const showModal = ref(false);
const saving = ref(false);
const error = ref("");
const form = ref({});
const enrollLead = ref(null);
const enrollClassId = ref("");
let timer = null;

// Assignment
const isAssignOpen = ref(false);
const targetAssignIds = ref([]);
const openAssign = (row) => {
  targetAssignIds.value = [row._id || row.id];
  isAssignOpen.value = true;
};
const openBulkAssign = () => {
  targetAssignIds.value = selectedRows.value.map((r) => r._id || r.id);
  isAssignOpen.value = true;
};
const handleAssignSuccess = () => {
  selectedRows.value = [];
  load();
};

// Details Drawer (Read-only View)
const isDetailsOpen = ref(false);
const activeLeadId = ref("");
const openDetails = (row) => {
  activeLeadId.value = row._id || row.id;
  isDetailsOpen.value = true;
};
const handleDetailsSuccess = () => {
  load();
};

// 3-Dots Action Dropdown Menu
const activeMenuRowId = ref("");
const activeMenuRow = ref(null);
const menuPosition = ref({ top: "auto", bottom: "auto", right: "0px" });

const toggleActionMenu = (row, event) => {
  const rowId = row._id || row.id;
  if (activeMenuRowId.value === rowId) {
    closeActionMenu();
    return;
  }
  const rect = event.currentTarget.getBoundingClientRect();
  const estimatedMenuHeight = 250;
  const bottomNavHeight = 72;
  const spaceBelow = window.innerHeight - rect.bottom - bottomNavHeight;

  if (spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight) {
    // Open UPWARDS above the trigger button to prevent bottom nav collision
    menuPosition.value = {
      top: "auto",
      bottom: `${window.innerHeight - rect.top + 4}px`,
      right: `${Math.max(8, window.innerWidth - rect.right)}px`,
    };
  } else {
    // Open DOWNWARDS below the trigger button
    menuPosition.value = {
      top: `${rect.bottom + 4}px`,
      bottom: "auto",
      right: `${Math.max(8, window.innerWidth - rect.right)}px`,
    };
  }
  activeMenuRow.value = row;
  activeMenuRowId.value = rowId;
};

const closeActionMenu = () => {
  activeMenuRowId.value = "";
  activeMenuRow.value = null;
};

// Menu Action Handlers
const handleView = (row) => {
  closeActionMenu();
  openDetails(row);
};

const handleEdit = (row) => {
  closeActionMenu();
  openEdit(row);
};

const handleReminder = (row) => {
  closeActionMenu();
  openReminder(row);
};

const handleEnroll = (row) => {
  closeActionMenu();
  openEnroll(row);
};

const handleAssign = (row) => {
  closeActionMenu();
  openAssign(row);
};

// Log Updates Drawer (Strictly Logging Updates)
const isLogOpen = ref(false);
const activeLogLeadId = ref("");
const activeLogLead = ref(null);

const handleLog = (row) => {
  closeActionMenu();
  activeLogLead.value = row;
  activeLogLeadId.value = row._id || row.id;
  isLogOpen.value = true;
};

const handleLogSuccess = () => {
  load();
};

// Edit Drawer
const isEditOpen = ref(false);
const activeEditLeadId = ref("");
const openEdit = (row) => {
  activeEditLeadId.value = row._id || row.id;
  isEditOpen.value = true;
};
const handleEditSuccess = () => {
  load();
};

// Reminder Modal
const isReminderOpen = ref(false);
const activeReminderLead = ref(null);
const openReminder = (row) => {
  activeReminderLead.value = row;
  isReminderOpen.value = true;
};
const handleReminderSuccess = () => {
  load();
};

async function load() {
  loading.value = true;
  try {
    const res = await fetchEducationLeads({
      search: search.value.trim() || undefined,
      status: statusFilter.value || undefined,
      page: pagination.value.page,
      limit: pagination.value.limit,
    });
    rows.value = res.data || [];
    const p = res.pagination || {};
    pagination.value = {
      page: Number(p.page) || pagination.value.page,
      limit: Number(p.limit) || pagination.value.limit,
      total: Number(p.total) || rows.value.length,
      totalPages: Number(p.pages || p.totalPages) || 1,
    };
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page) {
  pagination.value.page = page;
  load();
}

function handlePageSizeChange(limit) {
  pagination.value.limit = limit;
  pagination.value.page = 1;
  load();
}

function onFilterChange() {
  pagination.value.page = 1;
  load();
}

function handleSearch() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    pagination.value.page = 1;
    load();
  }, 300);
}

function openCreate() {
  form.value = {
    firstName: "",
    lastName: "",
    mobile: "",
    source: "walk_in",
    parentName: "",
    parentMobile: "",
    classInterestId: "",
  };
  error.value = "";
  showModal.value = true;
}

function openEnroll(row) {
  enrollLead.value = row;
  enrollClassId.value = row.classInterestId?._id || row.classInterestId || "";
  error.value = "";
}

async function save() {
  saving.value = true;
  error.value = "";
  try {
    await createEducationLead({
      ...form.value,
      classInterestId: form.value.classInterestId || undefined,
    });
    showModal.value = false;
    await load();
  } catch (err) {
    error.value = err.data?.message || err.message || "Unable to save lead.";
  } finally {
    saving.value = false;
  }
}

async function enroll() {
  if (!enrollLead.value || !enrollClassId.value) return;
  saving.value = true;
  error.value = "";
  try {
    await enrollEducationLead(enrollLead.value._id, {
      classId: enrollClassId.value,
    });
    enrollLead.value = null;
    await load();
  } catch (err) {
    error.value = err.data?.message || err.message || "Unable to enroll lead.";
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  const res = await fetchEducationClasses({ limit: 100 });
  classes.value = res.data || [];
  await load();
});
</script>
