<template>
  <div class="space-y-6 text-xs">
    <!-- Header Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0 font-medium">
      <div>
        <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 capitalize">
          <PhTrendUp :size="20" class="text-primary" />
          <span>{{ reportTitle }}</span>
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Realtime database metrics compilation and data visualization dashboard.
        </p>
      </div>

      <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
        <button 
          @click="loadData"
          :disabled="loading"
          class="btn btn-sm btn-ghost text-xs h-8 px-3 gap-1.5"
          title="Refresh live database data"
        >
          <PhArrowsClockwise :size="13" :class="{ 'animate-spin': loading }" />
          <span>Refresh</span>
        </button>
        <button 
          @click="shareReport"
          class="btn btn-sm btn-secondary text-xs h-8 px-3"
        >
          <PhShare :size="13" />
          <span>Share Report</span>
        </button>
        <router-link 
          to="/app/reports/dashboard"
          class="btn btn-sm btn-secondary text-xs h-8 px-3 shrink-0"
        >
          <PhBookOpen :size="13" />
          <span>Back to Library</span>
        </router-link>
      </div>
    </div>

    <!-- KPIs Ribbon -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPIWidget 
        v-for="kpi in reportKpis" 
        :key="kpi.title"
        :title="kpi.title"
        :value="kpi.value"
        :description="kpi.description"
        :trend="kpi.trend"
        :trendDirection="kpi.trendDirection"
      />
    </div>

    <!-- Visualization charts grids -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6" v-if="reportType !== 'forecast'">
      <AnalyticsChart 
        v-for="chart in reportCharts"
        :key="chart.title"
        :title="chart.title"
        :subtitle="chart.subtitle"
        :type="chart.type"
        :chartData="chart.data"
      />
    </div>

    <!-- Special Forecast View -->
    <div v-else class="space-y-6">
      <ForecastChart />
    </div>

    <!-- Dynamic report data lists details -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-default pb-2">
        <h4 class="font-heading font-bold text-slate-800 dark:text-slate-200 uppercase text-[9px] tracking-wider">
          Compiled Tabular Records
        </h4>
        <span class="text-[9px] font-mono text-slate-450">Active Records: {{ records.length }}</span>
      </div>

      <div class="overflow-x-auto">
        <div v-if="loading" class="py-8 text-center text-slate-400">
          Loading live database records...
        </div>
        <div v-else-if="records.length === 0" class="py-8 text-center text-slate-400">
          No records found in current database scope.
        </div>
        <table v-else class="w-full text-xs text-left">
          <thead>
            <tr class="border-b border-default text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
              <th v-for="col in tableHeaders" :key="col" class="py-2.5 px-3 capitalize">{{ col }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default text-slate-655 font-medium">
            <tr v-for="(row, idx) in records" :key="idx">
              <td v-for="col in tableHeaders" :key="col" class="py-2.5 px-3">
                <span v-if="col.toLowerCase().includes('value') || col.toLowerCase().includes('commission') || col.toLowerCase().includes('receivable') || col.toLowerCase().includes('revenue')" class="font-bold font-heading text-slate-800 dark:text-slate-100">
                  {{ formatCurrency(row[col]) }}
                </span>
                <span v-else class="text-slate-700 dark:text-slate-350">
                  {{ row[col] || '—' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { PhTrendUp, PhShare, PhBookOpen, PhArrowsClockwise } from '@phosphor-icons/vue';
import KPIWidget from '../components/KPIWidget.vue';
import AnalyticsChart from '../components/AnalyticsChart.vue';
import ForecastChart from '../components/ForecastChart.vue';
import {
  fetchEducationAnalytics,
  fetchEducationLeads,
  fetchEducationClasses,
} from '@/modules/education/api/endpoints';
import { fetchReportsDashboardStats } from '@/modules/reports/api/endpoints';

const route = useRoute();
const store = useStore();
const isEducation = computed(() => store.getters['organization/isEducationTenant']);

const reportType = computed(() => route.params.type || 'leads');

const loading = ref(false);
const liveAnalytics = ref(null);
const liveLeads = ref([]);
const liveClasses = ref([]);

const reportTitle = computed(() => {
  if (isEducation.value) {
    const educationMap = {
      leads: 'Student Inquiries & Channel Funnel',
      sales: 'Admissions & Enrollment Velocity',
      properties: 'Course Batches & Capacity Distribution',
      commissions: 'Expected vs Collected Fees & Revenues',
      performance: 'Counselor SLA & Productivity Audit',
      forecast: 'Quarterly Admissions & Fee Forecast',
      branch: 'Campus Branch Performance Metrics',
    };
    return educationMap[reportType.value] || `${reportType.value} Analytics Report`;
  }

  const realEstateMap = {
    leads: 'Lead Funnel & Source Performance',
    sales: 'Sales Deals Pipeline & Close Ratios',
    properties: 'Inventory & Projects Aging Report',
    commissions: 'Expected vs Collected Commission Ledger',
    performance: 'Agent SLA & Outreach Compliance',
    forecast: 'Revenue Forecast & Milestone Clearings',
    branch: 'Agency Branch Performance Metrics',
  };
  return realEstateMap[reportType.value] || `${reportType.value} Analytics Report`;
});

async function loadData() {
  loading.value = true;
  try {
    if (isEducation.value) {
      const [analyticsRes, leadsRes, classesRes] = await Promise.allSettled([
        fetchEducationAnalytics({ range: 'all' }),
        fetchEducationLeads({ limit: 20 }),
        fetchEducationClasses({ limit: 20 }),
      ]);
      if (analyticsRes.status === 'fulfilled') {
        liveAnalytics.value = analyticsRes.value?.data || analyticsRes.value;
      }
      if (leadsRes.status === 'fulfilled') {
        liveLeads.value = leadsRes.value?.data?.data || leadsRes.value?.data || [];
      }
      if (classesRes.status === 'fulfilled') {
        liveClasses.value = classesRes.value?.data?.data || classesRes.value?.data || [];
      }
    } else {
      const statsRes = await fetchReportsDashboardStats({ range: 'all' });
      liveAnalytics.value = statsRes?.data || statsRes;
    }
  } catch (err) {
    console.warn('Failed to load dynamic report viewer data:', err);
  } finally {
    loading.value = false;
  }
}

watch(reportType, () => {
  loadData();
});

onMounted(() => {
  loadData();
});

const reportKpis = computed(() => {
  const t = reportType.value;
  const metrics = liveAnalytics.value?.summaryMetrics || {
    totalInquiries: 0,
    confirmedConversions: 0,
    conversionRate: 0,
    pipelineInProgress: 0,
    slaCompliance: 100,
    totalClasses: 0,
    totalStudents: 0,
  };

  if (isEducation.value) {
    if (t === 'leads') {
      return [
        { title: 'Total Inquiries Sourced', value: String(metrics.totalInquiries), description: 'Dynamic intake registrations', trend: 'Live', trendDirection: 'up' },
        { title: 'Inquiries In Progress', value: String(metrics.pipelineInProgress), description: 'In counseling or trial demo', trend: 'Live', trendDirection: 'up' },
        { title: 'Confirmed Enrollments', value: String(metrics.confirmedConversions), description: 'Students enrolled in cohorts', trend: 'Live', trendDirection: 'up' },
        { title: 'Overall Conversion Rate', value: `${metrics.conversionRate}%`, description: 'Leads converted to students', trend: 'Live', trendDirection: 'up' },
      ];
    } else if (t === 'sales') {
      return [
        { title: 'Confirmed Enrollments', value: String(metrics.confirmedConversions), description: 'Registered students enrolled', trend: 'Live', trendDirection: 'up' },
        { title: 'Admissions Conversion Rate', value: `${metrics.conversionRate}%`, description: 'Intake ratio benchmark', trend: 'Live', trendDirection: 'up' },
        { title: 'Inquiries In Progress', value: String(metrics.pipelineInProgress), description: 'Trial class sessions scheduled', trend: 'Live', trendDirection: 'up' },
        { title: 'Active Class Batches', value: String(metrics.totalClasses || liveClasses.value.length), description: 'Ongoing academic cohorts', trend: 'Live', trendDirection: 'up' },
      ];
    } else if (t === 'properties') {
      const classCount = metrics.totalClasses || liveClasses.value.length || 0;
      const studentCount = metrics.totalStudents || 0;
      return [
        { title: 'Total Course Batches', value: String(classCount), description: 'Active academic batches', trend: 'Live', trendDirection: 'up' },
        { title: 'Active Students Enrolled', value: String(studentCount), description: 'Total matriculated students', trend: 'Live', trendDirection: 'up' },
        { title: 'Avg Cohort Capacity', value: classCount > 0 ? String(Math.round(studentCount / classCount)) : '0', description: 'Students per active batch', trend: 'Live', trendDirection: 'up' },
        { title: 'Course Offerings Active', value: String(classCount), description: 'Curriculum streams live', trend: 'Live', trendDirection: 'up' },
      ];
    } else if (t === 'commissions') {
      return [
        { title: 'Enrolled Students', value: String(metrics.confirmedConversions), description: 'Fee eligible admissions', trend: 'Live', trendDirection: 'up' },
        { title: 'Inquiries In Progress', value: String(metrics.pipelineInProgress), description: 'Expected next fee collections', trend: 'Live', trendDirection: 'up' },
        { title: 'Intake Conversion Yield', value: `${metrics.conversionRate}%`, description: 'Confirmed enrollments ratio', trend: 'Live', trendDirection: 'up' },
        { title: 'Total Academic Batches', value: String(metrics.totalClasses || liveClasses.value.length), description: 'Active class cohorts', trend: 'Live', trendDirection: 'up' },
      ];
    } else if (t === 'performance') {
      const counselors = liveAnalytics.value?.counselorPerformanceData || [];
      return [
        { title: 'Total Admissions Closed', value: String(metrics.confirmedConversions), description: 'Confirmed by counselors', trend: 'Live', trendDirection: 'up' },
        { title: 'Active Counseling Staff', value: String(counselors.length), description: 'Assigned counselor team', trend: 'Live', trendDirection: 'up' },
        { title: 'Inquiries Under Counseling', value: String(metrics.pipelineInProgress), description: 'Counseling sessions queued', trend: 'Live', trendDirection: 'up' },
        { title: 'Overall Conversion Rate', value: `${metrics.conversionRate}%`, description: 'Average admissions success rate', trend: 'Live', trendDirection: 'up' },
      ];
    } else {
      return [
        { title: 'Expected Intake (30d)', value: String(Math.round(metrics.totalInquiries * 0.4)), description: 'Weighted 30d forecast', trend: 'Live', trendDirection: 'up' },
        { title: 'Expected Intake (60d)', value: String(Math.round(metrics.totalInquiries * 0.7)), description: 'Weighted 60d forecast', trend: 'Live', trendDirection: 'up' },
        { title: 'Expected Intake (90d)', value: String(metrics.totalInquiries), description: 'Weighted 90d forecast', trend: 'Live', trendDirection: 'up' },
        { title: 'Pipeline In Progress', value: String(metrics.pipelineInProgress), description: 'Current active trials pool', trend: 'Live', trendDirection: 'up' },
      ];
    }
  }

  // Real Estate KPIs
  const leadTotal = metrics.totalInquiries || 0;
  const closedTotal = metrics.confirmedConversions || 0;
  const inNegotiation = metrics.pipelineInProgress || 0;

  if (t === 'leads') {
    return [
      { title: 'Total Leads Sourced', value: String(leadTotal), description: 'Database pipeline inquiries', trend: 'Live', trendDirection: 'up' },
      { title: 'Leads In Progress', value: String(inNegotiation), description: 'Active deal discussions', trend: 'Live', trendDirection: 'up' },
      { title: 'Closed Deals Count', value: String(closedTotal), description: 'Confirmed property bookings', trend: 'Live', trendDirection: 'up' },
      { title: 'Funnel Conversion Rate', value: `${metrics.conversionRate}%`, description: 'Leads converted to won deals', trend: 'Live', trendDirection: 'up' },
    ];
  } else if (t === 'sales') {
    return [
      { title: 'Won Deals Count', value: String(closedTotal), description: 'Confirmed property bookings', trend: 'Live', trendDirection: 'up' },
      { title: 'Deal Win Rate', value: `${metrics.conversionRate}%`, description: 'Booking conversions target met', trend: 'Live', trendDirection: 'up' },
      { title: 'Active Negotiations', value: String(inNegotiation), description: 'Pipeline under documentation', trend: 'Live', trendDirection: 'up' },
      { title: 'Total Leads Pool', value: String(leadTotal), description: 'Total registered client accounts', trend: 'Live', trendDirection: 'up' },
    ];
  } else {
    return [
      { title: 'Active Pipeline Deals', value: String(inNegotiation), description: 'Deals in negotiation stages', trend: 'Live', trendDirection: 'up' },
      { title: 'Closed Transactions', value: String(closedTotal), description: 'Settled transaction count', trend: 'Live', trendDirection: 'up' },
      { title: 'Conversion Rate', value: `${metrics.conversionRate}%`, description: 'Closing percentage ratio', trend: 'Live', trendDirection: 'up' },
      { title: 'SLA Compliance Rate', value: `${metrics.slaCompliance}%`, description: 'Speed to client follow-up', trend: 'Live', trendDirection: 'up' },
    ];
  }
});

const reportCharts = computed(() => {
  const trend = liveAnalytics.value?.trendChartData || [];
  const funnel = liveAnalytics.value?.funnelChartData || [];
  const source = liveAnalytics.value?.sourceChartData || [];
  const counselors = liveAnalytics.value?.counselorPerformanceData || [];

  return [
    {
      title: isEducation.value ? 'Inquiries Intake & Conversion Trend' : 'Lead Volume & Closing Trend',
      subtitle: 'Dynamic 6-month historical database timeline',
      type: 'line',
      data: trend,
    },
    {
      title: isEducation.value ? 'Admissions Conversion Funnel' : 'Sales Transaction Velocity Funnel',
      subtitle: 'Dynamic phase progression and drop-off analysis',
      type: 'funnel',
      data: funnel,
    },
    {
      title: isEducation.value ? 'Lead Origin Sourcing Performance' : 'Channel Acquisition Performance',
      subtitle: 'Channel volume yield breakdown',
      type: 'donut',
      data: source,
    },
    {
      title: isEducation.value ? 'Counselor Admissions Performance' : 'Broker Team Production',
      subtitle: 'Conversions closed against target benchmarks',
      type: 'bar',
      data: counselors,
    },
  ];
});

const tableHeaders = computed(() => {
  const t = reportType.value;
  if (isEducation.value) {
    if (t === 'leads' || t === 'sales') {
      return ['Student Name', 'Mobile', 'Source', 'Status', 'Date'];
    } else if (t === 'properties') {
      return ['Class Name', 'Code', 'Subject', 'Grade', 'Room', 'Status'];
    } else if (t === 'performance') {
      return ['Counselor Name', 'Conversions', 'Target Quota'];
    }
    return ['Stage', 'Active Count', 'Percentage Share'];
  }

  if (t === 'performance') {
    return ['Counselor Name', 'Conversions', 'Target Quota'];
  }
  return ['Channel / Stage', 'Volume Count', 'Yield Percentage'];
});

const records = computed(() => {
  const t = reportType.value;

  if (isEducation.value) {
    if (t === 'leads' || t === 'sales') {
      return liveLeads.value.map((lead) => ({
        'Student Name': `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Inquiry Contact',
        Mobile: lead.mobile || '—',
        Source: lead.source || 'Direct',
        Status: (lead.status || 'new').replace(/_/g, ' ').toUpperCase(),
        Date: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN') : '—',
      }));
    }

    if (t === 'properties') {
      return liveClasses.value.map((cls) => ({
        'Class Name': cls.name || 'Academic Batch',
        Code: cls.code || '—',
        Subject: cls.subject || 'Standard',
        Grade: cls.grade || '—',
        Room: cls.roomNumber || cls.room || 'Room 101',
        Status: (cls.status || 'active').toUpperCase(),
      }));
    }

    if (t === 'performance') {
      const counselors = liveAnalytics.value?.counselorPerformanceData || [];
      return counselors.map((c) => ({
        'Counselor Name': c.label,
        Conversions: c.value,
        'Target Quota': c.target || 10,
      }));
    }

    // Default funnel breakdown
    const funnel = liveAnalytics.value?.funnelChartData || [];
    return funnel.map((f) => ({
      Stage: f.label,
      'Active Count': f.value,
      'Percentage Share': `${f.percent}%`,
    }));
  }

  // Real estate dynamic fallback
  const counselors = liveAnalytics.value?.counselorPerformanceData || [];
  if (t === 'performance' && counselors.length > 0) {
    return counselors.map((c) => ({
      'Counselor Name': c.label,
      Conversions: c.value,
      'Target Quota': c.target || 10,
    }));
  }

  const sources = liveAnalytics.value?.sourceChartData || [];
  return sources.map((s) => ({
    'Channel / Stage': s.label,
    'Volume Count': s.value,
    'Yield Percentage': `${s.percent}%`,
  }));
});

const shareReport = () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    store.dispatch('notifications/triggerToast', {
      message: 'Report deep-link copied to clipboard. Ready to share.',
      type: 'success',
    });
  });
};

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};
</script>
