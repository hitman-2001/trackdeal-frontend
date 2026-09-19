<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <h1
          class="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white"
        >
          Platform Audit Logs
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Immutable audit trail of all platform-level administrative actions,
          security changes, and tenant updates.
        </p>
      </div>
      <button
        @click="loadLogs"
        class="btn btn-secondary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
      >
        <AppIcon
          name="refresh"
          :size="14"
          :class="{ 'animate-spin': loading }"
        />
        <span>Refresh Logs</span>
      </button>
    </div>

    <!-- Filter Toolbar -->
    <div
      class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 shadow-xs"
    >
      <input
        v-model="searchQuery"
        @input="handleSearch"
        type="text"
        placeholder="Filter by action, user email, description..."
        class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 w-full sm:w-80"
      />
      <div class="text-xs text-slate-500 dark:text-slate-400">
        Total Recorded:
        <span class="font-bold text-slate-900 dark:text-white">{{
          pagination.total || 0
        }}</span>
      </div>
    </div>

    <!-- Logs Table -->
    <div
      class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead
            class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800"
          >
            <tr>
              <th class="py-3 px-4">Action</th>
              <th class="py-3 px-4">Target Entity</th>
              <th class="py-3 px-4">Admin User</th>
              <th class="py-3 px-4">Description</th>
              <th class="py-3 px-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody
            class="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]"
          >
            <tr
              v-for="log in logs"
              :key="log._id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
            >
              <td class="py-3 px-4">
                <span
                  class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-primary/5 text-primary border border-primary/20 dark:bg-primary/15 dark:text-accent-400"
                >
                  {{ log.action }}
                </span>
              </td>
              <td
                class="py-3 px-4 text-slate-700 dark:text-slate-300 font-sans font-semibold"
              >
                {{ log.entity || "Platform" }}
              </td>
              <td
                class="py-3 px-4 text-slate-700 dark:text-slate-300 font-sans"
              >
                {{ log.userName || log.userEmail }}
              </td>
              <td
                class="py-3 px-4 text-slate-700 dark:text-slate-300 font-sans"
              >
                {{ log.description }}
              </td>
              <td
                class="py-3 px-4 text-slate-500 dark:text-slate-400 text-right font-sans"
              >
                {{ formatDateTime(log.createdAt || log.timestamp) }}
              </td>
            </tr>
            <tr v-if="logs.length === 0">
              <td
                colspan="5"
                class="py-12 text-center text-xs text-slate-500 font-sans"
              >
                No audit logs found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppPagination
        :page="pagination.page"
        :page-size="pagination.limit"
        :total="pagination.total"
        :total-pages="pagination.pages"
        :show-page-size="false"
        @page-change="changePage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { fetchAdminAuditLogs } from "../api/endpoints";

const loading = ref(false);
const logs = ref([]);
const pagination = ref({ page: 1, limit: 20, total: 0, pages: 1 });
const searchQuery = ref("");

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
