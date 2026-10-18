<template>
  <div class="space-y-3">
    <!-- Mobile: Search Bar + Filter Trigger Row (< 640px) -->
    <div class="sm:hidden space-y-2.5">
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <PhMagnifyingGlass :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
          <input
            v-model="filtersState.search"
            type="text"
            placeholder="Search tasks..."
            @input="debounceSearch"
            class="w-full h-10 pl-9 pr-8 bg-surface border border-default rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 shadow-2xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
          <button
            v-if="filtersState.search"
            type="button"
            @click="clearSearch"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            aria-label="Clear search"
          >
            <PhX :size="14" weight="bold" />
          </button>
        </div>

        <button
          type="button"
          @click="isFilterModalOpen = true"
          class="h-10 px-3.5 rounded-xl border font-semibold text-xs inline-flex items-center gap-1.5 shadow-2xs shrink-0 active:scale-95 transition-all"
          :class="activeFilterCount > 0
            ? 'border-primary bg-primary/10 text-primary font-bold'
            : 'border-default bg-surface text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-800'"
        >
          <PhSlidersHorizontal :size="16" weight="bold" />
          <span>Filters</span>
          <span
            v-if="activeFilterCount > 0"
            class="w-4.5 h-4.5 rounded-full bg-primary text-white text-[10px] font-bold inline-flex items-center justify-center shrink-0"
          >
            {{ activeFilterCount }}
          </span>
        </button>
      </div>

      <!-- Mobile Saved Views Swipeable Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
        <button
          v-for="view in savedViews"
          :key="view.id"
          type="button"
          @click="selectSavedView(view)"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all"
          :class="activeSavedView === view.id
            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
            : 'bg-surface text-slate-600 dark:text-slate-300 border border-default hover:bg-slate-50 dark:hover:bg-neutral-800'"
        >
          {{ view.name }}
        </button>
      </div>

      <!-- Mobile Active Filter Chips -->
      <div v-if="activeFilterCount > 0" class="flex items-center gap-1.5 flex-wrap pt-0.5">
        <button
          v-if="activeDateRange !== 'all'"
          type="button"
          @click="activeDateRange = 'all'; handleFilterChange()"
          class="h-6 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold text-blue-700 dark:text-blue-300 inline-flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>Due: {{ getDateRangeLabel(activeDateRange) }}</span>
          <PhX :size="11" weight="bold" class="opacity-70 hover:opacity-100" />
        </button>

        <button
          v-if="filtersState.status"
          type="button"
          @click="filtersState.status = ''; handleFilterChange()"
          class="h-6 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold text-amber-700 dark:text-amber-300 inline-flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>Status: {{ getStatusLabel(filtersState.status) }}</span>
          <PhX :size="11" weight="bold" class="opacity-70 hover:opacity-100" />
        </button>

        <button
          v-if="filtersState.priority"
          type="button"
          @click="filtersState.priority = ''; handleFilterChange()"
          class="h-6 px-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[11px] font-semibold text-purple-700 dark:text-purple-300 inline-flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>Priority: {{ filtersState.priority }}</span>
          <PhX :size="11" weight="bold" class="opacity-70 hover:opacity-100" />
        </button>

        <button
          v-if="filtersState.type"
          type="button"
          @click="filtersState.type = ''; handleFilterChange()"
          class="h-6 px-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] font-semibold text-teal-700 dark:text-teal-300 inline-flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>Type: {{ getTypeLabel(filtersState.type) }}</span>
          <PhX :size="11" weight="bold" class="opacity-70 hover:opacity-100" />
        </button>

        <button
          v-if="filtersState.assignedTo"
          type="button"
          @click="filtersState.assignedTo = ''; handleFilterChange()"
          class="h-6 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 inline-flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>Agent: {{ getAgentName(filtersState.assignedTo) }}</span>
          <PhX :size="11" weight="bold" class="opacity-70 hover:opacity-100" />
        </button>

        <button
          type="button"
          @click="clearAllFilters"
          class="h-6 px-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center"
        >
          Clear all
        </button>
      </div>
    </div>

    <!-- Desktop Toolbar (>= 640px) -->
    <div class="hidden sm:block bg-surface border border-default rounded-2xl p-4 shadow-xs space-y-3">
      <!-- Top Row: Saved Views + Search + Due Date -->
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <!-- Saved Views Tabs -->
        <div class="flex items-center gap-1 p-1 bg-slate-100 dark:bg-neutral-800/80 rounded-xl">
          <button
            v-for="view in savedViews"
            :key="view.id"
            type="button"
            @click="selectSavedView(view)"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            :class="activeSavedView === view.id
              ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'"
          >
            {{ view.name }}
          </button>
        </div>

        <!-- Search + Due Date -->
        <div class="flex items-center gap-2.5 min-w-0 flex-1 justify-end max-w-md">
          <div class="relative flex-1">
            <PhMagnifyingGlass :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              v-model="filtersState.search"
              type="text"
              placeholder="Search tasks..."
              @input="debounceSearch"
              class="filter-control !pl-9 !h-9 text-xs"
            />
            <button
              v-if="filtersState.search"
              type="button"
              @click="clearSearch"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <PhX :size="12" weight="bold" />
            </button>
          </div>

          <select
            v-model="activeDateRange"
            @change="handleFilterChange"
            class="filter-control !h-9 text-xs w-36 shrink-0"
          >
            <option value="all">All Time</option>
            <option value="today">Due Today</option>
            <option value="tomorrow">Due Tomorrow</option>
            <option value="week">Due This Week</option>
            <option value="overdue">Overdue Tasks</option>
          </select>
        </div>
      </div>

      <!-- Bottom Row: Filter Dropdowns Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-neutral-800/80 items-center">
        <!-- Status -->
        <select
          v-model="filtersState.status"
          @change="handleFilterChange"
          class="filter-control !h-9 text-xs"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="missed">Missed (Overdue)</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <!-- Priority -->
        <select
          v-model="filtersState.priority"
          @change="handleFilterChange"
          class="filter-control !h-9 text-xs"
        >
          <option value="">All Priorities</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
          <option value="urgent">Urgent Priority</option>
        </select>

        <!-- Type -->
        <select
          v-model="filtersState.type"
          @change="handleFilterChange"
          class="filter-control !h-9 text-xs"
        >
          <option value="">All Task Types</option>
          <option value="call">Phone Call</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
          <option value="site_visit">Site Visit</option>
          <option value="meeting">Meeting</option>
          <option value="document">Document Review</option>
          <option value="payment">Payout / Payment</option>
          <option value="general">General Task</option>
        </select>

        <!-- Agent -->
        <div class="flex items-center gap-2">
          <select
            v-model="filtersState.assignedTo"
            @change="handleFilterChange"
            class="filter-control !h-9 text-xs flex-1"
          >
            <option value="">All Agents</option>
            <option :value="currentUser.id || currentUser._id">Me (My Assigned)</option>
            <option
              v-for="agent in agents"
              :key="agent._id || agent.id"
              :value="agent._id || agent.id"
            >
              {{ agent.firstName }} {{ agent.lastName || "" }}
            </option>
          </select>

          <button
            v-if="activeFilterCount > 0"
            type="button"
            @click="clearAllFilters"
            class="btn btn-ghost btn-sm !h-9 px-2 text-xs text-rose-600 dark:text-rose-400 shrink-0"
            title="Reset all filters"
          >
            <PhArrowCounterClockwise :size="14" weight="bold" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Filter Modal (AppModal) -->
    <AppModal
      :isOpen="isFilterModalOpen"
      title="Filter Tasks"
      subtitle="Refine your tasks and agenda"
      maxSize="440px"
      @cancel="isFilterModalOpen = false"
      @confirm="isFilterModalOpen = false"
    >
      <div class="space-y-4 py-1">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Due Date</label>
          <select
            v-model="activeDateRange"
            @change="handleFilterChange"
            class="filter-control"
          >
            <option value="all">All Time</option>
            <option value="today">Due Today</option>
            <option value="tomorrow">Due Tomorrow</option>
            <option value="week">Due This Week</option>
            <option value="overdue">Overdue Tasks</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
          <select
            v-model="filtersState.status"
            @change="handleFilterChange"
            class="filter-control"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed (Overdue)</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
          <select
            v-model="filtersState.priority"
            @change="handleFilterChange"
            class="filter-control"
          >
            <option value="">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent Priority</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Task Type</label>
          <select
            v-model="filtersState.type"
            @change="handleFilterChange"
            class="filter-control"
          >
            <option value="">All Task Types</option>
            <option value="call">Phone Call</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
            <option value="site_visit">Site Visit</option>
            <option value="meeting">Meeting</option>
            <option value="document">Document Review</option>
            <option value="payment">Payout / Payment</option>
            <option value="general">General Task</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Assigned Agent</label>
          <select
            v-model="filtersState.assignedTo"
            @change="handleFilterChange"
            class="filter-control"
          >
            <option value="">All Agents</option>
            <option :value="currentUser.id || currentUser._id">Me (My Assigned)</option>
            <option
              v-for="agent in agents"
              :key="agent._id || agent.id"
              :value="agent._id || agent.id"
            >
              {{ agent.firstName }} {{ agent.lastName || "" }}
            </option>
          </select>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="clearAllFilters"
          class="btn btn-secondary btn-sm"
        >
          Reset All
        </button>
        <button
          type="button"
          @click="isFilterModalOpen = false"
          class="btn btn-primary btn-sm"
        >
          Done
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useStore } from "vuex";
import {
  PhMagnifyingGlass,
  PhSlidersHorizontal,
  PhX,
  PhArrowCounterClockwise
} from "@phosphor-icons/vue";
import AppModal from "@/components/AppModal.vue";
import apiClient from "@/api/client";

const emit = defineEmits(["change"]);

const store = useStore();
const currentUser = computed(() => store.state.auth.user || {});

const agents = ref([]);
const isFilterModalOpen = ref(false);

const fetchAgents = async () => {
  const hasUsersPerm =
    store.getters["permissions/hasCapability"]("users:read") ||
    store.getters["permissions/hasCapability"]("users.read");

  if (!hasUsersPerm) {
    agents.value = [currentUser.value];
    return;
  }

  try {
    const response = await apiClient.get("/users");
    agents.value = response.data?.data || [];
  } catch (error) {
    agents.value = [
      { id: "user-david", firstName: "David", lastName: "Miller" },
      { id: "user-sonia", firstName: "Sonia", lastName: "Rao" },
      { id: "user-ravi", firstName: "Ravi", lastName: "Verma" },
    ];
  }
};

onMounted(fetchAgents);

const savedViews = [
  {
    id: "all",
    name: "All Tasks",
    filters: { status: "", assignedTo: "", priority: "", type: "", search: "" },
  },
  {
    id: "my",
    name: "My Tasks",
    filters: {
      status: "",
      assignedTo: currentUser.value.id || currentUser.value._id || "",
      priority: "",
      type: "",
      search: "",
    },
  },
  {
    id: "pending",
    name: "Pending",
    filters: {
      status: "pending",
      assignedTo: "",
      priority: "",
      type: "",
      search: "",
    },
  },
  {
    id: "urgent",
    name: "Urgent",
    filters: {
      status: "",
      assignedTo: "",
      priority: "urgent",
      type: "",
      search: "",
    },
  },
];

const activeSavedView = ref("all");
const activeDateRange = ref("all");

const filtersState = reactive({
  search: "",
  status: "",
  priority: "",
  type: "",
  assignedTo: "",
});

let searchDebounce = null;

const debounceSearch = () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    handleFilterChange();
  }, 350);
};

const clearSearch = () => {
  filtersState.search = "";
  handleFilterChange();
};

const activeFilterCount = computed(() => {
  let count = 0;
  if (filtersState.status) count++;
  if (filtersState.priority) count++;
  if (filtersState.type) count++;
  if (filtersState.assignedTo) count++;
  if (activeDateRange.value !== "all") count++;
  return count;
});

const selectSavedView = (view) => {
  activeSavedView.value = view.id;
  Object.keys(view.filters).forEach((key) => {
    filtersState[key] = view.filters[key];
  });
  handleFilterChange();
};

const handleFilterChange = () => {
  const payload = { ...filtersState, dateRange: activeDateRange.value };
  emit("change", payload);
};

const clearAllFilters = () => {
  activeSavedView.value = "all";
  filtersState.status = "";
  filtersState.priority = "";
  filtersState.type = "";
  filtersState.assignedTo = "";
  activeDateRange.value = "all";
  handleFilterChange();
};

const getDateRangeLabel = (val) => {
  switch (val) {
    case "today": return "Today";
    case "tomorrow": return "Tomorrow";
    case "week": return "This Week";
    case "overdue": return "Overdue";
    default: return val;
  }
};

const getStatusLabel = (val) => {
  switch (val) {
    case "pending": return "Pending";
    case "in_progress": return "In Progress";
    case "completed": return "Completed";
    case "missed": return "Missed";
    case "cancelled": return "Cancelled";
    default: return val;
  }
};

const getTypeLabel = (val) => {
  switch (val) {
    case "call": return "Call";
    case "whatsapp": return "WhatsApp";
    case "email": return "Email";
    case "site_visit": return "Site Visit";
    case "meeting": return "Meeting";
    case "document": return "Document";
    case "payment": return "Payment";
    case "general": return "General";
    default: return val;
  }
};

const getAgentName = (id) => {
  if (id === currentUser.value.id || id === currentUser.value._id) return "Me";
  const agent = agents.value.find((a) => (a._id || a.id) === id);
  if (agent) {
    return `${agent.firstName} ${agent.lastName || ""}`.trim();
  }
  return "Assigned";
};
</script>
