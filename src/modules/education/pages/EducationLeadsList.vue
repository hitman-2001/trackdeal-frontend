<template>
  <div class="workspace-page education-list pb-28 sm:pb-16">
    <!-- Page Header (Section 6 Standard) -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl sm:text-[28px] font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Student Leads
          </h1>
          <p class="text-xs sm:text-[13px] text-slate-500 mt-0.5 hidden sm:block">
            Admission inquiries. Convert a lead into an enrolled student.
          </p>
        </div>
        <!-- Compact Add Button for Mobile Screen Header -->
        <button
          v-if="canCreateLead"
          class="sm:hidden btn btn-primary btn-sm rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
          @click="openCreate"
        >
          <PhPlus :size="14" weight="bold" />
          <span>Add Lead</span>
        </button>
      </div>

      <!-- Desktop Action Buttons (sm and above) -->
      <div class="hidden sm:flex items-center gap-2.5 flex-wrap">

        <button
          v-if="canBulkUpload"
          @click="showBulkUpload = true"
          class="btn btn-secondary btn-sm flex items-center gap-1.5"
          title="Bulk Upload Student Leads from Excel (.xlsx, .csv)"
        >
          <PhFileArrowUp :size="15" weight="bold" />
          <span>Import Excel</span>
        </button>
        <button
          v-if="canCreateLead"
          class="btn btn-primary btn-sm flex items-center gap-1.5"
          @click="openCreate"
        >
          <PhPlus :size="15" weight="bold" />
          <span>Add Student Lead</span>
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
            placeholder="Search student lead..."
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

      <!-- Applied Filter Chips Row on Mobile -->
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
          v-if="institutionTypeFilter"
          type="button"
          @click="institutionTypeFilter = ''; onFilterChange()"
          class="h-6 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>Type: {{ institutionTypeFilter }}</span>
          <PhX :size="11" weight="bold" class="opacity-70 hover:opacity-100" />
        </button>

        <button
          v-if="educationBoardFilter"
          type="button"
          @click="educationBoardFilter = ''; onFilterChange()"
          class="h-6 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold text-amber-700 dark:text-amber-300 inline-flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>Board: {{ educationBoardFilter }}</span>
          <PhX :size="11" weight="bold" class="opacity-70 hover:opacity-100" />
        </button>

        <button
          v-if="standardFilter"
          type="button"
          @click="standardFilter = ''; onFilterChange()"
          class="h-6 px-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[11px] font-semibold text-purple-700 dark:text-purple-300 inline-flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>Grade: {{ standardFilter }}</span>
          <PhX :size="11" weight="bold" class="opacity-70 hover:opacity-100" />
        </button>

        <button
          v-if="academicStreamFilter"
          type="button"
          @click="academicStreamFilter = ''; onFilterChange()"
          class="h-6 px-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] font-semibold text-teal-700 dark:text-teal-300 inline-flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>Stream: {{ academicStreamFilter }}</span>
          <PhX :size="11" weight="bold" class="opacity-70 hover:opacity-100" />
        </button>

        <button
          v-if="staffFilter"
          type="button"
          @click="staffFilter = ''; onFilterChange()"
          class="h-6 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 inline-flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>Staff: {{ getStaffName(staffFilter) }}</span>
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

    <!-- Desktop Filters Bar (sm and above) -->
    <div class="hidden sm:block p-4 rounded-2xl bg-surface border border-default shadow-xs space-y-3">
      <!-- Top Row: Search + Status Multi-Select Trigger + Staff Filter -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center"
        :class="canFilterAllStaff ? 'lg:grid-cols-3' : 'lg:grid-cols-2'"
      >
        <div class="relative w-full">
          <PhMagnifyingGlass :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
          <input
            v-model="search"
            type="text"
            placeholder="Search student lead..."
            class="filter-control !pl-10 w-full"
            @input="handleSearch"
          />
        </div>

        <button
          type="button"
          @click="openFilterModal"
          class="filter-control w-full flex items-center justify-between text-left cursor-pointer hover:border-blue-400"
        >
          <span class="truncate">
            {{ selectedStatuses.length === 0 ? 'All statuses (Multi-select)' : (selectedStatuses.length === 1 ? getStatusLabel(selectedStatuses[0]) : `${selectedStatuses.length} statuses selected`) }}
          </span>
          <PhSlidersHorizontal :size="15" class="text-slate-400 shrink-0" />
        </button>

        <select
          v-if="canFilterAllStaff"
          v-model="staffFilter"
          class="filter-control w-full"
          @change="onFilterChange"
        >
          <option value="">All staff</option>
          <option v-for="s in staffList" :key="s._id || s.id" :value="s._id || s.id">
            {{ s.firstName }} {{ s.lastName || '' }}
          </option>
        </select>
      </div>

      <!-- Quick Segmentation Filter Row: Institution Type, Board, Standard, Stream -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-slate-100 dark:border-neutral-800/80">
        <select
          v-model="institutionTypeFilter"
          class="filter-control w-full text-xs"
          @change="onFilterChange"
        >
          <option value="">All Institution Types</option>
          <option v-for="t in availableInstitutionTypes" :key="t.value" :value="t.value">
            {{ t.label }}
          </option>
        </select>

        <select
          v-model="educationBoardFilter"
          class="filter-control w-full text-xs"
          @change="onFilterChange"
        >
          <option value="">All Education Boards</option>
          <option v-for="b in availableEducationBoards" :key="b.value" :value="b.value">
            {{ b.label }}
          </option>
        </select>

        <select
          v-model="standardFilter"
          class="filter-control w-full text-xs"
          @change="onFilterChange"
        >
          <option value="">All Standards / Grades</option>
          <option v-for="std in availableStandards" :key="std.value" :value="std.value">
            {{ std.label }}
          </option>
        </select>

        <select
          v-model="academicStreamFilter"
          class="filter-control w-full text-xs"
          @change="onFilterChange"
        >
          <option value="">All Academic Streams</option>
          <option v-for="str in availableStreams" :key="str.value" :value="str.value">
            {{ str.label }}
          </option>
        </select>
      </div>

      <!-- Applied Filter Chips Row on Desktop -->
      <div v-if="activeFilterCount > 0" class="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-neutral-800">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Active:</span>

        <button
          v-for="st in selectedStatuses"
          :key="st"
          type="button"
          @click="removeStatusFilter(st)"
          class="h-6 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold text-blue-700 dark:text-blue-300 inline-flex items-center gap-1 hover:border-blue-300 transition-all"
        >
          <span>{{ getStatusLabel(st) }}</span>
          <PhX :size="11" weight="bold" class="opacity-70 hover:opacity-100" />
        </button>

        <button
          v-if="institutionTypeFilter"
          type="button"
          @click="institutionTypeFilter = ''; onFilterChange()"
          class="h-6 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1 hover:border-emerald-300 transition-all"
        >
          <span>Type: {{ institutionTypeFilter }}</span>
          <PhX :size="11" weight="bold" class="opacity-70 hover:opacity-100" />
        </button>

        <button
          v-if="educationBoardFilter"
          type="button"
          @click="educationBoardFilter = ''; onFilterChange()"
          class="h-6 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold text-amber-700 dark:text-amber-300 inline-flex items-center gap-1 hover:border-amber-300 transition-all"
        >
          <span>Board: {{ educationBoardFilter }}</span>
          <PhX :size="11" weight="bold" class="opacity-70 hover:opacity-100" />
        </button>

        <button
          v-if="standardFilter"
          type="button"
          @click="standardFilter = ''; onFilterChange()"
          class="h-6 px-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[11px] font-semibold text-purple-700 dark:text-purple-300 inline-flex items-center gap-1 hover:border-purple-300 transition-all"
        >
          <span>Grade: {{ standardFilter }}</span>
          <PhX :size="11" weight="bold" class="opacity-70 hover:opacity-100" />
        </button>

        <button
          v-if="academicStreamFilter"
          type="button"
          @click="academicStreamFilter = ''; onFilterChange()"
          class="h-6 px-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[11px] font-semibold text-teal-700 dark:text-teal-300 inline-flex items-center gap-1 hover:border-teal-300 transition-all"
        >
          <span>Stream: {{ academicStreamFilter }}</span>
          <PhX :size="11" weight="bold" class="opacity-70 hover:opacity-100" />
        </button>

        <button
          v-if="staffFilter"
          type="button"
          @click="staffFilter = ''; onFilterChange()"
          class="h-6 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 inline-flex items-center gap-1 hover:border-indigo-300 transition-all"
        >
          <span>Staff: {{ getStaffName(staffFilter) }}</span>
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

    <!-- Bulk Selection Toolbar (When Leads are Selected) -->
    <div
      v-if="selectedRows.length > 0"
      class="rounded-xl bg-surface border border-default shadow-sm p-3 sm:px-4 sm:py-2.5 transition-all space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between"
    >
      <!-- Left: Counter + Mobile Deselect -->
      <div class="flex items-center justify-between sm:justify-start sm:gap-3">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold font-tabular shadow-2xs shrink-0">
            {{ selectedRows.length }}
          </span>
          <span class="text-xs font-bold text-slate-900 dark:text-slate-100">
            {{ selectedRows.length === 1 ? '1 lead selected' : `${selectedRows.length} leads selected` }}
          </span>
        </div>

        <!-- Mobile Deselect button & Quick Select All -->
        <div class="flex items-center gap-2">
          <button
            v-if="!isAllSelected && rows.length > selectedRows.length"
            type="button"
            @click="toggleSelectAll"
            class="text-xs font-semibold text-primary hover:underline px-1 py-0.5 rounded cursor-pointer"
          >
            Select all ({{ rows.length }})
          </button>
          <button
            type="button"
            @click="selectedRows = []"
            class="sm:hidden btn btn-ghost btn-sm h-8 px-2 text-xs font-medium"
            title="Clear selection"
          >
            <PhX :size="13" weight="bold" />
            <span>Deselect</span>
          </button>
        </div>
      </div>

      <!-- Right: Action Buttons (Equal width on mobile, inline on desktop) -->
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <button
          v-if="canAssignLeads"
          type="button"
          @click="openBulkAssign"
          class="btn btn-primary btn-sm flex-1 sm:flex-none flex items-center justify-center gap-1.5 shadow-xs font-semibold"
          title="Assign selected leads to staff"
        >
          <PhUserPlus :size="15" weight="bold" />
          <span class="truncate">Assign</span>
        </button>

        <button
          v-if="canAssignLeads"
          type="button"
          @click="openRoundRobinAssign"
          class="btn btn-secondary btn-sm flex-1 sm:flex-none flex items-center justify-center gap-1.5 shadow-xs font-semibold"
          title="Distribute in fixed batches of 10 cyclically"
        >
          <PhArrowsClockwise :size="15" weight="bold" />
          <span class="truncate">Round-Robin</span>
        </button>

        <button
          v-if="canBulkDeleteLeads"
          type="button"
          @click="openBulkDelete"
          class="btn btn-danger-outline btn-sm flex-1 sm:flex-none flex items-center justify-center gap-1.5 shadow-xs font-semibold"
          title="Delete selected leads"
        >
          <PhTrash :size="15" weight="bold" />
          <span class="truncate">Delete</span>
        </button>

        <!-- Desktop Deselect button -->
        <button
          type="button"
          @click="selectedRows = []"
          class="hidden sm:inline-flex btn btn-ghost btn-sm flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium ml-1"
        >
          <PhX :size="13" weight="bold" />
          <span>Deselect</span>
        </button>
      </div>
    </div>

    <!-- Desktop Data Table Card (sm and above) -->
    <div class="hidden sm:block rounded-xl bg-surface border border-default overflow-hidden shadow-xs">
      <AppTable
        :rows="rows"
        :columns="columns"
        :isLoading="loading"
        :selectable="canAssignLeads || canBulkDeleteLeads"
        :selectedRows="selectedRows"
        row-actions-label="Actions"
        empty-title="No student leads yet"
        empty-subtext="Add an inquiry or import from Excel to get started."
        @selectionChange="handleSelectionChange"
        @rowClick="openDetails"
        @pageChange="handlePageChange"
        @pageSizeChange="handlePageSizeChange"
      >
        <template #cell(student)="{ row }">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-800 dark:text-slate-200">
              {{ row.firstName }} {{ row.lastName }}
            </span>
            <span
              v-if="!row.isAttended && !row.lastActionAt"
              class="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/60 shrink-0"
              title="Unattended: Pending staff contact"
            >
              Unattended
            </span>
          </div>
          <div class="text-slate-500 text-[11px] font-mono">{{ row.mobile }}</div>
          <div v-if="row.schoolName || row.standard" class="text-[10px] text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-0.5 truncate max-w-[15rem]">
            <span v-if="row.schoolName" class="truncate font-semibold text-slate-700 dark:text-slate-300">{{ row.schoolName }}</span>
            <span v-if="row.standard" class="text-[9px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50 shrink-0 font-bold">
              {{ row.standard }}
            </span>
          </div>
        </template>

        <template #cell(parent)="{ row }">
          <div class="text-slate-700 dark:text-slate-300 text-xs">
            {{ row.parentName || "—" }}
          </div>
        </template>


        <template #cell(staff)="{ row }">
          <div v-if="row.assignedTo" class="flex items-center gap-1.5 min-w-0">
            <span
              class="shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase"
            >
              {{ (row.assignedTo.firstName || "?").charAt(0) }}
            </span>
            <span class="truncate text-slate-700 dark:text-slate-300 text-xs">
              {{ row.assignedTo.firstName }} {{ row.assignedTo.lastName || "" }}
            </span>
          </div>
          <span v-else class="text-[11px] text-slate-400 italic">Unassigned</span>
        </template>

        <template #cell(status)="{ row }">
          <button
            type="button"
            @click.stop="openStatusModal(row)"
            class="inline-flex items-center transition-transform hover:scale-[1.02] text-left cursor-pointer"
            title="Click to update status & sub-status"
          >
            <StatusBadge :status="row.status" :subStatus="row.subStatus" />
          </button>
        </template>

        <template #rowActions="{ row }">
          <!-- Single 3-Dots Action Menu Trigger -->
          <button
            type="button"
            @click.stop="toggleActionMenu(row, $event)"
            title="Actions"
            class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            :class="{ 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200': activeMenuRowId === (row._id || row.id) }"
          >
            <PhDotsThreeVertical :size="18" weight="bold" />
          </button>
        </template>
      </AppTable>
    </div>

    <!-- Mobile Card View (< 640px) -->
    <div class="block sm:hidden space-y-3">
      <!-- Loading Skeleton for Mobile -->
      <div v-if="loading" class="py-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-3">
        <AppSpinner size="md" color="primary" text="Loading student leads..." vertical />
      </div>

      <!-- Empty State for Mobile -->
      <div v-else-if="rows.length === 0" class="py-16 text-center space-y-3">
        <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-400 flex items-center justify-center mx-auto">
          <PhUserPlus :size="28" />
        </div>
        <div>
          <p class="font-bold text-slate-800 text-base">No student leads yet</p>
          <p class="text-sm text-slate-400 mt-1">Tap the + button to add your first lead.</p>
        </div>
      </div>

      <!-- Mobile Cards Feed Container -->
      <template v-else>
        <!-- Mobile Bulk Select & Total Counter Bar (< 640px) -->
        <div
          v-if="canAssignLeads || canBulkDeleteLeads"
          class="flex items-center justify-between px-3 py-2.5 bg-surface rounded-xl border border-default text-xs shadow-2xs"
        >
          <label class="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200 select-none active:opacity-75">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
              class="w-4.5 h-4.5 rounded text-primary border-slate-300 dark:border-neutral-700 focus:ring-primary cursor-pointer shrink-0"
            />
            <span>{{ isAllSelected ? 'Deselect All' : `Select All (${rows.length})` }}</span>
          </label>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {{ pagination.total || rows.length }} leads
          </span>
        </div>

        <!-- Lead Cards Feed -->
        <div
          v-for="row in rows"
        :key="row._id || row.id"
        @click="openDetails(row)"
        class="bg-white dark:bg-neutral-900 rounded-2xl border transition-all cursor-pointer p-4 space-y-3 active:scale-[0.99]"
        :class="isRowSelected(row)
          ? 'border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/15 dark:bg-indigo-950/20 shadow-md'
          : 'border-slate-200/80 dark:border-neutral-800 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'"
      >
        <!-- Header: Selection Checkbox + Student Name + Status Badge -->
        <div class="flex items-start justify-between gap-2.5">
          <div class="flex items-start gap-2.5 min-w-0 flex-1">
            <input
              v-if="canAssignLeads || canBulkDeleteLeads"
              type="checkbox"
              :checked="isRowSelected(row)"
              @click.stop="toggleRowSelection(row)"
              class="w-4.5 h-4.5 mt-0.5 rounded text-indigo-600 border-slate-300 dark:border-neutral-700 focus:ring-indigo-500 cursor-pointer shrink-0"
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight leading-snug break-words">
                  {{ row.firstName }} {{ row.lastName || '' }}
                </h3>
                <span
                  v-if="!row.isAttended && !row.lastActionAt"
                  class="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/60 shrink-0"
                  title="Unattended: Pending staff contact"
                >
                  Unattended
                </span>
              </div>
              <!-- Phone & Standard tags directly below name -->
              <div class="flex items-center flex-wrap gap-2 mt-1">
                <a
                  v-if="row.mobile"
                  :href="'tel:' + row.mobile"
                  @click.stop
                  class="inline-flex items-center gap-1 text-xs font-mono font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <PhPhone :size="12" weight="bold" />
                  <span>{{ row.mobile }}</span>
                </a>
                <span
                  v-if="row.standard"
                  class="text-[9px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50 shrink-0 font-bold"
                >
                  {{ row.standard }}
                </span>
              </div>
            </div>
          </div>

          <!-- Capsule Status Badge (Tap to update) -->
          <button
            type="button"
            @click.stop="openStatusModal(row)"
            class="shrink-0 active:scale-95 transition-transform"
            title="Tap to update status"
          >
            <StatusBadge :status="row.status" :subStatus="row.subStatus" />
          </button>
        </div>

        <!-- Metadata Grid: Parent & Assigned Staff -->
        <div class="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-slate-100 dark:border-neutral-800 text-xs">
          <div class="min-w-0">
            <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">Parent</span>
            <span class="font-semibold text-slate-700 dark:text-slate-200 truncate block text-[12px] mt-0.5">
              {{ row.parentName || '—' }}
            </span>
          </div>
          <div class="min-w-0">
            <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">Assigned Staff</span>
            <span class="font-semibold text-slate-700 dark:text-slate-200 truncate block text-[12px] mt-0.5">
              {{ row.assignedTo ? `${row.assignedTo.firstName || ''} ${row.assignedTo.lastName || ''}`.trim() : 'Unassigned' }}
            </span>
          </div>
        </div>

        <!-- Touch Action Row (Harmonious balanced styling) -->
        <div class="flex items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-neutral-800" @click.stop>
          <a
            v-if="row.mobile"
            :href="'tel:' + row.mobile"
            class="flex-1 h-9 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-neutral-700 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <PhPhoneCall :size="14" weight="bold" class="text-blue-600 dark:text-blue-400" />
            <span>Call</span>
          </a>
          <a
            v-if="row.mobile"
            :href="getWhatsAppUrl(row.mobile)"
            target="_blank"
            rel="noopener noreferrer"
            class="flex-1 h-9 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 border border-slate-200/80 dark:border-neutral-700 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <PhWhatsappLogo :size="15" weight="fill" class="text-emerald-600 dark:text-emerald-400" />
            <span>WhatsApp</span>
          </a>
          <button
            type="button"
            @click="openStatusModal(row)"
            class="flex-1 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/90 dark:border-indigo-800/60 flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-[0.98]"
          >
            <PhArrowsClockwise :size="14" weight="bold" class="text-indigo-600 dark:text-indigo-400" />
            <span>Status</span>
          </button>
          <button
            type="button"
            @click="toggleActionMenu(row, $event)"
            class="w-9 h-9 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-neutral-700 flex items-center justify-center transition-all active:scale-[0.98] shrink-0"
            title="More actions"
          >
            <PhDotsThreeVertical :size="16" weight="bold" />
          </button>
        </div>
      </div>
      </template>

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

    <!-- Floating 3-Dots Action Dropdown Menu -->
    <Teleport to="body">
      <div
        v-if="activeMenuRowId"
        class="fixed inset-0 z-[1000]"
        @click="closeActionMenu"
      >
        <div
          class="fixed w-52 rounded-xl bg-surface border border-default shadow-xl p-1.5 z-[1001] text-xs space-y-0.5"
          :style="{
            top: menuPosition.top,
            bottom: menuPosition.bottom,
            right: menuPosition.right,
          }"
          @click.stop
        >
          <!-- 1. View Details -->
          <button
            type="button"
            @click="handleView(activeMenuRow)"
            class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors font-medium rounded-lg"
          >
            <PhEye :size="15" weight="bold" class="text-indigo-600" />
            <span>View Details</span>
          </button>

          <!-- 2. Update Status (Maglo selector) -->
          <button
            type="button"
            @click="handleUpdateStatus(activeMenuRow)"
            class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors font-medium rounded-lg"
          >
            <PhArrowsClockwise :size="15" weight="bold" class="text-blue-600" />
            <span>Update Status</span>
          </button>

          <!-- 3. Edit Lead -->
          <button
            v-if="canEditLead"
            type="button"
            @click="handleEdit(activeMenuRow)"
            class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors font-medium rounded-lg"
          >
            <PhPencilSimple :size="15" weight="bold" class="text-blue-600" />
            <span>Edit Lead</span>
          </button>

          <!-- 4. Assign Staff -->
          <button
            v-if="canAssignLeads"
            type="button"
            @click="handleAssign(activeMenuRow)"
            class="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 transition-colors font-medium rounded-lg"
          >
            <PhUserPlus :size="15" weight="bold" class="text-purple-600" />
            <span>Assign Staff</span>
          </button>

          <!-- 6. Delete Lead (Destructive) -->
          <template v-if="canDeleteLeads">
            <div class="my-1 border-t border-slate-100 dark:border-slate-800"></div>
            <button
              type="button"
              @click="handleDelete(activeMenuRow)"
              class="w-full px-3 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 transition-colors font-medium rounded-lg"
            >
              <PhTrash :size="15" weight="bold" />
              <span>Delete</span>
            </button>
          </template>
        </div>
      </div>
    </Teleport>

    <!-- Student Details & Conversation History Drawer (Read-Only View) -->
    <EducationLeadDrawer
      :isOpen="isDetailsOpen"
      :leadId="activeLeadId"
      @close="isDetailsOpen = false"
      @updated="load"
    />

    <!-- Edit Student Lead Drawer (Strictly Editing) -->
    <EducationLeadEditDrawer
      :isOpen="isEditOpen"
      :leadId="activeEditLeadId"
      @close="isEditOpen = false"
      @success="handleEditSuccess"
    />

    <!-- Set Follow-up Reminder Modal (Strictly Setting Reminder) -->
    <EducationLeadReminderModal
      :isOpen="isReminderOpen"
      :lead="activeReminderLead"
      @close="isReminderOpen = false"
      @success="handleReminderSuccess"
    />

    <!-- Assign Modal -->
    <LeadAssignModal
      :isOpen="isAssignOpen"
      :leadIds="targetAssignIds"
      :initialMode="assignModalMode"
      staff-mode
      @close="isAssignOpen = false"
      @success="handleAssignSuccess"
    />

    <!-- Right-Side Modal Drawer: Add Student Lead -->
    <AppDrawer
      :isOpen="showModal"
      title="Add Student Lead"
      subtitle="Capture inquiry details, school, standard, and course interest"
      width="540px"
      @close="showModal = false"
    >
      <form id="lead-form" class="space-y-4 text-xs" @submit.prevent="save">
        <p
          v-if="error"
          class="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900"
        >
          {{ error }}
        </p>
        <div class="modal-form-grid">
          <div class="modal-form-group">
            <label class="modal-form-label">First name <span class="required-star">*</span></label>
            <input
              v-model="form.firstName"
              required
              placeholder="e.g. Aarav"
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Last name</label>
            <input
              v-model="form.lastName"
              placeholder="e.g. Sharma"
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Primary Mobile <span class="required-star">*</span></label>
            <input
              v-model="form.mobile"
              required
              placeholder="e.g. 9876543210"
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Alternate Phone</label>
            <input
              v-model="form.alternativeMobile"
              placeholder="e.g. 9876543299"
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group col-span-full">
            <label class="modal-form-label">School Name <span class="required-star">*</span></label>
            <input
              v-model="form.schoolName"
              required
              placeholder="e.g. Delhi Public School / St. Xavier's"
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Institution Type</label>
            <select
              v-model="form.institutionType"
              class="modal-form-select"
            >
              <option value="">Select Institution Type</option>
              <option value="School">School</option>
              <option value="Private Classes">Private Classes</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Education Board</label>
            <select
              v-model="form.educationBoard"
              class="modal-form-select"
            >
              <option value="">Select Board</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board (SSC)</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Standard / Grade</label>
            <select
              v-model="form.standard"
              class="modal-form-select"
            >
              <option value="">Select Standard / Grade</option>
              <option value="8th SSC">8th SSC</option>
              <option value="8th CBSE">8th CBSE</option>
              <option value="8th ICSE">8th ICSE</option>
              <option value="9th SSC">9th SSC</option>
              <option value="9th CBSE">9th CBSE</option>
              <option value="9th ICSE">9th ICSE</option>
              <option value="10th SSC">10th SSC</option>
              <option value="10th CBSE">10th CBSE</option>
              <option value="10th ICSE">10th ICSE</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Academic Stream</label>
            <select
              v-model="form.academicStream"
              class="modal-form-select"
            >
              <option value="">Select Stream</option>
              <option value="Science">Science</option>
              <option value="Commerce">Commerce</option>
            </select>
          </div>
          <div class="modal-form-group col-span-full">
            <label class="modal-form-label">Current Coaching / Private Classes</label>
            <input
              v-model="form.currentCoaching"
              placeholder="e.g. Allen, Aakash, Mahesh Tutorials (if enrolled)"
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Inquiry Source</label>
            <select
              v-model="form.source"
              class="modal-form-select"
            >
              <option value="walk_in">Walk-in</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="campus">Campus</option>
              <option value="manual_entry">Manual</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Parent name</label>
            <input
              v-model="form.parentName"
              placeholder="e.g. Rajesh Sharma"
              class="modal-form-input"
            />
          </div>
          <div class="modal-form-group">
            <label class="modal-form-label">Parent mobile</label>
            <input
              v-model="form.parentMobile"
              placeholder="+91 9876543210"
              class="modal-form-input"
            />
          </div>
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="showModal = false"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="lead-form"
          class="btn btn-primary btn-sm"
          :disabled="saving"
        >
          {{ saving ? "Saving..." : "Save Student Lead" }}
        </button>
      </template>
    </AppDrawer>


    <!-- Lead Bulk Upload Modal (Opens from right side) -->
    <LeadBulkUploadModal
      :isOpen="showBulkUpload"
      @close="showBulkUpload = false"
      @success="load"
    />

    <!-- Delete Confirmation Modal (Section 19) -->
    <DeleteConfirmModal
      :isOpen="isDeleteOpen"
      :title="deleteModalTitle"
      :message="deleteModalMessage"
      :itemName="deleteModalItemName"
      :loading="isDeleting"
      @cancel="isDeleteOpen = false; isBulkDelete = false; leadToDelete = null"
      @confirm="confirmDelete"
    />

    <!-- Maglo Status & Sub-Status Modal -->
    <EducationLeadStatusModal
      :isOpen="isStatusModalOpen"
      :lead="activeStatusLead"
      @close="isStatusModalOpen = false"
      @saved="handleStatusModalSaved"
    />

    <!-- Flipkart / Amazon style Multi-Select Filter Modal (Bottom Sheet on Mobile) -->
    <AppModal
      :isOpen="isFilterModalOpen"
      title="Filter Leads"
      subtitle="Refine by multiple lead statuses and assigned staff"
      maxSize="480px"
      @cancel="isFilterModalOpen = false"
    >
      <div class="space-y-5">
        <!-- Status Multi-Select Section -->
        <div>
          <div class="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-neutral-800">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Lead Status ({{ tempStatuses.length }} selected)
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
                :class="statusClass(st.value)"
              >
                {{ st.label }}
              </span>
            </label>
          </div>
        </div>

        <!-- Staff Filter (if admin) -->
        <div v-if="canFilterAllStaff" class="pt-2">
          <div class="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-neutral-800">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Assigned Staff
            </span>
            <button
              v-if="tempStaff"
              type="button"
              @click="tempStaff = ''"
              class="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Clear
            </button>
          </div>

          <select
            v-model="tempStaff"
            class="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">All Staff</option>
            <option v-for="s in staffList" :key="s._id || s.id" :value="s._id || s.id">
              {{ s.firstName }} {{ s.lastName || '' }}
            </option>
          </select>
        </div>

        <!-- Institution Type -->
        <div class="pt-2">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-neutral-800">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Institution Type
            </span>
            <button
              v-if="tempInstitutionType"
              type="button"
              @click="tempInstitutionType = ''"
              class="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Clear
            </button>
          </div>
          <select
            v-model="tempInstitutionType"
            class="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">All Institution Types</option>
            <option v-for="t in availableInstitutionTypes" :key="t.value" :value="t.value">
              {{ t.label }}
            </option>
          </select>
        </div>

        <!-- Education Board -->
        <div class="pt-2">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-neutral-800">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Education Board
            </span>
            <button
              v-if="tempEducationBoard"
              type="button"
              @click="tempEducationBoard = ''"
              class="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Clear
            </button>
          </div>
          <select
            v-model="tempEducationBoard"
            class="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">All Education Boards</option>
            <option v-for="b in availableEducationBoards" :key="b.value" :value="b.value">
              {{ b.label }}
            </option>
          </select>
        </div>

        <!-- Standard / Grade -->
        <div class="pt-2">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-neutral-800">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Standard / Grade
            </span>
            <button
              v-if="tempStandard"
              type="button"
              @click="tempStandard = ''"
              class="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Clear
            </button>
          </div>
          <select
            v-model="tempStandard"
            class="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">All Standards / Grades</option>
            <option v-for="std in availableStandards" :key="std.value" :value="std.value">
              {{ std.label }}
            </option>
          </select>
        </div>

        <!-- Academic Stream -->
        <div class="pt-2">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-neutral-800">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Academic Stream
            </span>
            <button
              v-if="tempAcademicStream"
              type="button"
              @click="tempAcademicStream = ''"
              class="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Clear
            </button>
          </div>
          <select
            v-model="tempAcademicStream"
            class="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">All Academic Streams</option>
            <option v-for="str in availableStreams" :key="str.value" :value="str.value">
              {{ str.label }}
            </option>
          </select>
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
            Apply Filters
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useStore } from "vuex";
import {
  PhFileArrowUp,
  PhCheckCircle,
  PhUserPlus,
  PhEye,
  PhPencilSimple,
  PhBell,
  PhDotsThreeVertical,
  PhPlus,
  PhTrash,
  PhMagnifyingGlass,
  PhArrowsClockwise,
  PhPhone,
  PhPhoneCall,
  PhWhatsappLogo,
  PhUser,
  PhBookOpen,
  PhUsersThree,
  PhX,
  PhSlidersHorizontal,
  PhGraduationCap,
} from "@phosphor-icons/vue";
import AppTable from "@/components/AppTable.vue";
import AppDrawer from "@/components/AppDrawer.vue";
import AppModal from "@/components/AppModal.vue";
import AppSpinner from "@/components/AppSpinner.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.vue";
import EducationLeadDrawer from "../components/EducationLeadDrawer.vue";
import EducationLeadEditDrawer from "../components/EducationLeadEditDrawer.vue";
import EducationLeadReminderModal from "../components/EducationLeadReminderModal.vue";
import EducationLeadStatusModal from "../components/EducationLeadStatusModal.vue";
import LeadAssignModal from "@/modules/leads/components/LeadAssignModal.vue";
import LeadBulkUploadModal from "@/modules/leads/components/LeadBulkUploadModal.vue";
import apiClient from "@/api/client";
import {
  createEducationLead,
  deleteEducationLead,
  fetchEducationLeads,
} from "../api/endpoints";

const store = useStore();
const canCreateLead = computed(() => {
  return Boolean(store.getters["permissions/hasCapability"]?.("leads.create"));
});
const canEditLead = computed(() => {
  return Boolean(store.getters["permissions/hasCapability"]?.("leads.update"));
});
const canDeleteLeads = computed(() => {
  return Boolean(store.getters["permissions/hasCapability"]?.("leads.delete"));
});
const canBulkDeleteLeads = computed(() => {
  return Boolean(
    store.getters["permissions/hasCapability"]?.("leads.bulk_delete") ||
    store.getters["permissions/hasCapability"]?.("leads.delete")
  );
});
const canAssignLeads = computed(() => {
  return Boolean(store.getters["permissions/hasCapability"]?.("leads.assign"));
});
const canBulkUpload = computed(() => {
  return Boolean(store.getters["permissions/hasCapability"]?.("leads.bulk_upload"));
});
// "All staff" filter dropdown should ONLY be visible to elevated roles (admin/manager) who can manage assignments
// Regular staff should NEVER see the "All staff" dropdown!
const canFilterAllStaff = computed(() => {
  const role = String(store.getters["auth/userRole"] || "").toLowerCase();
  const isElevated = [
    "super_admin",
    "system_admin",
    "org_admin",
    "organization_admin",
    "manager",
    "branch_manager",
  ].includes(role);
  return isElevated && canAssignLeads.value;
});

const columns = computed(() => {
  const cols = [
    { key: "student", label: "Student" },
    { key: "parent", label: "Parent" },
  ];
  // Only show "Assigned staff" to admins/managers overseeing staff allocation
  if (canFilterAllStaff.value) {
    cols.push({ key: "staff", label: "Assigned staff" });
  }
  cols.push({ key: "status", label: "Status" });
  return cols;
});

const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 });

function formatStatus(status) {
  return String(status || "new").replace(/_/g, " ");
}

function statusClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "enrolled" || value === "converted") {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40";
  }
  if (value === "new" || value === "assigned") {
    return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40";
  }
  if (value === "contacted") {
    return "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/40";
  }
  if (value === "follow_up") {
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40";
  }
  if (value === "meeting_scheduled" || value === "counseling_scheduled") {
    return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40";
  }
  if (value === "qualified") {
    return "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40";
  }
  if (value === "application_trial") {
    return "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/40";
  }
  if (value === "lost") {
    return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40";
  }
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
}

const selectedRows = ref([]);
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

const isRowSelected = (row) => {
  const rowId = row._id || row.id;
  return selectedRows.value.some((r) => (r._id || r.id) === rowId);
};

const toggleRowSelection = (row) => {
  const rowId = row._id || row.id;
  const idx = selectedRows.value.findIndex((r) => (r._id || r.id) === rowId);
  if (idx >= 0) {
    selectedRows.value.splice(idx, 1);
  } else {
    selectedRows.value.push(row);
  }
};

const isAllSelected = computed(() => {
  if (!rows.value.length) return false;
  return rows.value.every((row) => isRowSelected(row));
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedRows.value = [];
  } else {
    selectedRows.value = [...rows.value];
  }
};

const showBulkUpload = ref(false);

const rows = ref([]);
const loading = ref(false);
const search = ref("");
const statusFilter = ref("");
const staffFilter = ref("");
const sourceFilter = ref("");
const staffList = ref([]);

const institutionTypeFilter = ref("");
const educationBoardFilter = ref("");
const standardFilter = ref("");
const academicStreamFilter = ref("");

const tempInstitutionType = ref("");
const tempEducationBoard = ref("");
const tempStandard = ref("");
const tempAcademicStream = ref("");

const availableInstitutionTypes = [
  { value: "School", label: "School" },
  { value: "Private Classes", label: "Private Classes" },
];

const availableEducationBoards = [
  { value: "CBSE", label: "CBSE" },
  { value: "ICSE", label: "ICSE" },
  { value: "State Board", label: "State Board" },
];

const availableStandards = [
  { value: "8th SSC", label: "8th SSC" },
  { value: "8th CBSE", label: "8th CBSE" },
  { value: "8th ICSE", label: "8th ICSE" },
  { value: "9th SSC", label: "9th SSC" },
  { value: "9th CBSE", label: "9th CBSE" },
  { value: "9th ICSE", label: "9th ICSE" },
  { value: "10th SSC", label: "10th SSC" },
  { value: "10th CBSE", label: "10th CBSE" },
  { value: "10th ICSE", label: "10th ICSE" },
  { value: "Class 11", label: "Class 11" },
  { value: "Class 12", label: "Class 12" },
];

const availableStreams = [
  { value: "Science", label: "Science" },
  { value: "Commerce", label: "Commerce" },
];

const assignModalMode = ref("single");

const availableStatuses = [
  { value: "interested", label: "Interested" },
  { value: "call_back", label: "Call Back" },
  { value: "future_prospect", label: "Future Prospect" },
  { value: "enrolled", label: "Enrolled" },
  { value: "not_interested", label: "Not Interested" },
];

const isFilterModalOpen = ref(false);
const selectedStatuses = ref([]);
const tempStatuses = ref([]);
const tempStaff = ref("");

const activeFilterCount = computed(() => {
  let count = selectedStatuses.value.length;
  if (staffFilter.value) count += 1;
  if (institutionTypeFilter.value) count += 1;
  if (educationBoardFilter.value) count += 1;
  if (standardFilter.value) count += 1;
  if (academicStreamFilter.value) count += 1;
  return count;
});

function openFilterModal() {
  tempStatuses.value = [...selectedStatuses.value];
  tempStaff.value = staffFilter.value;
  tempInstitutionType.value = institutionTypeFilter.value;
  tempEducationBoard.value = educationBoardFilter.value;
  tempStandard.value = standardFilter.value;
  tempAcademicStream.value = academicStreamFilter.value;
  isFilterModalOpen.value = true;
}

function clearFiltersInModal() {
  tempStatuses.value = [];
  tempStaff.value = "";
  tempInstitutionType.value = "";
  tempEducationBoard.value = "";
  tempStandard.value = "";
  tempAcademicStream.value = "";
}

function applyFiltersInModal() {
  selectedStatuses.value = [...tempStatuses.value];
  staffFilter.value = tempStaff.value;
  institutionTypeFilter.value = tempInstitutionType.value;
  educationBoardFilter.value = tempEducationBoard.value;
  standardFilter.value = tempStandard.value;
  academicStreamStreamFilter();
  statusFilter.value = selectedStatuses.value.length === 1 ? selectedStatuses.value[0] : "";
  isFilterModalOpen.value = false;
  onFilterChange();
}

function academicStreamStreamFilter() {
  academicStreamFilter.value = tempAcademicStream.value;
}

function removeStatusFilter(statusVal) {
  selectedStatuses.value = selectedStatuses.value.filter((s) => s !== statusVal);
  statusFilter.value = selectedStatuses.value.length === 1 ? selectedStatuses.value[0] : "";
  onFilterChange();
}

function clearAllFilters() {
  selectedStatuses.value = [];
  statusFilter.value = "";
  staffFilter.value = "";
  institutionTypeFilter.value = "";
  educationBoardFilter.value = "";
  standardFilter.value = "";
  academicStreamFilter.value = "";
  search.value = "";
  onFilterChange();
}

function getStatusLabel(statusVal) {
  const match = availableStatuses.find((s) => s.value === statusVal);
  return match ? match.label : formatStatus(statusVal);
}

function getStaffName(staffId) {
  const match = staffList.value.find((s) => (s._id || s.id) === staffId);
  return match ? `${match.firstName} ${match.lastName ? match.lastName.charAt(0) + '.' : ''}` : "Staff";
}

const showModal = ref(false);
const saving = ref(false);
const error = ref("");
const form = ref({});
const enrollLead = ref(null);
let timer = null;

function getWhatsAppUrl(mobile) {
  if (!mobile) return "#";
  const cleanPhone = String(mobile).replace(/\D/g, "");
  const phone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${phone}`;
}

// Delete confirmation state (Section 19)
const isDeleteOpen = ref(false);
const leadToDelete = ref(null);
const isBulkDelete = ref(false);
const isDeleting = ref(false);

const deleteModalTitle = computed(() => {
  if (isBulkDelete.value) {
    return `Delete ${selectedRows.value.length} Student Leads?`;
  }
  return "Delete Student Lead?";
});

const deleteModalMessage = computed(() => {
  if (isBulkDelete.value) {
    return `Are you sure you want to permanently delete these ${selectedRows.value.length} student leads? This action cannot be undone.`;
  }
  return "This action cannot be undone.";
});

const deleteModalItemName = computed(() => {
  if (isBulkDelete.value) {
    return `${selectedRows.value.length} selected student leads`;
  }
  if (!leadToDelete.value) return "";
  return `${leadToDelete.value.firstName} ${leadToDelete.value.lastName || ""}`.trim();
});

const handleDelete = (row) => {
  closeActionMenu();
  isBulkDelete.value = false;
  leadToDelete.value = row;
  isDeleteOpen.value = true;
};

const openBulkDelete = () => {
  if (selectedRows.value.length === 0) return;
  isBulkDelete.value = true;
  leadToDelete.value = null;
  isDeleteOpen.value = true;
};

const confirmDelete = async () => {
  isDeleting.value = true;
  try {
    if (isBulkDelete.value) {
      const ids = selectedRows.value.map((r) => r._id || r.id);
      await Promise.all(ids.map((id) => deleteEducationLead(id)));
      store.dispatch("notifications/triggerToast", {
        message: `${ids.length} student leads deleted successfully.`,
        type: "success",
      });
      selectedRows.value = [];
    } else if (leadToDelete.value) {
      const targetId = leadToDelete.value._id || leadToDelete.value.id;
      await deleteEducationLead(targetId);
      store.dispatch("notifications/triggerToast", {
        message: "Student lead deleted successfully.",
        type: "success",
      });
      leadToDelete.value = null;
    }
    isDeleteOpen.value = false;
    isBulkDelete.value = false;
    await load();
  } catch (err) {
    store.dispatch("notifications/triggerToast", {
      message: err.data?.message || err.message || "Failed to delete student lead(s).",
      type: "error",
    });
  } finally {
    isDeleting.value = false;
  }
};

// Assignment
const isAssignOpen = ref(false);
const targetAssignIds = ref([]);
const openAssign = (row) => {
  targetAssignIds.value = [row._id || row.id];
  assignModalMode.value = "single";
  isAssignOpen.value = true;
};
const openBulkAssign = () => {
  targetAssignIds.value = selectedRows.value.map((r) => r._id || r.id);
  assignModalMode.value = "single";
  isAssignOpen.value = true;
};
const openRoundRobinAssign = () => {
  targetAssignIds.value = selectedRows.value.map((r) => r._id || r.id);
  assignModalMode.value = "round_robin";
  isAssignOpen.value = true;
};
const handleAssignSuccess = () => {
  selectedRows.value = [];
  load();
};

// Details Drawer (Read-only View)
const isDetailsOpen = ref(false);
const activeLeadId = ref("");
const openDetails = (row) => {
  activeLeadId.value = row._id || row.id;
  isDetailsOpen.value = true;
};
const handleDetailsSuccess = () => {
  load();
};

// 3-Dots Action Dropdown Menu
const activeMenuRowId = ref("");
const activeMenuRow = ref(null);
const menuPosition = ref({ top: "auto", bottom: "auto", right: "0px" });

const toggleActionMenu = (row, event) => {
  const rowId = row._id || row.id;
  if (activeMenuRowId.value === rowId) {
    closeActionMenu();
    return;
  }
  const rect = event.currentTarget.getBoundingClientRect();
  const estimatedMenuHeight = 250;
  const bottomNavHeight = 72;
  const spaceBelow = window.innerHeight - rect.bottom - bottomNavHeight;

  if (spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight) {
    menuPosition.value = {
      top: "auto",
      bottom: `${window.innerHeight - rect.top + 4}px`,
      right: `${Math.max(8, window.innerWidth - rect.right)}px`,
    };
  } else {
    menuPosition.value = {
      top: `${rect.bottom + 4}px`,
      bottom: "auto",
      right: `${Math.max(8, window.innerWidth - rect.right)}px`,
    };
  }
  activeMenuRow.value = row;
  activeMenuRowId.value = rowId;
};

const closeActionMenu = () => {
  activeMenuRowId.value = "";
  activeMenuRow.value = null;
};

// Menu Action Handlers
const isStatusModalOpen = ref(false);
const activeStatusLead = ref(null);

const openStatusModal = (row) => {
  activeStatusLead.value = row;
  isStatusModalOpen.value = true;
};

const handleUpdateStatus = (row) => {
  closeActionMenu();
  openStatusModal(row);
};

const handleStatusModalSaved = () => {
  load();
};

const handleView = (row) => {
  closeActionMenu();
  openDetails(row);
};

const handleEdit = (row) => {
  closeActionMenu();
  openEdit(row);
};

const handleReminder = (row) => {
  closeActionMenu();
  openReminder(row);
};

const handleAssign = (row) => {
  closeActionMenu();
  openAssign(row);
};

// Edit Drawer
const isEditOpen = ref(false);
const activeEditLeadId = ref("");
const openEdit = (row) => {
  activeEditLeadId.value = row._id || row.id;
  isEditOpen.value = true;
};
const handleEditSuccess = () => {
  load();
};

// Reminder Modal
const isReminderOpen = ref(false);
const activeReminderLead = ref(null);
const openReminder = (row) => {
  activeReminderLead.value = row;
  isReminderOpen.value = true;
};
const handleReminderSuccess = () => {
  load();
};

async function load() {
  loading.value = true;
  try {
    const statusParam = selectedStatuses.value.length > 0
      ? selectedStatuses.value.join(",")
      : (statusFilter.value || undefined);

    const res = await fetchEducationLeads({
      search: search.value.trim() || undefined,
      status: statusParam,
      assignedTo: staffFilter.value || undefined,
      source: sourceFilter.value || undefined,
      institutionType: institutionTypeFilter.value || undefined,
      educationBoard: educationBoardFilter.value || undefined,
      standard: standardFilter.value || undefined,
      academicStream: academicStreamFilter.value || undefined,
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

function handlePageChange(page) {
  pagination.value.page = page;
  load();
}

function handlePageSizeChange(limit) {
  pagination.value.limit = limit;
  pagination.value.page = 1;
  load();
}

function onFilterChange() {
  pagination.value.page = 1;
  load();
}

function handleSearch() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    pagination.value.page = 1;
    load();
  }, 300);
}

function openCreate() {
  form.value = {
    firstName: "",
    lastName: "",
    mobile: "",
    alternativeMobile: "",
    schoolName: "",
    institutionType: "",
    educationBoard: "",
    standard: "",
    academicStream: "",
    currentCoaching: "",
    source: "walk_in",
    parentName: "",
    parentMobile: "",
  };
  error.value = "";
  showModal.value = true;
}

async function save() {
  if (!form.value.schoolName?.trim() || !form.value.firstName?.trim() || !form.value.mobile?.trim()) {
    error.value = "Student Name, Primary Mobile, and School Name are mandatory.";
    return;
  }
  saving.value = true;
  error.value = "";
  try {
    await createEducationLead({
      ...form.value,
      firstName: form.value.firstName.trim(),
      mobile: form.value.mobile.trim(),
      schoolName: form.value.schoolName.trim(),
    });
    showModal.value = false;
    await load();
  } catch (err) {
    error.value = err.data?.message || err.message || "Unable to save lead.";
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  try {
    if (canFilterAllStaff.value) {
      const staffRes = await apiClient.get('/users', { params: { limit: 200, status: 'active' }, silent: true, skipErrorToast: true }).catch(() => ({ data: { data: [] } }));
      staffList.value = staffRes.data?.data || [];
    }
  } catch (e) {
    // fallback gracefully
  }
  await load();
});
</script>
