<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-accent-400">
          Security &amp; Compliance
        </p>
        <h1 class="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
          Platform Audit Logs
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Immutable audit trail of all platform-level administrative actions, security changes, and tenant updates.
        </p>
      </div>
      <button
        @click="loadLogs"
        class="btn btn-secondary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto"
      >
        <PhArrowsClockwise
          :size="14"
          :class="{ 'animate-spin': loading }"
        />
        <span>Refresh Logs</span>
      </button>
    </div>

    <!-- Filter Toolbar -->
    <div class="p-4 rounded-xl bg-surface border border-default flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
      <div class="relative w-full sm:w-80">
        <PhMagnifyingGlass :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Filter by action, user email, description..."
          class="w-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
        />
      </div>
      <div class="text-xs text-slate-500 dark:text-slate-400 self-end sm:self-auto font-medium">
        Total Recorded:
        <span class="font-bold text-slate-900 dark:text-white font-tabular">{{ pagination.total || 0 }}</span>
      </div>
    </div>

    <!-- Logs AppTable -->
    <div class="rounded-xl bg-surface border border-default overflow-hidden shadow-xs">
      <AppTable
        :rows="logs"
        :columns="columns"
        :isLoading="loading"
        :pagination="pagination"
        empty-title="No audit logs recorded"
        empty-subtext="No administrative actions match your filter criteria."
        @pageChange="changePage"
        @pageSizeChange="handlePageSizeChange"
      >
        <!-- Cell: Action Badge -->
        <template #cell(action)="{ row }">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent-300 border border-primary/20">
            {{ row.action }}
          </span>
        </template>

        <!-- Cell: Target Entity -->
        <template #cell(entity)="{ row }">
          <span class="font-bold text-slate-800 dark:text-slate-200 text-xs">
            {{ row.entity || "Platform" }}
          </span>
        </template>

        <!-- Cell: Admin User -->
        <template #cell(user)="{ row }">
          <span class="text-xs text-slate-700 dark:text-slate-300 font-medium">
            {{ row.userName || row.userEmail }}
          </span>
        </template>

        <!-- Cell: Description -->
        <template #cell(description)="{ row }">
          <span class="text-xs text-slate-600 dark:text-slate-400">
            {{ row.description }}
          </span>
        </template>

        <!-- Cell: Timestamp -->
        <template #cell(createdAt)="{ row }">
          <span class="text-xs font-tabular text-slate-500 dark:text-slate-400">
            {{ formatDateTime(row.createdAt || row.timestamp) }}
          </span>
        </template>
      </AppTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { PhArrowsClockwise, PhMagnifyingGlass } from "@phosphor-icons/vue";
import AppTable from "@/components/AppTable.vue";
import { fetchAdminAuditLogs } from "../api/endpoints";

const loading = ref(false);
const logs = ref([]);
const pagination = ref({ page: 1, limit: 20, total: 0, pages: 1 });
const searchQuery = ref("");

const columns = [
  { key: "action", label: "Action" },
  { key: "entity", label: "Target Entity" },
  { key: "user", label: "Admin User" },
  { key: "description", label: "Description" },
  { key: "createdAt", label: "Timestamp", align: "right" },
];

let searchTimer = null;
function handleSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    pagination.value.page = 1;
    loadLogs();
  }, 300);
}

async function loadLogs() {
  loading.value = true;
  try {
    const res = await fetchAdminAuditLogs({
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: searchQuery.value.trim() || undefined,
    });
    logs.value = res?.data || [];
    if (res?.pagination) {
      pagination.value = res.pagination;
    }
  } catch (err) {
    console.error("Failed to load audit logs:", err);
  } finally {
    loading.value = false;
  }
}

function changePage(p) {
  pagination.value.page = p;
  loadLogs();
}

function handlePageSizeChange(size) {
  pagination.value.limit = size;
  pagination.value.page = 1;
  loadLogs();
}

function formatDateTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

onMounted(() => {
  loadLogs();
});
</script>
