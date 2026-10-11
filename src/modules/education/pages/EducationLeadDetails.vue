<template>
  <div class="workspace-page education-lead-details max-w-6xl mx-auto space-y-4 pb-16 text-xs">
    <!-- Top Navigation & Action Header -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <router-link
        to="/app/leads"
        class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition py-1"
      >
        <PhArrowLeft :size="15" weight="bold" />
        <span>Back to Student Leads</span>
      </router-link>

      <div class="flex items-center gap-2">
        <button
          v-if="canEditLead"
          type="button"
          @click="isEditOpen = true"
          class="btn btn-secondary btn-sm h-8 px-3 text-xs font-semibold flex items-center gap-1.5"
          title="Edit student lead"
        >
          <PhPencilSimple :size="14" weight="bold" />
          <span>Edit Lead</span>
        </button>

        <button
          v-if="canCreateStudent && lead && lead.status !== 'enrolled' && lead.status !== 'converted'"
          type="button"
          @click="openEnrollModal"
          class="btn btn-primary btn-sm h-8 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-xs"
          title="Convert lead to enrolled student"
        >
          <PhCheckCircle :size="15" weight="bold" />
          <span>Convert to Student</span>
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
      <div class="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span class="font-medium">Loading student lead details...</span>
    </div>

    <!-- Lead Loaded -->
    <div v-else-if="lead" class="space-y-4">
      <!-- 1. Hero Identity Card with Large Quick Actions -->
      <div class="p-4 sm:p-5 rounded-2xl bg-surface border border-default shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="space-y-1.5 min-w-0">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Student Admission Lead</span>
            <div class="flex items-center gap-2.5 flex-wrap">
              <h1 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {{ lead.firstName }} {{ lead.lastName || '' }}
              </h1>
              <button
                type="button"
                @click="isStatusOpen = true"
                class="group inline-flex items-center gap-1 transition-transform hover:scale-[1.02] cursor-pointer"
                title="Click to change status"
              >
                <StatusBadge :status="lead.status || 'new'" :subStatus="lead.subStatus" />
                <PhPencilSimple :size="12" class="text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            <!-- Contacts and Class Pill Line -->
            <div class="flex items-center gap-3 text-slate-500 text-xs flex-wrap pt-0.5">
              <a
                v-if="lead.mobile"
                :href="'tel:' + lead.mobile"
                class="font-mono font-semibold text-slate-700 dark:text-slate-300 hover:text-primary flex items-center gap-1.5 transition-colors"
                title="Click to call"
              >
                <PhPhone :size="13" weight="bold" class="text-slate-400" />
                <span>{{ lead.mobile }}</span>
              </a>
              <span v-if="lead.email" class="text-slate-400 flex items-center gap-1">
                <PhEnvelopeSimple :size="13" />
                <span>{{ lead.email }}</span>
              </span>
              <span
                v-if="lead.classInterestId?.name || lead.className"
                class="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold text-[11px] border border-blue-200/60 dark:border-blue-800/60"
              >
                {{ lead.classInterestId?.name || lead.className }}
              </span>
            </div>
          </div>

          <!-- Quick Action Buttons Row -->
          <div class="flex items-center gap-2 flex-wrap shrink-0">
            <a
              v-if="lead.mobile"
              :href="'tel:' + lead.mobile"
              class="h-9 px-3 rounded-xl border border-default bg-slate-50 dark:bg-slate-800/70 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
              title="Click to call student"
            >
              <PhPhoneCall :size="15" weight="bold" class="text-emerald-600" />
              <span>Call</span>
            </a>

            <a
              v-if="lead.mobile"
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="h-9 px-3 rounded-xl border border-default bg-slate-50 dark:bg-slate-800/70 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
              title="Open WhatsApp chat"
            >
              <PhWhatsappLogo :size="16" weight="fill" class="text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            <button
              type="button"
              @click="isStatusOpen = true"
              class="h-9 px-3 rounded-xl border border-default bg-slate-50 dark:bg-slate-800/70 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-950/30 text-slate-700 dark:text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
              title="Update status & disposition"
            >
              <PhArrowsClockwise :size="15" weight="bold" class="text-blue-600" />
              <span>Status</span>
            </button>

            <button
              type="button"
              @click="isReminderOpen = true"
              class="h-9 px-3 rounded-xl border border-default bg-slate-50 dark:bg-slate-800/70 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 dark:hover:bg-amber-950/30 text-slate-700 dark:text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
              title="Set follow-up reminder"
            >
              <PhBell :size="15" weight="bold" class="text-amber-600" />
              <span>Reminder</span>
            </button>

            <button
              type="button"
              @click="isLogOpen = true"
              class="h-9 px-3.5 rounded-xl bg-primary text-white hover:opacity-95 font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              title="Log interaction or remark"
            >
              <PhNotePencil :size="15" weight="bold" />
              <span>Log Remark</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Next Scheduled Follow-up Banner (If active) -->
      <div
        v-if="upcomingFollowUp"
        class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/80 flex items-start justify-between gap-3 text-amber-900 dark:text-amber-100"
      >
        <div class="flex items-start gap-3 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <PhCalendarCheck :size="17" weight="bold" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-amber-950 dark:text-amber-200">Scheduled Follow-up:</span>
              <span class="text-xs font-semibold text-amber-800 dark:text-amber-300">
                {{ formatDateTime(upcomingFollowUp.scheduledAt) }}
              </span>
            </div>
            <p v-if="upcomingFollowUp.notes" class="text-xs text-amber-900/90 dark:text-amber-200/90 mt-0.5 leading-relaxed">
              {{ upcomingFollowUp.notes }}
            </p>
            <div class="text-[11px] text-amber-800/80 dark:text-amber-400 mt-1 flex items-center gap-1">
              <PhUser :size="11" />
              <span>Assigned staff: <strong class="text-amber-950 dark:text-amber-200">{{ staffName }}</strong></span>
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="isReminderOpen = true"
          class="btn-sm btn-secondary h-7 px-2.5 text-[11px] font-bold text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700 shrink-0"
        >
          Reschedule
        </button>
      </div>

      <!-- 3. Main Workspace Grid: Left (Dossier + Fast Logger) & Right (Timeline) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <!-- Left Column (5 Cols): Dossier & Fast Logger -->
        <div class="lg:col-span-5 space-y-4">
          <!-- Information Dossier Card -->
          <div class="p-4 rounded-xl bg-surface border border-default shadow-2xs space-y-3.5">
            <h3 class="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider text-slate-400">
              Lead Information
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 text-xs">
              <!-- Parent / Guardian -->
              <div class="space-y-0.5">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Parent / Guardian</span>
                <div class="font-medium text-slate-800 dark:text-slate-200">
                  {{ lead.parentName || '—' }}
                  <a
                    v-if="lead.parentMobile"
                    :href="'tel:' + lead.parentMobile"
                    class="text-emerald-600 hover:underline font-mono text-[11px] ml-1"
                    title="Call parent"
                  >
                    ({{ lead.parentMobile }})
                  </a>
                </div>
              </div>

              <!-- Interested Class -->
              <div class="space-y-0.5">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Interested Class / Batch</span>
                <span class="font-medium text-slate-800 dark:text-slate-200">
                  {{ lead.classInterestId?.name || lead.className || '—' }}
                </span>
              </div>

              <!-- Assigned Staff -->
              <div class="space-y-0.5">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Assigned Counselor / Staff</span>
                <div class="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span class="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[9px] flex items-center justify-center uppercase">
                    {{ (staffName || '?').charAt(0) }}
                  </span>
                  <span>{{ staffName }}</span>
                </div>
              </div>

              <!-- Inquiry Source -->
              <div class="space-y-0.5">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Inquiry Source</span>
                <span class="font-medium capitalize text-slate-800 dark:text-slate-200">
                  {{ lead.source ? lead.source.replace(/_/g, ' ') : 'Direct Inquiry' }}
                </span>
              </div>

              <!-- School / College -->
              <div v-if="lead.schoolName" class="space-y-0.5">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Previous School / College</span>
                <span class="font-medium text-slate-800 dark:text-slate-200">
                  {{ lead.schoolName }}
                </span>
              </div>

              <!-- Location / City -->
              <div v-if="lead.city || lead.address" class="space-y-0.5">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Location</span>
                <span class="font-medium text-slate-800 dark:text-slate-200">
                  {{ [lead.city, lead.address].filter(Boolean).join(', ') }}
                </span>
              </div>

              <!-- Created At -->
              <div class="space-y-0.5">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Inquiry Date</span>
                <span class="text-slate-500 font-medium">
                  {{ formatDate(lead.createdAt) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Fast Quick Remark Composer Card (Streamlined for everyday staff) -->
          <div class="p-4 rounded-xl bg-surface border border-default shadow-2xs space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <PhPaperPlaneTilt :size="14" weight="bold" class="text-primary" />
                <span>Add Quick Remark</span>
              </h3>
              <span class="text-[10px] text-slate-400">Recorded with staff name</span>
            </div>

            <!-- Fast Channel Selector Buttons -->
            <div class="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                v-for="ch in quickChannels"
                :key="ch.id"
                @click="quickForm.type = ch.id"
                class="py-1.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all border cursor-pointer"
                :class="quickForm.type === ch.id
                  ? 'bg-primary/10 border-primary text-primary font-bold shadow-2xs'
                  : 'border-default bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-slate-300'"
              >
                <component :is="ch.icon" :size="14" weight="bold" />
                <span class="text-[10px]">{{ ch.label }}</span>
              </button>
            </div>

            <!-- Quick Outcome Chips -->
            <div class="space-y-1">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Quick Outcome</span>
              <div class="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  v-for="tag in commonOutcomeChips"
                  :key="tag"
                  @click="selectOutcome(tag)"
                  class="px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors cursor-pointer"
                  :class="quickForm.outcome === tag
                    ? 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold'
                    : 'border-default text-slate-500 hover:border-slate-400 bg-slate-50 dark:bg-slate-800/40'"
                >
                  {{ tag }}
                </button>
              </div>
            </div>

            <!-- Remarks Textarea -->
            <div class="space-y-1">
              <textarea
                v-model="quickForm.remarks"
                rows="2"
                required
                placeholder="What was discussed with student / parent? Notes, fee discussion, decision date..."
                class="w-full bg-slate-50 dark:bg-slate-800/70 border border-default rounded-xl p-2.5 text-xs outline-none focus:border-primary resize-none placeholder:text-slate-400"
              ></textarea>
            </div>

            <!-- Inline Next Follow-up Date Toggle -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-2 cursor-pointer select-none text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  v-model="quickForm.setFollowUp"
                  class="rounded border-default text-primary focus:ring-0"
                />
                <span>Schedule next follow-up</span>
              </label>

              <div v-if="quickForm.setFollowUp" class="pl-5 pt-1">
                <input
                  v-model="quickForm.followUpDateTime"
                  type="datetime-local"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-default rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <!-- Quick Error Banner -->
            <p v-if="quickLogError" class="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-200">
              {{ quickLogError }}
            </p>

            <!-- Save Button -->
            <div class="flex justify-end pt-1">
              <button
                type="button"
                @click="saveQuickRemark"
                :disabled="quickLogging || !quickForm.remarks.trim()"
                class="btn btn-primary btn-sm px-3.5 h-8 text-xs font-bold gap-1.5 flex items-center shadow-xs"
              >
                <PhPaperPlaneTilt :size="13" weight="bold" />
                <span>{{ quickLogging ? "Saving..." : "Save Remark" }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column (7 Cols): Conversation History Timeline -->
        <div class="lg:col-span-7 space-y-3">
          <div class="p-4 rounded-xl bg-surface border border-default shadow-2xs space-y-4">
            <!-- Timeline Header & Filter Tabs -->
            <div class="flex items-center justify-between gap-2 flex-wrap border-b border-default pb-3">
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <PhClockCounterClockwise :size="15" weight="bold" class="text-primary" />
                  <span>Conversation History</span>
                </h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {{ filteredTimeline.length }}
                </span>
              </div>

              <!-- Filter Tabs -->
              <div class="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5">
                <button
                  v-for="tab in filterTabs"
                  :key="tab.key"
                  type="button"
                  @click="activeFilter = tab.key"
                  class="px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer"
                  :class="activeFilter === tab.key
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'"
                >
                  <span>{{ tab.label }}</span>
                  <span
                    class="text-[9px] px-1 py-0.2 rounded"
                    :class="activeFilter === tab.key ? 'bg-white/20 dark:bg-slate-900/20' : 'bg-slate-200/60 dark:bg-slate-700/60'"
                  >
                    {{ tab.count }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Empty Timeline -->
            <div v-if="filteredTimeline.length === 0" class="text-center py-12 px-4 space-y-2">
              <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <PhNotePencil :size="18" />
              </div>
              <p class="font-bold text-xs text-slate-700 dark:text-slate-300">No conversation history yet</p>
              <p class="text-[11px] text-slate-400 max-w-sm mx-auto">
                Use the Quick Remark box on the left or tap "Log Remark" above to record calls, chats, or follow-up notes.
              </p>
            </div>

            <!-- Grouped Timeline Entries -->
            <div v-else class="space-y-4">
              <div
                v-for="(group, dateLabel) in groupedTimeline"
                :key="dateLabel"
                class="space-y-2.5"
              >
                <!-- Date Divider -->
                <div class="flex items-center gap-2.5">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                    {{ dateLabel }}
                  </span>
                  <div class="flex-1 border-t border-default"></div>
                </div>

                <!-- Interaction Cards -->
                <div class="space-y-2 pl-0.5">
                  <div
                    v-for="item in group"
                    :key="item._id || item.id"
                    class="rounded-xl border border-default p-3.5 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all border-l-4"
                    :class="getCardBorderColor(item)"
                  >
                    <!-- Card Header -->
                    <div class="flex items-start justify-between gap-2 mb-1.5">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span
                          class="w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0"
                          :class="getChannelIconBg(item)"
                        >
                          <component :is="getChannelIcon(item)" :size="13" weight="bold" />
                        </span>
                        <span class="font-bold text-xs text-slate-800 dark:text-slate-100">
                          {{ getChannelTitle(item) }}
                        </span>

                        <!-- Outcome Tag if present -->
                        <span
                          v-if="item.customerResponse || item.summary"
                          class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-200/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-200"
                        >
                          {{ item.customerResponse || item.summary }}
                        </span>
                      </div>

                      <span class="text-[10px] text-slate-400 font-medium shrink-0">
                        {{ formatTime(item.activityDate || item.createdAt || item.scheduledAt) }}
                      </span>
                    </div>

                    <!-- Remarks Content -->
                    <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-8 mt-1 whitespace-pre-line">
                      {{ item.description || item.summary || item.content || item.notes }}
                    </p>

                    <!-- Next Touchpoint if scheduled -->
                    <div
                      v-if="item.nextFollowUpAt"
                      class="mt-2.5 ml-8 flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60 w-fit"
                    >
                      <PhCalendarCheck :size="12" weight="bold" />
                      <span>Next touchpoint: {{ formatDateTime(item.nextFollowUpAt) }}</span>
                    </div>

                    <!-- Footer: Staff Attribution -->
                    <div class="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 pl-8 flex items-center justify-between text-[10px] text-slate-400">
                      <span class="flex items-center gap-1 font-medium">
                        <PhUser :size="11" />
                        <span>Logged by: {{ getAuthorName(item) }}</span>
                      </span>
                      <span>
                        {{ formatRelativeTime(item.activityDate || item.createdAt || item.scheduledAt) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error / Not Found State -->
    <div v-else class="p-8 text-center bg-surface rounded-xl border border-default text-xs text-slate-500 space-y-2">
      <p class="font-bold text-sm text-slate-700 dark:text-slate-300">Student lead not found or access denied.</p>
      <router-link to="/app/leads" class="btn btn-secondary btn-sm inline-flex items-center gap-1 mt-2">
        <span>Back to Student Leads</span>
      </router-link>
    </div>

    <!-- Modals & Drawers -->
    <EducationLeadEditDrawer
      :isOpen="isEditOpen"
      :leadId="lead?._id"
      @close="isEditOpen = false"
      @success="handleEditSuccess"
    />

    <EducationLeadReminderModal
      :isOpen="isReminderOpen"
      :lead="lead"
      @close="isReminderOpen = false"
      @success="handleReminderSuccess"
    />

    <EducationLeadLogDrawer
      :isOpen="isLogOpen"
      :leadId="lead?._id"
      :lead="lead"
      @close="isLogOpen = false"
      @success="handleLogSuccess"
    />

    <EducationLeadStatusModal
      :isOpen="isStatusOpen"
      :lead="lead"
      @close="isStatusOpen = false"
      @success="handleStatusSuccess"
    />

    <!-- Enroll Drawer -->
    <AppDrawer
      :isOpen="showEnroll"
      :title="lead ? `Enroll ${lead.firstName} ${lead.lastName || ''}` : 'Enroll Student'"
      subtitle="Select the batch or class to complete enrollment"
      width="440px"
      @close="showEnroll = false"
    >
      <form id="enroll-page-form" class="space-y-4 text-xs" @submit.prevent="confirmEnroll">
        <p
          v-if="enrollError"
          class="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200"
        >
          {{ enrollError }}
        </p>
        <label class="space-y-1 text-xs block font-medium text-slate-700 dark:text-slate-300">
          <span>Class *</span>
          <select
            v-model="enrollClassId"
            required
            class="w-full border border-default rounded-xl px-3 py-2 bg-surface text-xs focus:border-primary outline-none"
          >
            <option value="" disabled>Select class to enroll into</option>
            <option v-for="c in classes" :key="c._id" :value="c._id">
              {{ c.name }} ({{ c.code }})
            </option>
          </select>
        </label>
      </form>
      <template #footer>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="showEnroll = false"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="enroll-page-form"
          class="btn btn-primary btn-sm"
          :disabled="enrolling"
        >
          {{ enrolling ? "Enrolling..." : "Confirm Enrollment" }}
        </button>
      </template>
    </AppDrawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import {
  PhArrowLeft,
  PhPhone,
  PhPhoneCall,
  PhWhatsappLogo,
  PhBell,
  PhPencilSimple,
  PhCheckCircle,
  PhCalendarCheck,
  PhUser,
  PhClockCounterClockwise,
  PhNotePencil,
  PhChalkboardTeacher,
  PhArrowsClockwise,
  PhEnvelopeSimple,
  PhPaperPlaneTilt,
} from '@phosphor-icons/vue';

import StatusBadge from '@/components/StatusBadge.vue';
import AppDrawer from '@/components/AppDrawer.vue';
import EducationLeadEditDrawer from '../components/EducationLeadEditDrawer.vue';
import EducationLeadReminderModal from '../components/EducationLeadReminderModal.vue';
import EducationLeadLogDrawer from '../components/EducationLeadLogDrawer.vue';
import EducationLeadStatusModal from '../components/EducationLeadStatusModal.vue';

import {
  fetchEducationLead,
  fetchEducationLeadActivityCenter,
  logEducationLeadActivity,
  enrollEducationLead,
  fetchEducationClasses,
} from '../api/endpoints';

const props = defineProps({
  initialLead: { type: Object, default: null },
});

const route = useRoute();
const router = useRouter();
const store = useStore();

const canEditLead = computed(() => Boolean(store.getters['permissions/hasCapability']?.('leads.update')));
const canCreateStudent = computed(() => Boolean(store.getters['permissions/hasCapability']?.('students.create')));

const lead = ref(props.initialLead || null);
const loading = ref(true);
const activityData = ref({ activities: [], notes: [], followUps: [] });
const classes = ref([]);

// Modals / Drawers state
const isEditOpen = ref(false);
const isReminderOpen = ref(false);
const isLogOpen = ref(false);
const isStatusOpen = ref(false);
const showEnroll = ref(false);
const enrollClassId = ref('');
const enrolling = ref(false);
const enrollError = ref('');

// Quick inline logger state
const quickLogging = ref(false);
const quickLogError = ref('');
const quickChannels = [
  { id: 'call', label: 'Call', icon: PhPhoneCall },
  { id: 'whatsapp', label: 'WhatsApp', icon: PhWhatsappLogo },
  { id: 'meeting', label: 'Demo / Meeting', icon: PhChalkboardTeacher },
  { id: 'note', label: 'Remark', icon: PhNotePencil },
];
const commonOutcomeChips = [
  'Interested',
  'Fees Discussed',
  'Callback Requested',
  'Demo Scheduled',
  'Not Interested',
];

function defaultNextFollowUp() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const z = (n) => (n < 10 ? '0' : '') + n;
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`;
}

const quickForm = ref({
  type: 'call',
  outcome: '',
  remarks: '',
  setFollowUp: false,
  followUpDateTime: defaultNextFollowUp(),
});

function selectOutcome(tag) {
  const currentRemarks = quickForm.value.remarks.trim();
  const prevOutcome = quickForm.value.outcome;

  if (prevOutcome === tag) {
    // If clicking the currently active tag again: toggle off
    quickForm.value.outcome = '';
    if (currentRemarks === tag) {
      quickForm.value.remarks = '';
    }
    return;
  }

  quickForm.value.outcome = tag;

  // If remarks is empty OR was set to the previous outcome OR is one of the standard chips, update remarks to the new selected tag
  if (!currentRemarks || currentRemarks === prevOutcome || commonOutcomeChips.includes(currentRemarks)) {
    quickForm.value.remarks = tag;
  } else if (prevOutcome && currentRemarks.startsWith(prevOutcome)) {
    quickForm.value.remarks = currentRemarks.replace(prevOutcome, tag);
  }
}

// Timeline Filtering
const activeFilter = ref('all');

const staffName = computed(() => {
  const staff = lead.value?.assignedTo;
  if (!staff) return 'Unassigned';
  if (typeof staff === 'object') {
    const fullName = `${staff.firstName || ''} ${staff.lastName || ''}`.trim();
    if (fullName) return fullName;
    if (staff.email) return staff.email;
  }
  return 'Unassigned';
});

const whatsappUrl = computed(() => {
  if (!lead.value?.mobile) return '#';
  const cleanPhone = String(lead.value.mobile).replace(/\D/g, '');
  const phone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const name = lead.value.firstName || 'Student';
  const text = encodeURIComponent(`Hello ${name}, regarding your admission inquiry with us.`);
  return `https://wa.me/${phone}?text=${text}`;
});

const upcomingFollowUp = computed(() => {
  const list = activityData.value.followUps || [];
  const now = new Date();
  return (
    list
      .filter((f) => f.status === 'scheduled' && new Date(f.scheduledAt) > now)
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0] || null
  );
});

// Unified Timeline
const timelineItems = computed(() => {
  const items = [];
  (activityData.value.activities || []).forEach((a) => {
    items.push({ ...a, _type: a.type || 'activity' });
  });
  (activityData.value.notes || []).forEach((n) => {
    items.push({ ...n, _type: 'note', type: 'note', summary: n.content });
  });
  (activityData.value.followUps || []).forEach((f) => {
    items.push({ ...f, _type: 'follow_up', type: 'reminder', summary: f.notes });
  });

  return items.sort((a, b) => {
    const da = new Date(a.activityDate || a.createdAt || a.scheduledAt || 0);
    const db = new Date(b.activityDate || b.createdAt || b.scheduledAt || 0);
    return db - da;
  });
});

const filterTabs = computed(() => {
  const all = timelineItems.value;
  return [
    { key: 'all', label: 'All', count: all.length },
    { key: 'call', label: 'Calls', count: all.filter((i) => i.type === 'call' || i.type === 'phone_call').length },
    { key: 'whatsapp', label: 'WhatsApp', count: all.filter((i) => i.type === 'whatsapp').length },
    { key: 'meeting', label: 'Counselling', count: all.filter((i) => i.type === 'meeting').length },
    { key: 'note', label: 'Remarks', count: all.filter((i) => i.type === 'note').length },
    { key: 'reminder', label: 'Reminders', count: all.filter((i) => i.type === 'reminder' || i.type === 'follow_up').length },
  ];
});

const filteredTimeline = computed(() => {
  if (activeFilter.value === 'all') return timelineItems.value;
  if (activeFilter.value === 'call') {
    return timelineItems.value.filter((i) => i.type === 'call' || i.type === 'phone_call');
  }
  return timelineItems.value.filter((i) => i.type === activeFilter.value);
});

const groupedTimeline = computed(() => {
  const groups = {};
  filteredTimeline.value.forEach((item) => {
    const rawDate = item.activityDate || item.createdAt || item.scheduledAt;
    let label = 'Other';
    if (rawDate) {
      const d = new Date(rawDate);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (d.toDateString() === today.toDateString()) {
        label = 'Today';
      } else if (d.toDateString() === yesterday.toDateString()) {
        label = 'Yesterday';
      } else {
        label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });
  return groups;
});

async function loadLeadDetails() {
  const leadId = route.params.id;
  if (!leadId) return;
  loading.value = true;
  try {
    const [leadRes, actRes] = await Promise.all([
      fetchEducationLead(leadId),
      fetchEducationLeadActivityCenter(leadId).catch(() => ({ activities: [], notes: [], followUps: [] })),
    ]);
    lead.value = leadRes.data || leadRes || null;
    activityData.value = actRes.data || actRes || { activities: [], notes: [], followUps: [] };
  } catch (err) {
    console.error('Failed to load student lead:', err);
  } finally {
    loading.value = false;
  }
}

async function loadClasses() {
  try {
    const res = await fetchEducationClasses({ limit: 100 });
    classes.value = res.data || [];
  } catch {
    classes.value = [];
  }
}

onMounted(async () => {
  await Promise.all([loadLeadDetails(), loadClasses()]);
});

async function saveQuickRemark() {
  if (!quickForm.value.remarks.trim() || !lead.value?._id) return;
  quickLogging.value = true;
  quickLogError.value = '';
  try {
    const payload = {
      type: quickForm.value.type,
      summary: quickForm.value.outcome || 'Remark added',
      description: quickForm.value.remarks.trim(),
      customerResponse: quickForm.value.outcome || undefined,
      activityDate: new Date(),
    };
    if (quickForm.value.setFollowUp && quickForm.value.followUpDateTime) {
      payload.nextFollowUpAt = new Date(quickForm.value.followUpDateTime);
    }
    await logEducationLeadActivity(lead.value._id, payload);
    quickForm.value.remarks = '';
    quickForm.value.outcome = '';
    quickForm.value.setFollowUp = false;
    await loadLeadDetails();
  } catch (err) {
    quickLogError.value = err.data?.message || err.message || 'Failed to save remark.';
  } finally {
    quickLogging.value = false;
  }
}

function handleEditSuccess() {
  isEditOpen.value = false;
  loadLeadDetails();
}

function handleReminderSuccess() {
  isReminderOpen.value = false;
  loadLeadDetails();
}

function handleLogSuccess() {
  isLogOpen.value = false;
  loadLeadDetails();
}

function handleStatusSuccess() {
  isStatusOpen.value = false;
  loadLeadDetails();
}

function openEnrollModal() {
  enrollClassId.value = lead.value?.classInterestId?._id || lead.value?.classInterestId || '';
  enrollError.value = '';
  showEnroll.value = true;
}

async function confirmEnroll() {
  if (!lead.value || !enrollClassId.value) return;
  enrolling.value = true;
  enrollError.value = '';
  try {
    await enrollEducationLead(lead.value._id, {
      classId: enrollClassId.value,
    });
    showEnroll.value = false;
    router.push('/app/students');
  } catch (err) {
    enrollError.value = err.data?.message || err.message || 'Unable to enroll.';
  } finally {
    enrolling.value = false;
  }
}

// Helpers
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(d) {
  if (!d) return '';
  const now = new Date();
  const date = new Date(d);
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

function getChannelIcon(item) {
  if (item.type === 'call' || item.type === 'phone_call') return PhPhoneCall;
  if (item.type === 'whatsapp') return PhWhatsappLogo;
  if (item.type === 'meeting') return PhChalkboardTeacher;
  if (item.type === 'reminder' || item.type === 'follow_up') return PhCalendarCheck;
  return PhNotePencil;
}

function getChannelIconBg(item) {
  if (item.type === 'call' || item.type === 'phone_call') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
  if (item.type === 'whatsapp') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
  if (item.type === 'meeting') return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300';
  if (item.type === 'reminder' || item.type === 'follow_up') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

function getCardBorderColor(item) {
  if (item.type === 'call' || item.type === 'phone_call') return 'border-l-emerald-500';
  if (item.type === 'whatsapp') return 'border-l-emerald-500';
  if (item.type === 'meeting') return 'border-l-blue-500';
  if (item.type === 'reminder' || item.type === 'follow_up') return 'border-l-amber-500';
  return 'border-l-indigo-500';
}

function getChannelTitle(item) {
  if (item.type === 'call' || item.type === 'phone_call') return 'Phone Call';
  if (item.type === 'whatsapp') return 'WhatsApp Chat';
  if (item.type === 'meeting') return 'Counselling / Demo';
  if (item.type === 'reminder' || item.type === 'follow_up') return 'Scheduled Follow-up';
  if (item.type === 'note') return 'Staff Remark';
  return item.type ? item.type.replace(/_/g, ' ') : 'Touchpoint';
}

function getAuthorName(item) {
  const by = item.performedBy || item.createdBy || item.assignedTo;
  if (typeof by === 'object' && by) {
    const name = `${by.firstName || ''} ${by.lastName || ''}`.trim();
    if (name) return name;
    if (by.email) return by.email;
  }
  return 'Staff Member';
}
</script>
