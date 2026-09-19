<template>
  <div class="bg-surface border border-default rounded-xl p-6 shadow-sm space-y-6">
    <div class="flex items-center justify-between border-b border-default pb-4">
      <div>
        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">System Audit Logs</h3>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">Immutable chronological record of administrative actions, stage changes, status updates, and security events.</p>
      </div>
      <button
        @click="resetFilters"
        type="button"
        class="text-[11px] font-bold text-primary hover:underline"
      >
        Clear Filters
      </button>
    </div>

    <!-- Filters Panel -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-850/50 p-4 rounded-xl border border-default">
      <div>
        <label class="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">MODULE</label>
        <select
          v-model="filters.module"
          class="w-full bg-surface border border-default rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-100 cursor-pointer"
        >
          <option value="">All Modules</option>
          <option value="Education">Education</option>
          <option value="Leads">Leads & Inquiries</option>
          <option value="Users">Users & Staff</option>
          <option value="Roles">Roles & Access</option>
          <option value="Branches">Branches & Campuses</option>
          <option value="Integrations">Integrations</option>
          <option value="Platform">Platform & System</option>
        </select>
      </div>

      <div>
        <label class="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">ACTION</label>
        <input
          v-model="filters.action"
          type="text"
          placeholder="e.g. create, update, enroll..."
          class="w-full bg-surface border border-default rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-100"
        />
      </div>

      <div>
        <label class="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">ACTOR / STAFF</label>
        <input
          v-model="filters.user"
          type="text"
          placeholder="Search staff or admin..."
          class="w-full bg-surface border border-default rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-100"
        />
      </div>

      <div>
        <label class="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">DATE RANGE</label>
        <div class="flex items-center space-x-1">
          <input
            v-model="filters.startDate"
            type="date"
            class="w-1/2 bg-surface border border-default rounded-md px-1.5 py-1 text-[10px] outline-none focus:border-primary text-slate-800 dark:text-slate-100"
          />
          <span class="text-slate-400 text-xs">-</span>
          <input
            v-model="filters.endDate"
            type="date"
            class="w-1/2 bg-surface border border-default rounded-md px-1.5 py-1 text-[10px] outline-none focus:border-primary text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>
    </div>

    <!-- Timeline List -->
    <div v-if="filteredLogs.length === 0" class="text-center py-12 text-slate-400 text-xs">
      <p class="font-semibold">No audit logs found matching your criteria.</p>
      <p class="text-[11px] text-slate-400 mt-1">Actions performed across inquiries, classes, students, and staff will appear chronologically here.</p>
    </div>

    <div v-else class="relative border-l-2 border-slate-100 dark:border-slate-800 pl-4 ml-3 space-y-5">
      <div
        v-for="log in filteredLogs"
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
            <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-semibold">{{ log.action }}</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">{{ log.module }}</span>
          </div>
          <time class="text-[10px] text-slate-400 font-semibold shrink-0">{{ formatDate(log.timestamp) }}</time>
        </div>

        <div class="bg-slate-50 dark:bg-slate-850/40 border border-default rounded-lg p-3 space-y-1">
          <div class="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
            Target Entity: <strong class="text-slate-850 dark:text-slate-100">{{ log.target }}</strong>
          </div>
          <div class="text-[11px] text-slate-600 dark:text-slate-300">
            {{ log.description || log.details }}
          </div>
          <div v-if="log.changesText" class="text-[10px] text-slate-500 font-mono bg-white dark:bg-slate-900 p-2 rounded border border-default overflow-x-auto">
            {{ log.changesText }}
          </div>
          <div class="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>IP: <strong>{{ log.ip }}</strong></span>
            <span>Recorded: <strong>Immutable Write</strong></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  logs: { type: Array, required: true }
});

const filters = ref({
  module: '',
  action: '',
  user: '',
  startDate: '',
  endDate: ''
});

const normalizedLogs = computed(() => {
  return (props.logs || []).map((rawLog) => {
    const user = rawLog.user ||
      rawLog.userSnapshot?.name ||
      rawLog.userSnapshot?.email ||
      rawLog.userId?.name ||
      rawLog.userId?.email ||
      'Admin';

    const timestamp = rawLog.timestamp || rawLog.createdAt || new Date().toISOString();
    const entity = rawLog.entity || 'System';
    const entityId = rawLog.entityId ? String(rawLog.entityId).slice(-6) : '';
    const target = rawLog.target || (entityId ? `${entity} #${entityId}` : entity);

    const description = rawLog.description || rawLog.details || '';
    let changesText = '';
    if (rawLog.newValues && typeof rawLog.newValues === 'object' && Object.keys(rawLog.newValues).length > 0) {
      try {
        changesText = JSON.stringify(rawLog.newValues, null, 2);
      } catch (e) {
        changesText = '';
      }
    }

    const ip = rawLog.ip || rawLog.requestMetadata?.ip || 'Direct Action';
    const mod = rawLog.module || rawLog.entity || 'General';
    const action = rawLog.action || 'system.event';

    return {
      id: rawLog._id || rawLog.id || Math.random().toString(36),
      user,
      action,
      timestamp,
      target,
      description,
      details: description || 'Action completed successfully.',
      changesText,
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
      if (!logMod.includes(selected) && !selected.includes(logMod)) return false;
    }

    if (filters.value.action) {
      const searchAction = filters.value.action.toLowerCase();
      if (!String(log.action || '').toLowerCase().includes(searchAction)) return false;
    }

    if (filters.value.user) {
      const searchUser = filters.value.user.toLowerCase();
      if (!String(log.user || '').toLowerCase().includes(searchUser)) return false;
    }

    if (filters.value.startDate) {
      const start = new Date(filters.value.startDate).getTime();
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

function resetFilters() {
  filters.value = {
    module: '',
    action: '',
    user: '',
    startDate: '',
    endDate: ''
  };
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
