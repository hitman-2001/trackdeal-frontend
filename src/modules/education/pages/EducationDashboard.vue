<template>
  <div class="workspace-page pb-16 w-full max-w-full min-w-0 overflow-x-hidden space-y-4 sm:space-y-6">
    <!-- Page Header (Clean & Uncluttered for Mobile & Desktop) -->
    <div class="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-neutral-800 w-full min-w-0">
      <div class="min-w-0 flex-1">
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 mb-1">
          <PhSparkle :size="11" weight="fill" />
          <span>Education CRM</span>
        </div>
        <h1 class="font-heading text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight truncate sm:whitespace-normal">
          Admissions Overview
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed hidden sm:block">
          Monitor your prospective inquiries, active counseling funnel, and scheduled parent follow-ups in real time.
        </p>
      </div>

      <!-- Action Buttons Row -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Quick Refresh Button -->
        <button
          type="button"
          @click="loadDashboard(true)"
          :disabled="refreshing"
          class="h-9 w-9 sm:w-auto sm:px-3 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200/80 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          title="Refresh dashboard data"
        >
          <PhArrowsClockwise :size="15" :class="{ 'animate-spin': refreshing }" class="shrink-0" />
          <span class="hidden sm:inline">Refresh</span>
        </button>

        <!-- All Leads Shortcut (Desktop) -->
        <router-link
          to="/app/leads"
          class="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200/80 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-neutral-700 text-xs font-semibold transition-all"
        >
          <PhUsersThree :size="15" class="shrink-0" />
          <span>All Leads</span>
        </router-link>

        <!-- Add Student Lead Primary Button -->
        <router-link
          to="/app/leads?action=create"
          class="h-9 px-3 sm:px-3.5 rounded-xl btn-primary text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
        >
          <PhPlus :size="14" weight="bold" class="shrink-0" />
          <span>Add Lead</span>
        </router-link>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-4 sm:space-y-6 w-full min-w-0">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 w-full min-w-0">
        <div v-for="i in 6" :key="i" class="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-4 animate-pulse h-24"></div>
      </div>
      <div class="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-5 animate-pulse h-72"></div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
        <div class="lg:col-span-2 bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-5 animate-pulse h-64"></div>
        <div class="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-5 animate-pulse h-64"></div>
      </div>
    </div>

    <template v-else>
      <!-- ═══════════════════════════════════════════════
           ROW 1: Dynamic KPI Metrics (Mobile-Optimized Bento Cards)
           ═══════════════════════════════════════════════ -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 w-full min-w-0">
        <!-- Total Leads -->
        <div
          class="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:border-blue-400/80 dark:hover:border-blue-500/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all active:scale-[0.98] flex flex-col justify-between group cursor-pointer min-w-0"
          @click="navigateToLeads()"
        >
          <div class="flex items-center justify-between gap-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">Total Leads</span>
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <PhUsersThree :size="16" weight="duotone" />
            </div>
          </div>
          <div class="mt-2 min-w-0">
            <div class="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
              {{ summary.totalLeads ?? 0 }}
            </div>
            <div class="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5 truncate">
              {{ summary.newLeadsToday ? `+${summary.newLeadsToday} new today` : 'In database' }}
            </div>
          </div>
        </div>

        <!-- Follow-Ups Due Today -->
        <div
          class="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:border-amber-400/80 dark:hover:border-amber-500/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all active:scale-[0.98] flex flex-col justify-between group cursor-pointer min-w-0"
          @click="setTabAndScroll('today')"
        >
          <div class="flex items-center justify-between gap-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">Due Today</span>
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <PhCalendarCheck :size="16" weight="duotone" />
            </div>
          </div>
          <div class="mt-2 min-w-0">
            <div class="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {{ todayCount }}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
              Scheduled today
            </div>
          </div>
        </div>

        <!-- Overdue Follow-Ups (Pulsing if > 0) -->
        <div
          class="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-neutral-900 border transition-all active:scale-[0.98] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between group cursor-pointer min-w-0"
          :class="overdueCount > 0 ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/20 dark:bg-rose-950/15' : 'border-slate-200/80 dark:border-neutral-800 hover:border-rose-400/80'"
          @click="setTabAndScroll('overdue')"
        >
          <div class="flex items-center justify-between gap-1">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="text-[10px] font-bold uppercase tracking-wider truncate" :class="overdueCount > 0 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'text-slate-400 dark:text-slate-500'">
                Overdue
              </span>
              <span v-if="overdueCount > 0" class="relative flex h-2 w-2 shrink-0">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </div>
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <PhWarning :size="16" weight="duotone" />
            </div>
          </div>
          <div class="mt-2 min-w-0">
            <div class="text-xl sm:text-2xl font-black tabular-nums" :class="overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'">
              {{ overdueCount }}
            </div>
            <div class="text-[10px] font-medium mt-0.5 truncate" :class="overdueCount > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-500 dark:text-slate-400'">
              {{ overdueCount > 0 ? 'Requires action' : 'All caught up' }}
            </div>
          </div>
        </div>

        <!-- Active Pipeline Inquiries -->
        <div
          class="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:border-indigo-400/80 dark:hover:border-indigo-500/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all active:scale-[0.98] flex flex-col justify-between group cursor-pointer min-w-0"
          @click="navigateToLeads('contacted')"
        >
          <div class="flex items-center justify-between gap-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">In Pipeline</span>
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <PhFunnel :size="16" weight="duotone" />
            </div>
          </div>
          <div class="mt-2 min-w-0">
            <div class="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
              {{ activePipelineCount }}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
              Counseling active
            </div>
          </div>
        </div>

        <!-- Enrolled Students -->
        <div
          class="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:border-emerald-400/80 dark:hover:border-emerald-500/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all active:scale-[0.98] flex flex-col justify-between group cursor-pointer min-w-0"
          @click="navigateToStudents()"
        >
          <div class="flex items-center justify-between gap-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">Enrolled</span>
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <PhGraduationCap :size="16" weight="duotone" />
            </div>
          </div>
          <div class="mt-2 min-w-0">
            <div class="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {{ (summary.enrolledLeads !== undefined ? summary.enrolledLeads : summary.totalStudents) || 0 }}
            </div>
            <div class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 truncate">
              {{ conversionPercentage }}% converted
            </div>
          </div>
        </div>

        <!-- Active Batches & Classes -->
        <div
          class="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:border-purple-400/80 dark:hover:border-purple-500/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all active:scale-[0.98] flex flex-col justify-between group cursor-pointer min-w-0"
          @click="navigateToClasses()"
        >
          <div class="flex items-center justify-between gap-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">Classes</span>
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <PhChalkboardTeacher :size="16" weight="duotone" />
            </div>
          </div>
          <div class="mt-2 min-w-0">
            <div class="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
              {{ summary.totalClasses ?? 0 }}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
              Batches running
            </div>
          </div>
        </div>
      </div>

      <!-- Actionable Smart Alerts Banner (Tap to Navigate) -->
      <div v-if="hasAlerts" class="flex flex-col sm:flex-row gap-2.5 w-full min-w-0">
        <div
          v-if="overdueCount > 0"
          @click="setTabAndScroll('overdue')"
          class="cursor-pointer flex items-center justify-between gap-2.5 px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-950/50 transition-all active:scale-[0.99] shadow-xs w-full sm:w-auto"
        >
          <div class="flex items-center gap-2 min-w-0">
            <PhWarningCircle :size="16" weight="bold" class="shrink-0 text-rose-600" />
            <span class="truncate">{{ overdueCount }} follow-up{{ overdueCount > 1 ? 's are' : ' is' }} overdue. Tap to resolve.</span>
          </div>
          <PhArrowRight :size="13" class="shrink-0" />
        </div>

        <div
          v-if="(summary.unassignedLeads || 0) > 0"
          @click="navigateToLeads('unassigned')"
          class="cursor-pointer flex items-center justify-between gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-100/60 dark:hover:bg-amber-950/50 transition-all active:scale-[0.99] shadow-xs w-full sm:w-auto"
        >
          <div class="flex items-center gap-2 min-w-0">
            <PhClock :size="16" weight="bold" class="shrink-0 text-amber-600" />
            <span class="truncate">{{ summary.unassignedLeads }} unassigned student lead{{ summary.unassignedLeads > 1 ? 's need' : ' needs' }} counselor allocation.</span>
          </div>
          <PhArrowRight :size="13" class="shrink-0" />
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════
           ROW 2: Scheduled Reminders & Follow-Ups (De-cluttered Action Center)
           ═══════════════════════════════════════════════ -->
      <div id="reminders-section" class="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-3.5 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-3 sm:space-y-3.5 w-full min-w-0">
        <!-- Section Header & Filter Tabs (Clean 1-Row / 2-Row Layout) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full min-w-0">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <PhBell :size="15" weight="duotone" />
            </div>
            <h2 class="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              Follow-Up Queue
            </h2>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300">
              {{ allFollowUps.length }}
            </span>
          </div>

          <!-- Interactive Filter Tabs (Compact Segmented Strip) -->
          <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-100/90 dark:bg-neutral-800/80 border border-slate-200/60 dark:border-neutral-700/60 overflow-x-auto scrollbar-none w-full sm:w-auto">
            <button
              type="button"
              @click="reminderFilter = 'all'"
              class="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap text-center active:scale-95"
              :class="reminderFilter === 'all' ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'"
            >
              All ({{ allFollowUps.length }})
            </button>

            <button
              type="button"
              @click="reminderFilter = 'overdue'"
              class="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap text-center active:scale-95 flex items-center justify-center gap-1"
              :class="reminderFilter === 'overdue' ? 'bg-white dark:bg-neutral-700 text-rose-600 dark:text-rose-400 shadow-xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-rose-600'"
            >
              <span v-if="overdueCount > 0" class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>Overdue ({{ overdueCount }})</span>
            </button>

            <button
              type="button"
              @click="reminderFilter = 'today'"
              class="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap text-center active:scale-95"
              :class="reminderFilter === 'today' ? 'bg-white dark:bg-neutral-700 text-amber-600 dark:text-amber-400 shadow-xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-amber-600'"
            >
              Today ({{ todayCount }})
            </button>

            <button
              type="button"
              @click="reminderFilter = 'upcoming'"
              class="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap text-center active:scale-95"
              :class="reminderFilter === 'upcoming' ? 'bg-white dark:bg-neutral-700 text-purple-600 dark:text-purple-400 shadow-xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-purple-600'"
            >
              Upcoming ({{ upcomingCount }})
            </button>
          </div>
        </div>

        <!-- Single Streamlined Search & Channel Filter Row -->
        <div class="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-neutral-800 w-full min-w-0">
          <div class="relative flex-1 min-w-0">
            <PhMagnifyingGlass :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              v-model="reminderSearch"
              type="text"
              placeholder="Search follow-ups..."
              class="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 rounded-xl pl-8 pr-7 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-primary transition-all"
            />
            <button
              v-if="reminderSearch"
              type="button"
              @click="reminderSearch = ''"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <PhXCircle :size="14" weight="fill" />
            </button>
          </div>

          <!-- Channel Dropdown Selector -->
          <div class="shrink-0">
            <select
              v-model="reminderTypeFilter"
              class="h-9 bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 rounded-xl px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 outline-none font-medium focus:border-primary cursor-pointer"
            >
              <option value="all">All Channels</option>
              <option value="call">Phone Calls</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="meeting">Counseling</option>
              <option value="note">General</option>
            </select>
          </div>
        </div>

        <!-- REMINDERS FEED (De-cluttered, Streamlined Card System) -->
        <div v-if="filteredFollowUps.length > 0" class="space-y-3 w-full min-w-0">
          <div
            v-for="fu in displayedFollowUps"
            :key="fu._id"
            class="group relative flex flex-col bg-slate-50/40 dark:bg-neutral-900/90 rounded-2xl border transition-all duration-150 hover:shadow-xs w-full min-w-0 p-3.5 space-y-2.5"
            :class="[
              fu.isOverdue
                ? 'border-l-4 border-l-rose-500 border-slate-200/80 dark:border-neutral-800 bg-rose-50/10 dark:bg-rose-950/10'
                : fu.isToday
                  ? 'border-l-4 border-l-amber-500 border-slate-200/80 dark:border-neutral-800 bg-amber-50/10 dark:bg-amber-950/10'
                  : 'border-l-4 border-l-blue-500 border-slate-200/80 dark:border-neutral-800'
            ]"
          >
            <!-- Card Header: Clean 1-Row Badges (Left) + Actions (Right) -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
                <!-- Channel Badge -->
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border shrink-0"
                  :class="getChannelMeta(fu.type).badgeClass"
                >
                  <component :is="getChannelMeta(fu.type).icon" :size="11" weight="bold" />
                  {{ getChannelMeta(fu.type).label }}
                </span>

                <!-- Due Date & Time Badge -->
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border shrink-0"
                  :class="getScheduleBadgeMeta(fu).class"
                >
                  <component :is="getScheduleBadgeMeta(fu).icon" :size="10" weight="bold" />
                  <span>{{ getScheduleBadgeMeta(fu).text }}</span>
                </span>
              </div>

              <!-- Quick Header Actions: Reschedule & Profile -->
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  @click="openReminder(fu)"
                  class="h-7 w-7 rounded-lg bg-white dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200/70 dark:border-neutral-700 flex items-center justify-center transition-colors active:scale-95"
                  title="Reschedule reminder"
                >
                  <PhCalendarCheck :size="13" weight="bold" />
                </button>
                <button
                  type="button"
                  @click="openDetails(fu.leadId)"
                  class="h-7 w-7 rounded-lg bg-white dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/70 dark:border-neutral-700 flex items-center justify-center transition-colors active:scale-95"
                  title="View student profile"
                >
                  <PhEye :size="13" weight="bold" />
                </button>
              </div>
            </div>

            <!-- Card Body: Student & Contact Details -->
            <div class="space-y-1.5">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      @click="openDetails(fu.leadId)"
                      class="font-heading font-bold text-base text-slate-900 dark:text-slate-100 hover:text-primary transition-colors text-left break-words"
                    >
                      {{ fu.studentName }}
                    </button>
                    <span
                      v-if="fu.className"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 shrink-0"
                    >
                      {{ fu.className }}
                    </span>
                    <span
                      v-if="fu.lead?.status"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-neutral-700 shrink-0"
                    >
                      {{ formatStageName(fu.lead.status) }}
                    </span>
                  </div>

                  <!-- Contact Row -->
                  <div class="flex items-center gap-2 mt-1 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                    <a
                      v-if="fu.contactNumber"
                      :href="'tel:' + fu.contactNumber"
                      class="inline-flex items-center gap-1 font-mono font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <PhPhone :size="12" weight="bold" />
                      <span>{{ fu.contactNumber }}</span>
                    </a>
                    <span v-if="fu.parentName" class="text-slate-400 dark:text-slate-500 text-[11px]">
                      · Parent: <span class="text-slate-700 dark:text-slate-300 font-medium">{{ fu.parentName }}</span>
                    </span>
                  </div>
                </div>

                <!-- Assigned Counselor Pill -->
                <div v-if="fu.assignedTo" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 text-[11px] shrink-0">
                  <span class="w-4 h-4 rounded-full bg-slate-200 dark:bg-neutral-700 flex items-center justify-center text-[8px] font-bold text-slate-700 dark:text-slate-200 uppercase">
                    {{ (fu.assignedTo.firstName || 'C').charAt(0) }}
                  </span>
                  <span class="font-medium truncate max-w-[80px]">{{ fu.assignedTo.firstName }}</span>
                </div>
              </div>

              <!-- Notes Snippet (if any) -->
              <div
                v-if="fu.notes"
                class="flex items-start gap-2 p-2 rounded-xl bg-white dark:bg-neutral-800/60 border border-slate-100 dark:border-neutral-800 text-[11px] text-slate-600 dark:text-slate-400 italic break-words"
              >
                <PhNotePencil :size="13" class="shrink-0 mt-0.5 text-slate-400" />
                <span class="line-clamp-2">{{ fu.notes }}</span>
              </div>
            </div>

            <!-- Standardized 4-Touch Action Row (No Truncation) -->
            <div class="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 dark:border-neutral-800" @click.stop>
              <!-- Call -->
              <a
                v-if="fu.contactNumber"
                :href="'tel:' + fu.contactNumber"
                class="h-9 rounded-xl bg-white dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 border border-slate-200/80 dark:border-neutral-700 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-[0.98]"
                title="Call directly"
              >
                <PhPhoneCall :size="14" weight="bold" class="text-emerald-600 dark:text-emerald-400" />
                <span>Call</span>
              </a>
              <div v-else class="h-9 rounded-xl bg-slate-100/50 dark:bg-neutral-800/40 text-slate-400 border border-slate-200/40 dark:border-neutral-800 flex items-center justify-center text-xs opacity-50">
                <PhPhone :size="14" />
              </div>

              <!-- WhatsApp / Chat -->
              <a
                v-if="fu.contactNumber"
                :href="getWhatsAppUrl(fu.contactNumber)"
                target="_blank"
                rel="noopener noreferrer"
                class="h-9 rounded-xl bg-white dark:bg-neutral-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 border border-slate-200/80 dark:border-neutral-700 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-[0.98]"
                title="Open WhatsApp chat"
              >
                <PhWhatsappLogo :size="15" weight="fill" class="text-teal-600 dark:text-teal-400" />
                <span class="hidden sm:inline">WhatsApp</span>
                <span class="sm:hidden">Chat</span>
              </a>
              <div v-else class="h-9 rounded-xl bg-slate-100/50 dark:bg-neutral-800/40 text-slate-400 border border-slate-200/40 dark:border-neutral-800 flex items-center justify-center text-xs opacity-50">
                <PhWhatsappLogo :size="15" />
              </div>

              <!-- Log Update -->
              <button
                type="button"
                @click="openLog(fu)"
                class="h-9 rounded-xl btn-primary flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
                title="Log conversation update"
              >
                <PhNotePencil :size="14" weight="bold" />
                <span>Log</span>
              </button>

              <!-- Mark Completed -->
              <button
                type="button"
                @click="markCompleted(fu)"
                :disabled="completingId === fu._id"
                class="h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/70 flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                title="Mark this reminder completed"
              >
                <PhCheckCircle :size="14" weight="fill" class="text-emerald-600 dark:text-emerald-400" />
                <span>Done</span>
              </button>
            </div>
          </div>

          <!-- Pagination / Limit Toggle Button (Avoid Infinite Mobile Scrolling) -->
          <div v-if="filteredFollowUps.length > 8" class="pt-2 text-center">
            <button
              type="button"
              @click="showAllReminders = !showAllReminders"
              class="h-9 px-4 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200/80 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-neutral-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>{{ showAllReminders ? 'Show Less' : `Show All ${filteredFollowUps.length} Reminders` }}</span>
              <PhArrowRight :size="12" :class="{ 'rotate-90': showAllReminders }" class="transition-transform" />
            </button>
          </div>
        </div>

        <!-- Clean Empty State -->
        <div
          v-else
          class="py-12 sm:py-14 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 flex flex-col items-center justify-center gap-3 w-full min-w-0"
        >
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <PhBell :size="24" weight="duotone" />
          </div>
          <div class="max-w-md space-y-1">
            <h3 class="font-bold text-sm text-slate-800 dark:text-slate-200">
              {{ reminderFilter === 'overdue' ? 'No overdue follow-ups!' : 'No follow-up reminders in this view' }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {{ reminderFilter === 'overdue' ? 'Great job! All counseling touchpoints are currently on schedule.' : 'Schedule reminders from student lead profiles to keep track of upcoming inquiries.' }}
            </p>
          </div>
          <div class="flex items-center gap-2 mt-2 flex-wrap justify-center">
            <button
              v-if="reminderFilter !== 'all'"
              type="button"
              @click="reminderFilter = 'all'"
              class="h-8 px-3 rounded-xl bg-slate-100 dark:bg-neutral-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-neutral-700 hover:bg-slate-200/80"
            >
              Show All Reminders
            </button>
            <router-link
              to="/app/leads"
              class="h-8 px-3 rounded-xl btn-primary text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
            >
              <PhUsersThree :size="14" />
              <span>Browse All Leads</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════
           ROW 3: Admission Progression Funnel & Performance Row
           ═══════════════════════════════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
        <!-- Stage Pipeline Funnel (Left 2 cols) -->
        <div class="lg:col-span-2 bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] w-full min-w-0">
          <!-- Funnel Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
            <div>
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <PhFunnel :size="15" weight="duotone" />
                </div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Admissions Pipeline</span>
              </div>
              <h3 class="font-heading text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
                Admission Progression Funnel
              </h3>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Tap any stage card to filter student inquiries directly.
              </p>
            </div>
            <div class="flex items-center gap-2 self-start sm:self-auto">
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 tabular-nums">
                {{ totalPipelineLeads }} total
              </span>
              <router-link
                to="/app/leads"
                class="h-8 px-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200/80 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-neutral-700 text-xs font-semibold inline-flex items-center gap-1 transition-all"
              >
                <span>View All</span>
                <PhArrowRight :size="12" />
              </router-link>
            </div>
          </div>

          <!-- Segmented Proportional Flow Stream -->
          <div class="space-y-1.5 p-3 rounded-xl bg-slate-50/80 dark:bg-neutral-800/40 border border-slate-200/60 dark:border-neutral-700/60 w-full min-w-0">
            <div class="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium gap-1">
              <span>Pipeline Stage Proportions</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300">
                {{ activePipelineCount }} active in counseling
              </span>
            </div>
            <!-- Continuous flow track -->
            <div class="h-2.5 w-full bg-slate-200/70 dark:bg-neutral-800 rounded-full overflow-hidden flex gap-0.5">
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
              <div v-else class="h-full w-full bg-slate-200/60 dark:bg-neutral-800 rounded-full"></div>
            </div>
          </div>

          <!-- 8-Stage Bento Grid (2 cols on mobile, 4 cols on tablet/desktop) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 w-full min-w-0">
            <div
              v-for="(stage, idx) in pipelineStages"
              :key="stage.key"
              @click="navigateToLeads(stage.key)"
              class="group relative p-3 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[96px] min-w-0 active:scale-95"
              :class="[
                stage.count > 0
                  ? 'bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 hover:border-primary/50 shadow-xs'
                  : 'bg-slate-50/40 dark:bg-neutral-900/30 border-slate-100 dark:border-neutral-800/80 hover:border-slate-300 dark:hover:border-neutral-700 opacity-80 hover:opacity-100'
              ]"
            >
              <!-- Card Top: Index + Status Dot -->
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono font-bold text-slate-400">
                  {{ String(idx + 1).padStart(2, '0') }}
                </span>
                <span
                  class="w-2 h-2 rounded-full transition-transform group-hover:scale-125 shrink-0"
                  :class="stage.count > 0 ? stage.barBg : 'bg-slate-300 dark:bg-neutral-700'"
                ></span>
              </div>

              <!-- Card Middle: Stage Label -->
              <div class="my-1.5 min-w-0">
                <p class="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors line-clamp-1 truncate">
                  {{ stage.label }}
                </p>
              </div>

              <!-- Card Bottom: Count & Percentage -->
              <div class="flex items-baseline justify-between pt-1 border-t border-slate-100 dark:border-neutral-800/60 gap-1 min-w-0">
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

        <!-- Right Column: Conversion Performance & Quick Navigation -->
        <div class="space-y-4 min-w-0 w-full">
          <!-- Conversion Performance Card -->
          <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4 w-full min-w-0">
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
              <div class="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 dark:border-neutral-800">
                <span class="text-slate-500 dark:text-slate-400 truncate">Calls Scheduled Today</span>
                <span class="font-bold text-slate-800 dark:text-slate-200 tabular-nums shrink-0">{{ summary.callsScheduled || 0 }}</span>
              </div>
              <div class="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 dark:border-neutral-800">
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
          <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-3 w-full min-w-0">
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">Workspace Actions</span>
            <div class="grid grid-cols-1 gap-2">
              <router-link
                to="/app/leads?action=create"
                class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/50 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200/60 dark:border-neutral-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all active:scale-[0.98]"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-primary flex items-center justify-center shrink-0">
                    <PhPlus :size="15" weight="bold" />
                  </div>
                  <span>Register New Inquiry</span>
                </div>
                <PhArrowRight :size="12" class="text-slate-400" />
              </router-link>

              <router-link
                to="/app/students"
                class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/50 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200/60 dark:border-neutral-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all active:scale-[0.98]"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <PhGraduationCap :size="15" weight="bold" />
                  </div>
                  <span>Enrolled Student Roster</span>
                </div>
                <PhArrowRight :size="12" class="text-slate-400" />
              </router-link>

              <router-link
                to="/app/classes"
                class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/50 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200/60 dark:border-neutral-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all active:scale-[0.98]"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <PhChalkboardTeacher :size="15" weight="bold" />
                  </div>
                  <span>Manage Batches & Classes</span>
                </div>
                <PhArrowRight :size="12" class="text-slate-400" />
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Student Details Drawer (Read-Only View) -->
    <EducationLeadDrawer
      :isOpen="isDetailsOpen"
      :leadId="activeLeadId"
      @close="isDetailsOpen = false"
    />

    <!-- Log Update / Conversation Drawer -->
    <EducationLeadLogDrawer
      :isOpen="isLogOpen"
      :leadId="activeLogLeadId"
      :lead="activeLogLead"
      @close="isLogOpen = false"
      @success="handleActionSuccess"
    />

    <!-- Follow-up Reminder Modal (Rescheduling / Reminder Update) -->
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
  PhXCircle,
} from '@phosphor-icons/vue';
import { fetchEducationSummary } from '../api/endpoints';
import { updateLeadFollowUp } from '@/modules/leads/api/endpoints';
import { getErrorMessage } from '@/utils/errorHandler';

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
const showAllReminders = ref(false);

// Reminder Filtering
const reminderFilter = ref('all'); // 'all' | 'overdue' | 'today' | 'upcoming'
const reminderSearch = ref('');
const reminderTypeFilter = ref('all'); // 'all' | 'call' | 'whatsapp' | 'meeting' | 'note'

const typeFilterOptions = [
  { value: 'all', label: 'All' },
  { value: 'call', label: 'Calls' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'meeting', label: 'Counseling' },
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

// Follow-Ups extraction with timezone-safe normalization & priority sorting
const allFollowUps = computed(() => {
  const items = summary.value.followUps || [];
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const mapped = items.map((f) => {
    const sched = f.scheduledAt ? new Date(f.scheduledAt) : null;
    const isOverdue = f.isOverdue !== undefined ? f.isOverdue : Boolean(sched && sched < now && f.status === 'scheduled');
    const isToday = f.isToday !== undefined ? f.isToday : Boolean(sched && sched >= startToday && sched <= endToday);
    const isUpcoming = f.isUpcoming !== undefined ? f.isUpcoming : Boolean(sched && sched > endToday);
    return {
      ...f,
      isOverdue,
      isToday,
      isUpcoming,
      _time: sched ? sched.getTime() : 0,
    };
  });

  // Sort by priority: Overdue first (oldest first), then Today (earliest first), then Upcoming
  return mapped.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    if (a.isToday && !b.isToday) return -1;
    if (!a.isToday && b.isToday) return 1;
    return a._time - b._time;
  });
});

const overdueCount = computed(() =>
  allFollowUps.value.filter((f) => f.isOverdue).length
);

const todayCount = computed(() =>
  allFollowUps.value.filter((f) => f.isToday).length
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
    list = list.filter((f) => f.isToday);
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

  // Search query filter
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

// Avoid infinite scroll on mobile devices by paginating/limiting view
const displayedFollowUps = computed(() => {
  if (showAllReminders.value || filteredFollowUps.value.length <= 8) {
    return filteredFollowUps.value;
  }
  return filteredFollowUps.value.slice(0, 8);
});

// Pipeline Stages & Funnel Breakdown
const pipelineStages = computed(() => {
  const stageCounts = summary.value.stageBreakdown || {};
  return [
    {
      key: 'new',
      label: 'New Inquiries',
      count: stageCounts.new || 0,
      color: 'from-slate-400 to-slate-500',
      barBg: 'bg-slate-400',
      badgeClass: 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300',
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

const hasAlerts = computed(() =>
  overdueCount.value > 0 ||
  (summary.value.unassignedLeads || 0) > 0 ||
  (summary.value.staleLeads || 0) > 0
);

// Channel & Timing Helpers
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

function getScheduleBadgeMeta(fu) {
  if (!fu.scheduledAt) {
    return {
      text: 'Scheduled',
      class: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-neutral-800 dark:text-slate-400',
      icon: PhClock,
    };
  }
  const d = new Date(fu.scheduledAt);
  const now = new Date();
  const timeStr = isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfTarget - startOfToday) / (1000 * 60 * 60 * 24));

  if (fu.isOverdue) {
    return {
      text: diffDays === 0 ? `Overdue (${timeStr})` : `Overdue ${Math.abs(diffDays)}d (${timeStr})`,
      class: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900 font-bold',
      icon: PhWarningCircle,
    };
  }

  if (fu.isToday) {
    return {
      text: `Today, ${timeStr}`,
      class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900 font-semibold',
      icon: PhClock,
    };
  }

  if (diffDays === 1) {
    return {
      text: `Tomorrow, ${timeStr}`,
      class: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900 font-semibold',
      icon: PhClock,
    };
  }

  return {
    text: `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`,
    class: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-neutral-800 dark:text-slate-300 dark:border-neutral-700 font-medium',
    icon: PhClock,
  };
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

// Interactive Operations & Modals
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
    title: 'Mark Reminder Completed?',
    text: `Mark follow-up for "${fu.studentName || 'this student'}" as completed?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, mark completed',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#059669',
    cancelButtonColor: '#64748b',
    customClass: {
      popup: 'dark:bg-neutral-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-neutral-800',
    },
  });

  if (!result.isConfirmed) return;

  completingId.value = fu._id;
  try {
    // Optimistic UI update: instantly remove from list
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
      text: getErrorMessage(err, 'Could not mark reminder as completed.'),
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

function setTabAndScroll(tab) {
  reminderFilter.value = tab;
  const el = document.getElementById('reminders-section');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
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
