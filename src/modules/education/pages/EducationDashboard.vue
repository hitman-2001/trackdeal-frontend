<template>
  <div class="workspace-page pb-12 w-full max-w-full min-w-0 overflow-x-hidden">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80 w-full min-w-0">
      <div class="min-w-0 w-full sm:w-auto">
        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 mb-1.5">
          <PhSparkle :size="12" weight="fill" />
          <span>Education Workspace</span>
        </div>
        <h1 class="font-heading text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight break-words">
          Admissions & Counseling Overview
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Monitor your prospective inquiries, active counseling stages, and scheduled parent follow-ups in real time.
        </p>
      </div>
      <div class="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0 min-w-0">
        <!-- Refresh Button -->
        <button
          type="button"
          @click="loadDashboard(true)"
          :disabled="refreshing"
          class="btn btn-secondary btn-sm text-xs font-semibold gap-1.5 justify-center w-full sm:w-auto min-w-0"
          title="Refresh dashboard data"
        >
          <PhArrowsClockwise :size="14" :class="{ 'animate-spin': refreshing }" class="shrink-0" />
          <span class="truncate">Refresh</span>
        </button>

        <router-link
          to="/app/leads"
          class="btn btn-secondary btn-sm text-xs font-semibold gap-1.5 justify-center w-full sm:w-auto min-w-0"
        >
          <PhUsersThree :size="14" class="shrink-0" />
          <span class="truncate">All Leads</span>
        </router-link>

        <router-link
          to="/app/leads?action=create"
          class="btn btn-primary btn-sm text-xs font-semibold gap-1.5 shadow-sm hover:shadow col-span-2 sm:col-span-1 justify-center w-full sm:w-auto min-w-0"
        >
          <PhPlus :size="14" weight="bold" class="shrink-0" />
          <span class="truncate">Add Student Lead</span>
        </router-link>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-6 w-full min-w-0">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 w-full min-w-0">
        <div v-for="i in 6" :key="i" class="bg-surface border border-default rounded-xl sm:rounded-2xl p-4 sm:p-5 animate-pulse h-28"></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0">
        <div class="lg:col-span-2 bg-surface border border-default rounded-xl sm:rounded-2xl p-5 sm:p-6 animate-pulse h-80"></div>
        <div class="bg-surface border border-default rounded-xl sm:rounded-2xl p-5 sm:p-6 animate-pulse h-80"></div>
      </div>
    </div>

    <template v-else>
      <!-- Top Dynamic KPI Metrics (KokonutUI Glass Style) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 w-full min-w-0">
        <!-- Total Leads -->
        <div
          class="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-surface border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-400/60 dark:hover:border-blue-500/40 transition-all shadow-xs flex flex-col justify-between group cursor-pointer min-w-0"
          @click="navigateToLeads()"
        >
          <div class="flex items-center justify-between gap-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Total Leads</span>
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <PhUsersThree :size="15" weight="duotone" />
            </div>
          </div>
          <div class="mt-1.5 sm:mt-2 min-w-0">
            <div class="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
              {{ summary.totalLeads ?? 0 }}
            </div>
            <div class="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-0.5 truncate">
              {{ summary.newLeadsToday ? `+${summary.newLeadsToday} new today` : 'In database' }}
            </div>
          </div>
        </div>

        <!-- Follow-Ups Due Today -->
        <div
          class="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-surface border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-400/60 dark:hover:border-amber-500/40 transition-all shadow-xs flex flex-col justify-between group cursor-pointer min-w-0"
          @click="setTab('today')"
        >
          <div class="flex items-center justify-between gap-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Due Today</span>
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <PhCalendarCheck :size="15" weight="duotone" />
            </div>
          </div>
          <div class="mt-1.5 sm:mt-2 min-w-0">
            <div class="text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {{ todayCount }}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
              Scheduled for today
            </div>
          </div>
        </div>

        <!-- Overdue Follow-Ups (Pulsing if > 0) -->
        <div
          class="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-surface border transition-all shadow-xs flex flex-col justify-between group cursor-pointer min-w-0"
          :class="overdueCount > 0 ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10' : 'border-slate-200/80 dark:border-slate-800/80 hover:border-rose-400/60'"
          @click="setTab('overdue')"
        >
          <div class="flex items-center justify-between gap-1">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="text-[10px] font-bold uppercase tracking-wider truncate" :class="overdueCount > 0 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'text-slate-400'">
                Overdue
              </span>
              <span v-if="overdueCount > 0" class="relative flex h-2 w-2 shrink-0">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </div>
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <PhWarning :size="15" weight="duotone" />
            </div>
          </div>
          <div class="mt-1.5 sm:mt-2 min-w-0">
            <div class="text-lg sm:text-2xl font-black tabular-nums" :class="overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'">
              {{ overdueCount }}
            </div>
            <div class="text-[10px] font-medium mt-0.5 truncate" :class="overdueCount > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-500 dark:text-slate-400'">
              {{ overdueCount > 0 ? 'Requires action' : 'All caught up' }}
            </div>
          </div>
        </div>

        <!-- Active Pipeline Inquiries -->
        <div
          class="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-surface border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400/60 dark:hover:border-indigo-500/40 transition-all shadow-xs flex flex-col justify-between group cursor-pointer min-w-0"
          @click="navigateToLeads('contacted')"
        >
          <div class="flex items-center justify-between gap-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">In Pipeline</span>
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <PhFunnel :size="15" weight="duotone" />
            </div>
          </div>
          <div class="mt-1.5 sm:mt-2 min-w-0">
            <div class="text-lg sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
              {{ activePipelineCount }}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
              Contacted & Counseling
            </div>
          </div>
        </div>

        <!-- Enrolled Students -->
        <div
          class="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-surface border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-400/60 dark:hover:border-emerald-500/40 transition-all shadow-xs flex flex-col justify-between group cursor-pointer min-w-0"
          @click="navigateToStudents()"
        >
          <div class="flex items-center justify-between gap-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Enrolled</span>
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <PhGraduationCap :size="15" weight="duotone" />
            </div>
          </div>
          <div class="mt-1.5 sm:mt-2 min-w-0">
            <div class="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {{ (summary.enrolledLeads !== undefined ? summary.enrolledLeads : summary.totalStudents) || 0 }}
            </div>
            <div class="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 truncate">
              {{ conversionRateText }}
            </div>
          </div>
        </div>

        <!-- Active Classes -->
        <div
          class="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-surface border border-slate-200/80 dark:border-slate-800/80 hover:border-purple-400/60 dark:hover:border-purple-500/40 transition-all shadow-xs flex flex-col justify-between group cursor-pointer min-w-0"
          @click="navigateToClasses()"
        >
          <div class="flex items-center justify-between gap-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Classes</span>
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <PhChalkboardTeacher :size="15" weight="duotone" />
            </div>
          </div>
          <div class="mt-1.5 sm:mt-2 min-w-0">
            <div class="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
              {{ summary.totalClasses ?? 0 }}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
              Batches running
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts Banner (if any) -->
      <div v-if="hasAlerts" class="flex flex-col sm:flex-row gap-2 sm:gap-2.5 w-full min-w-0">
        <div
          v-if="overdueCount > 0"
          @click="setTab('overdue')"
          class="cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100/60 transition-colors shadow-xs w-full sm:w-auto"
        >
          <PhWarningCircle :size="16" weight="bold" class="shrink-0" />
          <span class="leading-tight">{{ overdueCount }} follow-up{{ overdueCount > 1 ? 's are' : ' is' }} overdue. Click to review.</span>
          <PhArrowRight :size="12" class="ml-auto sm:ml-1 shrink-0" />
        </div>
        <div
          v-if="(summary.unassignedLeads || 0) > 0"
          @click="navigateToLeads('unassigned')"
          class="cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-100/60 transition-colors shadow-xs w-full sm:w-auto"
        >
          <PhClock :size="16" weight="bold" class="shrink-0" />
          <span class="leading-tight">{{ summary.unassignedLeads }} unassigned student lead{{ summary.unassignedLeads > 1 ? 's need' : ' needs' }} counselor allocation.</span>
          <PhArrowRight :size="12" class="ml-auto sm:ml-1 shrink-0" />
        </div>
      </div>

      <!-- MAIN SECTION: Scheduled Reminders & Follow-Ups (KokonutUI Modern Card System) -->
      <div class="bg-surface border border-slate-200/80 dark:border-slate-800/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-6 shadow-xs space-y-4 w-full min-w-0">
        <!-- Section Header & Controls -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 w-full min-w-0">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <PhBell :size="18" weight="duotone" />
              </div>
              <h2 class="font-heading text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
                Scheduled Follow-Ups & Reminders
              </h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 shrink-0">
                {{ allFollowUps.length }} total
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Directly dial parents, initiate WhatsApp chats, log interaction notes, or reschedule counseling reminders.
            </p>
          </div>

          <!-- Interactive Filter Tabs (Skiper UI inspired pill tabs) -->
          <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 w-full lg:w-auto overflow-x-auto scrollbar-hide max-w-full">
            <button
              type="button"
              @click="reminderFilter = 'all'"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              :class="reminderFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
            >
              <span>All</span>
              <span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold" :class="reminderFilter === 'all' ? 'bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-200' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'">
                {{ allFollowUps.length }}
              </span>
            </button>

            <button
              type="button"
              @click="reminderFilter = 'overdue'"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              :class="reminderFilter === 'overdue' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-rose-600'"
            >
              <PhWarningCircle :size="13" weight="bold" />
              <span>Overdue</span>
              <span
                class="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
                :class="overdueCount > 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'"
              >
                {{ overdueCount }}
              </span>
            </button>

            <button
              type="button"
              @click="reminderFilter = 'today'"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              :class="reminderFilter === 'today' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-amber-600'"
            >
              <PhCalendarCheck :size="13" weight="bold" />
              <span>Due Today</span>
              <span
                class="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
                :class="todayCount > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'"
              >
                {{ todayCount }}
              </span>
            </button>

            <button
              type="button"
              @click="reminderFilter = 'upcoming'"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              :class="reminderFilter === 'upcoming' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-purple-600'"
            >
              <PhClock :size="13" weight="bold" />
              <span>Upcoming</span>
              <span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200/60 dark:bg-slate-800 text-slate-500">
                {{ upcomingCount }}
              </span>
            </button>
          </div>
        </div>

        <!-- Secondary Filters: Search & Channel Type -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1 border-t border-slate-100 dark:border-slate-800/60 w-full min-w-0">
          <!-- Search box -->
          <div class="relative w-full sm:w-72 min-w-0">
            <PhMagnifyingGlass :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              v-model="reminderSearch"
              type="text"
              placeholder="Search student, parent, phone..."
              class="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-primary transition-all"
            />
          </div>

          <!-- Channel Filter -->
          <div class="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1 sm:pb-0 w-full sm:w-auto max-w-full">
            <span class="text-[10px] font-bold uppercase text-slate-400 tracking-wider mr-1 shrink-0">Type:</span>
            <button
              v-for="t in typeFilterOptions"
              :key="t.value"
              type="button"
              @click="reminderTypeFilter = t.value"
              class="px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all whitespace-nowrap shrink-0"
              :class="reminderTypeFilter === t.value ? 'bg-primary/10 text-primary border-primary/30 font-bold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
            >
              {{ t.label }}
            </button>
          </div>
        </div>

        <!-- REMINDERS LIST -->
        <div v-if="filteredFollowUps.length > 0" class="space-y-2.5 w-full min-w-0">
          <div
            v-for="fu in filteredFollowUps"
            :key="fu._id"
            class="group relative flex flex-col gap-0 bg-white dark:bg-neutral-900 border rounded-xl overflow-hidden transition-all duration-150 hover:shadow-md w-full min-w-0"
            :class="fu.isOverdue ? 'border-l-[3px] border-l-rose-400 border-t-neutral-200 border-r-neutral-200 border-b-neutral-200 dark:border-l-rose-600 dark:border-t-neutral-800 dark:border-r-neutral-800 dark:border-b-neutral-800' : 'border-neutral-200 dark:border-neutral-800'"
          >
            <!-- Card Header Row -->
            <div class="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-3 sm:px-4 pt-3 pb-2.5 border-b border-neutral-100 dark:border-neutral-800 w-full min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap min-w-0">
                <!-- Channel Badge -->
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border shrink-0"
                  :class="getChannelMeta(fu.type).badgeClass"
                >
                  <component :is="getChannelMeta(fu.type).icon" :size="11" weight="bold" />
                  {{ getChannelMeta(fu.type).label }}
                </span>

                <!-- Status badge -->
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border shrink-0"
                  :class="getRelativeBadgeMeta(fu).class"
                >
                  <PhClock :size="10" weight="bold" />
                  {{ getRelativeBadgeMeta(fu).text }}
                </span>
              </div>

              <!-- Timestamp + View -->
              <div class="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
                <span class="text-[11px] text-neutral-400 tabular-nums font-mono">
                  {{ formatFollowUpDate(fu.scheduledAt) }}
                </span>
                <button
                  type="button"
                  @click="openDetails(fu.leadId)"
                  class="w-6 h-6 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="View full student profile"
                >
                  <PhEye :size="13" />
                </button>
              </div>
            </div>

            <!-- Card Body -->
            <div class="px-3 sm:px-4 py-3 space-y-2 w-full min-w-0">
              <!-- Student name + tags -->
              <div class="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  @click="openDetails(fu.leadId)"
                  class="font-heading font-bold text-sm text-neutral-900 dark:text-neutral-100 hover:text-primary transition-colors text-left"
                >
                  {{ fu.studentName }}
                </button>
                <span
                  v-if="fu.className"
                  class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40"
                >
                  {{ fu.className }}
                </span>
                <span
                  v-if="fu.lead?.status"
                  class="px-1.5 py-0.5 rounded text-[10px] font-medium capitalize bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                >
                  {{ formatStageName(fu.lead.status) }}
                </span>
                <!-- Counselor pill -->
                <div v-if="fu.assignedTo" class="ml-auto inline-flex items-center gap-1 text-[11px] text-neutral-400">
                  <span class="w-4 h-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[8px] font-bold text-neutral-600 dark:text-neutral-300 uppercase">
                    {{ (fu.assignedTo.firstName || 'C').charAt(0) }}
                  </span>
                  <span class="truncate max-w-[90px]">{{ fu.assignedTo.firstName }}</span>
                </div>
              </div>

              <!-- Parent & contact row -->
              <div class="flex items-center gap-3 text-xs text-neutral-500 flex-wrap">
                <span v-if="fu.parentName">
                  <span class="text-neutral-400 font-semibold uppercase text-[9px] mr-1">Parent</span>
                  <span class="font-medium text-neutral-700 dark:text-neutral-300">{{ fu.parentName }}</span>
                </span>
                <a
                  v-if="fu.contactNumber"
                  :href="'tel:' + fu.contactNumber"
                  class="font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
                >
                  <PhPhone :size="11" />
                  {{ fu.contactNumber }}
                </a>
              </div>

              <!-- Notes -->
              <div
                v-if="fu.notes"
                class="flex items-start gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 italic break-words"
              >
                <PhNotePencil :size="12" class="shrink-0 mt-0.5 text-neutral-400" />
                <span class="line-clamp-2">{{ fu.notes }}</span>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 w-full min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                <a
                  v-if="fu.contactNumber"
                  :href="'tel:' + fu.contactNumber"
                  class="action-btn action-btn--success"
                  title="Call directly"
                >
                  <PhPhoneCall :size="12" weight="bold" />
                  <span>Call</span>
                </a>
                <a
                  v-if="fu.contactNumber"
                  :href="getWhatsAppUrl(fu.contactNumber)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="action-btn action-btn--whatsapp"
                  title="Open WhatsApp"
                >
                  <PhWhatsappLogo :size="12" weight="bold" />
                  <span>WhatsApp</span>
                </a>
                <button
                  type="button"
                  @click="openLog(fu)"
                  class="action-btn action-btn--neutral"
                  title="Log interaction"
                >
                  <PhCheckCircle :size="12" weight="bold" class="text-blue-500" />
                  <span>Log Update</span>
                </button>
              </div>

              <div class="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end pt-1.5 sm:pt-0 border-t sm:border-t-0 border-neutral-200/60 dark:border-neutral-800">
                <button
                  type="button"
                  @click="markCompleted(fu)"
                  class="action-btn action-btn--complete"
                  title="Mark this reminder as completed"
                  :disabled="completingId === fu._id"
                >
                  <PhCheckCircle :size="12" weight="fill" class="text-emerald-600 dark:text-emerald-400" />
                  <span>{{ completingId === fu._id ? 'Completing...' : 'Mark Completed' }}</span>
                </button>

                <button
                  type="button"
                  @click="openReminder(fu)"
                  class="action-btn action-btn--ghost"
                  title="Reschedule this reminder"
                >
                  <PhCalendarCheck :size="12" />
                  <span>Reschedule</span>
                </button>
              </div>
            </div>
          </div>
        </div><!-- /space-y-2 (reminders list) -->

        <!-- Modern Empty State -->
        <div
          v-else
          class="py-10 sm:py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center gap-3 w-full min-w-0"
        >
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <PhBell :size="24" weight="duotone" />
          </div>
          <div class="max-w-md space-y-1">
            <h3 class="font-bold text-sm text-slate-800 dark:text-slate-200">
              {{ reminderFilter === 'overdue' ? 'No overdue follow-ups!' : 'No follow-up reminders in this view' }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {{ reminderFilter === 'overdue' ? 'Great job! All counseling touchpoints are on schedule.' : 'Schedule reminders from student lead profiles to keep track of upcoming inquiries.' }}
            </p>
          </div>
          <div class="flex items-center gap-2 mt-2 flex-wrap justify-center">
            <button
              v-if="reminderFilter !== 'all'"
              type="button"
              @click="reminderFilter = 'all'"
              class="btn btn-secondary btn-sm text-xs font-semibold"
            >
              Show All Reminders
            </button>
            <router-link to="/app/leads" class="btn btn-primary btn-sm text-xs font-semibold gap-1">
              <PhUsersThree :size="14" />
              <span>Browse All Leads</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Pipeline & Performance Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
        <!-- Stage Pipeline Funnel (Left 2 cols) -->
        <div class="lg:col-span-2 bg-surface border border-slate-200/80 dark:border-slate-800/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-6 space-y-4 shadow-xs w-full min-w-0">
          <!-- Funnel Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
            <div>
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <PhFunnel :size="15" weight="duotone" />
                </div>
                <span class="eyebrow">Admissions Pipeline</span>
              </div>
              <h3 class="font-heading text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                Admission Progression Funnel
              </h3>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Student counseling flow · Click any stage card to filter inquiries
              </p>
            </div>
            <div class="flex items-center gap-2 self-start sm:self-auto">
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 tabular-nums">
                {{ totalPipelineLeads }} total
              </span>
              <router-link
                to="/app/leads"
                class="btn btn-secondary btn-sm text-xs font-semibold gap-1"
              >
                <span>View All</span>
                <PhArrowRight :size="12" />
              </router-link>
            </div>
          </div>

          <!-- Segmented Proportional Flow Stream (Linear/KokonutUI style) -->
          <div class="space-y-1.5 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 w-full min-w-0">
            <div class="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium gap-1">
              <span>Pipeline Stage Proportions</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300">
                {{ activePipelineCount }} active in counseling
              </span>
            </div>
            <!-- Continuous flow track -->
            <div class="h-2 w-full bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
              <template v-if="totalPipelineLeads > 0">
                <div
                  v-for="stage in pipelineStages"
                  :key="'seg-' + stage.key"
                  v-show="stage.count > 0"
                  class="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                  :class="stage.barBg"
                  :style="{ width: getSegmentWidth(stage.count) }"
                  :title="`${stage.label}: ${stage.count} (${getStagePercent(stage.count)})`"
                ></div>
              </template>
              <div v-else class="h-full w-full bg-slate-200/60 dark:bg-slate-800 rounded-full"></div>
            </div>
          </div>

          <!-- 8-Stage Minimalist Bento Grid (4 cols on lg, 2 cols on mobile/tablet) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 w-full min-w-0">
            <div
              v-for="(stage, idx) in pipelineStages"
              :key="stage.key"
              @click="navigateToLeads(stage.key)"
              class="group relative p-3 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[96px] min-w-0"
              :class="[
                stage.count > 0
                  ? 'bg-surface border-slate-200 dark:border-slate-700 hover:border-primary/50 shadow-xs'
                  : 'bg-slate-50/40 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 opacity-80 hover:opacity-100'
              ]"
            >
              <!-- Card Top: Index + Status Dot -->
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono font-bold text-slate-400">
                  {{ String(idx + 1).padStart(2, '0') }}
                </span>
                <span
                  class="w-2 h-2 rounded-full transition-transform group-hover:scale-125 shrink-0"
                  :class="stage.count > 0 ? stage.barBg : 'bg-slate-300 dark:bg-slate-700'"
                ></span>
              </div>

              <!-- Card Middle: Stage Label -->
              <div class="my-1 min-w-0">
                <p class="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors line-clamp-1 truncate">
                  {{ stage.label }}
                </p>
              </div>

              <!-- Card Bottom: Count & Percentage -->
              <div class="flex items-baseline justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60 gap-1 min-w-0">
                <span
                  class="text-lg font-bold font-heading tabular-nums shrink-0"
                  :class="stage.count > 0 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'"
                >
                  {{ stage.count }}
                </span>
                <span class="text-[10px] font-mono text-slate-400 shrink-0">
                  {{ getStagePercent(stage.count) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Conversion & Quick Counts -->
        <div class="space-y-4 min-w-0 w-full">
          <!-- Conversion Performance Card -->
          <div class="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-surface border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4 w-full min-w-0">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Conversion Snapshot</span>
              <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                Active Cycle
              </span>
            </div>

            <div class="p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 space-y-1">
              <span class="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                Overall Lead-to-Student Rate
              </span>
              <div class="text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {{ conversionPercentage }}%
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                {{ (summary.enrolledLeads !== undefined ? summary.enrolledLeads : summary.totalStudents) || 0 }} enrolled out of {{ summary.totalLeads || 0 }} recorded inquiries
              </p>
            </div>

            <!-- Mini Indicators -->
            <div class="space-y-2 text-xs">
              <div class="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span class="text-slate-500 dark:text-slate-400 truncate">Calls Scheduled Today</span>
                <span class="font-bold text-slate-800 dark:text-slate-200 tabular-nums shrink-0">{{ summary.callsScheduled || 0 }}</span>
              </div>
              <div class="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span class="text-slate-500 dark:text-slate-400 truncate">Demo / Counseling Sessions</span>
                <span class="font-bold text-slate-800 dark:text-slate-200 tabular-nums shrink-0">{{ summary.meetingsToday || 0 }}</span>
              </div>
              <div class="flex items-center justify-between gap-2 py-1.5">
                <span class="text-slate-500 dark:text-slate-400 truncate">Pending Reminders</span>
                <span class="font-bold text-amber-600 dark:text-amber-400 tabular-nums shrink-0">{{ summary.pendingFollowUps || allFollowUps.length }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Navigation Card -->
          <div class="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-surface border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3 w-full min-w-0">
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">Workspace Actions</span>
            <div class="grid grid-cols-1 gap-2">
              <router-link
                to="/app/leads?action=create"
                class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <PhPlus :size="15" weight="bold" class="text-primary" />
                  <span>Register New Inquiry</span>
                </div>
                <PhArrowRight :size="12" class="text-slate-400" />
              </router-link>

              <router-link
                to="/app/students"
                class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <PhGraduationCap :size="15" weight="bold" class="text-emerald-500" />
                  <span>Enrolled Student Roster</span>
                </div>
                <PhArrowRight :size="12" class="text-slate-400" />
              </router-link>

              <router-link
                to="/app/classes"
                class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <PhChalkboardTeacher :size="15" weight="bold" class="text-purple-500" />
                  <span>Manage Batches & Classes</span>
                </div>
                <PhArrowRight :size="12" class="text-slate-400" />
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Student Details Drawer (Purely Read-Only View) -->
    <EducationLeadDrawer
      :isOpen="isDetailsOpen"
      :leadId="activeLeadId"
      @close="isDetailsOpen = false"
    />

    <!-- Log Update / Conversation Drawer (Strictly Logging Updates) -->
    <EducationLeadLogDrawer
      :isOpen="isLogOpen"
      :leadId="activeLogLeadId"
      :lead="activeLogLead"
      @close="isLogOpen = false"
      @success="handleActionSuccess"
    />

    <!-- Set Follow-up Reminder Modal (Strictly Rescheduling / Setting Reminder) -->
    <EducationLeadReminderModal
      :isOpen="isReminderOpen"
      :lead="activeReminderLead"
      @close="isReminderOpen = false"
      @success="handleActionSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import Swal from 'sweetalert2';
import {
  PhUsersThree,
  PhPlus,
  PhPhoneCall,
  PhPhone,
  PhWhatsappLogo,
  PhCalendarCheck,
  PhGraduationCap,
  PhChalkboardTeacher,
  PhWarning,
  PhWarningCircle,
  PhClock,
  PhArrowRight,
  PhSparkle,
  PhFunnel,
  PhBell,
  PhEye,
  PhCheckCircle,
  PhNotePencil,
  PhArrowsClockwise,
  PhMagnifyingGlass,
  PhCaretRight,
} from '@phosphor-icons/vue';
import { fetchEducationSummary } from '../api/endpoints';
import { updateLeadFollowUp } from '@/modules/leads/api/endpoints';

// Modals and Drawers
import EducationLeadDrawer from '../components/EducationLeadDrawer.vue';
import EducationLeadLogDrawer from '../components/EducationLeadLogDrawer.vue';
import EducationLeadReminderModal from '../components/EducationLeadReminderModal.vue';

const router = useRouter();
const store = useStore();

const loading = ref(true);
const refreshing = ref(false);
const completingId = ref(null);
const summary = ref({});

// Reminder Filtering
const reminderFilter = ref('all'); // 'all' | 'overdue' | 'today' | 'upcoming'
const reminderSearch = ref('');
const reminderTypeFilter = ref('all'); // 'all' | 'call' | 'whatsapp' | 'meeting' | 'note'

const typeFilterOptions = [
  { value: 'all', label: 'All' },
  { value: 'call', label: 'Calls' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'meeting', label: 'Meetings' },
  { value: 'note', label: 'General' },
];

// Interactive Modal / Drawer States
const activeLeadId = ref(null);
const isDetailsOpen = ref(false);

const activeLogLead = ref(null);
const activeLogLeadId = ref(null);
const isLogOpen = ref(false);

const activeReminderLead = ref(null);
const isReminderOpen = ref(false);

// Follow-Ups extraction
const allFollowUps = computed(() => summary.value.followUps || []);

const overdueCount = computed(() =>
  allFollowUps.value.filter((f) => f.isOverdue).length
);

const todayCount = computed(() =>
  allFollowUps.value.filter((f) => f.isToday && !f.isOverdue).length
);

const upcomingCount = computed(() =>
  allFollowUps.value.filter((f) => f.isUpcoming).length
);

const filteredFollowUps = computed(() => {
  let list = allFollowUps.value;

  // Filter tab
  if (reminderFilter.value === 'overdue') {
    list = list.filter((f) => f.isOverdue);
  } else if (reminderFilter.value === 'today') {
    list = list.filter((f) => f.isToday && !f.isOverdue);
  } else if (reminderFilter.value === 'upcoming') {
    list = list.filter((f) => f.isUpcoming);
  }

  // Type filter
  if (reminderTypeFilter.value !== 'all') {
    list = list.filter((f) => {
      const t = f.type || 'call';
      if (reminderTypeFilter.value === 'meeting') {
        return t === 'meeting' || t === 'visit' || t === 'site_visit';
      }
      return t === reminderTypeFilter.value;
    });
  }

  // Search filter
  if (reminderSearch.value.trim()) {
    const q = reminderSearch.value.toLowerCase().trim();
    list = list.filter((f) => {
      return (
        f.studentName?.toLowerCase().includes(q) ||
        f.parentName?.toLowerCase().includes(q) ||
        f.contactNumber?.includes(q) ||
        f.className?.toLowerCase().includes(q) ||
        f.notes?.toLowerCase().includes(q)
      );
    });
  }

  return list;
});

// Pipeline Stages & Funnel
const pipelineStages = computed(() => {
  const stageCounts = summary.value.stageBreakdown || {};
  return [
    {
      key: 'new',
      label: 'New Inquiries',
      count: stageCounts.new || 0,
      color: 'from-slate-400 to-slate-500',
      barBg: 'bg-slate-400',
      badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      key: 'assigned',
      label: 'Counselor Assigned',
      count: stageCounts.assigned || 0,
      color: 'from-blue-400 to-blue-600',
      barBg: 'bg-blue-500',
      badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    },
    {
      key: 'contacted',
      label: 'Contacted',
      count: stageCounts.contacted || 0,
      color: 'from-sky-400 to-cyan-600',
      barBg: 'bg-cyan-500',
      badgeClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
    },
    {
      key: 'follow_up',
      label: 'Active Follow-Up',
      count: stageCounts.follow_up || 0,
      color: 'from-amber-400 to-orange-500',
      barBg: 'bg-amber-500',
      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    },
    {
      key: 'meeting_scheduled',
      label: 'Counselling / Demo',
      count: stageCounts.meeting_scheduled || 0,
      color: 'from-violet-400 to-purple-600',
      barBg: 'bg-purple-500',
      badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    },
    {
      key: 'qualified',
      label: 'Qualified',
      count: stageCounts.qualified || 0,
      color: 'from-indigo-400 to-indigo-600',
      barBg: 'bg-indigo-500',
      badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
    },
    {
      key: 'application_trial',
      label: 'Application / Trial',
      count: stageCounts.application_trial || 0,
      color: 'from-teal-400 to-teal-600',
      barBg: 'bg-teal-500',
      badgeClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
    },
    {
      key: 'converted',
      label: 'Enrolled / Converted',
      count: stageCounts.converted || 0,
      color: 'from-emerald-400 to-emerald-600',
      barBg: 'bg-emerald-500',
      badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
  ];
});

const maxStageCount = computed(() =>
  Math.max(1, ...pipelineStages.value.map((s) => s.count))
);

const totalPipelineLeads = computed(() => {
  return pipelineStages.value.reduce((acc, s) => acc + (s.count || 0), 0);
});

function getSegmentWidth(count) {
  if (!totalPipelineLeads.value || !count) return '0%';
  return `${Math.max(4, Math.round((count / totalPipelineLeads.value) * 100))}%`;
}

function getStagePercent(count) {
  const total = summary.value.totalLeads || totalPipelineLeads.value || 0;
  if (!total || !count) return '0%';
  return `${Math.round((count / total) * 100)}%`;
}

const activePipelineCount = computed(() => {
  const b = summary.value.stageBreakdown || {};
  return (b.contacted || 0) + (b.follow_up || 0) + (b.meeting_scheduled || 0) + (b.qualified || 0);
});

const conversionPercentage = computed(() => {
  const total = summary.value.totalLeads || 0;
  const enrolled = summary.value.enrolledLeads !== undefined ? summary.value.enrolledLeads : (summary.value.totalStudents || 0);
  if (!total || !enrolled) return 0;
  return Math.min(100, Math.round((enrolled / total) * 100));
});

const conversionRateText = computed(() => {
  const total = summary.value.totalLeads || 0;
  const enrolled = summary.value.enrolledLeads !== undefined ? summary.value.enrolledLeads : (summary.value.totalStudents || 0);
  if (!total) return '0% conversion rate';
  const pct = Math.min(100, Math.round((enrolled / total) * 100));
  return `${pct}% conversion rate`;
});

const hasAlerts = computed(() =>
  overdueCount.value > 0 ||
  (summary.value.unassignedLeads || 0) > 0 ||
  (summary.value.staleLeads || 0) > 0
);

// Helpers for Reminders Cards
function getCardBorderClass(fu) {
  if (fu.isOverdue) {
    return 'border-rose-300/80 dark:border-rose-900/60 hover:border-rose-400 border-l-4 border-l-rose-500 bg-rose-50/15 dark:bg-rose-950/10';
  }
  if (fu.isToday) {
    return 'border-amber-300/80 dark:border-amber-900/60 hover:border-amber-400 border-l-4 border-l-amber-500 bg-amber-50/10 dark:bg-amber-950/10';
  }
  return 'border-slate-200/80 dark:border-slate-800/80 hover:border-primary/50 border-l-4 border-l-primary/60';
}

function getChannelMeta(type) {
  switch (type) {
    case 'call':
      return {
        label: 'Phone Call',
        icon: PhPhoneCall,
        badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      };
    case 'whatsapp':
      return {
        label: 'WhatsApp',
        icon: PhWhatsappLogo,
        badgeClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      };
    case 'meeting':
    case 'visit':
    case 'site_visit':
      return {
        label: 'Counseling',
        icon: PhChalkboardTeacher,
        badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      };
    default:
      return {
        label: 'Reminder',
        icon: PhClock,
        badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      };
  }
}

function getRelativeBadgeMeta(fu) {
  if (!fu.scheduledAt) {
    return { text: 'Scheduled', class: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400' };
  }
  const d = new Date(fu.scheduledAt);
  const now = new Date();
  const diffMs = d - now;
  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (fu.isOverdue) {
    if (Math.abs(diffHours) < 1) {
      return {
        text: `Overdue ${Math.max(1, Math.abs(diffMins))}m`,
        class: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900',
      };
    }
    if (Math.abs(diffDays) < 1) {
      return {
        text: `Overdue ${Math.abs(diffHours)}h`,
        class: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900',
      };
    }
    return {
      text: `Overdue ${Math.abs(diffDays)}d`,
      class: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900',
    };
  }

  if (fu.isToday) {
    if (diffHours >= 0 && diffHours <= 1) {
      return {
        text: `In ${Math.max(1, diffMins)}m`,
        class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900',
      };
    }
    if (diffHours > 1) {
      return {
        text: `Today in ${diffHours}h`,
        class: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900',
      };
    }
    return {
      text: 'Today',
      class: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900',
    };
  }

  if (diffDays === 1) {
    return {
      text: 'Tomorrow',
      class: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900',
    };
  }

  if (diffDays > 1) {
    return {
      text: `In ${diffDays} days`,
      class: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    };
  }

  return {
    text: 'Scheduled',
    class: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };
}

function formatFollowUpDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfTarget - startOfToday) / (1000 * 60 * 60 * 24));

  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Tomorrow, ${timeStr}`;
  if (diffDays === -1) return `Yesterday, ${timeStr}`;
  if (diffDays < -1) return `${Math.abs(diffDays)}d ago, ${timeStr}`;

  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
}

function getWhatsAppUrl(mobile) {
  if (!mobile) return '#';
  const clean = String(mobile).replace(/\D/g, '');
  if (!clean) return '#';
  const formatted = clean.length === 10 ? `91${clean}` : clean;
  return `https://wa.me/${formatted}`;
}

function formatStageName(status) {
  if (!status) return '—';
  return String(status).replace(/_/g, ' ');
}

// Interactive Actions
function openDetails(leadId) {
  if (!leadId) return;
  activeLeadId.value = String(leadId);
  isDetailsOpen.value = true;
}

function openLog(fu) {
  if (!fu) return;
  activeLogLead.value = fu.lead || {
    _id: fu.leadId,
    firstName: fu.studentName?.split(' ')[0] || 'Student',
    lastName: fu.studentName?.split(' ').slice(1).join(' ') || '',
    mobile: fu.studentMobile || fu.contactNumber,
    parentName: fu.parentName,
    parentMobile: fu.contactNumber,
  };
  activeLogLeadId.value = String(fu.leadId);
  isLogOpen.value = true;
}

function openReminder(fu) {
  if (!fu) return;
  activeReminderLead.value = {
    ...(fu.lead || {}),
    _id: fu.leadId,
    id: fu.leadId,
    firstName: fu.studentName?.split(' ')[0] || 'Student',
    lastName: fu.studentName?.split(' ').slice(1).join(' ') || '',
    mobile: fu.studentMobile || fu.contactNumber,
    parentName: fu.parentName,
    currentFollowUpId: fu._id,
    currentFollowUpDate: fu.scheduledAt,
    currentType: fu.type,
    currentNotes: fu.notes,
  };
  isReminderOpen.value = true;
}

async function markCompleted(fu) {
  if (!fu) return;

  const result = await Swal.fire({
    title: 'Mark Reminder as Completed?',
    text: `Mark follow-up for "${fu.studentName || 'this student'}" as completed? It will be removed from your pending reminders.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, mark completed',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#059669',
    cancelButtonColor: '#64748b',
    customClass: {
      popup: 'dark:bg-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800',
    },
  });

  if (!result.isConfirmed) return;

  completingId.value = fu._id;
  try {
    // Optimistic UI update: remove immediately so interaction feels instant
    if (summary.value && Array.isArray(summary.value.followUps)) {
      summary.value.followUps = summary.value.followUps.filter((item) => item._id !== fu._id);
    }

    await updateLeadFollowUp({
      leadId: fu.leadId,
      followUpId: fu._id,
      status: 'completed',
    });

    store.dispatch('notifications/triggerToast', {
      message: `Follow-up for ${fu.studentName || 'student'} marked completed.`,
      type: 'success',
    });

    await loadDashboard(true);
  } catch (err) {
    await loadDashboard(true);
    Swal.fire({
      icon: 'error',
      title: 'Action Failed',
      text: err.response?.data?.message || err.message || 'Could not mark reminder as completed.',
    });
  } finally {
    completingId.value = null;
  }
}

async function handleActionSuccess() {
  isLogOpen.value = false;
  isReminderOpen.value = false;
  await loadDashboard(true);
}

function setTab(tab) {
  reminderFilter.value = tab;
}

function navigateToLeads(status) {
  if (status) {
    router.push({ path: '/app/leads', query: { status } });
  } else {
    router.push('/app/leads');
  }
}

function navigateToStudents() {
  router.push('/app/students');
}

function navigateToClasses() {
  router.push('/app/classes');
}

async function loadDashboard(isRefresh = false) {
  if (isRefresh) {
    refreshing.value = true;
  } else {
    loading.value = true;
  }
  try {
    const res = await fetchEducationSummary();
    summary.value = res.data || res || {};
  } catch {
    summary.value = {};
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

onMounted(() => {
  loadDashboard();
});
</script>

<style scoped>
/* ── Action buttons on reminder cards ─────────────────────────── */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  transition: all 120ms ease;
  text-decoration: none;
  cursor: pointer;
}
.action-btn--success {
  background: hsl(var(--success-bg));
  color: hsl(var(--success-text));
  border: 1px solid hsl(var(--success-border));
}
.action-btn--success:hover { filter: brightness(0.95); }

.action-btn--whatsapp {
  background: hsl(152 63% 95%);
  color: hsl(142 71% 27%);
  border: 1px solid hsl(152 40% 82%);
}
.dark .action-btn--whatsapp {
  background: hsl(152 40% 10%);
  color: hsl(152 62% 68%);
  border-color: hsl(152 40% 20%);
}
.action-btn--whatsapp:hover { filter: brightness(0.95); }

.action-btn--complete {
  background: hsl(152 63% 95%);
  color: hsl(142 71% 27%);
  border: 1px solid hsl(152 40% 82%);
}
.dark .action-btn--complete {
  background: hsl(152 40% 12%);
  color: hsl(152 62% 68%);
  border-color: hsl(152 40% 24%);
}
.action-btn--complete:hover:not(:disabled) {
  background: hsl(152 63% 90%);
  border-color: hsl(152 40% 70%);
}
.action-btn--complete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn--neutral {
  background: hsl(var(--bg-elevated));
  color: hsl(var(--neutral-700));
  border: 1px solid hsl(var(--neutral-100));
}
.action-btn--neutral:hover { background: hsl(var(--neutral-50)); }

.action-btn--ghost {
  background: transparent;
  color: hsl(var(--neutral-500));
  border: 1px solid transparent;
}
.action-btn--ghost:hover {
  background: hsl(var(--bg-elevated));
  color: hsl(var(--neutral-900));
  border-color: hsl(var(--neutral-100));
}
</style>
