<template>
  <div class="space-y-6 text-xs">
    <!-- Top View Switcher & Title -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-default pb-4">
      <div>
        <h1 class="font-heading text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>{{ isEducation ? 'Executive Admissions Analytics' : 'Executive Reports & Analytics' }}</span>
        </h1>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {{ isEducation
            ? 'Interactive visual intelligence, admissions funnel velocity, channel ROI, and counselor benchmarks.'
            : 'Visual intelligence, deal pipeline conversion, revenue forecasts, and staff SLA compliance.' }}
        </p>
      </div>

      <!-- View Selector Tabs (Hidden for Education Vertical) -->
      <div 
        v-if="!isEducation"
        class="flex items-center bg-slate-100 dark:bg-neutral-800 p-1 rounded-xl border border-default self-start sm:self-auto"
      >
        <button
          @click="activeView = 'analytics'"
          class="px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5"
          :class="activeView === 'analytics'
            ? 'bg-surface text-primary shadow-xs'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
        >
          <PhChartLineUp :size="14" />
          <span>Executive Analytics</span>
        </button>
        <button
          @click="activeView = 'library'"
          class="px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5"
          :class="activeView === 'library'
            ? 'bg-surface text-primary shadow-xs'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
        >
          <PhBookOpen :size="14" />
          <span>Report Library</span>
        </button>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 1: EXECUTIVE ANALYTICS & INSIGHTS (GRAPHICAL)                         -->
    <!-- ========================================================================= -->
    <div v-if="isEducation || activeView === 'analytics'" class="space-y-6">
      <!-- Filter Bar: Date Range + Quick Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-default p-3.5 rounded-xl shadow-sm">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Time Horizon:</span>
          <button
            v-for="range in dateRanges"
            :key="range.id"
            @click="selectedRange = range.id"
            class="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
            :class="selectedRange === range.id
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'"
          >
            {{ range.label }}
          </button>
        </div>

        <div class="flex items-center gap-2 self-end sm:self-auto">
          <button
            @click="loadAnalytics"
            :disabled="isLoading"
            type="button"
            class="btn-sm btn-ghost gap-1.5 text-xs font-semibold"
            title="Refresh Live Database Metrics"
          >
            <PhArrowsClockwise :size="14" :class="{ 'animate-spin': isLoading }" />
            <span>Refresh</span>
          </button>
          <button
            @click="exportBriefing"
            type="button"
            class="btn-sm btn-secondary gap-1.5 text-xs font-semibold"
          >
            <PhDownloadSimple :size="14" />
            <span>Download CSV</span>
          </button>
          <button
            @click="printAnalytics"
            type="button"
            class="btn-sm btn-primary gap-1.5 text-xs font-semibold"
          >
            <PhPrinter :size="14" />
            <span>Export Briefing</span>
          </button>
        </div>
      </div>

      <!-- Executive KPI Metric Cards (Bento Style) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1: Total Inquiries / Leads -->
        <div class="bg-surface border border-default rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-200">
          <div class="flex justify-between items-start">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {{ isEducation ? 'Total Inquiries' : 'Total Leads' }}
            </span>
            <!-- Dynamic comparison badge from real database calculations -->
            <span 
              v-if="summaryMetrics.priorPeriodInquiries > 0 || summaryMetrics.totalInquiries > 0"
              class="px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-0.5"
              :class="summaryMetrics.inquiriesGrowth >= 0
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'"
            >
              <PhTrendUp v-if="summaryMetrics.inquiriesGrowth >= 0" :size="11" />
              <PhTrendDown v-else :size="11" />
              {{ summaryMetrics.inquiriesGrowth >= 0 ? '+' : '' }}{{ summaryMetrics.inquiriesGrowth }}%
            </span>
            <span 
              v-else 
              class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80"
            >
              0 new
            </span>
          </div>
          <div class="mt-2.5 flex items-baseline gap-2">
            <span class="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-slate-100 font-tabular tracking-tight">
              {{ summaryMetrics.totalInquiries }}
            </span>
            <span v-if="summaryMetrics.priorPeriodInquiries > 0" class="text-[11px] text-slate-400 font-medium">
              vs {{ summaryMetrics.priorPeriodInquiries }} prior
            </span>
            <span v-else class="text-[11px] text-slate-400 font-medium">
              in selected period
            </span>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-normal">
            {{ isEducation ? 'Total inquiries recorded across all channels' : 'Total potential client opportunities captured' }}
          </p>
        </div>

        <!-- Card 2: Inquiries In Progress / Active Follow-ups -->
        <div class="bg-surface border border-default rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-200">
          <div class="flex justify-between items-start">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {{ isEducation ? 'Inquiries In Progress' : 'Leads In Progress' }}
            </span>
            <!-- Dynamic pipeline share badge -->
            <span 
              class="px-2 py-0.5 rounded-md text-[10px] font-semibold border"
              :class="summaryMetrics.pipelineInProgress > 0
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200/80 dark:border-slate-700/80'"
            >
              {{ summaryMetrics.inProgressRate }}% of total
            </span>
          </div>
          <div class="mt-2.5 flex items-baseline gap-2">
            <span class="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-slate-100 font-tabular tracking-tight">
              {{ summaryMetrics.pipelineInProgress }}
            </span>
            <span class="text-[11px] text-slate-400 font-medium">
              {{ isEducation ? 'counseling & trials' : 'active negotiations' }}
            </span>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-normal">
            {{ isEducation ? 'Inquiries currently undergoing counseling or demo class' : 'Leads in property visits and commercial negotiations' }}
          </p>
        </div>

        <!-- Card 3: Confirmed Enrollments / Closed Deals -->
        <div class="bg-surface border border-default rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-200">
          <div class="flex justify-between items-start">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {{ isEducation ? 'Confirmed Enrollments' : 'Closed Deals' }}
            </span>
            <!-- Dynamic enrollment percentage badge with subtle primary accent -->
            <span 
              class="px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-0.5"
              :class="summaryMetrics.confirmedConversions > 0
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200/80 dark:border-slate-700/80'"
            >
              <PhCheckCircle v-if="summaryMetrics.confirmedConversions > 0" :size="11" />
              {{ summaryMetrics.conversionRate }}%
            </span>
          </div>
          <div class="mt-2.5 flex items-baseline gap-2">
            <span class="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-slate-100 font-tabular tracking-tight">
              {{ summaryMetrics.confirmedConversions }}
            </span>
            <span class="text-[11px] text-slate-400 font-medium">
              {{ isEducation ? 'students enrolled' : 'deals closed' }}
            </span>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-normal">
            {{ isEducation ? 'Admissions successfully confirmed in this period' : 'Transactions successfully closed and finalized' }}
          </p>
        </div>

        <!-- Card 4: Overall Conversion Rate -->
        <div class="bg-surface border border-default rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-200">
          <div class="flex justify-between items-start">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Overall Conversion Rate
            </span>
            <!-- Dynamic ratio badge -->
            <span 
              class="px-2 py-0.5 rounded-md text-[10px] font-semibold border"
              :class="summaryMetrics.totalInquiries > 0
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200/80 dark:border-slate-700/80'"
            >
              {{ summaryMetrics.confirmedConversions }} of {{ summaryMetrics.totalInquiries }}
            </span>
          </div>
          <div class="mt-2.5 flex items-baseline gap-2">
            <span class="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-slate-100 font-tabular tracking-tight">
              {{ summaryMetrics.conversionRate }}%
            </span>
            <span class="text-[11px] text-slate-400 font-medium">
              conversion yield
            </span>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-normal">
            {{ isEducation ? 'Percentage of total inquiries converted to students' : 'Percentage of total leads converted to closed deals' }}
          </p>
        </div>
      </div>

      <!-- 4 Graphical Charts Grid (2 x 2) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Chart 1: Line Trend Chart -->
        <AnalyticsChart
          :title="isEducation ? 'Inquiry & Enrollment Trend' : 'Lead & Sales Trend'"
          subtitle="6-month chronological volume vs confirmed conversions."
          type="line"
          :chartData="trendChartData"
        />

        <!-- Chart 2: Funnel Chart -->
        <AnalyticsChart
          :title="isEducation ? 'Admissions Conversion Funnel' : 'Pipeline Conversion Funnel'"
          subtitle="Stage progression and drop-off rate across the lifecycle."
          type="funnel"
          :chartData="funnelChartData"
        />

        <!-- Chart 3: Donut Distribution Chart -->
        <AnalyticsChart
          :title="isEducation ? 'Inquiry Channels' : 'Acquisition Channels'"
          subtitle="Breakdown of lead origin sources driving interest."
          type="donut"
          :chartData="sourceChartData"
        />

        <!-- Chart 4: Bar Comparative Chart -->
        <AnalyticsChart
          :title="isEducation ? 'Counselor Performance' : 'Staff Performance'"
          subtitle="Conversions achieved against assigned inquiries."
          type="bar"
          :chartData="counselorPerformanceData"
        />
      </div>

      <!-- Strategic Actionable Insights Panel -->
      <div class="bg-surface border border-default rounded-xl p-5 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b border-default pb-3">
          <div class="flex items-center gap-2.5">
            <span class="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <PhLightbulb :size="18" weight="bold" />
            </span>
            <div>
              <h3 class="font-heading font-bold text-slate-900 dark:text-slate-100 text-sm">
                Strategic Intelligence & Recommendations
              </h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                Actionable recommendations generated from conversion velocity, channel yield, and admissions pipeline.
              </p>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80">
            {{ strategicInsights.length }} Insights
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div
            v-for="(insight, idx) in strategicInsights"
            :key="insight.title"
            class="bg-surface hover:bg-slate-50/70 dark:hover:bg-slate-850/70 border border-default hover:border-slate-300 dark:hover:border-slate-700 rounded-xl p-4 flex items-start gap-3.5 transition-all duration-200"
          >
            <span
              class="p-2 rounded-lg shrink-0 border"
              :class="getInsightIconClass(insight.type || idx)"
            >
              <component :is="getInsightIcon(insight.type || idx)" :size="16" weight="bold" />
            </span>
            <div class="space-y-1">
              <h4 class="font-bold text-slate-900 dark:text-slate-100 text-xs">
                {{ insight.title }}
              </h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {{ insight.description }}
              </p>
            </div>
          </div>

          <div
            v-if="strategicInsights.length === 0"
            class="col-span-2 text-center py-6 text-slate-400 text-xs"
          >
            Analyzing real-time database activity to formulate recommendations...
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 2: REPORT CATALOG & LIBRARY (TABULAR & EXPORT CENTER - REAL ESTATE)   -->
    <!-- ========================================================================= -->
    <div v-else-if="!isEducation && activeView === 'library'" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left: Reports Catalog directories -->
        <div class="lg:col-span-8 space-y-6">
          <!-- Search and catalog headers -->
          <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-default pb-3 gap-2">
              <h3 class="font-heading font-bold text-slate-800 dark:text-slate-200">
                Enterprise Report Library
              </h3>
              <!-- Switch directories tabs -->
              <div class="flex items-center space-x-1 shrink-0 flex-wrap">
                <button
                  v-for="cat in categories"
                  :key="cat"
                  @click="activeCategory = cat"
                  class="btn btn-sm text-[9px] h-6 px-2 font-bold uppercase"
                  :class="activeCategory === cat ? 'btn-primary' : 'btn-ghost text-slate-500 dark:text-slate-400'"
                >
                  {{ cat }}
                </button>
              </div>
            </div>

            <!-- Catalog List Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ReportCard
                v-for="rep in filteredReports"
                :key="rep.name"
                :report="rep"
              />
            </div>
          </div>

          <!-- Quick navigation shortcuts -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <router-link
              to="/app/reports/builder"
              class="bg-surface hover:bg-slate-50 dark:hover:bg-slate-850/60 border border-default hover:border-slate-300 dark:hover:border-slate-700 p-4 rounded-xl shadow-xs transition-all flex flex-col justify-between h-28 text-xs font-semibold text-slate-800 dark:text-slate-200 group"
            >
              <div class="flex items-center gap-2">
                <span class="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <PhWrench :size="14" />
                </span>
                <span class="font-bold">Custom Report Builder</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 font-normal leading-normal">Drag, drop, aggregate, and save custom configurations.</span>
            </router-link>

            <router-link
              to="/app/reports/export"
              class="bg-surface hover:bg-slate-50 dark:hover:bg-slate-850/60 border border-default hover:border-slate-300 dark:hover:border-slate-700 p-4 rounded-xl shadow-xs transition-all flex flex-col justify-between h-28 text-xs font-semibold text-slate-800 dark:text-slate-200 group"
            >
              <div class="flex items-center gap-2">
                <span class="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <PhDownload :size="14" />
                </span>
                <span class="font-bold">Export Center</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 font-normal leading-normal">Extract tabular reports to CSV, PDF, or Excel sheets.</span>
            </router-link>

            <div
              @click="showKpiDictionary = true"
              class="bg-surface hover:bg-slate-50 dark:hover:bg-slate-850/60 border border-default hover:border-slate-300 dark:hover:border-slate-700 p-4 rounded-xl shadow-xs transition-all flex flex-col justify-between h-28 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer group"
            >
              <div class="flex items-center gap-2">
                <span class="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <PhBookOpen :size="14" />
                </span>
                <span class="font-bold">KPI Dictionary</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 font-normal leading-normal">View formulas and performance index calculation rules.</span>
            </div>
          </div>
        </div>

        <!-- Right: Data Governance & Shared Queues -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Data Freshness Widget -->
          <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3.5">
            <div class="border-b border-default pb-1">
              <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">Data Pipeline Freshness</h4>
              <p class="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Details on database replication synchronizations.</p>
            </div>
            <div class="space-y-2 font-medium">
              <div class="flex justify-between items-center text-[10px]">
                <span class="text-slate-500 dark:text-slate-400">Last Refreshed:</span>
                <span class="font-bold text-slate-900 dark:text-slate-100">Just Now (Realtime)</span>
              </div>
              <div class="flex justify-between items-center text-[10px]">
                <span class="text-slate-500 dark:text-slate-400">Data Source:</span>
                <span class="font-semibold text-slate-700 dark:text-slate-300">MongoDB Replica-Set</span>
              </div>
              <div class="flex justify-between items-center text-[10px]">
                <span class="text-slate-500 dark:text-slate-400">Refresh Status:</span>
                <span class="text-emerald-500 font-bold">● Active Syncing</span>
              </div>
            </div>
          </div>

          <!-- Scheduled Reports -->
          <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3.5">
            <div class="border-b border-default pb-1">
              <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200">Scheduled Extractions</h4>
              <p class="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Automated periodic email digests.</p>
            </div>
            <div class="space-y-2.5 font-medium">
              <div class="flex justify-between items-center text-[10px] py-1 border-b border-default border-dashed">
                <div>
                  <span class="font-bold text-slate-700 dark:text-slate-300 block">Admissions Intake Summary</span>
                  <span class="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Recipients: Institute Directors</span>
                </div>
                <span class="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-1 rounded">Weekly</span>
              </div>
              <div class="flex justify-between items-center text-[10px] py-1 border-b border-default border-dashed">
                <div>
                  <span class="font-bold text-slate-700 dark:text-slate-300 block">Counselor SLA Audit</span>
                  <span class="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Recipients: Campus Operations</span>
                </div>
                <span class="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-1 rounded">Daily</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- KPI Dictionary Modal -->
    <div
      v-if="showKpiDictionary"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div class="bg-surface border border-default w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-fade-in text-xs font-semibold">
        <div class="px-4 py-3 border-b border-default flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0">
          <h3 class="font-heading font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <PhBookOpen :size="16" class="text-slate-500" />
            <span>KPI & Compliance Dictionary</span>
          </h3>
          <button
            @click="showKpiDictionary = false"
            class="btn btn-sm btn-ghost p-1 h-7 w-7 text-slate-400 hover:text-slate-600"
          >
            <PhX :size="14" />
          </button>
        </div>

        <div class="p-4 space-y-3.5 overflow-y-auto flex-1 font-medium">
          <div v-for="kpi in kpiDictionary" :key="kpi.name" class="border-b border-default pb-2.5 last:border-b-0 space-y-1">
            <h5 class="font-bold text-slate-800 dark:text-slate-200">{{ kpi.name }}</h5>
            <div class="bg-slate-50 dark:bg-slate-900 p-2 rounded border font-mono text-[9px] text-primary">
              Formula: {{ kpi.formula }}
            </div>
            <p class="text-[10px] text-slate-500 mt-1 leading-normal">{{ kpi.description }}</p>
          </div>
        </div>

        <div class="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-default flex justify-end shrink-0">
          <button
            @click="showKpiDictionary = false"
            class="btn btn-md btn-secondary"
          >
            Close Dictionary
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import {
  PhChartLineUp, PhBookOpen, PhDownloadSimple, PhPrinter,
  PhTrendUp, PhTrendDown, PhCheckCircle, PhWarningCircle, PhLightbulb,
  PhWrench, PhDownload, PhX, PhArrowsClockwise
} from '@phosphor-icons/vue';
import Swal from 'sweetalert2';
import ReportCard from '../components/ReportCard.vue';
import AnalyticsChart from '../components/AnalyticsChart.vue';
import { fetchEducationAnalytics } from '@/modules/education/api/endpoints';
import { fetchReportsDashboardStats } from '@/modules/reports/api/endpoints';

const store = useStore();
const isEducation = computed(() => store.getters['organization/isEducationTenant']);

const activeView = ref('analytics');
const selectedRange = ref('30d');
const showKpiDictionary = ref(false);
const activeCategory = ref('All Reports');
const isLoading = ref(false);
const analyticsData = ref(null);

const dateRanges = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'quarter', label: 'This Quarter' },
  { id: 'year', label: 'This Year' },
  { id: 'all', label: 'All Time' },
];

async function loadAnalytics() {
  isLoading.value = true;
  try {
    if (isEducation.value) {
      const res = await fetchEducationAnalytics({ range: selectedRange.value });
      analyticsData.value = res?.data || res;
    } else {
      const res = await fetchReportsDashboardStats({ range: selectedRange.value });
      analyticsData.value = res?.data || res;
    }
  } catch (e) {
    console.warn('Failed to load dynamic analytics:', e);
  } finally {
    isLoading.value = false;
  }
}

watch(selectedRange, () => {
  loadAnalytics();
});

watch(isEducation, (val) => {
  if (val) activeView.value = 'analytics';
}, { immediate: true });

onMounted(() => {
  loadAnalytics();
});

const summaryMetrics = computed(() => {
  return analyticsData.value?.summaryMetrics || {
    totalInquiries: 0,
    confirmedConversions: 0,
    conversionRate: 0,
    pipelineInProgress: 0,
    inProgressRate: 0,
    inquiriesGrowth: 0,
    priorPeriodInquiries: 0,
    todayInquiries: 0,
    totalClasses: 0,
    totalStudents: 0,
  };
});

// Chart 1: Dynamic Line Trend Data
const trendChartData = computed(() => {
  return analyticsData.value?.trendChartData || [];
});

// Chart 2: Dynamic Funnel Chart Data
const funnelChartData = computed(() => {
  return analyticsData.value?.funnelChartData || [];
});

// Chart 3: Dynamic Donut Source Chart Data
const sourceChartData = computed(() => {
  return analyticsData.value?.sourceChartData || [];
});

// Chart 4: Dynamic Counselor / Agent Bar Performance Data
const counselorPerformanceData = computed(() => {
  return analyticsData.value?.counselorPerformanceData || [];
});

// Dynamic Strategic Actionable Insights
const strategicInsights = computed(() => {
  return analyticsData.value?.strategicInsights || [];
});

function getInsightIcon(type) {
  if (type === 'growth' || type === 0) return PhTrendUp;
  if (type === 'bottleneck' || type === 1) return PhWarningCircle;
  if (type === 'sla' || type === 2) return PhCheckCircle;
  return PhLightbulb;
}

function getInsightIconClass(type) {
  if (type === 'growth' || type === 0) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
  if (type === 'bottleneck' || type === 1) return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
  if (type === 'sla' || type === 2) return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
  return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';
}

function getInsightBorderClass() {
  return 'hover:border-slate-300 dark:hover:border-slate-700';
}

function exportBriefing() {
  const rows = [
    ['Metric', 'Current Period', 'Dynamic Ratio / Status'],
    ['Total Inquiries', summaryMetrics.value.totalInquiries, `${summaryMetrics.value.inquiriesGrowth >= 0 ? '+' : ''}${summaryMetrics.value.inquiriesGrowth}% vs prior`],
    ['Inquiries In Progress', summaryMetrics.value.pipelineInProgress, `${summaryMetrics.value.inProgressRate}% of total`],
    ['Confirmed Enrollments', summaryMetrics.value.confirmedConversions, `${summaryMetrics.value.conversionRate}% conversion`],
    ['Overall Conversion Rate', `${summaryMetrics.value.conversionRate}%`, `${summaryMetrics.value.confirmedConversions} of ${summaryMetrics.value.totalInquiries}`],
  ];
  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `executive_analytics_briefing_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function printAnalytics() {
  Swal.fire({
    title: 'Exporting Executive Briefing',
    text: 'Generating formatted executive PDF briefing and graphical snapshot...',
    icon: 'info',
    timer: 1600,
    showConfirmButton: false,
  });
  setTimeout(() => {
    window.print();
  }, 1700);
}

const categories = ['All Reports', 'leads', 'sales', 'properties', 'commissions', 'performance'];

const reports = [
  { name: 'Lead Funnel & Sources', description: 'Monitor inquiries pipeline conversions, channel sources performance, and lost reasons.', category: 'leads', to: '/app/reports/viewer/leads', favorite: true },
  { name: 'Admissions & Deals Pipeline', description: 'Analyze transaction cycles, close ratios, and enrollment win-rate trends.', category: 'sales', to: '/app/reports/viewer/sales', favorite: true },
  { name: 'Course Batches & Capacity Aging', description: 'Displays class batch occupancy, trial class attendance, and faculty performance.', category: 'properties', to: '/app/reports/viewer/properties', favorite: false },
  { name: 'Expected vs Collected Fees & Revenues', description: 'Fee payment schedules, banking collections ledger, and installment management.', category: 'commissions', to: '/app/reports/viewer/commissions', favorite: true },
  { name: 'Counselor SLA & Compliance', description: 'Analyze counselor follow-up productivity, response speeds, and outreach channels.', category: 'performance', to: '/app/reports/viewer/performance', favorite: false },
  { name: 'Campus Branch Performance Metrics', description: 'Compares gross admissions volume, active staff counts, and conversions across branches.', category: 'performance', to: '/app/reports/viewer/branch', favorite: false },
  { name: 'Quarterly Intake Forecasts', description: '30/60/90 days expected weighted intake forecasts.', category: 'commissions', to: '/app/reports/viewer/forecast', favorite: true }
];

const filteredReports = computed(() => {
  if (activeCategory.value === 'All Reports') return reports;
  return reports.filter(r => r.category === activeCategory.value);
});

const kpiDictionary = [
  { name: 'Lead Conversion Rate', formula: '(Leads Marked Won or Enrolled / Total Sourced Leads) * 100', description: 'Percentage of leads successfully converted to confirmed students/clients.' },
  { name: 'Average Sales / Admissions Cycle Days', formula: 'Sum(Enrollment Date - Lead Sourced Date) / Count(Converted)', description: 'Average calendar days required to close an inquiry from lead registration.' },
  { name: 'Fee Collection Ratio', formula: '(Gross Fees Collected / Net Scheduled Receivables) * 100', description: 'Percentage of cleared bank collections relative to scheduled fee installments.' },
  { name: 'SLA Follow-up Compliance', formula: '(Follow-ups Met within 2 Hours / Total Scheduled Follow-ups) * 100', description: 'Percentage of customer inquiries contacted within target SLA window.' }
];
</script>
