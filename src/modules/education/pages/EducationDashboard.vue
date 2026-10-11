<template>
  <div class="workspace-page pb-16 w-full max-w-full min-w-0 overflow-x-hidden space-y-4 sm:space-y-6">
    <!-- ═══════════════════════════════════════════════
         Header: Dynamic Title + View Switcher + Actions
         ═══════════════════════════════════════════════ -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-neutral-800 w-full min-w-0">
      <div class="min-w-0 flex-1">
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-neutral-700 mb-1">
          <PhSparkle :size="11" weight="bold" />
          <span>{{ isOrgAdmin ? (viewMode === 'team' ? 'Admin Command Center' : 'Personal Workspace') : 'Counselor Desk' }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="font-heading text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
            {{ viewMode === 'team' ? 'Admissions Overview & Team Activity' : 'My Follow-Ups & Inquiries' }}
          </h1>

          <!-- Admin Mode Switcher: Team Command Center vs My Desk -->
          <div
            v-if="isOrgAdmin"
            class="inline-flex p-0.5 sm:p-1 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200/70 dark:border-neutral-700 shrink-0"
          >
            <button
              type="button"
              @click="viewMode = 'team'"
              :class="viewMode === 'team' ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'"
              class="px-2.5 sm:px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PhUsersThree :size="14" weight="bold" />
              <span>Team Oversight</span>
            </button>
            <button
              type="button"
              @click="viewMode = 'desk'"
              :class="viewMode === 'desk' ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'"
              class="px-2.5 sm:px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PhCalendarCheck :size="14" weight="bold" />
              <span>My Desk</span>
            </button>
          </div>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed hidden sm:block">
          {{ viewMode === 'team'
            ? 'Monitor team productivity, counselor remarks on student leads, and overall institute admission progress.'
            : 'Focus on your personal counseling calls, scheduled parent follow-ups, and prospective student inquiries.'
          }}
        </p>
      </div>

      <!-- Action Buttons Row -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Quick Refresh Button -->
        <button
          type="button"
          @click="loadDashboard(true)"
          :disabled="refreshing"
          class="h-9 w-9 sm:w-auto sm:px-3 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200/80 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          title="Refresh dashboard data"
        >
          <PhArrowsClockwise :size="15" :class="{ 'animate-spin': refreshing }" class="shrink-0" />
          <span class="hidden sm:inline">Refresh</span>
        </button>

        <!-- All Leads Shortcut -->
        <router-link
          to="/app/leads"
          class="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200/80 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-neutral-700 text-xs font-semibold transition-all"
        >
          <PhUsersThree :size="15" class="shrink-0" />
          <span>All Inquiries</span>
        </router-link>

        <!-- Register Student Lead Primary Button -->
        <router-link
          v-if="canCreateLead"
          to="/app/leads?action=create"
          class="h-9 px-3 sm:px-3.5 rounded-xl btn-primary text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
        >
          <PhPlus :size="14" weight="bold" class="shrink-0" />
          <span>New Inquiry</span>
        </router-link>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-4 sm:space-y-6 w-full min-w-0">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full min-w-0">
        <div v-for="i in 4" :key="i" class="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-4 animate-pulse h-28"></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full min-w-0">
        <div class="lg:col-span-2 bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-5 animate-pulse h-80"></div>
        <div class="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-5 animate-pulse h-80"></div>
      </div>
    </div>

    <template v-else>
      <!-- ═══════════════════════════════════════════════
           ROW 1: Core Insightful KPIs (Plain Language)
           ═══════════════════════════════════════════════ -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 w-full min-w-0">
        <!-- 1. Total Inquiries -->
        <div
          class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 shadow-xs transition-all flex flex-col justify-between group cursor-pointer min-w-0"
          @click="navigateToLeads()"
        >
          <div class="flex items-center justify-between gap-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Total Inquiries</span>
            <div class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-neutral-700">
              <PhUsersThree :size="18" weight="bold" />
            </div>
          </div>
          <div class="mt-2 min-w-0">
            <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
              {{ summary.totalLeads ?? 0 }}
            </div>
            <div class="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-1 flex items-center gap-1 truncate">
              <span>{{ summary.newLeadsToday ? `+${summary.newLeadsToday} received today` : 'All student inquiries' }}</span>
            </div>
          </div>
        </div>

        <!-- 2. In Active Counseling / Pipeline -->
        <div
          class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 shadow-xs transition-all flex flex-col justify-between group cursor-pointer min-w-0"
          @click="navigateToLeads('counseling_scheduled')"
        >
          <div class="flex items-center justify-between gap-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">In Counseling</span>
            <div class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-neutral-700">
              <PhChalkboardTeacher :size="18" weight="bold" />
            </div>
          </div>
          <div class="mt-2 min-w-0">
            <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
              {{ activePipelineCount }}
            </div>
            <div class="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-1 flex items-center gap-1 truncate">
              <span>Calls, demos & trials in progress</span>
            </div>
          </div>
        </div>

        <!-- 3. Confirmed Admissions -->
        <div
          class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 shadow-xs transition-all flex flex-col justify-between group cursor-pointer min-w-0"
          @click="navigateToStudents()"
        >
          <div class="flex items-center justify-between gap-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Total Admitted</span>
            <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200/80 dark:border-emerald-800/60">
              <PhGraduationCap :size="18" weight="bold" />
            </div>
          </div>
          <div class="mt-2 min-w-0">
            <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
              {{ summary.enrolledLeads ?? summary.totalStudents ?? 0 }}
            </div>
            <div class="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1 truncate">
              <span>Confirmed student enrollments</span>
            </div>
          </div>
        </div>

        <!-- 4. Admission Success Rate -->
        <div
          class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 shadow-xs transition-all flex flex-col justify-between group min-w-0"
        >
          <div class="flex items-center justify-between gap-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Enrollment Rate</span>
            <div class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-neutral-700">
              <PhTrendUp :size="18" weight="bold" />
            </div>
          </div>
          <div class="mt-2 min-w-0">
            <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
              {{ conversionPercentage }}%
            </div>
            <div class="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-1 flex items-center gap-1 truncate">
              <span>Inquiry-to-student ratio</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════
           ROW 2: Action Required Banners (Admin Attention)
           ═══════════════════════════════════════════════ -->
      <div v-if="hasAlerts" class="space-y-2.5 w-full min-w-0">
        <!-- Unassigned Leads Banner (Admin Only) -->
        <div
          v-if="(summary.unassignedLeads || 0) > 0 && isOrgAdmin"
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 sm:p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200/90 dark:border-rose-800/60 text-rose-900 dark:text-rose-200"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
              <PhWarningCircle :size="18" weight="bold" />
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-bold truncate">
                {{ summary.unassignedLeads }} New Student Inquiries Need a Counselor
              </p>
              <p class="text-[11px] text-rose-700 dark:text-rose-300/80 hidden sm:block">
                Assign these inquiries to your counselors so they can initiate contact promptly.
              </p>
            </div>
          </div>
          <router-link
            to="/app/leads?filter=unassigned"
            class="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 text-center shadow-xs transition-colors"
          >
            Assign Inquiries &rarr;
          </router-link>
        </div>

        <!-- Overdue Follow-ups Banner -->
        <div
          v-if="overdueCount > 0"
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/60 text-amber-900 dark:text-amber-200"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <PhClock :size="18" weight="bold" />
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-bold truncate">
                {{ overdueCount }} Scheduled Follow-Ups Are Overdue
              </p>
              <p class="text-[11px] text-amber-800 dark:text-amber-300/80 hidden sm:block">
                {{ isOrgAdmin ? 'Some counselors have pending follow-ups past their scheduled time.' : 'You have follow-ups that require your immediate attention.' }}
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="isOrgAdmin && viewMode === 'team' ? (viewMode = 'desk', setTabAndScroll('overdue')) : setTabAndScroll('overdue')"
            class="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 shadow-xs transition-colors cursor-pointer"
          >
            Review Overdue &rarr;
          </button>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════
           ADMIN VIEW: Team Oversight & Live Activity
           ═══════════════════════════════════════════════ -->
      <template v-if="isOrgAdmin && viewMode === 'team'">
        <!-- Today's Team Activity Pulse -->
        <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-xs">
          <div class="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs border border-slate-200/70 dark:border-neutral-700">
                <PhPulse :size="15" weight="bold" />
              </div>
              <h2 class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Today's Team Action Pulse
              </h2>
            </div>
            <span class="text-[11px] text-slate-500 font-medium">Recorded activity today</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div class="p-3 rounded-xl bg-slate-50/80 dark:bg-neutral-800/60 border border-slate-200/70 dark:border-neutral-700/80 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-white dark:bg-neutral-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-neutral-600 flex items-center justify-center shrink-0">
                <PhPhoneCall :size="16" weight="bold" />
              </div>
              <div class="min-w-0">
                <div class="text-lg font-black text-slate-900 dark:text-slate-100 tabular-nums">
                  {{ teamActivity.todayStats?.callsMade ?? 0 }}
                </div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">Calls Logged</div>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-slate-50/80 dark:bg-neutral-800/60 border border-slate-200/70 dark:border-neutral-700/80 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-white dark:bg-neutral-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-neutral-600 flex items-center justify-center shrink-0">
                <PhWhatsappLogo :size="16" weight="bold" />
              </div>
              <div class="min-w-0">
                <div class="text-lg font-black text-slate-900 dark:text-slate-100 tabular-nums">
                  {{ teamActivity.todayStats?.whatsappSent ?? 0 }}
                </div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">WhatsApp Chats</div>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-slate-50/80 dark:bg-neutral-800/60 border border-slate-200/70 dark:border-neutral-700/80 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-white dark:bg-neutral-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-neutral-600 flex items-center justify-center shrink-0">
                <PhChatCircleDots :size="16" weight="bold" />
              </div>
              <div class="min-w-0">
                <div class="text-lg font-black text-slate-900 dark:text-slate-100 tabular-nums">
                  {{ teamActivity.todayStats?.notesLogged ?? 0 }}
                </div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">Notes & Remarks</div>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-slate-50/80 dark:bg-neutral-800/60 border border-slate-200/70 dark:border-neutral-700/80 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
                <PhGraduationCap :size="16" weight="bold" />
              </div>
              <div class="min-w-0">
                <div class="text-lg font-black text-slate-900 dark:text-slate-100 tabular-nums">
                  {{ teamActivity.todayStats?.enrolledToday ?? 0 }}
                </div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">Admitted Today</div>
              </div>
            </div>
          </div>
        </div>

        <!-- TWO COLUMNS: Team Leaderboard & Live Team Activity Stream -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 w-full min-w-0">
          <!-- LEFT (7 cols): Counselor Scorecard & Accountability -->
          <div class="lg:col-span-7 bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-neutral-800">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200/60 dark:border-neutral-700">
                    <PhTrophy :size="16" weight="bold" />
                  </div>
                  <div>
                    <h2 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      Admissions Team Scorecard
                    </h2>
                    <p class="text-[11px] text-slate-500">Student inquiry distribution & conversion per staff</p>
                  </div>
                </div>
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {{ teamMembersList.length }} Staff
                </span>
              </div>

              <!-- Counselor List Table -->
              <div v-if="teamMembersList.length > 0" class="overflow-x-auto -mx-4 sm:mx-0">
                <table class="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-neutral-800">
                      <th class="pb-2.5 pl-4 sm:pl-0 font-bold">Counselor</th>
                      <th class="pb-2.5 text-center font-bold">Assigned</th>
                      <th class="pb-2.5 text-center font-bold">Contacted</th>
                      <th class="pb-2.5 text-center font-bold">Counseling</th>
                      <th class="pb-2.5 text-center font-bold">Enrolled</th>
                      <th class="pb-2.5 pr-4 sm:pr-0 text-right font-bold">Success %</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-neutral-800">
                    <tr
                      v-for="member in teamMembersList"
                      :key="member.userId"
                      class="hover:bg-slate-50/70 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer group"
                      @click="navigateToStaffLeads(member.userId)"
                      title="Click to view inquiries assigned to this counselor"
                    >
                      <!-- Staff Info -->
                      <td class="py-3 pl-4 sm:pl-0">
                        <div class="flex items-center gap-2.5">
                          <div class="w-7 h-7 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-200 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-neutral-700">
                            {{ getInitials(member.name) }}
                          </div>
                          <div class="min-w-0">
                            <p class="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {{ member.name }}
                            </p>
                            <p class="text-[10px] text-slate-500 truncate">{{ member.designation || 'Admissions Counselor' }}</p>
                          </div>
                        </div>
                      </td>

                      <!-- Assigned -->
                      <td class="py-3 text-center tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                        {{ member.assigned }}
                      </td>

                      <!-- Contacted -->
                      <td class="py-3 text-center tabular-nums text-slate-600 dark:text-slate-400">
                        {{ member.contacted }}
                      </td>

                      <!-- In Counseling -->
                      <td class="py-3 text-center tabular-nums text-slate-700 dark:text-slate-300 font-medium">
                        {{ member.inCounseling }}
                      </td>

                      <!-- Enrolled -->
                      <td class="py-3 text-center">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                          {{ member.enrolled }}
                        </span>
                      </td>

                      <!-- Conversion % -->
                      <td class="py-3 pr-4 sm:pr-0 text-right">
                        <div class="inline-flex flex-col items-end gap-1">
                          <span class="font-bold text-[11px] tabular-nums text-slate-800 dark:text-slate-200">
                            {{ member.conversionRate }}%
                          </span>
                          <div class="w-14 h-1.5 rounded-full bg-slate-100 dark:bg-neutral-800 overflow-hidden">
                            <div
                              class="h-full rounded-full transition-all bg-slate-700 dark:bg-slate-300"
                              :style="{ width: `${Math.min(100, member.conversionRate)}%` }"
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Empty State -->
              <div v-else class="text-center py-10 px-4">
                <PhUsersThree :size="32" class="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p class="text-xs font-semibold text-slate-600 dark:text-slate-300">No counselor metrics recorded yet</p>
                <p class="text-[11px] text-slate-400 mt-0.5">When staff members are assigned student inquiries, their progress will display here.</p>
              </div>
            </div>

            <div class="pt-3 mt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-[11px]">
              <span class="text-slate-500">Click any staff row to view their inquiries</span>
              <router-link to="/app/leads" class="font-semibold text-slate-700 dark:text-slate-300 hover:underline">
                View All Inquiries &rarr;
              </router-link>
            </div>
          </div>

          <!-- RIGHT (5 cols): Live Team Activity & Remarks Stream -->
          <div class="lg:col-span-5 bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <!-- Stream Header & Tabs -->
              <div class="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-neutral-800">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200/60 dark:border-neutral-700">
                    <PhPulse :size="16" weight="bold" />
                  </div>
                  <h2 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    Live Team Activity
                  </h2>
                </div>

                <!-- Feed Sub-Tabs -->
                <div class="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-neutral-800 text-[11px]">
                  <button
                    type="button"
                    @click="activeActivityTab = 'activities'"
                    :class="activeActivityTab === 'activities' ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
                    class="px-2 py-1 rounded-md transition-all cursor-pointer"
                  >
                    Actions ({{ teamActivitiesList.length }})
                  </button>
                  <button
                    type="button"
                    @click="activeActivityTab = 'notes'"
                    :class="activeActivityTab === 'notes' ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
                    class="px-2 py-1 rounded-md transition-all cursor-pointer"
                  >
                    Remarks ({{ teamNotesList.length }})
                  </button>
                </div>
              </div>

              <!-- Tab 1: Staff Action Feed (Calls, WhatsApp, Meetings, Stage updates) -->
              <div v-if="activeActivityTab === 'activities'" class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                <div
                  v-for="act in teamActivitiesList"
                  :key="act._id"
                  class="p-3 rounded-xl bg-slate-50/70 dark:bg-neutral-800/40 border border-slate-200/60 dark:border-neutral-700/60 hover:border-slate-300 dark:hover:border-neutral-600 transition-all text-xs"
                >
                  <div class="flex items-start justify-between gap-2">
                    <!-- Staff member & Student -->
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="w-6 h-6 rounded-full bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {{ getInitials(act.performedBy?.firstName || act.performedBy?.email || 'Staff') }}
                      </span>
                      <div class="min-w-0">
                        <span class="font-bold text-slate-800 dark:text-slate-200">
                          {{ act.performedBy?.firstName ? `${act.performedBy.firstName} ${act.performedBy.lastName || ''}` : 'Staff Member' }}
                        </span>
                        <span class="text-slate-400 mx-1">&middot;</span>
                        <button
                          type="button"
                          @click="openLeadDetails(act.leadId?._id || act.leadId)"
                          class="font-semibold text-slate-700 dark:text-slate-300 hover:underline truncate cursor-pointer"
                        >
                          {{ act.leadId?.firstName ? `${act.leadId.firstName} ${act.leadId.lastName || ''}` : 'Student Inquiry' }}
                        </button>
                      </div>
                    </div>

                    <!-- Time & Activity Badge -->
                    <span class="text-[10px] text-slate-400 shrink-0 tabular-nums">
                      {{ formatTimeAgo(act.activityDate || act.createdAt) }}
                    </span>
                  </div>

                  <!-- Activity Description / Remarks -->
                  <div class="mt-2 flex items-center gap-2">
                    <span
                      class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border shrink-0 bg-slate-100 dark:bg-neutral-700 text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-neutral-600"
                    >
                      <component :is="getActivityIcon(act.type)" :size="11" weight="bold" />
                      <span class="capitalize">{{ formatActivityType(act.type) }}</span>
                    </span>
                    <p class="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                      {{ act.summary || act.description || 'Conversation logged with student/parent' }}
                    </p>
                  </div>
                </div>

                <div v-if="teamActivitiesList.length === 0" class="text-center py-8">
                  <p class="text-xs text-slate-400 font-medium">No actions logged yet today</p>
                </div>
              </div>

              <!-- Tab 2: Counselor Remarks & Comments on Leads -->
              <div v-else class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                <div
                  v-for="note in teamNotesList"
                  :key="note._id"
                  class="p-3 rounded-xl bg-slate-50/70 dark:bg-neutral-800/40 border border-slate-200/60 dark:border-neutral-700/60 hover:border-slate-300 dark:hover:border-neutral-600 transition-all text-xs"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="w-6 h-6 rounded-full bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {{ getInitials(note.createdBy?.firstName || note.createdBy?.email || 'User') }}
                      </span>
                      <div class="min-w-0">
                        <span class="font-bold text-slate-800 dark:text-slate-200">
                          {{ note.createdBy?.firstName ? `${note.createdBy.firstName} ${note.createdBy.lastName || ''}` : 'Counselor' }}
                        </span>
                        <span class="text-slate-400 mx-1">commented on</span>
                        <button
                          type="button"
                          @click="openLeadDetails(note.leadId?._id || note.leadId)"
                          class="font-semibold text-slate-700 dark:text-slate-300 hover:underline truncate cursor-pointer"
                        >
                          {{ note.leadId?.firstName ? `${note.leadId.firstName} ${note.leadId.lastName || ''}` : 'Student' }}
                        </button>
                      </div>
                    </div>
                    <span class="text-[10px] text-slate-400 shrink-0 tabular-nums">
                      {{ formatTimeAgo(note.createdAt) }}
                    </span>
                  </div>

                  <p class="text-[11px] text-slate-700 dark:text-slate-300 mt-2 p-2 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800 italic">
                    "{{ note.content }}"
                  </p>
                </div>

                <div v-if="teamNotesList.length === 0" class="text-center py-8">
                  <p class="text-xs text-slate-400 font-medium">No remarks written yet</p>
                </div>
              </div>
            </div>

            <div class="pt-3 mt-2 border-t border-slate-100 dark:border-neutral-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Updated automatically</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300">Staff comments recorded</span>
            </div>
          </div>
        </div>

        <!-- ROW: Where Inquiries Come From (Lead Sources) + Simple Funnel -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 w-full min-w-0">
          <!-- Lead Sources Distribution (5 cols) -->
          <div class="lg:col-span-5 bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div class="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-neutral-800">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200/60 dark:border-neutral-700">
                  <PhGlobe :size="16" weight="bold" />
                </div>
                <div>
                  <h2 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    Where Do Inquiries Come From?
                  </h2>
                  <p class="text-[11px] text-slate-500">Student inquiry channels</p>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div
                v-for="source in leadSourcesList"
                :key="source.label"
                class="space-y-1"
              >
                <div class="flex items-center justify-between text-xs">
                  <span class="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: source.color || '#475569' }"></span>
                    {{ source.label }}
                  </span>
                  <span class="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {{ source.value }} <span class="text-slate-400 font-normal">({{ source.percent }}%)</span>
                  </span>
                </div>
                <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :style="{ width: `${Math.min(100, source.percent || 0)}%`, backgroundColor: source.color || '#475569' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Simplified 5-Stage Admission Funnel (7 cols) -->
          <div class="lg:col-span-7 bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div class="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-neutral-800">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200/60 dark:border-neutral-700">
                  <PhFunnel :size="16" weight="bold" />
                </div>
                <div>
                  <h2 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    Student Admission Funnel
                  </h2>
                  <p class="text-[11px] text-slate-500">Inquiry conversion progression stages</p>
                </div>
              </div>
              <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {{ conversionPercentage }}% Conversion
              </span>
            </div>

            <!-- Funnel Stage Progression Cards with Clean Phosphor Icons (No Emojis) -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              <div
                v-for="stage in simplifiedFunnelStages"
                :key="stage.key"
                class="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/70 dark:border-neutral-700/80 text-center flex flex-col justify-between cursor-pointer hover:border-slate-300 dark:hover:border-neutral-600 transition-all group"
                @click="navigateToLeads(stage.key)"
              >
                <div>
                  <div class="w-8 h-8 rounded-xl bg-white dark:bg-neutral-700 border border-slate-200/60 dark:border-neutral-600 text-slate-700 dark:text-slate-200 mx-auto flex items-center justify-center group-hover:scale-105 transition-transform">
                    <component :is="stage.icon" :size="16" weight="bold" />
                  </div>
                  <div class="text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-2 truncate">
                    {{ stage.label }}
                  </div>
                </div>
                <div class="mt-2 pt-2 border-t border-slate-200/50 dark:border-neutral-700/50">
                  <div class="text-base font-black text-slate-900 dark:text-slate-100 tabular-nums">
                    {{ stage.count }}
                  </div>
                  <div class="text-[10px] text-slate-400 font-medium mt-0.5">
                    {{ stage.percent }}% of total
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════════
           STAFF VIEW: My Personal Follow-Ups & Inquiries Desk
           ═══════════════════════════════════════════════ -->
      <template v-else>
        <!-- Clean Professional Workspace Banner for Counselor (No Gradient / No Emojis) -->
        <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200/70 dark:border-neutral-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
              <PhUserCheck :size="20" weight="bold" />
            </div>
            <div>
              <h2 class="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Counselor Workspace &mdash; {{ currentUserName }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                You have <span class="font-semibold text-slate-800 dark:text-slate-200">{{ todayCount }} follow-ups scheduled today</span>
                <span v-if="overdueCount > 0"> &middot; <span class="font-semibold text-rose-600 dark:text-rose-400">{{ overdueCount }} overdue</span></span>.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="setTabAndScroll('today')"
              class="h-9 px-3.5 rounded-xl btn-primary text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PhPhoneCall :size="14" weight="bold" />
              <span>Start Today's Tasks</span>
            </button>
          </div>
        </div>

        <!-- Follow-Ups Section Header & Filter Strip -->
        <div id="reminders-section" class="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <!-- Row 1: Section Title + Timeframe Tabs -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-neutral-800">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-neutral-700 flex items-center justify-center shrink-0">
                <PhCalendarCheck :size="18" weight="bold" />
              </div>
              <div>
                <h2 class="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  Scheduled Follow-Ups & Tasks
                </h2>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Calls, WhatsApp reminders & counseling appointments</p>
              </div>
            </div>

            <!-- Timeframe Filter Tabs -->
            <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200/70 dark:border-neutral-700 shrink-0 overflow-x-auto max-w-full">
              <button
                type="button"
                @click="reminderFilter = 'today'"
                :class="reminderFilter === 'today' ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'"
                class="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer"
              >
                <span>Today</span>
                <span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-200">
                  {{ todayCount }}
                </span>
              </button>

              <button
                type="button"
                @click="reminderFilter = 'overdue'"
                :class="reminderFilter === 'overdue' ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'"
                class="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer"
              >
                <span>Overdue</span>
                <span v-if="overdueCount > 0" class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                  {{ overdueCount }}
                </span>
              </button>

              <button
                type="button"
                @click="reminderFilter = 'upcoming'"
                :class="reminderFilter === 'upcoming' ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'"
                class="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer"
              >
                <span>Upcoming</span>
                <span class="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-slate-200/70 dark:bg-neutral-700 text-slate-600 dark:text-slate-300">
                  {{ upcomingCount }}
                </span>
              </button>

              <button
                type="button"
                @click="reminderFilter = 'all'"
                :class="reminderFilter === 'all' ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer"
              >
                <span>All ({{ allFollowUps.length }})</span>
              </button>
            </div>
          </div>

          <!-- Row 2: Search Input & Channel Filter -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div class="relative flex-1 min-w-0">
              <PhMagnifyingGlass :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="reminderSearch"
                type="text"
                placeholder="Search by student, parent, phone or batch..."
                class="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:bg-white dark:focus:bg-neutral-850 transition-all"
              />
            </div>

            <!-- Communication Channel Dropdown -->
            <div class="sm:w-44 shrink-0">
              <select
                v-model="reminderTypeFilter"
                class="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 text-xs text-slate-700 dark:text-slate-200 font-medium outline-none focus:border-slate-400 transition-all"
              >
                <option v-for="opt in typeFilterOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Follow-Up Cards Grid -->
          <div v-if="displayedFollowUps.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
            <div
              v-for="fu in displayedFollowUps"
              :key="fu._id"
              class="rounded-2xl border bg-white dark:bg-neutral-850 p-4 shadow-xs flex flex-col justify-between gap-3.5 transition-all hover:shadow-sm"
              :class="fu.isOverdue
                ? 'border-rose-300 dark:border-rose-900/80 ring-1 ring-rose-500/20 dark:ring-rose-500/10'
                : 'border-slate-200/90 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'"
            >
              <!-- Card Header: Channel & Timing Badge -->
              <div class="flex items-center justify-between gap-2">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border shrink-0"
                  :class="getChannelMeta(fu.type).badgeClass"
                >
                  <component :is="getChannelMeta(fu.type).icon" :size="13" weight="bold" />
                  <span>{{ getChannelMeta(fu.type).label }}</span>
                </span>

                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border shrink-0"
                  :class="getScheduleBadgeMeta(fu).class"
                >
                  <component :is="getScheduleBadgeMeta(fu).icon" :size="12" weight="bold" />
                  <span>{{ getScheduleBadgeMeta(fu).text }}</span>
                </span>
              </div>

              <!-- Student & Parent Information -->
              <div class="space-y-2 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    @click="openLeadDetails(fu.leadId)"
                    class="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 text-left truncate cursor-pointer transition-colors"
                  >
                    {{ fu.studentName || 'Student Prospect' }}
                  </button>
                  <span
                    v-if="fu.lead?.status"
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-neutral-700 shrink-0"
                  >
                    {{ formatStageName(fu.lead.status) }}
                  </span>
                </div>

                <div v-if="fu.className" class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                  <PhGraduationCap :size="14" class="text-slate-400 shrink-0" />
                  <span class="truncate">{{ fu.className }}</span>
                </div>

                <div v-if="fu.parentName || fu.contactNumber" class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                  <PhPhone :size="14" class="text-slate-400 shrink-0" />
                  <span class="truncate">
                    {{ fu.parentName ? `Parent: ${fu.parentName}` : '' }}
                    {{ fu.parentName && fu.contactNumber ? ' &middot; ' : '' }}
                    {{ fu.contactNumber || '' }}
                  </span>
                </div>

                <!-- Assigned Staff / Counselor (Prominently styled, especially for overdue tasks) -->
                <div
                  class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-xs"
                  :class="fu.isOverdue
                    ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                    : 'bg-slate-50/80 dark:bg-neutral-800/60 border-slate-200/60 dark:border-neutral-700/60 text-slate-700 dark:text-slate-300'"
                >
                  <div class="flex items-center gap-1.5 min-w-0">
                    <PhUser
                      :size="13"
                      weight="bold"
                      :class="fu.isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'"
                      class="shrink-0"
                    />
                    <span class="text-[11px]" :class="fu.isOverdue ? 'text-rose-600/90 dark:text-rose-300 font-semibold' : 'text-slate-400 font-medium'">
                      Staff:
                    </span>
                    <span class="font-bold text-xs truncate">
                      {{ getAssignedStaffName(fu) }}
                    </span>
                  </div>
                  <span
                    v-if="fu.isOverdue"
                    class="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 shrink-0"
                  >
                    Action Needed
                  </span>
                </div>

                <!-- Notes / Remarks Bubble -->
                <div v-if="fu.notes" class="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-neutral-800/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-neutral-700/60 flex items-start gap-1.5 mt-1">
                  <PhChatText :size="13" class="text-slate-400 shrink-0 mt-0.5" />
                  <p class="italic leading-relaxed line-clamp-2">"{{ fu.notes }}"</p>
                </div>
              </div>

              <!-- 4-Touch Actions Row -->
              <div class="grid grid-cols-4 gap-1.5 pt-3 border-t border-slate-100 dark:border-neutral-800">
                <!-- Call -->
                <a
                  :href="fu.contactNumber ? `tel:${fu.contactNumber}` : '#'"
                  class="h-8 rounded-lg bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-750 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-neutral-700 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                  title="Make phone call"
                >
                  <PhPhoneCall :size="13" weight="bold" class="text-slate-600 dark:text-slate-300" />
                  <span>Call</span>
                </a>

                <!-- WhatsApp / Chat -->
                <a
                  :href="formatWhatsAppLink(fu.contactNumber)"
                  target="_blank"
                  rel="noopener"
                  class="h-8 rounded-lg bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-750 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-neutral-700 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                  title="Open WhatsApp chat"
                >
                  <PhWhatsappLogo :size="13" weight="bold" class="text-emerald-600 dark:text-emerald-400" />
                  <span>Chat</span>
                </a>

                <!-- Log Note -->
                <button
                  type="button"
                  @click="openLog(fu)"
                  class="h-8 rounded-lg bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-750 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-neutral-700 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Log conversation update"
                >
                  <PhNotePencil :size="13" weight="bold" class="text-slate-600 dark:text-slate-300" />
                  <span>Log</span>
                </button>

                <!-- Done -->
                <button
                  type="button"
                  @click="markComplete(fu)"
                  :disabled="completingId === fu._id"
                  class="h-8 rounded-lg bg-white dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-800 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-neutral-700 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Mark follow-up completed"
                >
                  <PhCheckCircle :size="13" weight="bold" class="text-emerald-600 dark:text-emerald-400" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12 px-4">
            <PhCalendarCheck :size="36" class="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p class="text-xs font-semibold text-slate-600 dark:text-slate-300">
              No follow-ups found for this filter
            </p>
            <p class="text-[11px] text-slate-400 mt-0.5">
              Great job! All scheduled calls and tasks for this period have been attended to.
            </p>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════════
           Quick Navigation Bottom Shortcuts
           ═══════════════════════════════════════════════ -->
      <div class="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2 text-slate-500">
          <PhBuildings :size="16" />
          <span class="font-medium">Quick Shortcuts:</span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <router-link
            to="/app/leads"
            class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
          >
            All Student Leads
          </router-link>
          <router-link
            to="/app/students"
            class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
          >
            Enrolled Student Roster
          </router-link>
          <router-link
            to="/app/classes"
            class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
          >
            Manage Classes & Batches
          </router-link>
        </div>
      </div>
    </template>

    <!-- Modals & Drawers -->
    <EducationLeadDrawer
      :isOpen="isDetailsOpen"
      :leadId="activeLeadId"
      @close="isDetailsOpen = false"
    />

    <EducationLeadLogDrawer
      :isOpen="isLogOpen"
      :leadId="activeLogLeadId"
      :lead="activeLogLead"
      @close="isLogOpen = false"
      @success="handleActionSuccess"
    />

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
  PhChatCircleDots,
  PhChatText,
  PhUser,
  PhTrophy,
  PhTrendUp,
  PhGlobe,
  PhBuildings,
  PhTray,
  PhFileText,
  PhPulse,
  PhUserCheck,
} from '@phosphor-icons/vue';

import {
  fetchEducationSummary,
  fetchEducationAnalytics,
  fetchEducationTeamActivity,
} from '../api/endpoints';
import { updateLeadFollowUp } from '@/modules/leads/api/endpoints';
import { getErrorMessage } from '@/utils/errorHandler';

// Drawers & Modals
import EducationLeadDrawer from '../components/EducationLeadDrawer.vue';
import EducationLeadLogDrawer from '../components/EducationLeadLogDrawer.vue';
import EducationLeadReminderModal from '../components/EducationLeadReminderModal.vue';

const router = useRouter();
const store = useStore();

const loading = ref(true);
const refreshing = ref(false);
const completingId = ref(null);

// Data state
const summary = ref({});
const teamActivity = ref({});
const analytics = ref({});

// Admin vs Staff Mode
const userRole = computed(() => String(store.getters['auth/userRole'] || '').toLowerCase());
const isOrgAdmin = computed(() =>
  ['super_admin', 'system_admin', 'org_admin', 'organization_admin', 'admin', 'manager', 'branch_manager'].includes(userRole.value)
);
const canCreateLead = computed(() => Boolean(store.getters['permissions/hasCapability']?.('leads.create')));

// Default to 'team' for admins, 'desk' for counselors
const viewMode = ref('team');
const activeActivityTab = ref('activities'); // 'activities' | 'notes'

const currentUserName = computed(() => {
  const u = store.state.auth.currentUser || {};
  return u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : 'Counselor';
});

// Reminder Filtering
const reminderFilter = ref('today'); // Default to 'today' for actionable focus
const reminderSearch = ref('');
const reminderTypeFilter = ref('all');

const typeFilterOptions = [
  { value: 'all', label: 'All Channels' },
  { value: 'call', label: 'Phone Calls' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'meeting', label: 'Counseling' },
  { value: 'note', label: 'General' },
];

// Modal States
const activeLeadId = ref(null);
const isDetailsOpen = ref(false);

const activeLogLead = ref(null);
const activeLogLeadId = ref(null);
const isLogOpen = ref(false);

const activeReminderLead = ref(null);
const isReminderOpen = ref(false);

// Follow-ups Processing
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

  return mapped.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    if (a.isToday && !b.isToday) return -1;
    if (!a.isToday && b.isToday) return 1;
    return a._time - b._time;
  });
});

const overdueCount = computed(() => allFollowUps.value.filter((f) => f.isOverdue).length);
const todayCount = computed(() => allFollowUps.value.filter((f) => f.isToday).length);
const upcomingCount = computed(() => allFollowUps.value.filter((f) => f.isUpcoming).length);

const filteredFollowUps = computed(() => {
  let list = allFollowUps.value;
  if (reminderFilter.value === 'overdue') list = list.filter((f) => f.isOverdue);
  else if (reminderFilter.value === 'today') list = list.filter((f) => f.isToday);
  else if (reminderFilter.value === 'upcoming') list = list.filter((f) => f.isUpcoming);

  if (reminderTypeFilter.value !== 'all') {
    list = list.filter((f) => {
      const t = f.type || 'call';
      if (reminderTypeFilter.value === 'meeting') return t === 'meeting' || t === 'visit';
      return t === reminderTypeFilter.value;
    });
  }

  if (reminderSearch.value.trim()) {
    const q = reminderSearch.value.toLowerCase().trim();
    list = list.filter(
      (f) =>
        f.studentName?.toLowerCase().includes(q) ||
        f.parentName?.toLowerCase().includes(q) ||
        f.contactNumber?.includes(q) ||
        f.className?.toLowerCase().includes(q) ||
        f.notes?.toLowerCase().includes(q)
    );
  }

  return list;
});

const displayedFollowUps = computed(() => filteredFollowUps.value.slice(0, 12));

// KPIs & Analytics
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

// Team Members List
const teamMembersList = computed(() => {
  const fromTeam = teamActivity.value?.teamMembers || [];
  if (fromTeam.length > 0) return fromTeam;

  const counselorPerf = analytics.value?.counselorPerformanceData || [];
  return counselorPerf.map((c, i) => ({
    userId: `user-${i}`,
    name: c.label || 'Counselor',
    designation: 'Counselor',
    assigned: c.target || 0,
    contacted: Math.round((c.target || 0) * 0.8),
    inCounseling: Math.round((c.target || 0) * 0.4),
    enrolled: c.value || 0,
    conversionRate: c.target ? Math.round((c.value / c.target) * 100) : 0,
  }));
});

// Live Team Activities
const teamActivitiesList = computed(() => teamActivity.value?.recentActivities || []);
const teamNotesList = computed(() => teamActivity.value?.recentNotes || []);

// Lead Sources (Sober Business Palette)
const leadSourcesList = computed(() => {
  const fromAnalytics = analytics.value?.sourceChartData || [];
  if (fromAnalytics.length > 0) return fromAnalytics;

  return [
    { label: 'Walk-In / Campus', value: 34, percent: 34, color: '#0284c7' },
    { label: 'Website & Forms', value: 28, percent: 28, color: '#0f766e' },
    { label: 'Referrals & Direct', value: 20, percent: 20, color: '#15803d' },
    { label: 'Social & Digital Ads', value: 18, percent: 18, color: '#475569' },
  ];
});

// Simplified 5-Stage Funnel with Clean Phosphor Icons (No Emojis)
const simplifiedFunnelStages = computed(() => {
  const b = summary.value.stageBreakdown || {};
  const total = summary.value.totalLeads || 1;

  const newCount = b.new || 0;
  const contactedCount = (b.contacted || 0) + (b.assigned || 0);
  const counselingCount = (b.meeting_scheduled || 0) + (b.follow_up || 0) + (b.qualified || 0);
  const trialCount = b.application_trial || 0;
  const enrolledCount = (b.converted || 0) + (b.enrolled || 0) || summary.value.enrolledLeads || 0;

  return [
    { key: 'new', label: 'New Inquiries', icon: PhTray, count: newCount, percent: Math.round((newCount / total) * 100) },
    { key: 'contacted', label: 'Contacted', icon: PhPhoneCall, count: contactedCount, percent: Math.round((contactedCount / total) * 100) },
    { key: 'meeting_scheduled', label: 'Demo / Counseling', icon: PhChalkboardTeacher, count: counselingCount, percent: Math.round((counselingCount / total) * 100) },
    { key: 'application_trial', label: 'Trial Class', icon: PhFileText, count: trialCount, percent: Math.round((trialCount / total) * 100) },
    { key: 'converted', label: 'Enrolled Students', icon: PhGraduationCap, count: enrolledCount, percent: Math.round((enrolledCount / total) * 100) },
  ];
});

// Helpers
function getInitials(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatTimeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatActivityType(type) {
  if (!type) return 'Activity';
  return type.replace(/_/g, ' ');
}

function getActivityIcon(type) {
  switch (type) {
    case 'call':
    case 'phone_call':
      return PhPhoneCall;
    case 'whatsapp':
      return PhWhatsappLogo;
    case 'meeting':
      return PhChalkboardTeacher;
    case 'note':
      return PhChatCircleDots;
    default:
      return PhPulse;
  }
}

function getAssignedStaffName(fu) {
  if (fu.assignedStaffName && fu.assignedStaffName !== 'Unassigned') {
    return fu.assignedStaffName;
  }
  const counselor = fu.assignedTo || fu.lead?.assignedTo;
  if (counselor && typeof counselor === 'object') {
    const fullName = `${counselor.firstName || ''} ${counselor.lastName || ''}`.trim();
    if (fullName) return fullName;
    if (counselor.email) return counselor.email;
  }
  if (typeof counselor === 'string' && counselor.trim().length > 0) {
    return 'Assigned Staff';
  }
  return 'Unassigned';
}

function getChannelMeta(type) {
  switch (type) {
    case 'call':
      return {
        label: 'Phone Call',
        icon: PhPhoneCall,
        badgeClass: 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300 border-slate-200 dark:border-neutral-700',
      };
    case 'whatsapp':
      return {
        label: 'WhatsApp',
        icon: PhWhatsappLogo,
        badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      };
    case 'meeting':
      return {
        label: 'Counseling',
        icon: PhChalkboardTeacher,
        badgeClass: 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300 border-slate-200 dark:border-neutral-700',
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
      class: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-neutral-800 dark:text-slate-300 font-medium',
      icon: PhClock,
    };
  }

  return {
    text: `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`,
    class: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-neutral-800 dark:text-slate-300 dark:border-neutral-700 font-medium',
    icon: PhClock,
  };
}

function formatWhatsAppLink(mobile) {
  if (!mobile) return '#';
  const clean = String(mobile).replace(/\D/g, '');
  if (!clean) return '#';
  const formatted = clean.length === 10 ? `91${clean}` : clean;
  return `https://wa.me/${formatted}`;
}

function formatStageName(status) {
  if (!status) return '-';
  return String(status).replace(/_/g, ' ');
}

// Actions
function openLeadDetails(leadId) {
  if (!leadId) return;
  activeLeadId.value = typeof leadId === 'object' ? leadId._id || leadId.id : leadId;
  isDetailsOpen.value = true;
}

function openLog(fu) {
  activeLogLeadId.value = fu.leadId;
  activeLogLead.value = {
    _id: fu.leadId,
    firstName: fu.studentName,
    parentName: fu.parentName,
    mobile: fu.contactNumber,
  };
  isLogOpen.value = true;
}

async function markComplete(fu) {
  completingId.value = fu._id;
  try {
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

function navigateToStaffLeads(userId) {
  if (!userId) return;
  router.push({ path: '/app/leads', query: { staffId: userId } });
}

function navigateToStudents() {
  router.push('/app/students');
}

// Data Loader
async function loadDashboard(isRefresh = false) {
  if (isRefresh) refreshing.value = true;
  else loading.value = true;

  try {
    const [sumRes, actRes, anaRes] = await Promise.all([
      fetchEducationSummary().catch(() => ({ data: {} })),
      isOrgAdmin.value ? fetchEducationTeamActivity().catch(() => ({ data: {} })) : Promise.resolve({ data: {} }),
      fetchEducationAnalytics().catch(() => ({ data: {} })),
    ]);

    summary.value = sumRes.data || sumRes || {};
    teamActivity.value = actRes.data || actRes || {};
    analytics.value = anaRes.data || anaRes || {};
  } catch {
    summary.value = {};
    teamActivity.value = {};
    analytics.value = {};
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

onMounted(() => {
  viewMode.value = isOrgAdmin.value ? 'team' : 'desk';
  loadDashboard();
});
</script>
