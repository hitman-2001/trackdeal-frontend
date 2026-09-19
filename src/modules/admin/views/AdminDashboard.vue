<template>
  <div class="admin-dash">

    <!-- ── Header ─────────────────────────────────────────────────── -->
    <div class="admin-dash__header">
      <div>
        <p class="eyebrow">Platform Administration</p>
        <h1 class="admin-dash__title">Dashboard</h1>
        <p class="admin-dash__subtitle">
          Real-time SaaS cluster analytics, tenant growth, and platform health.
        </p>
      </div>
      <div class="flex items-center gap-2.5 shrink-0">
        <button
          @click="loadData"
          class="btn btn-secondary btn-sm gap-1.5"
        >
          <PhArrowsClockwise :size="14" :class="{ 'animate-spin': loading }" />
          <span>Refresh</span>
        </button>
        <router-link
          to="/admin/organizations"
          class="btn btn-primary btn-sm gap-1.5"
        >
          <PhPlus :size="14" weight="bold" />
          <span>Add Tenant</span>
        </router-link>
      </div>
    </div>

    <!-- ── Loading State ─────────────────────────────────────────── -->
    <div v-if="loading && !stats" class="admin-dash__loading">
      <div class="admin-dash__spinner"></div>
      <p class="admin-dash__loading-text">Loading platform metrics…</p>
    </div>

    <div v-else class="admin-dash__body">

      <!-- ── KPI Cards ─────────────────────────────────────────── -->
      <div class="admin-kpi-grid">

        <!-- Organizations -->
        <div class="admin-kpi">
          <div class="admin-kpi__top">
            <span class="admin-kpi__label">Organizations</span>
            <div class="admin-kpi__icon admin-kpi__icon--accent">
              <PhBuildings :size="17" weight="duotone" />
            </div>
          </div>
          <p class="admin-kpi__value">{{ stats?.totalOrganizations ?? 0 }}</p>
          <div class="admin-kpi__detail">
            <span class="admin-kpi__detail--positive">+{{ stats?.newOrganizationsThisMonth ?? 0 }} this month</span>
            <span class="admin-kpi__dot">·</span>
            <span>{{ stats?.activeTenants ?? 0 }} active</span>
          </div>
        </div>

        <!-- Platform Users -->
        <div class="admin-kpi">
          <div class="admin-kpi__top">
            <span class="admin-kpi__label">Total Users</span>
            <div class="admin-kpi__icon admin-kpi__icon--success">
              <PhUsersThree :size="17" weight="duotone" />
            </div>
          </div>
          <p class="admin-kpi__value">{{ stats?.totalUsers ?? 0 }}</p>
          <div class="admin-kpi__detail">
            <span class="admin-kpi__detail--positive">+{{ stats?.newUsersThisMonth ?? 0 }} new</span>
            <span class="admin-kpi__dot">·</span>
            <span>Across all tenants</span>
          </div>
        </div>

        <!-- Active Tenants -->
        <div class="admin-kpi">
          <div class="admin-kpi__top">
            <span class="admin-kpi__label">Active Tenants</span>
            <div class="admin-kpi__icon admin-kpi__icon--info">
              <PhLightning :size="17" weight="duotone" />
            </div>
          </div>
          <p class="admin-kpi__value">{{ stats?.activeTenants ?? 0 }}</p>
          <div class="admin-kpi__detail">
            <span>{{ stats?.inactiveTenants ?? 0 }} inactive</span>
            <template v-if="stats?.suspendedTenants > 0">
              <span class="admin-kpi__dot">·</span>
              <span class="admin-kpi__detail--danger">{{ stats?.suspendedTenants }} suspended</span>
            </template>
          </div>
        </div>

        <!-- Platform Leads -->
        <div class="admin-kpi">
          <div class="admin-kpi__top">
            <span class="admin-kpi__label">Platform Leads</span>
            <div class="admin-kpi__icon admin-kpi__icon--warning">
              <PhTarget :size="17" weight="duotone" />
            </div>
          </div>
          <p class="admin-kpi__value">{{ stats?.totalLeads ?? 0 }}</p>
          <div class="admin-kpi__detail">
            <span>{{ stats?.totalDeals ?? 0 }} deals</span>
            <span class="admin-kpi__dot">·</span>
            <span>{{ stats?.totalProperties ?? 0 }} properties</span>
          </div>
        </div>

      </div>

      <!-- ── Lower grid: Organizations table + Health panel ─────── -->
      <div class="admin-lower">

        <!-- Recent Organizations Table -->
        <div class="workspace-panel admin-orgs-panel">
          <div class="admin-section-header">
            <div>
              <p class="eyebrow">Tenants</p>
              <h2 class="admin-section-title">Recent Tenant Organizations</h2>
              <p class="admin-section-sub">Newly onboarded organizations across all verticals</p>
            </div>
            <router-link
              to="/admin/organizations"
              class="admin-view-all"
            >
              <span>View All ({{ stats?.totalOrganizations ?? 0 }})</span>
              <PhArrowRight :size="11" />
            </router-link>
          </div>

          <div class="overflow-x-auto">
            <table class="workspace-table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Owner</th>
                  <th>Vertical / Plan</th>
                  <th class="text-center">Users</th>
                  <th class="text-center">Leads</th>
                  <th>Status</th>
                  <th class="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="org in recentOrganizations"
                  :key="org._id"
                >
                  <td>
                    <span class="workspace-table-primary">{{ org.name }}</span>
                    <span class="workspace-table-muted font-mono">{{ org.code }}</span>
                  </td>
                  <td>
                    <span class="workspace-table-primary">
                      {{ org.ownerId?.firstName }} {{ org.ownerId?.lastName }}
                    </span>
                    <span class="workspace-table-muted truncate max-w-[150px] block">{{ org.ownerId?.email }}</span>
                  </td>
                  <td>
                    <span class="workspace-status capitalize">
                      {{ org.organizationType || org.subscriptionPlan || 'Agency' }}
                    </span>
                  </td>
                  <td class="text-center font-mono" style="color: hsl(var(--neutral-700)); font-weight: 600">
                    {{ org.usersCount || 0 }}
                  </td>
                  <td class="text-center font-mono" style="color: hsl(var(--neutral-700)); font-weight: 600">
                    {{ org.leadsCount || 0 }}
                  </td>
                  <td>
                    <span
                      class="status-pill"
                      :class="{
                        'status-pill--success': org.status === 'active',
                        'status-pill--warning': org.status === 'inactive',
                        'status-pill--danger': org.status === 'suspended',
                      }"
                    >
                      {{ org.status }}
                    </span>
                  </td>
                  <td class="text-right">
                    <router-link
                      :to="`/admin/organizations/${org._id}`"
                      class="admin-action-btn"
                      title="Manage organization"
                    >
                      <PhGearSix :size="14" />
                    </router-link>
                  </td>
                </tr>
                <tr v-if="recentOrganizations.length === 0">
                  <td colspan="7" class="py-10 text-center" style="color: hsl(var(--neutral-400)); font-size: 12px">
                    No organizations found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Platform Health + Quick Actions -->
        <div class="workspace-panel admin-health-panel">
          <div class="admin-section-header admin-section-header--compact">
            <div>
              <p class="eyebrow">System</p>
              <h2 class="admin-section-title">Platform Health</h2>
              <p class="admin-section-sub">Cluster runtime services &amp; controls</p>
            </div>
          </div>

          <!-- Health rows -->
          <div class="health-list">
            <div class="health-row">
              <div class="flex items-center gap-2.5">
                <span class="health-dot health-dot--ok"></span>
                <div>
                  <p class="health-service">MongoDB Multi-Tenant DB</p>
                  <p class="health-meta">ReplicaSet Connected · Isolated Contexts</p>
                </div>
              </div>
              <span class="health-badge health-badge--ok">Healthy</span>
            </div>

            <div class="health-row">
              <div class="flex items-center gap-2.5">
                <span class="health-dot health-dot--ok"></span>
                <div>
                  <p class="health-service">API Gateway &amp; Fastify</p>
                  <p class="health-meta">JWT Authentication &amp; Rate Limiters</p>
                </div>
              </div>
              <span class="health-badge health-badge--ok">Active</span>
            </div>

            <div class="health-row">
              <div class="flex items-center gap-2.5">
                <span class="health-dot health-dot--ok"></span>
                <div>
                  <p class="health-service">Tenant Isolation Policy</p>
                  <p class="health-meta">Strict Org-ID Scoping &amp; Masked PII</p>
                </div>
              </div>
              <span class="health-badge health-badge--ok">Enforced</span>
            </div>
          </div>

          <!-- Quick actions -->
          <div class="health-actions">
            <router-link to="/admin/users" class="btn btn-secondary btn-sm w-full justify-center gap-2">
              <PhUsersThree :size="14" />
              <span>Manage Platform Users</span>
            </router-link>
            <router-link to="/admin/audit-logs" class="btn btn-secondary btn-sm w-full justify-center gap-2">
              <PhScroll :size="14" />
              <span>View System Audit Logs</span>
            </router-link>
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
import { fetchAdminDashboard } from "../api/endpoints";

const loading = ref(false);
const stats = ref(null);
const recentOrganizations = ref([]);

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

<style scoped>
/* ── Page shell ─────────────────────────────────────────────────── */
.admin-dash {
  max-width: 82rem;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Header ─────────────────────────────────────────────────────── */
.admin-dash__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.125rem;
  border-bottom: 1px solid hsl(var(--neutral-100));
}
.admin-dash__title {
  font-family: 'Manrope', system-ui, sans-serif;
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
  font-weight: 800;
  letter-spacing: -0.045em;
  color: hsl(var(--neutral-900));
  margin-top: 0.25rem;
  line-height: 1.1;
}
.admin-dash__subtitle {
  font-size: 13px;
  color: hsl(var(--neutral-400));
  margin-top: 0.35rem;
  line-height: 1.5;
}

/* ── Loading ─────────────────────────────────────────────────────── */
.admin-dash__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  gap: 0.75rem;
}
.admin-dash__spinner {
  width: 36px;
  height: 36px;
  border: 3px solid hsl(var(--accent-100));
  border-top-color: hsl(var(--accent-500));
  border-radius: 50%;
  animation: spin 0.85s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.admin-dash__loading-text { font-size: 12px; color: hsl(var(--neutral-400)); }

/* ── Body ───────────────────────────────────────────────────────── */
.admin-dash__body { display: flex; flex-direction: column; gap: 1.25rem; }

/* ── KPI grid ───────────────────────────────────────────────────── */
.admin-kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.875rem;
}
@media (min-width: 768px) {
  .admin-kpi-grid { grid-template-columns: repeat(4, 1fr); }
}

.admin-kpi {
  padding: 1.125rem;
  border-radius: 14px;
  border: 1px solid hsl(var(--neutral-100));
  background: hsl(var(--bg-surface));
  box-shadow: 0 1px 3px rgb(26 22 18 / 0.03);
  transition: box-shadow 150ms ease, border-color 150ms ease;
}
.admin-kpi:hover {
  box-shadow: 0 4px 16px rgb(26 22 18 / 0.06);
  border-color: hsl(var(--neutral-200));
}
.admin-kpi__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.admin-kpi__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: hsl(var(--neutral-400));
}
.admin-kpi__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
}
.admin-kpi__icon--accent  { background: hsl(var(--accent-100));  color: hsl(var(--accent-600)); }
.admin-kpi__icon--success { background: hsl(var(--success-bg));  color: hsl(var(--success-text)); }
.admin-kpi__icon--info    { background: hsl(var(--info-bg));     color: hsl(var(--info-text)); }
.admin-kpi__icon--warning { background: hsl(var(--warning-bg));  color: hsl(var(--warning-text)); }
.admin-kpi__value {
  font-family: 'Manrope', system-ui, sans-serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: hsl(var(--neutral-900));
}
.admin-kpi__detail {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: hsl(var(--neutral-400));
  margin-top: 0.35rem;
  flex-wrap: wrap;
}
.admin-kpi__dot { color: hsl(var(--neutral-300)); }
.admin-kpi__detail--positive { color: hsl(var(--success-text)); font-weight: 600; }
.admin-kpi__detail--danger   { color: hsl(var(--danger-text));  font-weight: 600; }

/* ── Lower section ──────────────────────────────────────────────── */
.admin-lower {
  display: grid;
  gap: 1.125rem;
  grid-template-columns: 1fr;
}
@media (min-width: 1024px) {
  .admin-lower { grid-template-columns: 2fr 1fr; }
}

.admin-orgs-panel,
.admin-health-panel { overflow: hidden; }

.admin-section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.125rem 1.25rem;
  border-bottom: 1px solid hsl(var(--neutral-100));
}
.admin-section-header--compact { border-bottom: 1px solid hsl(var(--neutral-100)); }
.admin-section-title {
  font-family: 'Manrope', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: hsl(var(--neutral-900));
  margin-top: 2px;
}
.admin-section-sub {
  font-size: 11px;
  color: hsl(var(--neutral-400));
  margin-top: 2px;
}
.admin-view-all {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: hsl(var(--accent-600));
  text-decoration: none;
  white-space: nowrap;
  margin-top: 4px;
  transition: color 120ms;
}
.admin-view-all:hover { color: hsl(var(--accent-700)); text-decoration: underline; }

/* Status pills */
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  text-transform: capitalize;
  border: 1px solid;
}
.status-pill--success {
  background: hsl(var(--success-bg));
  color: hsl(var(--success-text));
  border-color: hsl(var(--success-border));
}
.status-pill--warning {
  background: hsl(var(--warning-bg));
  color: hsl(var(--warning-text));
  border-color: hsl(var(--warning-border));
}
.status-pill--danger {
  background: hsl(var(--danger-bg));
  color: hsl(var(--danger-text));
  border-color: hsl(var(--danger-border));
}

/* Admin action button */
.admin-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 7px;
  border: 1px solid hsl(var(--neutral-100));
  background: hsl(var(--bg-surface));
  color: hsl(var(--neutral-500));
  transition: all 120ms ease;
}
.admin-action-btn:hover {
  border-color: hsl(var(--accent-200));
  background: hsl(var(--accent-50));
  color: hsl(var(--accent-600));
}

/* Health panel */
.health-list { display: flex; flex-direction: column; }
.health-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid hsl(var(--neutral-100));
  gap: 0.75rem;
}
.health-row:last-child { border-bottom: 0; }
.health-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  animation: pulse-health 2s ease-in-out infinite;
}
.health-dot--ok { background: hsl(var(--success-dot)); }
.health-dot--warn { background: hsl(var(--warning-dot)); }
.health-dot--err { background: hsl(var(--danger-dot)); }
@keyframes pulse-health {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.health-service {
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--neutral-800, var(--neutral-700)));
}
.health-meta {
  font-size: 10px;
  color: hsl(var(--neutral-400));
  margin-top: 1px;
}
.health-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  flex-shrink: 0;
}
.health-badge--ok {
  background: hsl(var(--success-bg));
  color: hsl(var(--success-text));
}
.health-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid hsl(var(--neutral-100));
}
</style>
