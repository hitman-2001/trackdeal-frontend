<template>
  <div class="bg-surface border border-default rounded-xl p-4 sm:p-5 shadow-xs text-xs space-y-4 transition-all duration-200 hover:border-primary/30 relative">
    <!-- Header -->
    <div class="border-b border-default pb-3 flex items-start justify-between gap-3">
      <div>
        <h4 class="font-heading font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
          {{ title }}
        </h4>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed" v-if="subtitle">
          {{ subtitle }}
        </p>
      </div>

      <!-- Chart Legend for Line Chart with multiple series -->
      <div v-if="type === 'line' && hasConvertedData" class="flex items-center gap-3 text-[11px] shrink-0 pt-0.5">
        <span class="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
          <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
          Inquiries
        </span>
        <span class="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          Enrollments
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!chartData || chartData.length === 0" class="py-10 text-center text-slate-400">
      <p class="text-xs">No transaction records logged in this period.</p>
    </div>

    <!-- 1. Funnel Chart -->
    <div v-else-if="type === 'funnel'" class="space-y-3.5 pt-1">
      <div 
        v-for="(item, idx) in chartData" 
        :key="item.label" 
        class="space-y-1.5 group"
      >
        <div class="flex justify-between items-center text-[11px]">
          <span class="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span class="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
              {{ idx + 1 }}
            </span>
            <span>{{ cleanFunnelLabel(item.label) }}</span>
          </span>
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 dark:text-slate-100 font-tabular text-xs">{{ item.value }}</span>
            <span 
              class="px-2 py-0.5 rounded text-[10px] font-bold font-tabular min-w-[44px] text-center border"
              :class="item.value > 0 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-200/40 dark:border-slate-800/40'"
            >
              {{ item.percent }}%
            </span>
          </div>
        </div>
        <!-- Funnel bar progress track -->
        <div class="w-full bg-slate-100 dark:bg-slate-800/70 rounded-full h-2.5 overflow-hidden p-0.5 border border-default/50">
          <div 
            class="h-full rounded-full transition-all duration-700 relative overflow-hidden"
            :class="getFunnelBarClass(idx)"
            :style="{ width: item.value > 0 ? `${Math.max(item.percent, 3)}%` : '0%' }"
          >
            <!-- subtle inner sheen -->
            <div class="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Donut Distribution Chart -->
    <div v-else-if="type === 'donut'" class="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
      <!-- Donut SVG -->
      <div class="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 42 42" class="w-full h-full transform -rotate-90">
          <!-- Background circle track -->
          <circle 
            cx="21" 
            cy="21" 
            r="15.915" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="3.5" 
            class="text-slate-100 dark:text-slate-800"
          />
          
          <!-- Colored segments (only rendered if percent > 0) -->
          <circle 
            v-for="seg in donutSegments" 
            :key="seg.label"
            cx="21" 
            cy="21" 
            r="15.915" 
            fill="none" 
            :stroke="seg.color" 
            stroke-width="3.6" 
            stroke-linecap="round"
            :stroke-dasharray="`${Math.max(seg.percent - 1.5, 0.5)} ${100 - Math.max(seg.percent - 1.5, 0.5)}`"
            :stroke-dashoffset="seg.offset"
            class="transition-all duration-700"
          />
        </svg>

        <!-- Inner total metric label -->
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span class="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-heading font-tabular leading-none">
            {{ totalCount }}
          </span>
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Total
          </span>
        </div>
      </div>

      <!-- Donut Legend -->
      <div class="space-y-2 flex-1 w-full">
        <div 
          v-for="item in chartData" 
          :key="item.label" 
          class="flex items-center justify-between text-[11px] p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" :style="{ backgroundColor: item.color || '#4f46e5' }"></span>
            <span class="text-slate-700 dark:text-slate-300 font-medium">{{ item.label }}</span>
          </div>
          <div class="flex items-center gap-2 font-tabular">
            <span class="font-bold text-slate-900 dark:text-slate-100">{{ item.value }}</span>
            <span class="text-[10px] text-slate-400 font-semibold min-w-[38px] text-right">({{ item.percent }}%)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Line Trend Chart (Smooth Monotone Spline with Interactive Hover Tooltip) -->
    <div v-else-if="type === 'line'" class="pt-2 relative">
      <!-- Interactive Hover Tooltip Card -->
      <div 
        v-if="hoveredIndex !== null && activePointData"
        class="absolute top-2 z-20 pointer-events-none transform -translate-x-1/2 transition-transform duration-100"
        :style="{ left: `${tooltipLeftPercent}%` }"
      >
        <div class="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-2 rounded-lg shadow-xl border border-slate-700/40 text-[11px] space-y-1">
          <div class="font-bold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-600 border-b border-slate-700/60 dark:border-slate-200/60 pb-1">
            {{ activePointData.name }}
          </div>
          <div class="flex items-center justify-between gap-4 font-tabular">
            <span class="flex items-center gap-1.5 text-indigo-400 dark:text-indigo-600 font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Inquiries:
            </span>
            <span class="font-black text-white dark:text-slate-900">{{ activePointData.value }}</span>
          </div>
          <div v-if="hasConvertedData" class="flex items-center justify-between gap-4 font-tabular">
            <span class="flex items-center gap-1.5 text-emerald-400 dark:text-emerald-600 font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Enrollments:
            </span>
            <span class="font-black text-white dark:text-slate-900">{{ activePointData.converted || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Chart SVG Container -->
      <div class="relative w-full">
        <svg 
          ref="svgRef"
          viewBox="0 0 420 140" 
          class="w-full h-36 overflow-visible select-none cursor-crosshair"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
        >
          <!-- Y-Axis Scale Values -->
          <text x="32" y="23" text-anchor="end" font-size="8.5" font-weight="600" class="fill-slate-400 dark:fill-slate-500 font-tabular">
            {{ scaleMax }}
          </text>
          <text x="32" y="68" text-anchor="end" font-size="8.5" font-weight="600" class="fill-slate-400 dark:fill-slate-500 font-tabular">
            {{ scaleMid }}
          </text>
          <text x="32" y="113" text-anchor="end" font-size="8.5" font-weight="600" class="fill-slate-400 dark:fill-slate-500 font-tabular">
            0
          </text>

          <!-- Horizontal Grid Lines -->
          <line x1="38" y1="20" x2="410" y2="20" stroke="currentColor" stroke-dasharray="3 3" class="text-slate-200 dark:text-slate-800" stroke-width="0.8" />
          <line x1="38" y1="65" x2="410" y2="65" stroke="currentColor" stroke-dasharray="3 3" class="text-slate-200 dark:text-slate-800" stroke-width="0.8" />
          <line x1="38" y1="110" x2="410" y2="110" stroke="currentColor" class="text-slate-200 dark:text-slate-800" stroke-width="0.9" />

          <!-- Gradient Area Fill under Inquiries Curve -->
          <path 
            :d="areaPath" 
            :fill="`url(#${chartGradId})`" 
            class="transition-all duration-700"
          />

          <!-- Primary Inquiries Line (Indigo) -->
          <path 
            :d="linePath" 
            fill="none" 
            stroke="#4f46e5" 
            stroke-width="2.5" 
            stroke-linecap="round"
            stroke-linejoin="round"
            class="transition-all duration-700"
          />

          <!-- Secondary Converted Enrollments Line (Emerald), if available -->
          <path 
            v-if="hasConvertedData && convertedLinePath"
            :d="convertedLinePath" 
            fill="none" 
            stroke="#10b981" 
            stroke-width="2" 
            stroke-dasharray="4 3"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="transition-all duration-700"
          />

          <!-- Hover Vertical Crosshair Guide -->
          <line 
            v-if="hoveredIndex !== null && activePointData"
            :x1="activePointData.x" 
            y1="16" 
            :x2="activePointData.x" 
            y2="110" 
            stroke="currentColor" 
            stroke-dasharray="2 2" 
            class="text-indigo-400 dark:text-indigo-500" 
            stroke-width="1.2" 
          />

          <!-- Primary Line Point Markers (Clean Dots without Cluttering Static Pills) -->
          <g v-for="(pt, idx) in linePoints" :key="`pt-${idx}`">
            <!-- Active Hover Outer Halo -->
            <circle 
              v-if="hoveredIndex === idx"
              :cx="pt.x" 
              :cy="pt.y" 
              r="7" 
              fill="#4f46e5" 
              opacity="0.25" 
              class="animate-ping" 
            />
            
            <!-- Point Outer Ring -->
            <circle 
              :cx="pt.x" 
              :cy="pt.y" 
              :r="hoveredIndex === idx ? 4.5 : 3" 
              fill="#4f46e5" 
              class="stroke-white dark:stroke-slate-900 transition-all duration-200" 
              :stroke-width="hoveredIndex === idx ? 2 : 1.5"
            />

            <!-- Converted Point Marker (if converted data exists) -->
            <circle 
              v-if="hasConvertedData && convertedPoints[idx]"
              :cx="convertedPoints[idx].x" 
              :cy="convertedPoints[idx].y" 
              :r="hoveredIndex === idx ? 3.5 : 2.5" 
              fill="#10b981" 
              class="stroke-white dark:stroke-slate-900 transition-all duration-200" 
              stroke-width="1.2"
            />

            <!-- X-Axis Label at Bottom -->
            <text 
              :x="pt.x" 
              y="126" 
              text-anchor="middle" 
              font-size="8.5" 
              :font-weight="hoveredIndex === idx ? 'bold' : '600'" 
              class="transition-colors duration-150"
              :class="hoveredIndex === idx 
                ? 'fill-slate-900 dark:fill-white' 
                : 'fill-slate-500 dark:fill-slate-400'"
            >
              {{ pt.name }}
            </text>
          </g>

          <defs>
            <linearGradient :id="chartGradId" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.22" />
              <stop offset="70%" stop-color="#4f46e5" stop-opacity="0.04" />
              <stop offset="100%" stop-color="#4f46e5" stop-opacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>

    <!-- 4. Bar Comparative Chart -->
    <div v-else-if="type === 'bar'" class="space-y-3 pt-1">
      <div 
        v-for="item in chartData" 
        :key="item.label" 
        class="space-y-1.5 group"
      >
        <div class="flex justify-between items-center text-[11px]">
          <span class="font-medium text-slate-800 dark:text-slate-200">{{ item.label }}</span>
          <span class="font-tabular font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>{{ item.value }}</span>
            <span v-if="item.target" class="text-slate-400 font-normal">
              / {{ item.target }} 
              <span class="text-primary font-semibold text-[10px] ml-0.5">
                ({{ Math.round((item.value / item.target) * 100) }}%)
              </span>
            </span>
          </span>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-800/70 rounded-full h-2.5 overflow-hidden flex items-center p-0.5 border border-default/50">
          <div 
            class="h-full rounded-full transition-all duration-700 relative overflow-hidden"
            :style="{ 
              width: item.value > 0 
                ? `${item.percent !== undefined ? item.percent : Math.min(100, Math.round((item.value / (item.target || maxBarValue)) * 100))}%` 
                : '0%', 
              backgroundColor: item.color || '#4f46e5' 
            }"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  type: { type: String, default: 'funnel' }, // funnel, donut, line, bar
  chartData: { type: Array, required: true }
});

const svgRef = ref(null);
const hoveredIndex = ref(null);

const chartGradId = computed(() => {
  return `chart-grad-${props.title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'default'}`;
});

const cleanFunnelLabel = (label) => {
  if (!label) return '';
  return label.replace(/^\d+\.\s*/, '');
};

// Funnel colors: Executive tonal progression
const getFunnelBarClass = (idx) => {
  const classes = [
    'bg-slate-700 dark:bg-slate-300',
    'bg-slate-500 dark:bg-slate-400',
    'bg-indigo-600 dark:bg-indigo-500',
    'bg-emerald-600 dark:bg-emerald-500'
  ];
  return classes[idx % classes.length];
};

const maxBarValue = computed(() => {
  if (!props.chartData || props.chartData.length === 0) return 1;
  return Math.max(...props.chartData.map(item => item.value || 0), 1);
});

// Donut segments calculation
const totalCount = computed(() => {
  if (!props.chartData || props.chartData.length === 0) return 0;
  return props.chartData.reduce((acc, curr) => acc + (curr.value || 0), 0);
});

const donutSegments = computed(() => {
  if (!props.chartData || props.chartData.length === 0 || totalCount.value === 0) return [];
  let accumOffset = 0;
  return props.chartData
    .filter(item => (item.value || 0) > 0)
    .map(item => {
      const percent = item.percent !== undefined 
        ? item.percent 
        : (totalCount.value > 0 ? (item.value / totalCount.value) * 100 : 0);
      const offset = 100 - accumOffset;
      accumOffset += percent;
      return {
        label: item.label,
        percent,
        offset,
        color: item.color || '#4f46e5'
      };
    });
});

// Check if dataset has secondary converted enrollments series
const hasConvertedData = computed(() => {
  if (!props.chartData || props.chartData.length === 0) return false;
  return props.chartData.some(item => item.converted !== undefined);
});

// Maximum scale calculation for clean Y-axis headroom
const maxDataVal = computed(() => {
  if (!props.chartData || props.chartData.length === 0) return 1;
  const vals = props.chartData.map(item => Math.max(item.value || 0, item.converted || 0));
  return Math.max(...vals, 1);
});

const scaleMax = computed(() => {
  const v = maxDataVal.value;
  if (v <= 2) return 2;
  if (v <= 4) return 4;
  if (v <= 10) return Math.ceil(v / 2) * 2;
  return Math.ceil(v * 1.15);
});

const scaleMid = computed(() => {
  return Math.round(scaleMax.value / 2);
});

// Line Points calculation
// X range: 50 to 395 (width 345)
// Y range: 110 (value 0) to 20 (scaleMax)
const linePoints = computed(() => {
  if (props.type !== 'line' || !props.chartData || props.chartData.length === 0) return [];
  const size = props.chartData.length;
  const xStart = 55;
  const xEnd = 395;
  const xStep = size > 1 ? (xEnd - xStart) / (size - 1) : 0;
  const sMax = scaleMax.value;

  return props.chartData.map((item, idx) => {
    const x = xStart + idx * xStep;
    const val = item.value || 0;
    const y = 110 - (val / sMax) * 90;
    return {
      x,
      y,
      value: val,
      converted: item.converted || 0,
      name: item.label || ''
    };
  });
});

const convertedPoints = computed(() => {
  if (!hasConvertedData.value || !props.chartData || props.chartData.length === 0) return [];
  const size = props.chartData.length;
  const xStart = 55;
  const xEnd = 395;
  const xStep = size > 1 ? (xEnd - xStart) / (size - 1) : 0;
  const sMax = scaleMax.value;

  return props.chartData.map((item, idx) => {
    const x = xStart + idx * xStep;
    const val = item.converted || 0;
    const y = 110 - (val / sMax) * 90;
    return {
      x,
      y,
      value: val,
      name: item.label || ''
    };
  });
});

// Mathematical Monotone Spline (Fritsch-Carlson)
// Prevents baseline dipping, overshoot, and awkward S-kinks when transitioning from flat zeros
function buildMonotoneSpline(pts) {
  if (!pts || pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;
  const n = pts.length;

  // Step 1: Calculate secants
  const secants = [];
  const dxs = [];
  for (let i = 0; i < n - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    dxs.push(dx);
    secants.push((pts[i + 1].y - pts[i].y) / (dx || 1));
  }

  // Step 2: Calculate tangents
  const m = new Array(n);
  m[0] = secants[0];
  m[n - 1] = secants[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (secants[i - 1] * secants[i] <= 0) {
      m[i] = 0; // Local extremum or flat: horizontal tangent
    } else {
      m[i] = (secants[i - 1] + secants[i]) / 2;
    }
  }

  // Step 3: Build Bezier curves
  let path = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const dx = dxs[i] / 3;

    let cp1y = p0.y + m[i] * dx;
    let cp2y = p1.y - m[i + 1] * dx;

    // Strict clamping within vertical segment bounds (guarantees no baseline overshoot)
    const minY = Math.min(p0.y, p1.y);
    const maxY = Math.max(p0.y, p1.y);
    cp1y = Math.max(minY, Math.min(maxY, cp1y));
    cp2y = Math.max(minY, Math.min(maxY, cp2y));

    const cp1x = p0.x + dx;
    const cp2x = p1.x - dx;

    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
  }
  return path;
}

const linePath = computed(() => {
  return buildMonotoneSpline(linePoints.value);
});

const convertedLinePath = computed(() => {
  return buildMonotoneSpline(convertedPoints.value);
});

// Area Fill under Curve (bounds strictly to y=110 baseline)
const areaPath = computed(() => {
  const pts = linePoints.value;
  if (pts.length === 0) return '';
  const first = pts[0];
  const last = pts[pts.length - 1];
  return `${linePath.value} L ${last.x.toFixed(1)},110 L ${first.x.toFixed(1)},110 Z`;
});

// Mouse interactions for Tooltip & Crosshair
const activePointData = computed(() => {
  if (hoveredIndex.value === null || !linePoints.value.length) return null;
  return linePoints.value[hoveredIndex.value] || null;
});

const tooltipLeftPercent = computed(() => {
  if (!activePointData.value) return 50;
  // SVG width is 420
  const pct = (activePointData.value.x / 420) * 100;
  return Math.max(15, Math.min(85, pct));
});

function handleMouseMove(e) {
  const svg = svgRef.value;
  if (!svg || !linePoints.value.length) return;
  const rect = svg.getBoundingClientRect();
  const clientX = e.clientX - rect.left;
  const svgX = (clientX / rect.width) * 420;

  let closestIdx = 0;
  let minDiff = Infinity;
  linePoints.value.forEach((pt, idx) => {
    const diff = Math.abs(pt.x - svgX);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = idx;
    }
  });
  hoveredIndex.value = closestIdx;
}

function handleMouseLeave() {
  hoveredIndex.value = null;
}
</script>

