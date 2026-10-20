<template>
  <div class="bg-surface border border-default rounded-xl p-4 sm:p-6 shadow-sm space-y-6">
    <div class="flex items-center justify-between border-b border-default pb-4 flex-wrap gap-2">
      <div>
        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">System Audit Logs</h3>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">Immutable chronological record of administrative actions, stage changes, status updates, and security events.</p>
      </div>
      <button
        v-if="hasActiveFilters"
        @click="resetFilters"
        type="button"
        class="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
      >
        <span>Clear Filters</span>
        <span class="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px]">{{ activeFilterCount }}</span>
      </button>
    </div>

    <!-- Filters Panel -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-850/50 p-4 rounded-xl border border-default">
      <div>
        <label class="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">MODULE</label>
        <select
          v-model="filters.module"
          class="w-full bg-surface border border-default rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-100 cursor-pointer"
        >
          <option value="">All Modules</option>
          <option v-for="mod in availableModules" :key="mod" :value="mod">{{ mod }}</option>
        </select>
      </div>

      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">STAFF MEMBER</label>
          <button
            v-if="filters.user"
            @click="filters.user = ''"
            type="button"
            class="text-[9px] text-primary hover:underline cursor-pointer"
          >
            Clear
          </button>
        </div>
        <select
          v-model="filters.user"
          class="w-full bg-surface border border-default rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-100 cursor-pointer"
        >
          <option value="">All Staff Members</option>
          <option v-for="staff in availableStaffList" :key="staff.value" :value="staff.value">
            {{ staff.label }}
          </option>
        </select>
      </div>

      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">DATE RANGE</label>
          <button
            v-if="filters.startDate || filters.endDate"
            @click="applyDatePreset('all')"
            type="button"
            class="text-[9px] text-primary hover:underline cursor-pointer"
          >
            Clear
          </button>
        </div>
        <select
          v-model="selectedPreset"
          @change="applyDatePreset(selectedPreset)"
          class="w-full bg-surface border border-default rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-100 cursor-pointer"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7">Last 7 Days</option>
          <option value="last30">Last 30 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="custom">Custom Date Range</option>
        </select>
        <div v-if="selectedPreset === 'custom'" class="flex items-center space-x-1 mt-2">
          <input
            v-model="filters.startDate"
            type="date"
            :max="filters.endDate || undefined"
            class="w-1/2 bg-surface border border-default rounded-md px-1.5 py-1 text-[11px] outline-none focus:border-primary text-slate-800 dark:text-slate-100"
            title="Start date (From)"
          />
          <span class="text-slate-400 text-xs">-</span>
          <input
            v-model="filters.endDate"
            type="date"
            :min="filters.startDate || undefined"
            class="w-1/2 bg-surface border border-default rounded-md px-1.5 py-1 text-[11px] outline-none focus:border-primary text-slate-800 dark:text-slate-100"
            title="End date (To)"
          />
        </div>
      </div>
    </div>

    <!-- Timeline List -->
    <div v-if="filteredLogs.length === 0" class="text-center py-12 text-slate-400 text-xs space-y-2">
      <p class="font-semibold text-slate-700 dark:text-slate-300">No audit logs found matching your criteria.</p>
      <p class="text-[11px] text-slate-400">
        {{ hasActiveFilters ? "Try clearing or adjusting your search filters above." : "Actions performed across inquiries, classes, students, and staff will appear chronologically here." }}
      </p>
      <button
        v-if="hasActiveFilters"
        @click="resetFilters"
        type="button"
        class="mt-2 btn btn-secondary btn-sm h-7 text-xs"
      >
        Reset Filters
      </button>
    </div>

    <div v-else class="space-y-4">
      <div class="relative border-l-2 border-slate-100 dark:border-slate-800 pl-4 ml-3 space-y-5">
        <div
          v-for="log in paginatedLogs"
          :key="log.id"
          class="relative space-y-1.5"
        >
          <!-- Bullet Indicator -->
          <span
            class="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ring-4 shadow-xs"
            :class="getLogIndicatorClass(log.action)"
          ></span>

          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div class="flex items-center space-x-2 flex-wrap gap-y-1">
              <span class="text-xs font-bold text-slate-850 dark:text-slate-150">{{ log.user }}</span>
              <span class="text-[10px] font-semibold text-slate-400">performed</span>
              <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-semibold">{{ formatActionLabel(log.action) }}</span>
              <span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">{{ log.module }}</span>
            </div>
            <time class="text-[10px] text-slate-400 font-semibold shrink-0">{{ formatDate(log.timestamp) }}</time>
          </div>

          <div class="bg-slate-50 dark:bg-slate-850/40 border border-default rounded-lg p-3 space-y-1.5">
            <div class="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
              Target Entity: <strong class="text-slate-850 dark:text-slate-100">{{ log.target }}</strong>
            </div>
            <div class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {{ log.description || log.details }}
            </div>

            <!-- Clean Formatted Value Changes (No raw hex database IDs) -->
            <div v-if="log.formattedChanges && log.formattedChanges.length > 0" class="flex flex-wrap gap-1.5 pt-1">
              <span
                v-for="ch in log.formattedChanges"
                :key="ch.label"
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-default text-[10px]"
              >
                <span class="text-slate-400 uppercase font-bold text-[9px]">{{ ch.label }}:</span>
                <strong class="text-slate-700 dark:text-slate-200 font-medium">{{ ch.value }}</strong>
              </span>
            </div>

            <div class="flex items-center justify-between text-[9px] text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
              <span>IP: <strong>{{ log.ip }}</strong></span>
              <span>Recorded: <strong>Immutable Write</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div v-if="filteredLogs.length > pageSize" class="flex items-center justify-between pt-3 border-t border-default text-xs text-slate-500">
        <span>
          Showing {{ (page - 1) * pageSize + 1 }} to {{ Math.min(page * pageSize, filteredLogs.length) }} of {{ filteredLogs.length }} events
        </span>
        <div class="flex items-center space-x-2">
          <button
            type="button"
            :disabled="page <= 1"
            @click="page--"
            class="px-2.5 py-1 rounded border border-default bg-surface hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs cursor-pointer font-medium"
          >
            Previous
          </button>
          <span class="text-xs font-semibold px-1">Page {{ page }} of {{ totalPages }}</span>
          <button
            type="button"
            :disabled="page >= totalPages"
            @click="page++"
            class="px-2.5 py-1 rounded border border-default bg-surface hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs cursor-pointer font-medium"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  logs: { type: Array, required: true },
  users: { type: Array, default: () => [] }
});

const filters = ref({
  module: '',
  user: '',
  startDate: '',
  endDate: ''
});

const selectedPreset = ref('all');
const page = ref(1);
const pageSize = ref(20);

watch(filters, () => {
  page.value = 1;
}, { deep: true });

watch(() => filters.value.startDate, (newStart) => {
  if (newStart && filters.value.endDate && filters.value.endDate < newStart) {
    filters.value.endDate = newStart;
  }
});

watch(() => filters.value.endDate, (newEnd) => {
  if (newEnd && filters.value.startDate && filters.value.startDate > newEnd) {
    filters.value.startDate = newEnd;
  }
});

function formatToYMD(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function applyDatePreset(presetKey) {
  selectedPreset.value = presetKey;
  const now = new Date();
  const todayStr = formatToYMD(now);

  if (presetKey === 'all') {
    filters.value.startDate = '';
    filters.value.endDate = '';
  } else if (presetKey === 'today') {
    filters.value.startDate = todayStr;
    filters.value.endDate = todayStr;
  } else if (presetKey === 'yesterday') {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yStr = formatToYMD(y);
    filters.value.startDate = yStr;
    filters.value.endDate = yStr;
  } else if (presetKey === 'last7') {
    const past7 = new Date();
    past7.setDate(past7.getDate() - 6);
    filters.value.startDate = formatToYMD(past7);
    filters.value.endDate = todayStr;
  } else if (presetKey === 'last30') {
    const past30 = new Date();
    past30.setDate(past30.getDate() - 29);
    filters.value.startDate = formatToYMD(past30);
    filters.value.endDate = todayStr;
  } else if (presetKey === 'thisMonth') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    filters.value.startDate = formatToYMD(firstDay);
    filters.value.endDate = todayStr;
  }
}

const availableStaffList = computed(() => {
  const map = new Map();

  // 1. Add staff from props.users
  (props.users || []).forEach((u) => {
    const id = u.id || u._id;
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || u.email;
    if (name) {
      const email = u.email ? ` (${u.email})` : '';
      const key = name.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          value: name.trim(),
          userId: id ? String(id) : null,
          email: u.email || '',
          label: `${name.trim()}${email}`,
        });
      }
    }
  });

  // 2. Add actors present in props.logs
  (props.logs || []).forEach((l) => {
    const rawName = l.user || l.userSnapshot?.name || l.userId?.name;
    const rawEmail = l.actorEmail || l.userSnapshot?.email || l.userId?.email || '';
    const userId = l.userId?._id || l.userId || l.userSnapshot?.id || l.userSnapshot?._id;
    if (rawName && typeof rawName === 'string') {
      const cleanName = rawName.trim();
      const key = cleanName.toLowerCase();
      if (!map.has(key) && cleanName.toLowerCase() !== 'system') {
        const emailSuffix = rawEmail ? ` (${rawEmail})` : '';
        map.set(key, {
          value: cleanName,
          userId: userId ? String(userId) : null,
          email: rawEmail,
          label: `${cleanName}${emailSuffix}`,
        });
      }
    }
  });

  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
});

const hasActiveFilters = computed(() => {
  return Boolean(
    filters.value.module ||
    filters.value.user ||
    filters.value.startDate ||
    filters.value.endDate
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.module) count++;
  if (filters.value.user) count++;
  if (filters.value.startDate || filters.value.endDate) count++;
  return count;
});

const availableModules = computed(() => {
  const set = new Set();
  (props.logs || []).forEach(rawLog => {
    const m = rawLog.module || rawLog.entity;
    if (m && typeof m === 'string' && m.trim()) {
      const clean = m.trim();
      // Skip IDs
      if (/^[0-9a-fA-F]{24}$/.test(clean) || /^#[0-9a-fA-F]+$/.test(clean)) return;
      const lower = clean.toLowerCase();
      let normalized = lower.charAt(0).toUpperCase() + lower.slice(1);
      if (lower === 'user' || lower === 'users') normalized = 'Users';
      else if (lower === 'lead' || lower === 'leads') normalized = 'Leads';
      else if (lower === 'role' || lower === 'roles') normalized = 'Roles';
      else if (lower === 'branch' || lower === 'branches') normalized = 'Branches';
      else if (lower === 'class' || lower === 'classes') normalized = 'Classes';
      else if (lower === 'student' || lower === 'students') normalized = 'Students';
      else if (lower === 'education') normalized = 'Education';
      set.add(normalized);
    }
  });
  if (set.size === 0) {
    return ['Education', 'Users', 'Leads', 'Roles', 'Branches'];
  }
  return Array.from(set).sort();
});

function sanitizeDescription(desc) {
  if (!desc) return '';
  let s = String(desc);
  // Replace contextual IDs with human descriptions
  s = s.replace(/\binto class\s+[0-9a-fA-F]{24}\b/gi, 'into enrolled class');
  s = s.replace(/\b(?:to|for)\s+(?:agent|staff|user)\s+[0-9a-fA-F]{24}\b/gi, 'to staff member');
  s = s.replace(/\b(?:lead|student|class|batch|user|branch)\s+[0-9a-fA-F]{24}\b/gi, (match) => match.split(/\s+/)[0]);
  s = s.replace(/\b(?:id|objectid)[:\s]+[0-9a-fA-F]{24}\b/gi, '');
  // Strip any remaining standalone 24-character hex ObjectIds
  s = s.replace(/\b[0-9a-fA-F]{24}\b/g, '');
  // Clean up any stray hashtags with hex numbers e.g. #3ba166, #38978b
  s = s.replace(/#[0-9a-fA-F]{3,32}\b/g, '');
  // Clean empty quotes or parens left behind
  s = s.replace(/\(\s*\)/g, '').replace(/""\s*/g, '').replace(/''\s*/g, '');
  // Clean up double spaces or awkward spacing
  s = s.replace(/\s{2,}/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
  return s;
}

function formatChanges(newValues) {
  if (!newValues || typeof newValues !== 'object') return [];
  const changes = [];
  const hiddenKeys = [
    'id', '_id', '__v', 'studentid', 'classid', 'userid', 'leadid',
    'entityid', 'branchid', 'roleid', 'organizationid', 'tenantid',
    'createdby', 'updatedby'
  ];

  for (const [key, val] of Object.entries(newValues)) {
    if (val === null || val === undefined || val === '') continue;
    const lowerKey = key.toLowerCase();
    // Exclude raw ID keys and internal fields
    if (hiddenKeys.includes(lowerKey) || lowerKey.endsWith('id') || lowerKey.endsWith('_id')) {
      continue;
    }
    // Exclude any value that is a raw 24-hex ObjectId string or hashtag ID
    if (typeof val === 'string' && (/^[0-9a-fA-F]{24}$/.test(val.trim()) || /^#[0-9a-fA-F]{3,32}$/.test(val.trim()))) {
      continue;
    }

    // Format human label
    const label = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim();

    let displayVal = val;
    if (typeof val === 'string' && !isNaN(Date.parse(val)) && val.includes('T')) {
      displayVal = formatDate(val);
    } else if (typeof val === 'object') {
      continue;
    } else {
      displayVal = String(val);
    }

    changes.push({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value: displayVal
    });
  }
  return changes;
}

function formatActionLabel(action) {
  if (!action) return 'EVENT';
  const a = String(action).trim();
  if (a.toLowerCase() === 'login') return 'LOGIN';
  return a
    .replace(/^education\./i, '')
    .replace(/\./g, ' ')
    .toUpperCase();
}

const normalizedLogs = computed(() => {
  return (props.logs || []).map((rawLog) => {
    const user = rawLog.user ||
      rawLog.userSnapshot?.name ||
      rawLog.userSnapshot?.email ||
      rawLog.userId?.name ||
      rawLog.userId?.email ||
      'Admin';

    const userId = rawLog.userId?._id || rawLog.userId || rawLog.userSnapshot?.id || rawLog.userSnapshot?._id || '';
    const actorEmail = rawLog.actorEmail || rawLog.userSnapshot?.email || rawLog.userId?.email || '';
    const timestamp = rawLog.timestamp || rawLog.createdAt || new Date().toISOString();
    const entity = rawLog.entity || 'System';

    // Target Entity: Never display hex ID slices like #3ba166 or #38978b
    let target = rawLog.targetName || rawLog.target || entity;
    target = String(target)
      .replace(/\s*#[0-9a-fA-F]{3,32}\b/g, '')
      .replace(/\b[0-9a-fA-F]{24}\b/g, '')
      .replace(/\(\s*\)/g, '')
      .trim();
    if (!target) target = entity;

    const rawDesc = rawLog.description || rawLog.details || '';
    const description = sanitizeDescription(rawDesc);
    const formattedChanges = formatChanges(rawLog.newValues);

    const ip = rawLog.ip || rawLog.requestMetadata?.ip || 'Direct Action';
    const mod = rawLog.module || rawLog.entity || 'General';
    const action = rawLog.action || 'system.event';

    return {
      id: rawLog._id || rawLog.id || Math.random().toString(36),
      user,
      userId,
      actorEmail,
      action,
      timestamp,
      target,
      entity,
      description,
      details: description || 'Action completed successfully.',
      formattedChanges,
      ip,
      module: mod,
    };
  });
});

const filteredLogs = computed(() => {
  return normalizedLogs.value.filter(log => {
    if (filters.value.module) {
      const selected = filters.value.module.toLowerCase();
      const logMod = String(log.module || '').toLowerCase();
      const logEntity = String(log.entity || '').toLowerCase();
      const selectedStem = selected.endsWith('s') ? selected.slice(0, -1) : selected;
      const modStem = logMod.endsWith('s') ? logMod.slice(0, -1) : logMod;
      const entityStem = logEntity.endsWith('s') ? logEntity.slice(0, -1) : logEntity;

      const matches =
        logMod === selected ||
        logEntity === selected ||
        modStem === selectedStem ||
        entityStem === selectedStem ||
        logMod.includes(selected) ||
        selected.includes(logMod) ||
        logEntity.includes(selected) ||
        selected.includes(logEntity);

      if (!matches) return false;
    }

    if (filters.value.user) {
      const searchUser = filters.value.user.trim().toLowerCase();
      const u = String(log.user || '').toLowerCase();
      const rawActor = String(log.actorEmail || '').toLowerCase();
      const d = String(log.description || '').toLowerCase();
      const uid = String(log.userId || '').toLowerCase();
      const matches =
        u.includes(searchUser) ||
        rawActor.includes(searchUser) ||
        (uid && uid === searchUser) ||
        d.includes(searchUser);
      if (!matches) {
        return false;
      }
    }

    if (filters.value.startDate) {
      const start = new Date(filters.value.startDate + 'T00:00:00').getTime();
      const logTime = new Date(log.timestamp).getTime();
      if (logTime < start) return false;
    }

    if (filters.value.endDate) {
      const end = new Date(filters.value.endDate + 'T23:59:59.999').getTime();
      const logTime = new Date(log.timestamp).getTime();
      if (logTime > end) return false;
    }

    return true;
  });
});

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / pageSize.value) || 1);

const paginatedLogs = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredLogs.value.slice(start, start + pageSize.value);
});

function resetFilters() {
  filters.value = {
    module: '',
    user: '',
    startDate: '',
    endDate: ''
  };
  selectedPreset.value = 'all';
  page.value = 1;
}

function formatDate(isoStr) {
  const date = new Date(isoStr);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getLogIndicatorClass(action) {
  const a = String(action || '').toLowerCase();
  if (a.includes('suspend') || a.includes('delete') || a.includes('fail')) {
    return 'bg-red-500 ring-red-100 dark:ring-red-950/40';
  }
  if (a.includes('create') || a.includes('add') || a.includes('invite') || a.includes('enroll')) {
    return 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-950/40';
  }
  if (a.includes('update') || a.includes('edit') || a.includes('change') || a.includes('stage')) {
    return 'bg-amber-500 ring-amber-100 dark:ring-amber-950/40';
  }
  return 'bg-blue-500 ring-blue-100 dark:ring-blue-950/40';
}
</script>
