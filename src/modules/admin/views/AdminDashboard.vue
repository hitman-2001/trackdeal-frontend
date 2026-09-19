<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- ── Header ─────────────────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-accent-400">
          Platform Administration
        </p>
        <h1 class="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
          Super Admin Console
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time SaaS cluster analytics, tenant growth, and platform health telemetry.
        </p>
      </div>
      <div class="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
        <button
          @click="loadData"
          class="btn btn-secondary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
        >
          <PhArrowsClockwise :size="14" :class="{ 'animate-spin': loading }" />
          <span>Refresh</span>
        </button>
        <router-link
          to="/admin/organizations"
          class="btn btn-primary px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 shadow-xs"
        >
          <PhPlus :size="14" weight="bold" />
          <span>Add Tenant Org</span>
        </router-link>
      </div>
    </div>

    <!-- ── Loading State ─────────────────────────────────────────── -->
    <div v-if="loading && !stats" class="py-24 text-center">
      <div class="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading platform metrics…</p>
    </div>

    <div v-else class="space-y-6">
      <!-- ── KPI Bento Cards ─────────────────────────────────────── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Organizations -->
        <div class="bg-surface border border-default rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <div class="flex items-center justify-between mb-2 sm:mb-3">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Organizations
            </span>
            <div class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <PhBuildings :size="18" weight="bold" />
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-slate-100 font-tabular tracking-tight mb-1">
            {{ stats?.totalOrganizations ?? 0 }}
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20">
              +{{ stats?.newOrganizationsThisMonth ?? 0 }} this month
            </span>
            <span>•</span>
            <span>{{ stats?.activeTenants ?? 0 }} active</span>
          </div>
        </div>

        <!-- Platform Users -->
        <div class="bg-surface border border-default rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <div class="flex items-center justify-between mb-2 sm:mb-3">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Users
            </span>
            <div class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <PhUsersThree :size="18" weight="bold" />
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-slate-100 font-tabular tracking-tight mb-1">
            {{ stats?.totalUsers ?? 0 }}
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20">
              +{{ stats?.newUsersThisMonth ?? 0 }} new
            </span>
            <span>•</span>
            <span>Across all tenants</span>
          </div>
        </div>

        <!-- Active Tenants -->
        <div class="bg-surface border border-default rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <div class="flex items-center justify-between mb-2 sm:mb-3">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Tenants
            </span>
            <div class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <PhLightning :size="18" weight="bold" />
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-slate-100 font-tabular tracking-tight mb-1">
            {{ stats?.activeTenants ?? 0 }}
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span>{{ stats?.inactiveTenants ?? 0 }} inactive</span>
            <template v-if="stats?.suspendedTenants > 0">
              <span>•</span>
              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-500/20">
                {{ stats?.suspendedTenants }} suspended
              </span>
            </template>
          </div>
        </div>

        <!-- Platform Leads -->
        <div class="bg-surface border border-default rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
          <div class="flex items-center justify-between mb-2 sm:mb-3">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Platform Leads
            </span>
            <div class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <PhTarget :size="18" weight="bold" />
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-slate-100 font-tabular tracking-tight mb-1">
            {{ stats?.totalLeads ?? 0 }}
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span>{{ stats?.totalDeals ?? 0 }} deals</span>
            <span>•</span>
            <span>{{ stats?.totalProperties ?? 0 }} properties</span>
          </div>
        </div>
      </div>

      <!-- ── Lower Grid: Organizations Table + Cluster Health ─────── -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Organizations AppTable (2 Columns on Large Screens) -->
        <div class="lg:col-span-2 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-sm font-bold text-slate-900 dark:text-white">
                Recent Tenant Organizations
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Newly onboarded organizations across all verticals
              </p>
            </div>
            <router-link
              to="/admin/organizations"
              class="inline-flex items-center gap-1 text-xs font-semibold text-primary dark:text-accent-400 hover:underline"
            >
              <span>View All ({{ stats?.totalOrganizations ?? 0 }})</span>
              <PhArrowRight :size="12" />
            </router-link>
          </div>

          <div class="rounded-xl bg-surface border border-default overflow-hidden shadow-xs">
            <AppTable
              :rows="recentOrganizations"
              :columns="tableColumns"
              :isLoading="loading"
              row-actions-label="Action"
              empty-title="No organizations found"
              empty-subtext="No organizations have been onboarded yet."
            >
              <!-- Cell: Organization Name & Code (Completely fixes the squished ManchClassesmanchcla bug) -->
              <template #cell(name)="{ row }">
                <div class="space-y-1 py-0.5">
                  <router-link
                    :to="`/admin/organizations/${row._id}`"
                    class="font-bold text-slate-900 dark:text-slate-100 hover:text-primary dark:hover:text-accent-400 transition-colors block text-xs"
                  >
                    {{ row.name }}
                  </router-link>
                  <div class="flex items-center gap-1.5">
                    <span class="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                      {{ row.code }}
                    </span>
                  </div>
                </div>
              </template>

              <!-- Cell: Owner -->
              <template #cell(owner)="{ row }">
                <div class="space-y-0.5 text-xs">
                  <div class="font-medium text-slate-800 dark:text-slate-200">
                    {{ row.ownerId?.firstName }} {{ row.ownerId?.lastName }}
                  </div>
                  <div class="text-[10px] text-slate-400 truncate max-w-[150px]">
                    {{ row.ownerId?.email }}
                  </div>
                </div>
              </template>

              <!-- Cell: Vertical & Plan -->
              <template #cell(vertical)="{ row }">
                <div class="flex flex-col gap-1 items-start">
                  <span
                    class="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border"
                    :class="row.vertical === 'education' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'"
                  >
                    {{ row.vertical === 'education' ? 'Education' : 'Real Estate' }}
                  </span>
                  <span class="text-[10px] text-slate-400 capitalize">
                    {{ row.organizationType || row.subscriptionPlan || 'Agency' }}
                  </span>
                </div>
              </template>

              <!-- Cell: Users -->
              <template #cell(usersCount)="{ row }">
                <span class="font-tabular font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {{ row.usersCount || 0 }}
                </span>
              </template>

              <!-- Cell: Leads -->
              <template #cell(leadsCount)="{ row }">
                <span class="font-tabular font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {{ row.leadsCount || 0 }}
                </span>
              </template>

              <!-- Cell: Status -->
              <template #cell(status)="{ row }">
                <span
                  class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1"
                  :class="{
                    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800': row.status === 'active',
                    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800': row.status === 'inactive',
                    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800': row.status === 'suspended',
                  }"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="{
                      'bg-emerald-500': row.status === 'active',
                      'bg-amber-500': row.status === 'inactive',
                      'bg-rose-500': row.status === 'suspended',
                    }"
                  ></span>
                  {{ row.status }}
                </span>
              </template>

              <!-- Row Action -->
              <template #rowActions="{ row }">
                <router-link
                  :to="`/admin/organizations/${row._id}`"
                  class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                  title="Manage organization"
                >
                  <PhGearSix :size="15" />
                </router-link>
              </template>
            </AppTable>
          </div>
        </div>

        <!-- Platform Health & Controls (1 Column on Large Screens) -->
        <div class="space-y-3">
          <div>
            <h2 class="text-sm font-bold text-slate-900 dark:text-white">
              Platform Health
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Cluster runtime services &amp; operational status
            </p>
          </div>

          <div class="bg-surface border border-default rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
            <!-- Services status list -->
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
                <div class="flex items-center gap-2.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <div>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">
                      MongoDB Multi-Tenant DB
                    </div>
                    <div class="text-[10px] text-slate-400">
                      ReplicaSet Connected • Isolated Scopes
                    </div>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20">
                  Healthy
                </span>
              </div>

              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
                <div class="flex items-center gap-2.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <div>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">
                      API Gateway &amp; Fastify
                    </div>
                    <div class="text-[10px] text-slate-400">
                      JWT Auth • Rate Limiters Active
                    </div>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>

              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
                <div class="flex items-center gap-2.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <div>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Tenant Isolation Policy
                    </div>
                    <div class="text-[10px] text-slate-400">
                      Strict AsyncLocalStorage • Masked PII
                    </div>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20">
                  Enforced
                </span>
              </div>
            </div>

            <!-- Quick navigation links -->
            <div class="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <router-link
                to="/admin/users"
                class="btn btn-secondary btn-sm w-full justify-center gap-2"
              >
                <PhUsersThree :size="14" />
                <span>Manage Platform Users</span>
              </router-link>
              <router-link
                to="/admin/audit-logs"
                class="btn btn-secondary btn-sm w-full justify-center gap-2"
              >
                <PhScroll :size="14" />
                <span>View System Audit Logs</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  PhArrowsClockwise,
  PhPlus,
  PhBuildings,
  PhUsersThree,
  PhLightning,
  PhTarget,
  PhGearSix,
  PhScroll,
  PhArrowRight,
} from "@phosphor-icons/vue";
import AppTable from "@/components/AppTable.vue";
import { fetchAdminDashboard } from "../api/endpoints";

const loading = ref(false);
const stats = ref(null);
const recentOrganizations = ref([]);

const tableColumns = [
  { key: "name", label: "Organization" },
  { key: "owner", label: "Owner" },
  { key: "vertical", label: "Vertical / Plan" },
  { key: "usersCount", label: "Users", align: "center" },
  { key: "leadsCount", label: "Leads", align: "center" },
  { key: "status", label: "Status" },
];

async function loadData() {
  loading.value = true;
  try {
    const res = await fetchAdminDashboard();
    const payload = res?.data || res || {};
    stats.value = payload.summary || null;
    recentOrganizations.value = payload.recentOrganizations || [];
  } catch (err) {
    console.error("Failed to load admin dashboard:", err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>
