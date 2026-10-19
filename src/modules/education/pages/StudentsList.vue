<template>
  <div class="workspace-page education-list space-y-5 text-xs">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div class="flex items-center justify-between gap-2 w-full sm:w-auto">
        <div>
          <h1 class="font-heading text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 whitespace-nowrap leading-none">
            <span>Enrolled Students</span>
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
            Directory of enrolled students and parent guardian contacts.
          </p>
        </div>
        <!-- Compact Actions for Mobile Screen Header -->
        <div class="sm:hidden flex items-center gap-1.5 shrink-0">
          <button 
            v-if="canCreateStudent"
            type="button"
            class="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
            @click="showBulkUpload = true"
            title="Bulk Upload Enrolled Students from Excel (.xlsx, .csv)"
          >
            <PhFileArrowUp :size="14" weight="bold" class="text-emerald-600 dark:text-emerald-400" />
            <span>Import</span>
          </button>
          <button 
            v-if="canCreateStudent"
            type="button"
            class="h-8 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
            @click="openCreate"
          >
            <PhPlus :size="13" weight="bold" />
            <span>Add</span>
          </button>
        </div>
      </div>

      <!-- Desktop Action Buttons (sm and above) -->
      <div class="hidden sm:flex items-center gap-2.5 shrink-0">
        <button 
          v-if="canCreateStudent"
          type="button"
          class="btn btn-secondary btn-sm h-9 px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-xs" 
          @click="showBulkUpload = true"
          title="Bulk Upload Enrolled Students from Excel (.xlsx, .csv)"
        >
          <PhFileArrowUp :size="15" weight="bold" />
          <span>Import Excel</span>
        </button>
        <button 
          v-if="canCreateStudent"
          type="button"
          class="btn btn-primary btn-sm h-9 px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-xs" 
          @click="openCreate"
        >
          <PhPlus :size="15" weight="bold" />
          <span>Add Student</span>
        </button>
      </div>
    </div>

    <!-- Mobile Streamlined Search & Filter (Flipkart / Amazon Style) (< 640px) -->
    <div class="sm:hidden space-y-2">
      <!-- Search Input + Filters Button Row -->
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <PhMagnifyingGlass :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
          <input 
            v-model="search" 
            type="text" 
            placeholder="Search student, mobile, parent..." 
            class="w-full h-10 pl-9 pr-8 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 shadow-2xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" 
            @input="handleSearch" 
          />
          <button
            v-if="search"
            type="button"
            @click="search = ''; handleSearch()"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            aria-label="Clear search"
          >
            <PhX :size="14" weight="bold" />
          </button>
        </div>

        <!-- Filter Trigger Button (Flipkart / Amazon style) -->
        <button
          type="button"
          @click="openFilterModal"
          class="h-10 px-3.5 rounded-xl border font-semibold text-xs inline-flex items-center gap-1.5 shadow-2xs shrink-0 active:scale-95 transition-all"
          :class="activeFilterCount > 0
            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold'
            : 'border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-800'"
          title="Open Filters"
        >
          <PhSlidersHorizontal :size="16" weight="bold" />
          <span>Filters</span>
          <span
            v-if="activeFilterCount > 0"
            class="w-4.5 h-4.5 rounded-full bg-blue-600 text-white text-[10px] font-bold inline-flex items-center justify-center shrink-0"
          >
            {{ activeFilterCount }}
          </span>
        </button>
      </div>

      <!-- Applied Filter Chips Row -->
      <div v-if="activeFilterCount > 0" class="flex items-center gap-1.5 flex-wrap pt-0.5">
        <button
          v-for="st in selectedStatuses"
          :key="st"
          type="button"
          @click="removeStatusFilter(st)"
          class="h-6 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold text-blue-700 dark:text-blue-300 inline-flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>{{ getStatusLabel(st) }}</span>
          <PhX :size="11" weight="bold" class="opacity-70 hover:opacity-100" />
        </button>

        <button
          type="button"
          @click="clearAllFilters"
          class="h-6 px-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center"
        >
          Clear all
        </button>
      </div>
    </div>

    <!-- Desktop Filter & Search Bar (sm and above) -->
    <div class="hidden sm:flex p-3.5 rounded-2xl bg-surface border border-default shadow-xs flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-2.5 flex-1 flex-wrap">
        <!-- Search Field -->
        <div class="relative w-full sm:w-80">
          <PhMagnifyingGlass :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            v-model="search" 
            type="text" 
            placeholder="Search student, mobile, parent..." 
            class="w-full bg-slate-50 dark:bg-slate-850 border border-default rounded-xl pl-9 pr-3 py-2 text-xs focus:border-primary outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400" 
            @input="handleSearch" 
          />
        </div>

        <!-- Status Filter Button / Trigger -->
        <button
          type="button"
          @click="openFilterModal"
          class="bg-slate-50 dark:bg-slate-850 border border-default hover:border-blue-400 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none inline-flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span>{{ selectedStatuses.length === 0 ? 'All Statuses (Multi-select)' : (selectedStatuses.length === 1 ? getStatusLabel(selectedStatuses[0]) : `${selectedStatuses.length} statuses selected`) }}</span>
          <PhSlidersHorizontal :size="14" class="text-slate-400 shrink-0" />
        </button>
      </div>

      <!-- Results Pill -->
      <div class="flex items-center gap-2 self-end sm:self-auto">
        <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-tabular bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-default/60">
          {{ pagination.total }} {{ pagination.total === 1 ? 'Student' : 'Students' }}
        </span>
      </div>
    </div>

    <!-- AppTable Data Table Component -->
    <!-- Desktop Table (sm and above) -->
    <div class="hidden sm:block rounded-xl bg-surface border border-default overflow-hidden shadow-xs">
      <AppTable
        :rows="rows"
        :columns="columns"
        :isLoading="loading"
        :pagination="pagination"
        :sorting="sorting"
        row-actions-label="Actions"
        empty-title="No students enrolled yet"
        empty-subtext="No enrolled students match your filters. Directly add a student or enroll from Student Leads."
        @rowClick="openView"
        @pageChange="handlePageChange"
        @pageSizeChange="handlePageSizeChange"
        @sort="handleSort"
      >
        <!-- Cell: Student Name & Lead Reference -->
        <template #cell(student)="{ row }">
          <div class="space-y-0.5">
            <div class="font-bold text-slate-900 dark:text-slate-100 text-xs hover:text-primary transition-colors">
              {{ row.firstName }} {{ row.lastName || '' }}
            </div>
            <div v-if="row.schoolName" class="text-slate-500 dark:text-slate-400 text-[10px] truncate max-w-[180px]">
              {{ row.schoolName }}
            </div>
            <div v-else-if="row.email" class="text-slate-400 text-[10px] truncate max-w-[150px]">
              {{ row.email }}
            </div>
          </div>
        </template>

        <!-- Cell: Contact Phone -->
        <template #cell(contact)="{ row }">
          <div class="font-tabular font-medium text-slate-700 dark:text-slate-300 text-xs">
            {{ row.mobile }}
          </div>
        </template>

        <!-- Cell: Parent / Guardian -->
        <template #cell(parent)="{ row }">
          <div class="space-y-0.5">
            <div class="text-slate-800 dark:text-slate-200 font-medium text-xs">
              {{ row.parentName || '—' }}
            </div>
            <div v-if="row.parentMobile" class="text-slate-400 font-tabular text-[10px]">
              {{ row.parentMobile }}
            </div>
          </div>
        </template>


        <!-- Cell: Status Badge -->
        <template #cell(status)="{ row }">
          <span
            class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1"
            :class="getStatusClass(row.status)"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(row.status)"></span>
            {{ getStatusLabel(row.status) }}
          </span>
        </template>

        <!-- Cell: Enrollment Date -->
        <template #cell(enrollmentDate)="{ row }">
          <div class="font-tabular text-slate-600 dark:text-slate-400 text-xs">
            {{ formatDate(row.enrollmentDate) }}
          </div>
        </template>

        <!-- Row Actions Slot -->
        <template #rowActions="{ row }">
          <div class="flex items-center gap-1 justify-end">
            <!-- 1. View Button (Eye) -->
            <button
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
              title="View student details"
              aria-label="View student details"
              @click.stop="openView(row)"
            >
              <PhEye :size="15" weight="bold" />
            </button>

            <!-- 2. Edit Button (Pencil) -->
            <button
              v-if="canEditStudent"
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
              title="Edit student"
              aria-label="Edit student"
              @click.stop="openEdit(row)"
            >
              <PhPencilSimple :size="15" weight="bold" />
            </button>

            <!-- 3. Delete Button (Trash) -->
            <button
              v-if="canDeleteStudent"
              class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete student"
              aria-label="Delete student"
              @click.stop="handleDelete(row)"
            >
              <PhTrash :size="15" weight="bold" />
            </button>
          </div>
        </template>
      </AppTable>
    </div>

    <!-- Mobile Card View (< 640px) -->
    <div class="block sm:hidden space-y-3">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="py-16 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="font-medium">Loading enrolled students...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="rows.length === 0" class="py-16 text-center space-y-3 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800">
        <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
          <PhGraduationCap :size="28" />
        </div>
        <div>
          <p class="font-bold text-slate-800 dark:text-slate-100 text-base">No students enrolled yet</p>
          <p class="text-xs text-slate-400 mt-1">Students will appear here once marked as enrolled.</p>
        </div>
      </div>

      <!-- Enrolled Student Cards -->
      <div
        v-else
        v-for="row in rows"
        :key="row._id || row.id"
        @click="openView(row)"
        class="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-4 space-y-3 active:scale-[0.99] transition-all cursor-pointer"
      >
        <!-- Header: Student Name + Status Badge -->
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <h3 class="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight leading-snug break-words">
              {{ row.firstName }} {{ row.lastName || '' }}
            </h3>
            <!-- Phone & Class/Batch tags directly below name -->
            <div class="flex items-center flex-wrap gap-2 mt-1.5">
              <a
                v-if="row.mobile"
                :href="'tel:' + row.mobile"
                @click.stop
                class="inline-flex items-center gap-1 text-xs font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <PhPhone :size="12" weight="bold" />
                <span>{{ row.mobile }}</span>
              </a>
            </div>
          </div>

          <!-- Status Badge -->
          <span
            class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 shrink-0"
            :class="getStatusClass(row.status)"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(row.status)"></span>
            {{ getStatusLabel(row.status) }}
          </span>
        </div>

        <!-- Metadata Grid: Parent & Enrollment Date -->
        <div class="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-slate-100 dark:border-neutral-800 text-xs">
          <div class="min-w-0">
            <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">Parent / Guardian</span>
            <span class="font-semibold text-slate-700 dark:text-slate-200 truncate block text-[12px] mt-0.5">
              {{ row.parentName || '—' }}
            </span>
          </div>
          <div class="min-w-0">
            <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">Enrolled Date</span>
            <span class="font-semibold text-slate-700 dark:text-slate-200 truncate block text-[12px] mt-0.5">
              {{ formatDate(row.enrollmentDate) }}
            </span>
          </div>
        </div>

        <!-- Touch Action Row -->
        <div class="flex items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-neutral-800" @click.stop>
          <a
            v-if="row.mobile"
            :href="'tel:' + row.mobile"
            class="flex-1 h-9 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200/70 dark:border-neutral-700 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <PhPhoneCall :size="14" weight="bold" class="text-slate-500 dark:text-slate-400" />
            <span>Call</span>
          </a>
          <button
            type="button"
            @click="openView(row)"
            class="flex-1 h-9 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-neutral-700 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <PhEye :size="14" weight="bold" class="text-slate-500 dark:text-slate-400" />
            <span>View</span>
          </button>
          <button
            v-if="canEditStudent"
            type="button"
            @click="openEdit(row)"
            class="w-9 h-9 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200/70 dark:border-neutral-700 flex items-center justify-center transition-all active:scale-[0.98]"
            title="Edit student"
          >
            <PhPencilSimple :size="15" weight="bold" />
          </button>
          <button
            v-if="canDeleteStudent"
            type="button"
            @click="handleDelete(row)"
            class="w-9 h-9 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200/70 dark:border-neutral-700 flex items-center justify-center transition-all active:scale-[0.98]"
            title="Delete student"
          >
            <PhTrash :size="15" weight="bold" />
          </button>
        </div>
      </div>

      <!-- Mobile Pagination Controls -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-xs font-semibold">
        <button
          type="button"
          :disabled="pagination.page <= 1"
          @click="handlePageChange(pagination.page - 1)"
          class="h-9 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition-colors"
        >
          Previous
        </button>
        <span class="text-slate-400 font-medium">{{ pagination.page }} / {{ pagination.totalPages }}</span>
        <button
          type="button"
          :disabled="pagination.page >= pagination.totalPages"
          @click="handlePageChange(pagination.page + 1)"
          class="h-9 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition-colors"
        >
          Next
        </button>
      </div>
    </div>

    <!-- View Student Details Drawer -->
    <AppDrawer
      :isOpen="showViewDrawer"
      title="Student Profile"
      subtitle="Read-only view of enrolled student details, academic background, and batch assignment"
      width="560px"
      @close="showViewDrawer = false"
    >
      <div v-if="viewingStudent" class="space-y-4 text-xs">
        <!-- Header Profile Card -->
        <div class="bg-slate-50 dark:bg-slate-850/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="font-heading font-extrabold text-base text-slate-900 dark:text-slate-100">
                {{ viewingStudent.firstName }} {{ viewingStudent.lastName || '' }}
              </h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {{ getStudentVal('schoolName') || 'Enrolled Student' }}
              </p>
            </div>
            <!-- Status Badge: User requested "just the status will be enrolled" -->
            <span
              class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 shrink-0"
              :class="getStatusClass(viewingStudent.status)"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(viewingStudent.status)"></span>
              <span>{{ getStatusLabel(viewingStudent.status) }}</span>
            </span>
          </div>

          <div class="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800 text-slate-500 font-mono text-[11px] flex-wrap">
            <span>Enrolled: <strong class="text-slate-700 dark:text-slate-200 font-sans">{{ formatDate(viewingStudent.enrollmentDate) }}</strong></span>
            <span v-if="viewingStudent.leadId" class="text-slate-300 dark:text-slate-700">&bull;</span>
            <span v-if="viewingStudent.leadId" class="text-blue-600 dark:text-blue-400 font-semibold font-sans">
              Converted from Lead
            </span>
            <span v-if="viewingStudent.classId?.name" class="text-slate-300 dark:text-slate-700">&bull;</span>
            <span v-if="viewingStudent.classId?.name" class="text-purple-600 dark:text-purple-400 font-semibold font-sans">
              Batch: {{ viewingStudent.classId.name }}
            </span>
          </div>
        </div>

        <!-- Section 1: Contact Information (Matching Add Modal) -->
        <div class="space-y-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Contact Information
          </span>
          <div class="grid grid-cols-2 gap-2.5">
            <div class="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <PhPhone :size="11" /> Primary Mobile
              </span>
              <p class="font-bold text-slate-900 dark:text-slate-100 text-xs font-tabular">
                {{ getStudentVal('mobile') || '—' }}
              </p>
            </div>

            <div class="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <PhPhone :size="11" /> Alternate Phone
              </span>
              <p class="font-bold text-slate-900 dark:text-slate-100 text-xs font-tabular">
                {{ getStudentVal('alternativeMobile') || '—' }}
              </p>
            </div>

            <div class="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1 col-span-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <PhEnvelopeSimple :size="11" /> Email Address
              </span>
              <p class="font-medium text-slate-800 dark:text-slate-200 text-xs truncate" :title="getStudentVal('email')">
                {{ getStudentVal('email') || '—' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Section 2: School & Academic Profile (Matching Add Modal) -->
        <div class="space-y-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            School & Academic Profile
          </span>
          <div class="grid grid-cols-2 gap-2.5">
            <div class="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1 col-span-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <PhBuildings :size="11" /> College / School Name
              </span>
              <p class="font-bold text-slate-900 dark:text-slate-100 text-xs">
                {{ getStudentVal('schoolName') || '—' }}
              </p>
            </div>

            <div class="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Institution Type</span>
              <p class="font-bold text-slate-900 dark:text-slate-100 text-xs">
                {{ getStudentVal('institutionType') || '—' }}
              </p>
            </div>

            <div class="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Education Board</span>
              <p class="font-bold text-slate-900 dark:text-slate-100 text-xs">
                {{ getStudentVal('educationBoard') || '—' }}
              </p>
            </div>

            <div class="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Standard / Grade</span>
              <p class="font-bold text-slate-900 dark:text-slate-100 text-xs">
                {{ getStudentVal('standard') || '—' }}
              </p>
            </div>

            <div class="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academic Stream</span>
              <p class="font-bold text-slate-900 dark:text-slate-100 text-xs">
                {{ getStudentVal('academicStream') || '—' }}
              </p>
            </div>

            <div class="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1 col-span-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Coaching / Private Classes</span>
              <p class="font-medium text-slate-800 dark:text-slate-200 text-xs">
                {{ getStudentVal('currentCoaching') || '—' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Section 3: Guardian & Location Details (Matching Add Modal) -->
        <div class="space-y-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Guardian & Admission Details
          </span>
          <div class="grid grid-cols-2 gap-2.5">
            <div class="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <PhUser :size="11" /> Parent / Guardian
              </span>
              <p class="font-bold text-slate-900 dark:text-slate-100 text-xs">
                {{ getStudentVal('parentName') || '—' }}
              </p>
            </div>

            <div class="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <PhPhone :size="11" /> Parent Contact
              </span>
              <p class="font-bold text-slate-900 dark:text-slate-100 text-xs font-tabular">
                {{ getStudentVal('parentMobile') || '—' }}
              </p>
            </div>

            <div class="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inquiry Source</span>
              <p class="font-bold text-slate-900 dark:text-slate-100 text-xs capitalize">
                {{ formatLeadSource(getStudentVal('source')) || '—' }}
              </p>
            </div>

            <div class="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Batch</span>
              <p class="font-bold text-slate-900 dark:text-slate-100 text-xs">
                {{ viewingStudent.classId?.name || 'General Roster' }}
              </p>
            </div>

            <div v-if="getStudentVal('city') || getStudentVal('address')" class="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1 col-span-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <PhMapPin :size="11" /> Location
              </span>
              <p class="font-medium text-slate-800 dark:text-slate-200 text-xs">
                {{ [getStudentVal('city'), getStudentVal('address')].filter(Boolean).join(', ') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Section: Custom Attributes (Salesforce Object Manager) -->
        <div v-if="hasCustomFields(viewingStudent)" class="space-y-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Custom Attributes
          </span>
          <div class="grid grid-cols-2 gap-2.5">
            <template
              v-for="(val, key) in (viewingStudent.customFields || viewingStudent.leadId?.customFields || {})"
              :key="key"
            >
              <div
                v-if="val !== undefined && val !== null && String(val).trim() !== ''"
                class="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1"
              >
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 capitalize">
                  {{ formatCustomFieldLabel(key) }}
                </span>
                <p class="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {{ val }}
                </p>
              </div>
            </template>
          </div>
        </div>

        <!-- Section 4: Academic Notes -->
        <div v-if="viewingStudent.notes || getStudentVal('notes')" class="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academic Notes</span>
          <p class="text-slate-600 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
            {{ viewingStudent.notes || getStudentVal('notes') }}
          </p>
        </div>
      </div>
      <template #footer>
        <button type="button" class="btn btn-secondary btn-sm" @click="showViewDrawer = false">Close</button>
        <button
          v-if="canEditStudent"
          type="button"
          class="btn btn-primary btn-sm gap-1.5"
          @click="switchToEditFromView"
        >
          <PhPencilSimple :size="14" />
          <span>Edit Student</span>
        </button>
      </template>
    </AppDrawer>

    <!-- Create / Edit Student Drawer -->
    <AppDrawer
      :isOpen="showModal"
      :title="editing ? 'Edit Student Record' : 'Enroll New Student'"
      :subtitle="editing ? 'Update enrolled student details and academic information' : 'Directly register an enrolled student record'"
      width="560px"
      @close="showModal = false"
    >
      <form id="student-form" class="space-y-4 text-xs" @submit.prevent="save">
        <p v-if="error" class="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">{{ error }}</p>
        <div class="modal-form-grid">
          <div class="modal-form-group">
            <label class="modal-form-label">First Name <span class="required-star">*</span></label>
            <input v-model="form.firstName" required placeholder="e.g. Rahul" class="modal-form-input" />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Last Name</label>
            <input v-model="form.lastName" placeholder="e.g. Sharma" class="modal-form-input" />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Mobile Phone <span class="required-star">*</span></label>
            <input v-model="form.mobile" required placeholder="10-digit mobile" class="modal-form-input" />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Alternate Phone</label>
            <input v-model="form.alternativeMobile" placeholder="Alternate phone" class="modal-form-input" />
          </div>
          <div class="modal-form-group col-span-full">
            <label class="modal-form-label">Email Address</label>
            <input v-model="form.email" type="email" placeholder="student@example.com" class="modal-form-input" />
          </div>
          <div class="modal-form-group col-span-full">
            <label class="modal-form-label">{{ getFieldLabel('schoolName', 'School / College Name') }} <span class="required-star">*</span></label>
            <input v-model="form.schoolName" :placeholder="getFieldPlaceholder('schoolName', 'e.g. St. Xavier\'s College / Delhi Public School')" class="modal-form-input" />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">{{ getFieldLabel('institutionType', 'Institution Type') }}</label>
            <select v-model="form.institutionType" class="modal-form-select">
              <option value="">{{ getFieldPlaceholder('institutionType', 'Select Institution Type') }}</option>
              <option v-for="opt in institutionTypeOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">{{ getFieldLabel('educationBoard', 'Education Board') }}</label>
            <select v-model="form.educationBoard" class="modal-form-select">
              <option value="">{{ getFieldPlaceholder('educationBoard', 'Select Board') }}</option>
              <option v-for="opt in educationBoardOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">{{ getFieldLabel('standard', 'Standard / Grade') }}</label>
            <select v-model="form.standard" class="modal-form-select">
              <option value="">{{ getFieldPlaceholder('standard', 'Select Standard / Grade') }}</option>
              <option v-for="opt in standardOptions" :key="opt" :value="opt">{{ opt }}</option>
              <option
                v-if="form.standard && !standardOptions.includes(String(form.standard))"
                :value="form.standard"
              >
                {{ form.standard }}
              </option>
            </select>
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">{{ getFieldLabel('academicStream', 'Academic Stream') }}</label>
            <select v-model="form.academicStream" class="modal-form-select">
              <option value="">{{ getFieldPlaceholder('academicStream', 'Select Stream') }}</option>
              <option v-for="opt in streamOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
          <div class="modal-form-group col-span-full">
            <label class="modal-form-label">Current Coaching / Private Classes</label>
            <input v-model="form.currentCoaching" placeholder="e.g. Allen, Aakash, Mahesh Tutorials (if enrolled)" class="modal-form-input" />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Inquiry Source</label>
            <select v-model="form.source" class="modal-form-select">
              <option value="walk_in">Walk-in</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="campus">Campus</option>
              <option value="manual_entry">Manual</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Student Status</label>
            <select v-model="form.status" class="modal-form-select">
              <option value="active">Enrolled (Active)</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Parent / Guardian Name</label>
            <input v-model="form.parentName" placeholder="Parent or guardian name" class="modal-form-input" />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Parent Mobile</label>
            <input v-model="form.parentMobile" placeholder="Parent mobile number" class="modal-form-input" />
          </div>

          <!-- Dynamic Custom Fields Group (Salesforce Object Manager) -->
          <div v-if="customFieldsList.length > 0" class="modal-form-group col-span-full pt-2 border-t border-slate-100 dark:border-neutral-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Custom Attributes</span>
              <span class="text-[10px] text-slate-400 font-medium">Object Manager Fields</span>
            </div>
            <div class="modal-form-grid">
              <div
                v-for="cf in customFieldsList"
                :key="cf.key"
                class="modal-form-group"
              >
                <label class="modal-form-label">
                  {{ cf.label }}
                  <span v-if="cf.required" class="required-star">*</span>
                </label>
                <!-- Dropdown Select -->
                <select
                  v-if="cf.type === 'select'"
                  v-model="form.customFields[cf.key]"
                  :required="cf.required"
                  class="modal-form-select"
                >
                  <option value="" :disabled="cf.required">{{ cf.placeholder || `Select ${cf.label}` }}</option>
                  <option
                    v-for="(opt, idx) in cf.options"
                    :key="idx"
                    :value="getOptionValue(opt)"
                  >
                    {{ getOptionLabel(opt) }}
                  </option>
                </select>
                <!-- Text Input -->
                <input
                  v-else
                  v-model="form.customFields[cf.key]"
                  :required="cf.required"
                  :placeholder="cf.placeholder || `Enter ${cf.label}`"
                  class="modal-form-input"
                />
                <p v-if="cf.helpText" class="text-[10px] text-slate-400 mt-0.5">{{ cf.helpText }}</p>
              </div>
            </div>
          </div>

          <div class="modal-form-group col-span-full">
            <label class="modal-form-label">Academic Notes</label>
            <textarea v-model="form.notes" rows="3" placeholder="Additional student background, goals, or fees schedule..." class="modal-form-textarea"></textarea>
          </div>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary btn-sm" @click="showModal = false">Cancel</button>
        <button type="submit" form="student-form" class="btn btn-primary btn-sm" :disabled="saving">
          {{ saving ? 'Saving...' : (editing ? 'Save Changes' : 'Enroll Student') }}
        </button>
      </template>
    </AppDrawer>

    <!-- Flipkart / Amazon style Multi-Select Filter Modal -->
    <AppModal
      :isOpen="isFilterModalOpen"
      title="Filter Students"
      subtitle="Refine by multiple student statuses"
      maxSize="480px"
      @cancel="isFilterModalOpen = false"
    >
      <div class="space-y-5">
        <!-- Status Multi-Select Section -->
        <div>
          <div class="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-neutral-800">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Student Status ({{ tempStatuses.length }} selected)
            </span>
            <button
              v-if="tempStatuses.length > 0"
              type="button"
              @click="tempStatuses = []"
              class="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Clear
            </button>
          </div>

          <div class="grid grid-cols-1 gap-2">
            <label
              v-for="st in availableStatuses"
              :key="st.value"
              class="flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all active:scale-[0.99]"
              :class="tempStatuses.includes(st.value)
                ? 'bg-blue-50/70 border-blue-500/80 dark:bg-blue-950/40 dark:border-blue-700'
                : 'bg-white dark:bg-neutral-850 border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800'"
            >
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  :value="st.value"
                  v-model="tempStatuses"
                  class="w-4.5 h-4.5 rounded text-blue-600 border-slate-300 dark:border-neutral-600 focus:ring-blue-500 cursor-pointer"
                />
                <span class="text-xs font-bold text-slate-800 dark:text-slate-100">{{ st.label }}</span>
              </div>
              <span
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                :class="st.badgeClass"
              >
                {{ st.label }}
              </span>
            </label>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="grid grid-cols-2 gap-2.5 w-full">
          <button
            type="button"
            @click="clearFiltersInModal"
            class="h-10 px-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-neutral-700 active:scale-95 transition-all text-center"
          >
            Clear All
          </button>
          <button
            type="button"
            @click="applyFiltersInModal"
            class="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all text-center"
          >
            Apply Filters {{ tempStatuses.length > 0 ? `(${tempStatuses.length})` : '' }}
          </button>
        </div>
      </template>
    </AppModal>

    <!-- Bulk Import Enrolled Students Modal -->
    <LeadBulkUploadModal
      :isOpen="showBulkUpload"
      target="students"
      @close="showBulkUpload = false"
      @success="load"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { 
  PhEye, 
  PhPencilSimple, 
  PhTrash, 
  PhPlus, 
  PhMagnifyingGlass,
  PhGraduationCap,
  PhPhone,
  PhPhoneCall,
  PhBookOpen,
  PhX,
  PhSlidersHorizontal,
  PhEnvelopeSimple,
  PhBuildings,
  PhUser,
  PhMapPin,
  PhFileArrowUp,
} from '@phosphor-icons/vue';
import Swal from 'sweetalert2';
import AppTable from '@/components/AppTable.vue';
import AppDrawer from '@/components/AppDrawer.vue';
import AppModal from '@/components/AppModal.vue';
import LeadBulkUploadModal from '@/modules/leads/components/LeadBulkUploadModal.vue';
import { 
  createEducationStudent, 
  fetchEducationStudents,
  updateEducationStudent,
  deleteEducationStudent
} from '../api/endpoints';
import { fetchCustomFields } from '@/api/customFields';
import { formatLeadSource } from '@/utils/formatters';

const store = useStore();
const showBulkUpload = ref(false);
const canCreateStudent = computed(() => {
  return Boolean(store.getters['permissions/hasCapability']?.('students.create'));
});

const canEditStudent = computed(() => {
  return Boolean(store.getters['permissions/hasCapability']?.('students.update'));
});

const canDeleteStudent = computed(() => {
  return Boolean(store.getters['permissions/hasCapability']?.('students.delete'));
});

const columns = [
  { key: 'student', label: 'Student', sortable: true },
  { key: 'contact', label: 'Contact', sortable: false },
  { key: 'parent', label: 'Parent / Guardian', sortable: false },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'enrollmentDate', label: 'Enrollment Date', sortable: true },
];

const rows = ref([]);
const loading = ref(false);
const search = ref('');
const statusFilter = ref('');

const availableStatuses = [
  { value: 'active', label: 'Enrolled', badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40' },
  { value: 'inactive', label: 'Inactive', badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40' },
  { value: 'graduated', label: 'Graduated', badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40' },
  { value: 'dropped', label: 'Dropped', badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40' },
];

const isFilterModalOpen = ref(false);
const selectedStatuses = ref([]);
const tempStatuses = ref([]);

const activeFilterCount = computed(() => {
  return selectedStatuses.value.length;
});

function openFilterModal() {
  tempStatuses.value = [...selectedStatuses.value];
  isFilterModalOpen.value = true;
}

function clearFiltersInModal() {
  tempStatuses.value = [];
}

function applyFiltersInModal() {
  selectedStatuses.value = [...tempStatuses.value];
  statusFilter.value = selectedStatuses.value.length === 1 ? selectedStatuses.value[0] : '';
  isFilterModalOpen.value = false;
  onFilterChange();
}

function removeStatusFilter(statusVal) {
  selectedStatuses.value = selectedStatuses.value.filter((s) => s !== statusVal);
  statusFilter.value = selectedStatuses.value.length === 1 ? selectedStatuses.value[0] : '';
  onFilterChange();
}

function clearAllFilters() {
  selectedStatuses.value = [];
  statusFilter.value = '';
  search.value = '';
  onFilterChange();
}

function getStatusLabel(statusVal) {
  const s = String(statusVal || '').toLowerCase();
  if (s === 'active' || s === 'enrolled') return 'Enrolled';
  if (s === 'inactive') return 'Inactive';
  if (s === 'graduated') return 'Graduated';
  if (s === 'dropped') return 'Dropped';
  return statusVal || 'Enrolled';
}

function getStudentVal(field) {
  if (!viewingStudent.value) return '';
  return viewingStudent.value[field] || viewingStudent.value.leadId?.[field] || '';
}

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
});

const sorting = ref({
  field: 'enrollmentDate',
  direction: 'desc',
});

const showModal = ref(false);
const showViewDrawer = ref(false);
const viewingStudent = ref(null);
const saving = ref(false);
const error = ref('');
const editing = ref(null);
const form = ref({});
let timer = null;

const allFieldsList = ref([]);
const customFieldsList = ref([]);

function getFieldConfig(key) {
  return allFieldsList.value.find(f => f.key === key);
}

function getFieldLabel(key, fallback) {
  const cfg = getFieldConfig(key);
  return cfg?.label || fallback;
}

function getFieldPlaceholder(key, fallback) {
  const cfg = getFieldConfig(key);
  return cfg?.placeholder || fallback;
}

function getFieldOptions(key, fallback = []) {
  const cfg = getFieldConfig(key);
  if (cfg && Array.isArray(cfg.options) && cfg.options.length > 0) {
    return cfg.options.map(o => typeof o === 'object' ? (o.value || o.label) : String(o));
  }
  return fallback;
}

function getOptionValue(opt) {
  if (opt === null || opt === undefined) return '';
  if (typeof opt === 'object') return String(opt.value ?? opt.label ?? '');
  return String(opt);
}

function getOptionLabel(opt) {
  if (opt === null || opt === undefined) return '';
  if (typeof opt === 'object') return String(opt.label ?? opt.value ?? '');
  return String(opt);
}

const institutionTypeOptions = computed(() => getFieldOptions('institutionType', ['School', 'Private Classes']));
const educationBoardOptions = computed(() => getFieldOptions('educationBoard', ['CBSE', 'ICSE', 'State Board']));
const standardOptions = computed(() => getFieldOptions('standard', ['8', '9', '10', '11', '12']));
const streamOptions = computed(() => getFieldOptions('academicStream', ['Science', 'Commerce']));

async function loadCustomFields() {
  try {
    const list = await fetchCustomFields('students', { includeStandard: true });
    allFieldsList.value = Array.isArray(list) ? list : [];
    customFieldsList.value = allFieldsList.value.filter(f => !f.isStandard && f.isActive !== false);
    if (!form.value.customFields) {
      form.value.customFields = {};
    }
    for (const cf of customFieldsList.value) {
      if (form.value.customFields[cf.key] === undefined || form.value.customFields[cf.key] === null) {
        form.value.customFields[cf.key] = "";
      }
    }
  } catch (e) {
    allFieldsList.value = [];
    customFieldsList.value = [];
  }
}

function hasCustomFields(student) {
  if (!student) return false;
  const cf = student.customFields || student.leadId?.customFields;
  if (!cf || typeof cf !== 'object') return false;
  return Object.values(cf).some((v) => v !== undefined && v !== null && String(v).trim() !== '');
}

function formatCustomFieldLabel(key) {
  if (!key) return '';
  return String(key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function blank() {
  return { 
    firstName: '', 
    lastName: '', 
    mobile: '', 
    alternativeMobile: '',
    email: '', 
    parentName: '', 
    parentMobile: '', 
    schoolName: '',
    institutionType: '',
    educationBoard: '',
    standard: '',
    academicStream: '',
    currentCoaching: '',
    source: 'walk_in',
    city: '',
    address: '',
    status: 'active',
    notes: '',
    customFields: {},
  };
}

function getStatusClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'active' || s === 'enrolled') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/20';
  if (s === 'inactive') return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-500/20';
  if (s === 'graduated') return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-500/20';
  if (s === 'dropped') return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-500/20';
  return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/20';
}

function getStatusDotClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'active') return 'bg-emerald-500';
  if (s === 'inactive') return 'bg-amber-500';
  if (s === 'graduated') return 'bg-blue-500';
  if (s === 'dropped') return 'bg-rose-500';
  return 'bg-slate-400';
}

async function load() {
  loading.value = true;
  try {
    const statusParam = selectedStatuses.value.length > 0
      ? selectedStatuses.value.join(',')
      : (statusFilter.value || undefined);

    const res = await fetchEducationStudents({
      search: search.value.trim() || undefined,
      status: statusParam,
      page: pagination.value.page,
      limit: pagination.value.limit,
    });
    rows.value = res.data || [];
    const p = res.pagination || {};
    pagination.value = {
      page: Number(p.page) || pagination.value.page,
      limit: Number(p.limit) || pagination.value.limit,
      total: Number(p.total) || rows.value.length,
      totalPages: Number(p.pages || p.totalPages) || 1,
    };
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    pagination.value.page = 1;
    load();
  }, 300);
}

function onFilterChange() {
  pagination.value.page = 1;
  load();
}

function handlePageChange(page) {
  pagination.value.page = page;
  load();
}

function handlePageSizeChange(limit) {
  pagination.value.limit = limit;
  pagination.value.page = 1;
  load();
}

function handleSort({ field, direction }) {
  sorting.value = { field, direction };
  rows.value.sort((a, b) => {
    const valA = a[field] ?? '';
    const valB = b[field] ?? '';
    if (direction === 'asc') {
      return valA > valB ? 1 : -1;
    } else {
      return valA < valB ? 1 : -1;
    }
  });
}

function openView(row) {
  viewingStudent.value = row;
  showViewDrawer.value = true;
}

function switchToEditFromView() {
  const target = viewingStudent.value;
  showViewDrawer.value = false;
  if (target) {
    openEdit(target);
  }
}

function openCreate() {
  editing.value = null;
  form.value = blank();
  error.value = '';
  loadCustomFields();
  showModal.value = true;
}

function openEdit(row) {
  editing.value = row;
  loadCustomFields();
  form.value = { 
    firstName: row.firstName || '',
    lastName: row.lastName || '',
    mobile: row.mobile || '',
    alternativeMobile: row.alternativeMobile || row.leadId?.alternativeMobile || '',
    email: row.email || row.leadId?.email || '',
    parentName: row.parentName || row.leadId?.parentName || '',
    parentMobile: row.parentMobile || row.leadId?.parentMobile || '',
    schoolName: row.schoolName || row.leadId?.schoolName || '',
    institutionType: row.institutionType || row.leadId?.institutionType || '',
    educationBoard: row.educationBoard || row.leadId?.educationBoard || '',
    standard: row.standard || row.leadId?.standard || '',
    academicStream: row.academicStream || row.leadId?.academicStream || '',
    currentCoaching: row.currentCoaching || row.leadId?.currentCoaching || '',
    source: row.source || row.leadId?.source || 'walk_in',
    city: row.city || row.leadId?.city || '',
    address: row.address || row.leadId?.address || '',
    classId: row.classId?._id || row.classId || '',
    status: row.status || 'active',
    notes: row.notes || row.leadId?.notes || '',
    customFields: { ...(row.customFields || row.leadId?.customFields || {}) },
  };
  for (const cf of customFieldsList.value) {
    if (form.value.customFields[cf.key] === undefined || form.value.customFields[cf.key] === null) {
      form.value.customFields[cf.key] = "";
    }
  }
  error.value = '';
  showModal.value = true;
}

async function save() {
  // Validate required custom fields configured in Salesforce Object Manager
  for (const cf of customFieldsList.value) {
    if (cf.required) {
      const val = form.value.customFields?.[cf.key];
      if (val === undefined || val === null || String(val).trim() === '') {
        error.value = `${cf.label} is mandatory.`;
        return;
      }
    }
  }

  saving.value = true;
  error.value = '';
  try {
    const payload = { 
      ...form.value,
      customFields: form.value.customFields || {},
    };
    if (editing.value) {
      await updateEducationStudent(editing.value._id, payload);
    } else {
      await createEducationStudent(payload);
    }
    showModal.value = false;
    await load();
  } catch (err) {
    error.value = err.data?.message || err.message || 'Unable to save student.';
  } finally {
    saving.value = false;
  }
}

async function handleDelete(row) {
  if (!canDeleteStudent.value) {
    Swal.fire({
      title: 'Access Restricted',
      text: 'You do not have permission to delete student records.',
      icon: 'error',
    });
    return;
  }

  const result = await Swal.fire({
    title: `Delete "${row.firstName} ${row.lastName || ''}"?`,
    text: 'Are you sure you want to delete this student record? This action will archive the enrollment.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Yes, delete student',
    cancelButtonText: 'Cancel',
  });

  if (!result.isConfirmed) return;

  try {
    await deleteEducationStudent(row._id);
    Swal.fire({
      title: 'Deleted!',
      text: 'Student record has been deleted successfully.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
    });
    await load();
  } catch (err) {
    Swal.fire({
      title: 'Error',
      text: err.response?.data?.message || err.message || 'Failed to delete student.',
      icon: 'error',
    });
  }
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

onMounted(async () => {
  loadCustomFields();
  await load();
});
</script>

