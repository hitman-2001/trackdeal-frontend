<template>
  <div class="dash-root mx-auto max-w-[1600px]">
    <!-- ═══════════════════════════════════════════════
         HERO HEADER — KokonutUI bento-style greeting
         ═══════════════════════════════════════════════ -->
    <header class="dash-hero" aria-label="Dashboard header">
      <!-- Left: Greeting & subtitle -->
      <div class="dash-hero__copy">
        <div class="dash-hero__eyebrow">
          <span class="eyebrow-dot"></span>
          <span>{{ formattedToday }}</span>
        </div>
        <h1 class="dash-hero__title">
          {{ greeting }},&nbsp;<span class="dash-hero__name">{{
            firstName
          }}</span>
        </h1>
        <p class="dash-hero__sub">
          Here's your pipeline at a glance — follow-ups due, deals in motion,
          and what needs your attention today.
        </p>
      </div>

      <!-- Right: Controls row -->
      <div class="dash-hero__controls">
        <!-- Period selector -->
        <div class="period-pill" role="group" aria-label="Reporting period">
          <button
            v-for="p in periods"
            :key="p.value"
            type="button"
            :aria-pressed="selectedPeriod === p.value"
            :class="[
              'period-pill__btn',
              selectedPeriod === p.value && 'period-pill__btn--active',
            ]"
            @click="setPeriod(p.value)"
          >
            {{ p.label }}
          </button>
        </div>
        <!-- Refresh + CTA -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="icon-btn"
            :class="{ spin: refreshing }"
            @click="refreshData"
            aria-label="Refresh dashboard"
            :disabled="loading"
          >
            <AppIcon name="refresh" :size="16" />
          </button>
          <router-link
            to="/app/leads"
            class="btn btn-primary btn-sm gap-1.5 font-semibold"
          >
            <AppIcon name="add" :size="14" weight="bold" />
            <span>New Lead</span>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Loading skeleton -->
    <div v-if="loading" class="dash-skeleton">
      <div v-for="i in 4" :key="i" class="dash-skeleton__card"></div>
      <div class="dash-skeleton__wide"></div>
      <div class="dash-skeleton__side"></div>
    </div>

    <template v-else>
      <!-- ═══════════════════════════════════════════════
           ROW 1: KPI Headline Strip — 4 metric tiles
           ═══════════════════════════════════════════════ -->
      <section class="kpi-strip" aria-label="Key performance indicators">
        <router-link
          v-for="m in kpiMetrics"
          :key="m.label"
          :to="m.to"
          class="kpi-tile group"
          :class="`kpi-tile--${m.tone}`"
        >
          <!-- Icon -->
          <div class="kpi-tile__icon" :class="`kpi-tile__icon--${m.tone}`">
            <AppIcon :name="m.icon" :size="18" weight="duotone" />
          </div>

          <!-- Value -->
          <p class="kpi-tile__value">{{ m.value }}</p>
          <p class="kpi-tile__label">{{ m.label }}</p>
          <p class="kpi-tile__detail">{{ m.detail }}</p>

          <!-- Hover arrow -->
          <div class="kpi-tile__arrow">
            <AppIcon name="arrowRight" :size="13" />
          </div>
        </router-link>
      </section>

      <!-- ═══════════════════════════════════════════════
           ROW 2: Pulse Hero + Priority Queue (bento grid)
           ═══════════════════════════════════════════════ -->
      <section class="bento-row">
        <!-- Pipeline Pulse Card (large, dark) -->
        <div class="pulse-card">
          <!-- Subtle animated noise overlay -->
          <div class="pulse-card__noise" aria-hidden="true"></div>

          <div class="pulse-card__body">
            <!-- Top: metric -->
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="pulse-card__eyebrow">Active pipeline value</p>
                <p class="pulse-card__figure">
                  ₹{{ formatCompact(kpis.activePipelineValue || 0) }}
                </p>
                <p class="pulse-card__caption">
                  {{ kpis.activeDeals || 0 }} live deals across
                  {{ pipelineStages.length }} stages
                </p>
              </div>
              <div class="pulse-icon-wrap">
                <AppIcon name="trend" :size="20" weight="duotone" />
              </div>
            </div>

            <!-- Pipeline bar chart (Bklit-inspired) -->
            <div>
              <div class="pulse-chart-header">
                <span>Pipeline distribution</span>
                <router-link to="/app/leads" class="pulse-chart-link">
                  Open pipeline <AppIcon name="arrowRight" :size="11" />
                </router-link>
              </div>
              <PipelineChart
                :items="
                  pipelineStages.map((s) => ({
                    label: s.label,
                    value: getStageCount(s.key),
                  }))
                "
                class="text-emerald-300"
              />
            </div>
          </div>
        </div>

        <!-- Priority Queue Panel -->
        <aside class="priority-panel">
          <div class="priority-panel__header">
            <div>
              <p class="eyebrow">Action queue</p>
              <h2 class="priority-panel__title">Today's priorities</h2>
            </div>
            <span class="priority-badge">
              <AppIcon name="lightning" :size="15" weight="duotone" />
            </span>
          </div>

          <div class="priority-list">
            <router-link
              v-for="item in priorityItems"
              :key="item.label"
              :to="item.to"
              class="priority-row group"
            >
              <span
                class="priority-row__icon"
                :class="`priority-row__icon--${item.tone}`"
              >
                <AppIcon :name="item.icon" :size="15" weight="duotone" />
              </span>
              <div class="priority-row__body">
                <span class="priority-row__label">{{ item.label }}</span>
                <span class="priority-row__detail">{{ item.detail }}</span>
              </div>
              <span
                class="priority-row__count"
                :class="
                  item.value > 0 ? `priority-row__count--${item.tone}` : ''
                "
              >
                {{ item.value }}
              </span>
              <AppIcon
                name="arrowRight"
                :size="12"
                class="priority-row__arrow"
              />
            </router-link>
          </div>
        </aside>
      </section>

      <!-- ═══════════════════════════════════════════════
           ROW 3: Sales Pipeline Stage Funnel
           ═══════════════════════════════════════════════ -->
      <section
        class="section-panel overflow-hidden"
        aria-label="Sales pipeline funnel"
      >
        <header class="funnel-header">
          <div>
            <p class="eyebrow">Opportunities</p>
            <h2 class="funnel-title">Sales pipeline</h2>
          </div>
          <p class="funnel-subtitle">
            Live opportunity volume and estimated stage value
          </p>
        </header>

        <!-- Stage cards — horizontal scroll on mobile -->
        <div class="funnel-grid">
          <router-link
            v-for="(stage, index) in pipelineStages"
            :key="stage.key"
            to="/app/leads"
            class="funnel-stage group"
          >
            <!-- Stage index + gradient accent line -->
            <div class="funnel-stage__top">
              <span class="funnel-stage__index">{{
                String(index + 1).padStart(2, "0")
              }}</span>
              <AppIcon
                name="arrowRight"
                :size="12"
                class="funnel-stage__arrow"
              />
            </div>

            <!-- Bar fill representing lead count -->
            <div class="funnel-stage__bar-wrap" aria-hidden="true">
              <div
                class="funnel-stage__bar"
                :style="{
                  height: `${(getStageCount(stage.key) / Math.max(1, maxStageCount)) * 100}%`,
                }"
              ></div>
            </div>

            <p class="funnel-stage__count">{{ getStageCount(stage.key) }}</p>
            <p class="funnel-stage__label">{{ stage.label }}</p>
            <p class="funnel-stage__value">
              ₹{{ formatCompact(getStageValue(stage.key)) }}
            </p>
          </router-link>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════
           ROW 4: Follow-ups + Commission + Loan
           ═══════════════════════════════════════════════ -->
      <section class="bottom-row">
        <!-- Follow-ups Panel -->
        <div class="section-panel overflow-hidden followup-panel">
          <header class="followup-header">
            <div>
              <p class="eyebrow">Client commitments</p>
              <h2 class="followup-title">Follow-ups</h2>
            </div>
            <router-link
              to="/app/tasks"
              class="btn btn-secondary btn-sm text-xs font-semibold"
            >
              View all
            </router-link>
          </header>

          <div
            v-if="followupItems.length"
            class="divide-y"
            style="border-color: hsl(var(--neutral-100))"
          >
            <div
              v-for="task in followupItems.slice(0, 5)"
              :key="task.id || task._id"
              class="followup-row-item"
            >
              <!-- Channel icon -->
              <span class="followup-row-item__icon">
                <AppIcon name="phone" :size="14" weight="duotone" />
              </span>

              <!-- Lead info -->
              <div class="followup-row-item__body">
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="followup-row-item__name">
                    {{ task.leadName || task.title || "Client follow-up" }}
                  </p>
                  <span v-if="task.temperature === 'hot'" class="hot-badge">
                    Hot
                  </span>
                  <span v-if="task.isOverdue" class="overdue-badge">
                    Overdue
                  </span>
                </div>
                <p class="followup-row-item__sub">
                  {{ task.type || task.title || "Follow-up" }}
                </p>
              </div>

              <!-- Time -->
              <div class="text-right shrink-0">
                <p class="followup-row-item__time">{{ task.dueTime || "—" }}</p>
                <p class="followup-row-item__type">{{ task.type || "Call" }}</p>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="followup-empty">
            <span class="followup-empty__icon">
              <AppIcon name="checkCircle" :size="22" weight="duotone" />
            </span>
            <p class="followup-empty__title">Queue cleared</p>
            <p class="followup-empty__sub">
              No pending calls or visits for today.
            </p>
          </div>
        </div>

        <!-- Right column: Commission + Loan -->
        <div class="side-stack">
          <!-- Commission collection card -->
          <div class="section-panel commission-card">
            <div class="flex items-start justify-between">
              <div>
                <p class="eyebrow">Collections</p>
                <h2 class="commission-card__title">Commission collections</h2>
              </div>
              <span class="commission-icon">
                <AppIcon name="currency" :size="16" weight="duotone" />
              </span>
            </div>

            <div class="commission-card__grid">
              <div>
                <p class="commission-card__meta-label">Receivable</p>
                <p class="commission-card__meta-value">
                  ₹{{ formatCompact(kpis.commissionReceivable || 0) }}
                </p>
              </div>
              <div>
                <p class="commission-card__meta-label">Received</p>
                <p
                  class="commission-card__meta-value commission-card__meta-value--green"
                >
                  ₹{{ formatCompact(kpis.commissionReceived || 0) }}
                </p>
              </div>
            </div>

            <!-- Collection progress bar -->
            <div class="commission-card__progress-wrap">
              <div class="flex justify-between text-xs mb-2">
                <span style="color: hsl(var(--neutral-400))"
                  >Collection progress</span
                >
                <span
                  class="font-mono font-bold"
                  style="color: hsl(var(--success-text))"
                >
                  {{ kpis.collectionRate || 0 }}%
                </span>
              </div>
              <div class="commission-card__track">
                <div
                  class="commission-card__bar"
                  :style="{
                    width: `${Math.min(100, kpis.collectionRate || 0)}%`,
                  }"
                ></div>
              </div>
            </div>

            <!-- Quick stats row -->
            <div class="commission-card__stats">
              <div
                v-if="kpis.commissionOverdue"
                class="commission-card__stat commission-card__stat--danger"
              >
                <AppIcon name="warning" :size="13" weight="duotone" />
                <span
                  >₹{{ formatCompact(kpis.commissionOverdue) }} overdue</span
                >
              </div>
              <div
                v-else
                class="commission-card__stat commission-card__stat--success"
              >
                <AppIcon name="checkCircle" :size="13" weight="duotone" />
                <span>Accounts on track</span>
              </div>
            </div>
          </div>

          <!-- Home Loan Pipeline (dark card) -->
          <router-link to="/app/loans" class="loan-card group">
            <div class="loan-card__noise" aria-hidden="true"></div>
            <div class="relative z-10">
              <div class="flex items-start justify-between">
                <div>
                  <p class="loan-card__eyebrow">Financing desk</p>
                  <h2 class="loan-card__title">Home-loan pipeline</h2>
                </div>
                <span class="loan-card__icon-wrap">
                  <AppIcon name="bank" :size="18" weight="duotone" />
                </span>
              </div>

              <div class="loan-card__stats">
                <div>
                  <p class="loan-card__stat-value">
                    {{ loanSummary.activeCases || 0 }}
                  </p>
                  <p class="loan-card__stat-label">Active</p>
                </div>
                <div>
                  <p class="loan-card__stat-value">
                    {{ loanSummary.sanctionedCount || 0 }}
                  </p>
                  <p class="loan-card__stat-label">Sanctioned</p>
                </div>
                <div>
                  <p class="loan-card__stat-value">
                    ₹{{ formatCompact(loanSummary.disbursedThisMonth || 0) }}
                  </p>
                  <p class="loan-card__stat-label">Disbursed</p>
                </div>
              </div>

              <div class="loan-card__footer">
                <span>View loan desk</span>
                <AppIcon name="arrowRight" :size="13" />
              </div>
            </div>
          </router-link>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import PipelineChart from "@/components/ui/PipelineChart.vue";
import AppIcon from "@/components/AppIcon.vue";
import { fetchBrokerDashboard } from "../api/endpoints";
import apiClient from "@/api/client";

const store = useStore();

// ── State ──────────────────────────────────────────────────────────────────
const periods = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "Week" },
  { value: "this_month", label: "Month" },
  { value: "this_quarter", label: "Quarter" },
  { value: "this_year", label: "Year" },
];
const selectedPeriod = ref("this_month");
const loading = ref(true);
const refreshing = ref(false);

const kpis = ref({
  activeLeads: 0,
  activeProperties: 0,
  activeDeals: 0,
  activePipelineValue: 0,
  closedDealsPeriodCount: 0,
  closedDealsPeriodValue: 0,
  commissionReceivable: 0,
  commissionReceived: 0,
  commissionEarned: 0,
  commissionOverdue: 0,
  expectedThisMonth: 0,
  collectionRate: 0,
  followupsDueTodayCount: 0,
  overdueFollowupsCount: 0,
  siteVisitsScheduledCount: 0,
  newLeadsThisMonth: 0,
  hotLeads: 0,
});
const salesPipeline = ref({});
const leadTemperatures = ref({ hot: 0, warm: 0, cold: 0 });
const todayFollowups = ref([]);
const overdueFollowups = ref([]);
const loanSummary = ref({
  activeCases: 0,
  sanctionedCount: 0,
  disbursedThisMonth: 0,
  totalSanctionedAmount: 0,
  totalDisbursedAmount: 0,
  commissionReceivable: 0,
});

// ── Computed ───────────────────────────────────────────────────────────────
const user = computed(() => store.state.auth?.currentUser || {});
const firstName = computed(() => {
  const u = user.value;
  return u?.firstName
    ? `${u.firstName} ${u.lastName || ""}`.trim()
    : u?.name || "there";
});
const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
});
const formattedToday = computed(() =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }),
);

const pipelineStages = [
  { key: "new", label: "New" },
  { key: "qualified", label: "Qualified" },
  { key: "property_shared", label: "Shared" },
  { key: "site_visit", label: "Site Visit" },
  { key: "negotiation", label: "Negotiate" },
  { key: "booking", label: "Booking" },
  { key: "closed_won", label: "Closed" },
];
const maxStageCount = computed(() =>
  Math.max(1, ...pipelineStages.map((s) => getStageCount(s.key))),
);

const kpiMetrics = computed(() => [
  {
    label: "Active leads",
    value: kpis.value.activeLeads || 0,
    detail: `${kpis.value.newLeadsThisMonth || 0} new this month`,
    to: "/app/leads",
    icon: "users",
    tone: "accent",
  },
  {
    label: "Live deals",
    value: kpis.value.activeDeals || 0,
    detail: `₹${formatCompact(kpis.value.activePipelineValue || 0)} in motion`,
    to: "/app/deals",
    icon: "handshake",
    tone: "info",
  },
  {
    label: "Available inventory",
    value: kpis.value.activeProperties || 0,
    detail: "Units ready to match",
    to: "/app/properties",
    icon: "buildings",
    tone: "purple",
  },
  {
    label: "Commission receivable",
    value: `₹${formatCompact(kpis.value.commissionReceivable || 0)}`,
    detail: kpis.value.commissionOverdue
      ? `₹${formatCompact(kpis.value.commissionOverdue)} overdue`
      : "Accounts on track",
    to: "/app/commissions/receivables",
    icon: "currency",
    tone: kpis.value.commissionOverdue ? "danger" : "success",
  },
]);

const priorityItems = computed(() => [
  {
    label: "Follow-ups due",
    detail: "Client calls & commitments",
    value: kpis.value.followupsDueTodayCount || 0,
    to: "/app/tasks",
    icon: "phone",
    tone: "accent",
  },
  {
    label: "Site visits",
    detail: "Scheduled property visits",
    value: kpis.value.siteVisitsScheduledCount || 0,
    to: "/app/tasks",
    icon: "house",
    tone: "info",
  },
  {
    label: "High-intent leads",
    detail: "Require immediate attention",
    value: kpis.value.hotLeads || leadTemperatures.value.hot || 0,
    to: "/app/leads",
    icon: "flame",
    tone: "danger",
  },
  {
    label: "Overdue actions",
    detail: "Past service commitments",
    value: kpis.value.overdueFollowupsCount || 0,
    to: "/app/tasks",
    icon: "warning",
    tone: "warning",
  },
]);

const followupItems = computed(() => [
  ...overdueFollowups.value.map((f) => ({ ...f, isOverdue: true })),
  ...todayFollowups.value,
]);

// ── Methods ────────────────────────────────────────────────────────────────
const getStageCount = (key) => salesPipeline.value[key]?.count || 0;
const getStageValue = (key) => salesPipeline.value[key]?.value || 0;

function formatCompact(val) {
  const n = Number(val) || 0;
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `${(n / 100_000).toFixed(2)} L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} K`;
  return n.toLocaleString("en-IN");
}

function setPeriod(period) {
  selectedPeriod.value = period;
  loadData();
}

function getPeriodDates() {
  const now = new Date();
  let start = new Date();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
  );
  if (selectedPeriod.value === "today")
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  else if (selectedPeriod.value === "this_week") {
    const day = now.getDay();
    start = new Date(now.setDate(now.getDate() - day + (day === 0 ? -6 : 1)));
    start.setHours(0, 0, 0, 0);
  } else if (selectedPeriod.value === "this_month")
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  else if (selectedPeriod.value === "this_quarter")
    start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  else if (selectedPeriod.value === "this_year")
    start = new Date(now.getFullYear(), 0, 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

async function loadData(isRefresh = false) {
  if (isRefresh) refreshing.value = true;
  else loading.value = true;

  try {
    const [dashRes, loanRes] = await Promise.allSettled([
      fetchBrokerDashboard(getPeriodDates()),
      apiClient.get("/loans/summary"),
    ]);
    if (dashRes.status === "fulfilled") {
      const data = dashRes.value?.data || dashRes.value;
      if (data) {
        if (data.kpis) kpis.value = { ...kpis.value, ...data.kpis };
        if (data.salesPipeline) salesPipeline.value = data.salesPipeline;
        if (data.leadTemperatures)
          leadTemperatures.value = data.leadTemperatures;
        if (data.todayFollowups) todayFollowups.value = data.todayFollowups;
        if (data.overdueFollowups)
          overdueFollowups.value = data.overdueFollowups;
      }
    }
    if (loanRes.status === "fulfilled")
      loanSummary.value =
        loanRes.value?.data?.data || loanRes.value?.data || loanSummary.value;
  } catch (err) {
    console.error("Dashboard load failed:", err);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

async function refreshData() {
  await loadData(true);
}

onMounted(() => loadData());
</script>

<style scoped>
/* ────────────────────────────────────────────────────────────────
   DASH ROOT
──────────────────────────────────────────────────────────────── */
.dash-root {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 3rem;
}

/* ────────────────────────────────────────────────────────────────
   HERO HEADER
──────────────────────────────────────────────────────────────── */
.dash-hero {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid hsl(var(--neutral-100));
}
.dash-hero__copy {
  max-width: 32rem;
  flex: 1 1 260px;
}
.dash-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: hsl(var(--accent-600));
  margin-bottom: 0.4rem;
}
.eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: hsl(var(--accent-500));
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.7);
  }
}
.dash-hero__title {
  font-family: "Manrope", "Inter", system-ui, sans-serif;
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.045em;
  color: hsl(var(--neutral-900));
  line-height: 1.1;
}
.dash-hero__name {
  color: hsl(var(--accent-600));
}
.dash-hero__sub {
  margin-top: 0.5rem;
  font-size: 13px;
  color: hsl(var(--neutral-400));
  line-height: 1.55;
}
.dash-hero__controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.625rem;
  flex: 0 0 auto;
}

/* Period pill selector */
.period-pill {
  display: flex;
  gap: 2px;
  padding: 3px;
  border: 1px solid hsl(var(--neutral-100));
  border-radius: 9px;
  background: hsl(var(--bg-surface));
  overflow-x: auto;
}
.period-pill__btn {
  flex: none;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: hsl(var(--neutral-400));
  transition: all 150ms ease;
  white-space: nowrap;
}
.period-pill__btn:hover {
  color: hsl(var(--neutral-900));
}
.period-pill__btn--active {
  background: hsl(var(--accent-100));
  color: hsl(var(--accent-700));
  box-shadow: inset 0 0 0 1px hsl(var(--accent-200) / 0.7);
}
.dark .period-pill__btn--active {
  background: hsl(var(--accent-50));
  color: hsl(var(--accent-600));
}

/* Icon button */
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid hsl(var(--neutral-100));
  background: hsl(var(--bg-surface));
  color: hsl(var(--neutral-500));
  transition: all 150ms ease;
}
.icon-btn:hover:not(:disabled) {
  background: hsl(var(--neutral-25));
  color: hsl(var(--neutral-900));
  border-color: hsl(var(--neutral-200));
}
.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.icon-btn.spin svg {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ────────────────────────────────────────────────────────────────
   SKELETON
──────────────────────────────────────────────────────────────── */
.dash-skeleton {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto auto auto;
}
.dash-skeleton__card,
.dash-skeleton__wide,
.dash-skeleton__side {
  border-radius: 14px;
  background: linear-gradient(
    90deg,
    hsl(var(--neutral-50)) 0%,
    hsl(var(--neutral-100)) 50%,
    hsl(var(--neutral-50)) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
}
.dash-skeleton__card {
  height: 130px;
}
.dash-skeleton__wide {
  height: 320px;
  grid-column: 1 / -1;
}
.dash-skeleton__side {
  height: 200px;
  grid-column: 1 / -1;
}
@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
@media (min-width: 640px) {
  .dash-skeleton {
    grid-template-columns: repeat(4, 1fr);
  }
  .dash-skeleton__wide {
    grid-column: 1 / 3;
    height: 340px;
  }
  .dash-skeleton__side {
    grid-column: 3 / 5;
    height: 340px;
  }
}

/* ────────────────────────────────────────────────────────────────
   KPI STRIP — 4 headline tiles
──────────────────────────────────────────────────────────────── */
.kpi-strip {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.875rem;
}
@media (min-width: 768px) {
  .kpi-strip {
    grid-template-columns: repeat(4, 1fr);
  }
}

.kpi-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.125rem;
  border-radius: 14px;
  border: 1px solid hsl(var(--neutral-100));
  background: hsl(var(--bg-surface) / 0.96);
  backdrop-filter: blur(8px);
  box-shadow: 0 1px 3px rgb(26 22 18 / 0.04);
  transition:
    transform 200ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 200ms ease,
    box-shadow 200ms ease;
  overflow: hidden;
  text-decoration: none;
}
.kpi-tile::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    circle at 110% -10%,
    currentColor,
    transparent 65%
  );
  opacity: 0;
  transition: opacity 200ms ease;
  pointer-events: none;
}
.kpi-tile:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgb(26 22 18 / 0.09);
}
.kpi-tile--accent:hover {
  border-color: hsl(var(--accent-200));
}
.kpi-tile--accent:hover::before {
  opacity: 0.04;
  color: hsl(var(--accent-500));
}
.kpi-tile--info:hover {
  border-color: hsl(var(--info-border));
}
.kpi-tile--info:hover::before {
  opacity: 0.05;
  color: hsl(var(--info-text));
}
.kpi-tile--purple:hover {
  border-color: hsl(var(--purple-border));
}
.kpi-tile--purple:hover::before {
  opacity: 0.05;
  color: hsl(var(--purple-text));
}
.kpi-tile--danger:hover {
  border-color: hsl(var(--danger-border));
}
.kpi-tile--danger:hover::before {
  opacity: 0.05;
  color: hsl(var(--danger-text));
}
.kpi-tile--success:hover {
  border-color: hsl(var(--success-border));
}
.kpi-tile--success:hover::before {
  opacity: 0.05;
  color: hsl(var(--success-text));
}
.kpi-tile--warning:hover {
  border-color: hsl(var(--warning-border));
}
.kpi-tile--warning:hover::before {
  opacity: 0.05;
  color: hsl(var(--warning-text));
}

.kpi-tile__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  margin-bottom: 0.75rem;
  flex-shrink: 0;
}
.kpi-tile__icon--accent {
  background: hsl(var(--accent-100));
  color: hsl(var(--accent-600));
}
.kpi-tile__icon--info {
  background: hsl(var(--info-bg));
  color: hsl(var(--info-text));
}
.kpi-tile__icon--purple {
  background: hsl(var(--purple-bg));
  color: hsl(var(--purple-text));
}
.kpi-tile__icon--danger {
  background: hsl(var(--danger-bg));
  color: hsl(var(--danger-text));
}
.kpi-tile__icon--success {
  background: hsl(var(--success-bg));
  color: hsl(var(--success-text));
}
.kpi-tile__icon--warning {
  background: hsl(var(--warning-bg));
  color: hsl(var(--warning-text));
}

.kpi-tile__value {
  font-family: "Manrope", system-ui, sans-serif;
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: hsl(var(--neutral-900));
  margin-top: auto;
}
.kpi-tile__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: hsl(var(--neutral-500));
  margin-top: 0.25rem;
}
.kpi-tile__detail {
  font-size: 11px;
  color: hsl(var(--neutral-400));
  margin-top: 0.15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kpi-tile__arrow {
  position: absolute;
  bottom: 14px;
  right: 14px;
  opacity: 0;
  transform: translateX(-4px);
  color: hsl(var(--neutral-400));
  transition: all 200ms ease;
}
.kpi-tile:hover .kpi-tile__arrow {
  opacity: 1;
  transform: translateX(0);
}

/* ────────────────────────────────────────────────────────────────
   BENTO ROW — Pulse card + Priority panel
──────────────────────────────────────────────────────────────── */
.bento-row {
  display: grid;
  gap: 1.125rem;
  grid-template-columns: 1fr;
}
@media (min-width: 1024px) {
  .bento-row {
    grid-template-columns: 2fr 1fr;
  }
}

/* Pulse card (dark, gradient background) */
.pulse-card {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  color: white;
  background:
    radial-gradient(
      circle at 85% 5%,
      hsl(var(--accent-500) / 0.28),
      transparent 20rem
    ),
    linear-gradient(135deg, hsl(18 20% 7%), hsl(166 22% 11%));
  box-shadow: 0 16px 40px rgb(17 24 20 / 0.18);
  min-height: 300px;
  display: flex;
  flex-direction: column;
}
.pulse-card__noise {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgb(255 255 255 / 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.03) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(to left, black 20%, transparent 80%);
  pointer-events: none;
}
.pulse-card__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 1.5rem;
  gap: 1.5rem;
}
.pulse-card__eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: hsl(162 63% 68%);
}
.pulse-card__figure {
  font-family: "Manrope", system-ui;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.05em;
  color: white;
  margin-top: 0.5rem;
}
.pulse-card__caption {
  margin-top: 0.5rem;
  font-size: 12px;
  color: hsl(162 20% 60%);
  line-height: 1.5;
}
.pulse-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgb(255 255 255 / 0.08);
  border: 1px solid rgb(255 255 255 / 0.07);
  color: hsl(162 50% 70%);
  flex-shrink: 0;
}
.pulse-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
  font-size: 10px;
  font-weight: 600;
  color: hsl(162 10% 50%);
}
.pulse-chart-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: hsl(162 50% 60%);
  transition: color 150ms;
  text-decoration: none;
}
.pulse-chart-link:hover {
  color: hsl(162 60% 72%);
}

/* Priority panel */
.priority-panel {
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  border: 1px solid hsl(var(--neutral-100));
  background: hsl(var(--bg-surface) / 0.95);
  backdrop-filter: blur(8px);
  overflow: hidden;
  box-shadow: 0 1px 3px rgb(26 22 18 / 0.03);
}
.priority-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.125rem 1.25rem;
  border-bottom: 1px solid hsl(var(--neutral-100));
}
.priority-panel__title {
  font-family: "Manrope", system-ui;
  font-size: 14px;
  font-weight: 700;
  color: hsl(var(--neutral-900));
  margin-top: 2px;
}
.priority-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: hsl(var(--warning-bg));
  color: hsl(var(--warning-text));
}
.priority-list {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.priority-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.8rem 1.25rem;
  min-height: 60px;
  border-bottom: 1px solid hsl(var(--neutral-100) / 0.7);
  text-decoration: none;
  transition: background 150ms ease;
}
.priority-row:last-child {
  border-bottom: 0;
}
.priority-row:hover {
  background: hsl(var(--neutral-25));
}
.priority-row__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  flex-shrink: 0;
  transition: transform 150ms ease;
}
.priority-row:hover .priority-row__icon {
  transform: scale(1.07);
}
.priority-row__icon--accent {
  background: hsl(var(--accent-100));
  color: hsl(var(--accent-600));
}
.priority-row__icon--info {
  background: hsl(var(--info-bg));
  color: hsl(var(--info-text));
}
.priority-row__icon--danger {
  background: hsl(var(--danger-bg));
  color: hsl(var(--danger-text));
}
.priority-row__icon--warning {
  background: hsl(var(--warning-bg));
  color: hsl(var(--warning-text));
}
.priority-row__body {
  flex: 1;
  min-width: 0;
}
.priority-row__label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--neutral-900));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.priority-row__detail {
  display: block;
  font-size: 10px;
  color: hsl(var(--neutral-400));
  margin-top: 1px;
}
.priority-row__count {
  font-family: "JetBrains Mono", monospace;
  font-size: 15px;
  font-weight: 700;
  color: hsl(var(--neutral-900));
  flex-shrink: 0;
}
.priority-row__count--accent {
  color: hsl(var(--accent-600));
}
.priority-row__count--info {
  color: hsl(var(--info-text));
}
.priority-row__count--danger {
  color: hsl(var(--danger-text));
}
.priority-row__count--warning {
  color: hsl(var(--warning-text));
}
.priority-row__arrow {
  color: hsl(var(--neutral-300));
  opacity: 0;
  transform: translateX(-3px);
  transition: all 150ms ease;
}
.priority-row:hover .priority-row__arrow {
  opacity: 1;
  transform: translateX(0);
}

/* ────────────────────────────────────────────────────────────────
   FUNNEL — Pipeline stages
──────────────────────────────────────────────────────────────── */
.funnel-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 1.25rem 1.375rem;
  border-bottom: 1px solid hsl(var(--neutral-100));
}
.funnel-title {
  font-family: "Manrope", system-ui;
  font-size: 14px;
  font-weight: 700;
  color: hsl(var(--neutral-900));
  margin-top: 2px;
}
.funnel-subtitle {
  font-size: 12px;
  color: hsl(var(--neutral-400));
  align-self: flex-end;
}
.funnel-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  overflow-x: auto;
}
@media (min-width: 768px) {
  .funnel-grid {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
}
@media (max-width: 639px) {
  .funnel-grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
}
.funnel-stage {
  min-height: 160px;
  padding: 1rem;
  border-right: 1px solid hsl(var(--neutral-100));
  display: flex;
  flex-direction: column;
  text-decoration: none;
  transition: background 160ms ease;
  scroll-snap-align: start;
  min-width: 120px;
}
.funnel-stage:last-child {
  border-right: 0;
}
.funnel-stage:hover {
  background: hsl(var(--bg-elevated));
}
.funnel-stage__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.funnel-stage__index {
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  color: hsl(var(--neutral-300));
}
.funnel-stage__arrow {
  color: hsl(var(--neutral-300));
  opacity: 0;
  transform: translateX(-3px);
  transition: all 150ms ease;
}
.funnel-stage:hover .funnel-stage__arrow {
  opacity: 1;
  transform: translateX(0);
}
.funnel-stage__bar-wrap {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: flex-end;
  margin: 0.75rem 0 0.5rem;
  background: hsl(var(--neutral-50));
  border-radius: 4px;
  overflow: hidden;
}
.funnel-stage__bar {
  width: 100%;
  min-height: 4px;
  border-radius: 4px;
  background: linear-gradient(
    to top,
    hsl(var(--accent-600)),
    hsl(var(--accent-500))
  );
  transition: height 500ms cubic-bezier(0.16, 1, 0.3, 1);
}
.dark .funnel-stage__bar {
  background: linear-gradient(to top, hsl(var(--accent-600)), hsl(162 63% 60%));
}
.funnel-stage__count {
  font-family: "Manrope", system-ui;
  font-size: 1.35rem;
  font-weight: 800;
  color: hsl(var(--neutral-900));
}
.funnel-stage__label {
  font-size: 11px;
  font-weight: 600;
  color: hsl(var(--neutral-700));
  margin-top: 2px;
}
.funnel-stage__value {
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  color: hsl(var(--accent-600));
  margin-top: 2px;
}

/* ────────────────────────────────────────────────────────────────
   BOTTOM ROW — Follow-ups + Commission + Loan
──────────────────────────────────────────────────────────────── */
.bottom-row {
  display: grid;
  gap: 1.125rem;
  grid-template-columns: 1fr;
}
@media (min-width: 1024px) {
  .bottom-row {
    grid-template-columns: 7fr 5fr;
  }
}

.followup-panel {
}
.followup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.125rem 1.25rem;
  border-bottom: 1px solid hsl(var(--neutral-100));
}
.followup-title {
  font-family: "Manrope", system-ui;
  font-size: 14px;
  font-weight: 700;
  color: hsl(var(--neutral-900));
  margin-top: 2px;
}

.followup-row-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  min-height: 64px;
  transition: background 150ms ease;
}
.followup-row-item:hover {
  background: hsl(var(--bg-elevated));
}
.followup-row-item__icon {
  display: flex;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: hsl(var(--accent-100));
  color: hsl(var(--accent-600));
}
.followup-row-item__body {
  flex: 1;
  min-width: 0;
}
.followup-row-item__name {
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--neutral-900));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.followup-row-item__sub {
  font-size: 11px;
  color: hsl(var(--neutral-400));
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.followup-row-item__time {
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  font-weight: 700;
  color: hsl(var(--neutral-900));
}
.followup-row-item__type {
  font-size: 10px;
  color: hsl(var(--neutral-400));
  margin-top: 1px;
}

.hot-badge {
  padding: 1px 6px;
  border-radius: 4px;
  background: hsl(var(--danger-bg));
  color: hsl(var(--danger-text));
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.overdue-badge {
  padding: 1px 6px;
  border-radius: 4px;
  background: hsl(var(--warning-bg));
  color: hsl(var(--warning-text));
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.followup-empty {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
  padding: 2rem;
}
.followup-empty__icon {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: hsl(var(--success-bg));
  color: hsl(var(--success-text));
  margin-bottom: 6px;
}
.followup-empty__title {
  font-family: "Manrope", system-ui;
  font-size: 14px;
  font-weight: 700;
  color: hsl(var(--neutral-900));
}
.followup-empty__sub {
  font-size: 12px;
  color: hsl(var(--neutral-400));
}

/* Side stack */
.side-stack {
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
}

/* Commission card */
.commission-card {
  padding: 1.25rem;
}
.commission-card__title {
  font-family: "Manrope", system-ui;
  font-size: 14px;
  font-weight: 700;
  color: hsl(var(--neutral-900));
  margin-top: 2px;
}
.commission-icon {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: hsl(var(--accent-100));
  color: hsl(var(--accent-600));
  flex-shrink: 0;
}
.commission-card__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1.125rem;
}
.commission-card__meta-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: hsl(var(--neutral-400));
}
.commission-card__meta-value {
  margin-top: 4px;
  font-family: "Manrope", system-ui;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: hsl(var(--neutral-900));
}
.commission-card__meta-value--green {
  color: hsl(var(--success-text));
}
.commission-card__progress-wrap {
  margin-top: 1.125rem;
}
.commission-card__track {
  height: 6px;
  border-radius: 999px;
  background: hsl(var(--neutral-100));
  overflow: hidden;
}
.commission-card__bar {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    hsl(var(--accent-500)),
    hsl(var(--accent-600))
  );
  transition: width 600ms cubic-bezier(0.16, 1, 0.3, 1);
}
.commission-card__stats {
  margin-top: 0.875rem;
}
.commission-card__stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}
.commission-card__stat--danger {
  background: hsl(var(--danger-bg));
  color: hsl(var(--danger-text));
}
.commission-card__stat--success {
  background: hsl(var(--success-bg));
  color: hsl(var(--success-text));
}

/* Loan card (dark) */
.loan-card {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  padding: 1.25rem;
  text-decoration: none;
  background:
    radial-gradient(
      circle at 100% 0%,
      rgb(56 189 248 / 0.18),
      transparent 16rem
    ),
    linear-gradient(135deg, hsl(204 35% 12%), hsl(188 28% 10%));
  box-shadow: 0 12px 30px rgb(15 35 38 / 0.12);
  transition:
    transform 200ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 200ms ease;
}
.loan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgb(15 35 38 / 0.18);
}
.loan-card__noise {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgb(255 255 255 / 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.025) 1px, transparent 1px);
  background-size: 22px 22px;
  pointer-events: none;
}
.loan-card__eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: hsl(200 80% 68%);
}
.loan-card__title {
  font-family: "Manrope", system-ui;
  font-size: 15px;
  font-weight: 700;
  color: white;
  margin-top: 4px;
}
.loan-card__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgb(255 255 255 / 0.1);
  color: hsl(200 80% 70%);
}
.loan-card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 1.25rem;
}
.loan-card__stat-value {
  color: white;
  font-family: "Manrope", system-ui;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.loan-card__stat-label {
  margin-top: 2px;
  color: rgb(148 163 184);
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.loan-card__footer {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 1rem;
  font-size: 11px;
  font-weight: 600;
  color: hsl(200 60% 65%);
  transition: color 150ms ease;
}
.loan-card:hover .loan-card__footer {
  color: hsl(200 80% 78%);
}
</style>
