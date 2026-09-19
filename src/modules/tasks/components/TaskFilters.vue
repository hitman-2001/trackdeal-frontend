<template>
  <div
    class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4"
  >
    <!-- Saved Views tabs row -->
    <div
      class="flex items-center justify-between border-b border-default pb-3 flex-wrap gap-2"
    >
      <div class="flex space-x-1">
        <button
          v-for="view in savedViews"
          :key="view.id"
          @click="selectSavedView(view)"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
          :class="[
            activeSavedView === view.id
              ? 'bg-primary text-white'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850',
          ]"
        >
          {{ view.name }}
        </button>
      </div>

      <!-- Date range filters wrapper -->
      <div class="flex items-center space-x-2 text-xs">
        <span class="text-slate-400 dark:text-slate-500">Due Date:</span>
        <select
          v-model="activeDateRange"
          @change="handleFilterChange"
          class="bg-surface border border-default rounded-lg px-2.5 py-1.5 outline-none font-semibold text-slate-700 dark:text-slate-200"
        >
          <option value="all">All Time</option>
          <option value="today">Due Today</option>
          <option value="tomorrow">Due Tomorrow</option>
          <option value="week">Due This Week</option>
          <option value="overdue">Overdue Tasks</option>
        </select>
      </div>
    </div>

    <!-- Active Filters Form Grid -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3"
    >
      <!-- Search Input -->
      <div class="relative flex items-center">
        <input
          v-model="filtersState.search"
          type="text"
          placeholder="Search task title..."
          @input="debounceSearch"
          class="w-full bg-surface border border-default rounded-lg pl-3 pr-8 py-1.5 text-xs placeholder-slate-400 outline-none text-slate-750 focus:border-primary transition-colors animate-fade-in"
        />
        <div class="absolute right-2.5 pointer-events-none text-slate-400">
          <PhMagnifyingGlass class="w-3.5 h-3.5" />
        </div>
      </div>

      <!-- Status dropdown -->
      <select
        v-model="filtersState.status"
        @change="handleFilterChange"
        class="bg-surface border border-default rounded-lg px-3 py-1.5 text-xs outline-none text-slate-700 dark:text-slate-200 font-medium"
      >
        <option value="">Filter by Status</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="missed">Missed (Overdue)</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <!-- Priority dropdown -->
      <select
        v-model="filtersState.priority"
        @change="handleFilterChange"
        class="bg-surface border border-default rounded-lg px-3 py-1.5 text-xs outline-none text-slate-700 dark:text-slate-200 font-medium"
      >
        <option value="">Filter by Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      <!-- Task Type dropdown -->
      <select
        v-model="filtersState.type"
        @change="handleFilterChange"
        class="bg-surface border border-default rounded-lg px-3 py-1.5 text-xs outline-none text-slate-700 dark:text-slate-200 font-medium"
      >
        <option value="">Filter by Type</option>
        <option value="call">Phone Call</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="email">Email</option>
        <option value="site_visit">Site Visit</option>
        <option value="meeting">Meeting</option>
        <option value="document">Document Review</option>
        <option value="payment">Payout/Payment</option>
        <option value="general">General Task</option>
      </select>

      <!-- Agent/Owner dropdown -->
      <select
        v-model="filtersState.assignedTo"
        @change="handleFilterChange"
        class="bg-surface border border-default rounded-lg px-3 py-1.5 text-xs outline-none text-slate-700 dark:text-slate-200 font-medium"
      >
        <option value="">All Agents</option>
        <option :value="currentUser.id">Me (My Assigned)</option>
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
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { PhMagnifyingGlass } from "@phosphor-icons/vue";
import apiClient from "@/api/client";

const emit = defineEmits(["change"]);

const store = useStore();
const currentUser = computed(() => store.state.auth.user || {});
const userRole = computed(() => store.getters["auth/userRole"] || "agent");

const agents = ref([]);

const fetchAgents = async () => {
  // Only fetch agents if user has users read permission
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
    // Fallback static agents
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
    name: "Pending Tasks",
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
</script>
