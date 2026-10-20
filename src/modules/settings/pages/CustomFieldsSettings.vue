<template>
  <div class="w-full max-w-full min-w-0 space-y-3 sm:space-y-5 text-xs pb-28 sm:pb-8">
    <!-- Desktop Header (Hidden on mobile to save screen space) -->
    <div class="hidden sm:flex sm:items-center sm:justify-between gap-3 pb-1 border-b border-default">
      <div class="min-w-0">
        <h2 class="font-heading text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 truncate">
          {{ currentObjectLabel }} &mdash; {{ activeView === 'template' ? 'Excel Import Template' : 'Form Fields' }}
        </h2>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          {{ activeView === 'template'
            ? 'Design column headers and configure active spreadsheet attributes for bulk data imports.'
            : 'Configure standard CRM fields and custom attributes for lead and student records.' }}
        </p>
      </div>

      <!-- Desktop Header Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <template v-if="activeView === 'template'">
          <button
            type="button"
            @click="openAddExcelColumnModal"
            class="btn-sm btn-secondary gap-1.5 justify-center shadow-xs text-xs font-semibold"
          >
            <PhPlus :size="14" weight="bold" />
            <span>Add Column</span>
          </button>
          <button
            type="button"
            @click="downloadExcelTemplate"
            class="btn-sm btn-primary gap-1.5 justify-center shadow-xs active:scale-[0.98] transition-transform text-xs font-bold"
          >
            <PhDownloadSimple :size="14" weight="bold" />
            <span>Download .XLSX</span>
          </button>
        </template>
        <button
          v-else
          type="button"
          @click="openCreateDrawer"
          class="btn-sm btn-primary gap-1.5 justify-center shadow-xs active:scale-[0.98] transition-transform text-xs font-bold"
        >
          <PhPlus :size="14" weight="bold" />
          <span>New Custom Field</span>
        </button>
      </div>
    </div>

    <!-- Controls Row 1: Object Selector Tabs + Mobile Inline Action Buttons + Desktop View Switcher -->
    <div class="flex items-center justify-between gap-2">
      <!-- Object Tabs -->
      <div class="flex items-center gap-1 sm:gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-0.5 sm:p-1 rounded-xl border border-default overflow-x-auto scrollbar-none">
        <button
          v-for="obj in OBJECTS"
          :key="obj.key"
          type="button"
          @click="selectObject(obj.key)"
          class="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
          :class="activeObject === obj.key
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'"
        >
          <component :is="obj.icon" :size="14" weight="bold" />
          <span class="hidden sm:inline">{{ obj.label }}</span>
          <span class="sm:hidden">{{ obj.shortLabel }}</span>
          <span
            class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold"
            :class="activeObject === obj.key
              ? 'bg-primary/10 text-primary'
              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'"
          >
            {{ getObjectFieldCount(obj.key) }}
          </span>
        </button>
      </div>

      <!-- Mobile Action Buttons (Compact inline pills) -->
      <div class="flex sm:hidden items-center gap-1.5 shrink-0">
        <template v-if="activeView === 'template'">
          <button
            type="button"
            @click="openAddExcelColumnModal"
            class="h-7 px-2 rounded-lg border border-default bg-surface text-slate-700 dark:text-slate-200 font-semibold text-[11px] flex items-center gap-1 shadow-xs active:scale-95 transition-all"
            title="Add Column"
          >
            <PhPlus :size="12" weight="bold" />
            <span>Column</span>
          </button>
          <button
            type="button"
            @click="downloadExcelTemplate"
            class="h-7 px-2.5 rounded-lg bg-primary text-white font-bold text-[11px] flex items-center gap-1 shadow-xs active:scale-95 transition-all"
            title="Download Template"
          >
            <PhDownloadSimple :size="12" weight="bold" />
            <span>.XLSX</span>
          </button>
        </template>
        <button
          v-else
          type="button"
          @click="openCreateDrawer"
          class="h-7 px-2.5 rounded-lg bg-primary text-white font-bold text-[11px] flex items-center gap-1 shadow-xs active:scale-95 transition-all"
        >
          <PhPlus :size="12" weight="bold" />
          <span>New Field</span>
        </button>
      </div>

      <!-- Desktop View Switcher (Segmented Pill) -->
      <div class="hidden sm:flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-default shrink-0">
        <button
          type="button"
          @click="selectView('fields')"
          class="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all"
          :class="activeView === 'fields'
            ? 'bg-white dark:bg-slate-700 text-primary shadow-xs'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
        >
          <PhSlidersHorizontal :size="13" weight="bold" />
          <span>Form Fields</span>
        </button>
        <button
          type="button"
          @click="selectView('template')"
          class="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all"
          :class="activeView === 'template'
            ? 'bg-white dark:bg-slate-700 text-primary shadow-xs'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
        >
          <PhFileXls :size="13" weight="bold" />
          <span>Excel Template</span>
        </button>
      </div>
    </div>

    <!-- Mobile-only View Switcher (Slim full-width segmented control) -->
    <div class="flex sm:hidden items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-default">
      <button
        type="button"
        @click="selectView('fields')"
        class="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all"
        :class="activeView === 'fields'
          ? 'bg-white dark:bg-slate-700 text-primary shadow-xs'
          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
      >
        <PhSlidersHorizontal :size="13" weight="bold" />
        <span>Form Fields</span>
      </button>
      <button
        type="button"
        @click="selectView('template')"
        class="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all"
        :class="activeView === 'template'
          ? 'bg-white dark:bg-slate-700 text-primary shadow-xs'
          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
      >
        <PhFileXls :size="13" weight="bold" />
        <span>Excel Template</span>
      </button>
    </div>

    <!-- ===================================================================== -->
    <!-- VIEW A: EXCEL IMPORT TEMPLATES TAB                                    -->
    <!-- ===================================================================== -->
    <template v-if="activeView === 'template'">
      <!-- Summary Strip for Excel Templates (with integrated Select All & Reset) -->
      <div class="flex items-center justify-between px-1 text-[11px] text-slate-500 font-medium">
        <div class="flex items-center gap-1.5">
          <span>{{ enabledExcelColumnsCount }} of {{ currentExcelColumns.length }} enabled</span>
          <span class="hidden sm:inline text-purple-600 dark:text-purple-400 font-semibold">({{ customExcelColumnsCount }} custom)</span>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <button
            type="button"
            @click="selectAllExcelColumns"
            class="text-primary hover:underline font-semibold"
            title="Enable all columns in template"
          >
            Select All
          </button>
          <span class="text-slate-300 dark:text-slate-600">&bull;</span>
          <button
            type="button"
            @click="resetExcelColumnsToDefault"
            class="text-slate-600 dark:text-slate-400 hover:underline font-semibold"
            title="Restore standard column titles"
          >
            Reset Headers
          </button>
        </div>
      </div>

      <!-- Main Container for Excel Templates -->
      <div class="bg-transparent sm:bg-surface border-0 sm:border border-default rounded-none sm:rounded-xl p-0 sm:p-5 shadow-none sm:shadow-sm space-y-3 sm:space-y-4">
        <!-- Toolbar: Filters & Search -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <!-- Filter Tabs -->
          <div class="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-800 rounded-lg border border-default text-xs font-semibold overflow-x-auto scrollbar-none w-full sm:w-auto">
            <button
              type="button"
              @click="excelCategoryFilter = 'all'"
              class="px-2.5 py-1 rounded-md transition-all whitespace-nowrap text-xs"
              :class="excelCategoryFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'"
            >
              All ({{ currentExcelColumns.length }})
            </button>
            <button
              type="button"
              @click="excelCategoryFilter = 'standard'"
              class="px-2.5 py-1 rounded-md transition-all whitespace-nowrap text-xs"
              :class="excelCategoryFilter === 'standard'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'"
            >
              Standard ({{ standardExcelColumnsCount }})
            </button>
            <button
              type="button"
              @click="excelCategoryFilter = 'custom'"
              class="px-2.5 py-1 rounded-md transition-all whitespace-nowrap text-xs"
              :class="excelCategoryFilter === 'custom'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'"
            >
              Custom ({{ customAttributesCount }})
            </button>
            <button
              type="button"
              @click="excelCategoryFilter = 'added'"
              class="px-2.5 py-1 rounded-md transition-all whitespace-nowrap text-xs"
              :class="excelCategoryFilter === 'added'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'"
            >
              Added ({{ userAddedColumnsCount }})
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative w-full sm:w-60">
            <input
              v-model="excelSearchQuery"
              type="text"
              placeholder="Search template headers..."
              class="w-full bg-white dark:bg-slate-900 sm:bg-surface border border-default rounded-lg pl-8 pr-7 py-1.5 sm:py-2 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
            <PhMagnifyingGlass :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <!-- Desktop Template Columns Table (>= 768px) -->
        <div class="hidden md:block rounded-xl border border-default overflow-hidden bg-white dark:bg-slate-900">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-850 border-b border-default text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th class="p-3 w-14 text-center">Include</th>
                <th class="p-3">Column Header in Excel</th>
                <th class="p-3">Mapped Attribute Key</th>
                <th class="p-3">Attribute Type</th>
                <th class="p-3 text-center">Required Status</th>
                <th class="p-3">Sample Value</th>
                <th class="p-3 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr
                v-for="(col, idx) in filteredExcelColumns"
                :key="col.key || idx"
                class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <!-- Include Toggle Checkbox -->
                <td class="p-3 text-center">
                  <input
                    v-model="col.enabled"
                    type="checkbox"
                    :disabled="col.isLockedRequired"
                    @change="persistExcelColumns"
                    class="rounded text-primary focus:ring-primary w-4 h-4 disabled:opacity-50 cursor-pointer"
                  />
                </td>

                <!-- Editable Header Name -->
                <td class="p-3">
                  <div class="flex items-center gap-1.5 max-w-sm">
                    <input
                      v-model="col.header"
                      type="text"
                      @input="persistExcelColumns"
                      class="bg-surface border border-default focus:border-primary rounded px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-100 w-full outline-none transition-colors"
                      placeholder="Column header"
                    />
                    <span
                      v-if="col.isLockedRequired"
                      class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 shrink-0 uppercase"
                    >
                      Required
                    </span>
                  </div>
                </td>

                <!-- Mapped Field Key -->
                <td class="p-3">
                  <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-default rounded text-[11px] font-mono font-semibold">
                    {{ col.key }}
                  </span>
                </td>

                <!-- Attribute Type Badge -->
                <td class="p-3">
                  <span
                    v-if="col.isCustomField"
                    class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50 uppercase tracking-wide"
                  >
                    Custom Attribute
                  </span>
                  <span
                    v-else-if="col.isUserAdded"
                    class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 uppercase tracking-wide"
                  >
                    Added Column
                  </span>
                  <span
                    v-else
                    class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-default uppercase tracking-wide"
                  >
                    Standard
                  </span>
                </td>

                <!-- Required Toggle -->
                <td class="p-3 text-center">
                  <span
                    v-if="col.isLockedRequired"
                    class="px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 rounded text-[10px] font-bold"
                  >
                    Required
                  </span>
                  <label v-else-if="col.isUserAdded" class="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      v-model="col.required"
                      type="checkbox"
                      @change="persistExcelColumns"
                      class="rounded text-primary focus:ring-primary w-3.5 h-3.5"
                    />
                    <span class="text-[10px] text-slate-500">{{ col.required ? 'Required' : 'Optional' }}</span>
                  </label>
                  <span v-else class="text-[10px] text-slate-400">
                    {{ col.required ? 'Required' : 'Optional' }}
                  </span>
                </td>

                <!-- Sample Value Preview -->
                <td class="p-3 text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-xs">
                  {{ col.sample || '—' }}
                </td>

                <!-- Actions: Edit Pencil for every column, Trash for custom/added, Lock for standard delete -->
                <td class="p-3 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      @click="openEditExcelColumn(col)"
                      title="Edit column & samples"
                      class="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <PhPencilSimple :size="14" />
                    </button>
                    <button
                      v-if="col.isUserAdded || col.isCustomField"
                      type="button"
                      @click="removeExcelColumn(col)"
                      class="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 transition-colors"
                      title="Remove column"
                    >
                      <PhTrash :size="14" />
                    </button>
                    <span
                      v-else
                      class="text-slate-300 dark:text-slate-600 p-1"
                      title="Standard CRM field"
                    >
                      <PhLockSimple :size="13" />
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Clean Streamlined Card List (< 768px) -->
        <div class="block md:hidden bg-white dark:bg-slate-900 rounded-xl border border-default divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-xs">
          <div
            v-for="(col, idx) in filteredExcelColumns"
            :key="col.key || idx"
            class="p-3 sm:p-3.5 flex flex-col gap-2 transition-colors"
            :class="col.enabled ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/70 dark:bg-slate-850/40 opacity-70'"
          >
            <!-- Row 1: Checkbox + Editable Header + Remove/Lock Action -->
            <div class="flex items-center gap-2.5">
              <input
                v-model="col.enabled"
                type="checkbox"
                :disabled="col.isLockedRequired"
                @change="persistExcelColumns"
                class="rounded text-primary focus:ring-primary w-4 h-4 disabled:opacity-50 cursor-pointer shrink-0"
              />
              <div class="relative flex-1 min-w-0">
                <input
                  v-model="col.header"
                  type="text"
                  @input="persistExcelColumns"
                  class="bg-surface border border-default focus:border-primary rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 w-full outline-none transition-colors"
                  placeholder="Column header"
                />
              </div>
              <button
                type="button"
                @click="openEditExcelColumn(col)"
                class="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
                title="Edit column properties"
              >
                <PhPencilSimple :size="15" />
              </button>
              <button
                v-if="col.isUserAdded || col.isCustomField"
                type="button"
                @click="removeExcelColumn(col)"
                class="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-red-500 transition-colors shrink-0"
                title="Remove custom column"
              >
                <PhTrash :size="15" />
              </button>
              <span
                v-else-if="col.isLockedRequired"
                class="p-1 text-slate-300 dark:text-slate-600 shrink-0"
                title="Locked required field"
              >
                <PhLockSimple :size="14" />
              </span>
            </div>

            <!-- Row 2: Badges and Key Metadata -->
            <div class="flex items-center justify-between text-[11px] gap-2 pt-0.5 pl-6.5">
              <div class="flex items-center gap-1.5 flex-wrap min-w-0">
                <span class="font-mono text-[10px] text-slate-600 dark:text-slate-300 font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 border border-default">
                  {{ col.key }}
                </span>
                <span
                  v-if="col.isLockedRequired"
                  class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60"
                >
                  Required
                </span>
                <span
                  v-else-if="col.isCustomField"
                  class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50 uppercase"
                >
                  Custom
                </span>
                <span
                  v-else-if="col.isUserAdded"
                  class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 uppercase"
                >
                  Added
                </span>
                <span
                  v-else
                  class="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                >
                  Standard
                </span>
              </div>

              <!-- Sample value -->
              <span v-if="col.sample" class="text-[10px] text-slate-400 truncate max-w-[120px]">
                {{ col.sample }}
              </span>
            </div>
          </div>
        </div>

        <!-- Information & Integration Banner -->
        <div class="p-3.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 rounded-xl flex items-start gap-3 text-[11px] text-blue-900 dark:text-blue-200">
          <PhInfo :size="18" class="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" weight="bold" />
          <div class="space-y-1">
            <span class="font-bold block">How Template Customization Works</span>
            <p class="text-blue-800 dark:text-blue-300 leading-relaxed">
              Column headers customized here are automatically applied when downloading bulk templates and recognized during Excel uploads. Any extra columns present in uploaded spreadsheets will be safely captured under Custom Attributes for that record.
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- ===================================================================== -->
    <!-- VIEW B: OBJECT MANAGER FIELDS LIST (LEADS / STUDENTS)                 -->
    <!-- ===================================================================== -->
    <template v-else>
      <!-- Summary Strip for Form Fields -->
      <div class="flex items-center justify-between px-1 text-[11px] text-slate-500 font-medium">
        <span>{{ currentModuleFields.length }} fields ({{ standardCount }} standard, {{ customCount }} custom)</span>
        <span v-if="requiredCount > 0" class="text-amber-600 dark:text-amber-400 font-semibold">{{ requiredCount }} required</span>
      </div>

      <!-- Main Content Container (No double-box border on mobile) -->
      <div class="bg-transparent sm:bg-surface border-0 sm:border border-default rounded-none sm:rounded-xl p-0 sm:p-5 shadow-none sm:shadow-sm space-y-3 sm:space-y-4">
        <!-- Toolbar: Category filter & Search -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <!-- Category Filter Tabs -->
          <div class="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-800 rounded-lg border border-default text-xs font-semibold overflow-x-auto scrollbar-none">
            <button
              type="button"
              @click="categoryFilter = 'all'"
              class="px-2.5 py-1 rounded-md transition-all whitespace-nowrap text-xs"
              :class="categoryFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'"
            >
              All ({{ currentModuleFields.length }})
            </button>
            <button
              type="button"
              @click="categoryFilter = 'standard'"
              class="px-2.5 py-1 rounded-md transition-all whitespace-nowrap text-xs"
              :class="categoryFilter === 'standard'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'"
            >
              Standard ({{ standardCount }})
            </button>
            <button
              type="button"
              @click="categoryFilter = 'custom'"
              class="px-2.5 py-1 rounded-md transition-all whitespace-nowrap text-xs"
              :class="categoryFilter === 'custom'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'"
            >
              Custom ({{ customCount }})
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative w-full sm:w-64">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search fields by label or key..."
              class="w-full bg-white dark:bg-slate-900 sm:bg-surface border border-default rounded-lg pl-8 pr-7 py-2 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
            <PhMagnifyingGlass :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <!-- 1. Desktop Clean Table (>= 768px) -->
        <div v-if="filteredFields.length > 0" class="hidden md:block rounded-xl border border-default overflow-hidden bg-white dark:bg-slate-900">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-850 border-b border-default text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th class="p-3">Field Label</th>
                <th class="p-3">API Field Key</th>
                <th class="p-3">Data Type</th>
                <th class="p-3">Options / Values</th>
                <th class="p-3 text-center">Required</th>
                <th class="p-3 text-center">Status</th>
                <th class="p-3 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr
                v-for="field in filteredFields"
                :key="field._id || field.key"
                class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <!-- Label & Badge -->
                <td class="p-3">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-800 dark:text-slate-100 text-[13px]">
                      {{ field.label }}
                    </span>
                    <span
                      v-if="!field.isStandard"
                      class="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 tracking-wide uppercase"
                    >
                      Custom
                    </span>
                  </div>
                  <div v-if="field.helpText || field.placeholder" class="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    {{ field.helpText || field.placeholder }}
                  </div>
                </td>

                <!-- Key -->
                <td class="p-3">
                  <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-default rounded text-[11px] font-mono font-semibold">
                    {{ field.key }}
                  </span>
                </td>

                <!-- Type -->
                <td class="p-3">
                  <span
                    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold"
                    :class="field.type === 'select'
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/50'"
                  >
                    <component :is="field.type === 'select' ? PhListBullets : PhTextT" :size="12" weight="bold" />
                    <span>{{ field.type === 'select' ? 'Dropdown (Select)' : 'Text Input' }}</span>
                  </span>
                </td>

                <!-- Options -->
                <td class="p-3 text-slate-600 dark:text-slate-400">
                  <template v-if="field.type === 'select' && getFieldOptions(field).length">
                    <div class="flex flex-wrap gap-1 max-w-xs">
                      <span
                        v-for="(opt, idx) in getFieldOptions(field).slice(0, 3)"
                        :key="idx"
                        class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-700 dark:text-slate-300 border border-default"
                      >
                        {{ getOptionLabel(opt) }}
                      </span>
                      <span
                        v-if="getFieldOptions(field).length > 3"
                        class="text-[10px] text-slate-400 self-center font-semibold"
                      >
                        +{{ getFieldOptions(field).length - 3 }} more
                      </span>
                    </div>
                  </template>
                  <span v-else-if="field.type === 'select'" class="text-amber-500 italic text-[11px]">No options configured</span>
                  <span v-else class="text-slate-400 italic text-[11px]">Freeform text</span>
                </td>

                <!-- Required Badge -->
                <td class="p-3 text-center">
                  <span
                    v-if="field.required"
                    class="px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 rounded text-[10px] font-bold"
                  >
                    Required
                  </span>
                  <span
                    v-else
                    class="px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-default rounded text-[10px]"
                  >
                    Optional
                  </span>
                </td>

                <!-- Status -->
                <td class="p-3 text-center">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold"
                    :class="field.isActive !== false
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-default'"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="field.isActive !== false ? 'bg-emerald-500' : 'bg-slate-400'"
                    ></span>
                    <span>{{ field.isActive !== false ? 'Active' : 'Inactive' }}</span>
                  </span>
                </td>

                <!-- Actions -->
                <td class="p-3 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      @click="openEditDrawer(field)"
                      title="Edit field & choices"
                      class="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <PhPencilSimple :size="14" />
                    </button>
                    <button
                      v-if="!field.isStandard && !field.isSystemLocked"
                      type="button"
                      @click="openDeleteDialog(field)"
                      title="Delete custom field"
                      class="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <PhTrash :size="14" />
                    </button>
                    <span
                      v-else
                      class="text-slate-300 dark:text-slate-600 p-1"
                      title="Default system field"
                    >
                      <PhLockSimple :size="13" />
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 2. Mobile Clean Streamlined List (< 768px) -->
        <div v-if="filteredFields.length > 0" class="block md:hidden bg-white dark:bg-slate-900 rounded-xl border border-default divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-xs">
          <div
            v-for="field in filteredFields"
            :key="field._id || field.key"
            class="p-3 flex flex-col gap-1.5 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
          >
            <!-- Row 1: Label, Custom/Standard Tag & Required Indicator -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="font-bold text-slate-850 dark:text-slate-100 text-[13px] truncate">
                  {{ field.label }}
                </span>
                <span
                  v-if="!field.isStandard"
                  class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 shrink-0 uppercase tracking-wider"
                >
                  Custom
                </span>
                <span
                  v-else
                  class="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 shrink-0"
                >
                  Standard
                </span>
              </div>

              <!-- Required vs Optional -->
              <div class="shrink-0">
                <span
                  v-if="field.required"
                  class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60"
                >
                  Required
                </span>
                <span
                  v-else
                  class="text-[10px] text-slate-400 font-normal"
                >
                  Optional
                </span>
              </div>
            </div>

            <!-- Row 2: Metadata (Key, Type, Active) & Actions -->
            <div class="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
                <span class="font-mono text-[10px] text-slate-600 dark:text-slate-300 font-semibold px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
                  {{ field.key }}
                </span>
                <span class="text-slate-300 dark:text-slate-600">·</span>
                <span class="inline-flex items-center gap-1 text-[11px]">
                  <component :is="field.type === 'select' ? PhListBullets : PhTextT" :size="11" />
                  <span>{{ field.type === 'select' ? `Dropdown (${getFieldOptions(field).length})` : 'Text' }}</span>
                </span>
                <template v-if="!field.isStandard">
                  <span class="text-slate-300 dark:text-slate-600">·</span>
                  <span
                    class="inline-flex items-center gap-1 text-[10px] font-medium"
                    :class="field.isActive !== false ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="field.isActive !== false ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                    {{ field.isActive !== false ? 'Active' : 'Inactive' }}
                  </span>
                </template>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  @click="openEditDrawer(field)"
                  class="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Edit field & choices"
                >
                  <PhPencilSimple :size="14" />
                </button>
                <button
                  v-if="!field.isStandard && !field.isSystemLocked"
                  type="button"
                  @click="openDeleteDialog(field)"
                  class="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 transition-colors"
                  title="Delete custom field"
                >
                  <PhTrash :size="14" />
                </button>
                <span
                  v-else
                  class="text-slate-300 dark:text-slate-600 p-0.5"
                  title="Default system field"
                >
                  <PhLockSimple :size="12" />
                </span>
              </div>
            </div>

            <!-- Row 3 (optional): Options preview for select dropdowns -->
            <div
              v-if="field.type === 'select' && getFieldOptions(field).length"
              class="flex items-center gap-1 flex-wrap pt-0.5"
            >
              <span
                v-for="(opt, idx) in getFieldOptions(field).slice(0, 3)"
                :key="idx"
                class="px-1.5 py-0.2 bg-slate-50 dark:bg-slate-800/80 rounded text-[9px] text-slate-600 dark:text-slate-300 border border-default"
              >
                {{ getOptionLabel(opt) }}
              </span>
              <span v-if="getFieldOptions(field).length > 3" class="text-[9px] text-slate-400 font-semibold">
                +{{ getFieldOptions(field).length - 3 }} more
              </span>
            </div>
          </div>
        </div>

        <!-- Empty State for Fields -->
        <div
          v-else
          class="py-12 px-4 text-center rounded-xl border border-dashed border-default bg-slate-50/50 dark:bg-slate-850/30 space-y-3"
        >
          <div class="w-12 h-12 mx-auto rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <PhSlidersHorizontal :size="24" weight="bold" />
          </div>
          <div class="max-w-md mx-auto space-y-1">
            <h3 class="font-heading text-sm font-bold text-slate-800 dark:text-slate-200">
              {{ categoryFilter === 'custom' ? `No Custom Fields for ${currentObjectLabel}` : `No Fields Matching Query` }}
            </h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              {{ categoryFilter === 'custom'
                ? 'Create custom attributes like Parent Profession, Target Exam, Scholarship Category, or Previous School.'
                : 'Try searching with a different term or clear the filter.' }}
            </p>
          </div>
          <div v-if="categoryFilter === 'custom'">
            <button
              type="button"
              @click="openCreateDrawer"
              class="btn-md btn-primary gap-1.5 text-xs font-semibold w-full sm:w-auto"
            >
              <PhPlus :size="14" weight="bold" />
              <span>Create First Custom Field</span>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ===================================================================== -->
    <!-- MODAL 1: CREATE / EDIT CUSTOM FIELD DRAWER                            -->
    <!-- ===================================================================== -->
    <AppDrawer
      :isOpen="isDrawerOpen"
      :title="editingField ? 'Edit Custom Field' : 'Create Custom Field'"
      :subtitle="editingField ? `Editing field for ${currentObjectLabel}` : `Add a new attribute to ${currentObjectLabel}`"
      width="500px"
      @close="closeDrawer"
    >
      <form id="custom-field-form" @submit.prevent="onSaveField" class="space-y-4 text-xs">
        <p
          v-if="formError"
          class="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900"
        >
          {{ formError }}
        </p>

        <!-- Target Object Selector -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Object</label>
          <select
            v-model="fieldForm.module"
            :disabled="!!editingField"
            class="w-full bg-surface border border-default rounded-lg px-3 py-2 outline-none focus:border-primary text-slate-800 dark:text-slate-200 font-semibold disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
          >
            <option v-for="obj in OBJECTS" :key="obj.key" :value="obj.key">
              {{ obj.label }}
            </option>
          </select>
        </div>

        <!-- Field Label -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            Field Label <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="fieldForm.label"
            type="text"
            required
            placeholder="e.g. Parent Profession / Target Examination"
            @input="handleLabelInput"
            class="w-full bg-surface border border-default rounded-lg px-3 py-2 outline-none focus:border-primary text-slate-800 dark:text-slate-200 font-semibold"
          />
        </div>

        <!-- Field API Key -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            API Field Key <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="fieldForm.key"
            type="text"
            required
            :disabled="!!editingField"
            placeholder="e.g. parent_profession"
            class="w-full bg-surface border border-default rounded-lg px-3 py-2 outline-none focus:border-primary font-mono text-slate-800 dark:text-slate-200 font-bold disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
          />
          <p class="text-[10px] text-slate-400 mt-1">
            Identifier used for storage and API integrations. Must be unique per object.
          </p>
        </div>

        <!-- Data Type Selection -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-2">
            Field Data Type <span class="text-rose-500">*</span>
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              @click="fieldForm.type = 'text'"
              class="p-3 border rounded-xl text-left transition-all flex flex-col gap-1 active:scale-[0.99]"
              :class="fieldForm.type === 'text'
                ? 'border-primary bg-primary-50/40 dark:bg-primary-950/30 text-primary-900 dark:text-primary-100 shadow-sm'
                : 'border-default bg-surface hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'"
            >
              <div class="flex items-center gap-1.5 font-bold">
                <PhTextT :size="16" weight="bold" />
                <span>Text Input</span>
              </div>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">
                Single-line text for freeform data entry.
              </p>
            </button>

            <button
              type="button"
              @click="fieldForm.type = 'select'"
              class="p-3 border rounded-xl text-left transition-all flex flex-col gap-1 active:scale-[0.99]"
              :class="fieldForm.type === 'select'
                ? 'border-primary bg-primary-50/40 dark:bg-primary-950/30 text-primary-900 dark:text-primary-100 shadow-sm'
                : 'border-default bg-surface hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'"
            >
              <div class="flex items-center gap-1.5 font-bold">
                <PhListBullets :size="16" weight="bold" />
                <span>Dropdown Options</span>
              </div>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">
                Single choice selection from predefined options list.
              </p>
            </button>
          </div>
        </div>

        <!-- Options Builder (when type === 'select') -->
        <div v-if="fieldForm.type === 'select'" class="space-y-2 p-3 bg-slate-50 dark:bg-slate-850/50 rounded-xl border border-default">
          <div class="flex items-center justify-between">
            <label class="block text-[10px] font-bold text-slate-500 uppercase">
              Dropdown Choices <span class="text-rose-500">*</span>
            </label>
            <span class="text-[10px] text-slate-400 font-semibold">
              {{ fieldForm.options.length }} {{ fieldForm.options.length === 1 ? 'option' : 'options' }}
            </span>
          </div>

          <!-- Add Option Input -->
          <div class="flex gap-2">
            <input
              v-model="newOptionInput"
              type="text"
              placeholder="Type an option and press Add..."
              @keydown.enter.prevent="addOption"
              class="flex-1 bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary text-slate-800 dark:text-slate-200"
            />
            <button
              type="button"
              @click="addOption"
              class="btn-sm btn-secondary font-semibold shrink-0"
            >
              Add
            </button>
          </div>

          <!-- List of Options Badges -->
          <div v-if="fieldForm.options.length > 0" class="flex flex-wrap gap-1.5 pt-1">
            <span
              v-for="(opt, idx) in fieldForm.options"
              :key="idx"
              class="inline-flex items-center gap-1 px-2 py-1 bg-surface dark:bg-slate-800 border border-default rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-200"
            >
              <span>{{ getOptionLabel(opt) }}</span>
              <button
                type="button"
                @click="removeOption(idx)"
                class="hover:text-red-500 p-0.5 rounded transition-colors"
                title="Remove option"
              >
                <PhX :size="11" weight="bold" />
              </button>
            </span>
          </div>
          <p v-else class="text-[10px] text-amber-600 dark:text-amber-400 italic">
            Please add at least one dropdown option choice.
          </p>
        </div>

        <!-- Placeholder text -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Placeholder Text</label>
          <input
            v-model="fieldForm.placeholder"
            type="text"
            placeholder="e.g. Select an option / Type here..."
            class="w-full bg-surface border border-default rounded-lg px-3 py-2 outline-none focus:border-primary text-slate-800 dark:text-slate-200"
          />
        </div>

        <!-- Help / Subtitle text -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Help Text / Description</label>
          <input
            v-model="fieldForm.helpText"
            type="text"
            placeholder="e.g. Required for state merit scholarship tracking"
            class="w-full bg-surface border border-default rounded-lg px-3 py-2 outline-none focus:border-primary text-slate-800 dark:text-slate-200"
          />
        </div>

        <!-- Validation & Toggles -->
        <div class="pt-2 border-t border-default space-y-3">
          <!-- Required Toggle -->
          <label class="flex items-center justify-between cursor-pointer p-2.5 rounded-lg border border-default bg-surface hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
            <div>
              <span class="font-bold text-slate-800 dark:text-slate-200 block">Mark as Required</span>
              <span class="text-[10px] text-slate-400 block">Users must provide a value before saving the record</span>
            </div>
            <input
              v-model="fieldForm.required"
              type="checkbox"
              class="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
            />
          </label>

          <!-- Active Toggle -->
          <label class="flex items-center justify-between cursor-pointer p-2.5 rounded-lg border border-default bg-surface hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
            <div>
              <span class="font-bold text-slate-800 dark:text-slate-200 block">Field Status</span>
              <span class="text-[10px] text-slate-400 block">Active fields appear in forms and detail panels</span>
            </div>
            <input
              v-model="fieldForm.isActive"
              type="checkbox"
              class="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
            />
          </label>
        </div>
      </form>

      <template #footer>
        <div class="grid grid-cols-2 gap-2.5 w-full sm:flex sm:justify-end">
          <button
            type="button"
            @click="closeDrawer"
            class="btn-md btn-secondary justify-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="custom-field-form"
            class="btn-md btn-primary gap-1.5 justify-center"
            :disabled="saving"
          >
            <span v-if="saving">Saving...</span>
            <span v-else>{{ editingField ? 'Save Changes' : 'Create Field' }}</span>
          </button>
        </div>
      </template>
    </AppDrawer>

    <!-- ===================================================================== -->
    <!-- MODAL 2: ADD / EDIT EXCEL TEMPLATE COLUMN DRAWER                      -->
    <!-- ===================================================================== -->
    <AppDrawer
      :isOpen="isExcelDrawerOpen"
      :title="editingExcelCol ? 'Edit Template Column' : 'Add Template Column'"
      :subtitle="editingExcelCol ? `Configure spreadsheet header and sample data for ${editingExcelCol.fieldLabel || editingExcelCol.key}` : 'Define a custom column header to include in your spreadsheet'"
      width="480px"
      @close="closeExcelDrawer"
    >
      <form id="edit-excel-col-form" @submit.prevent="saveExcelColumnDrawer" class="space-y-4 text-xs">
        <!-- Target Object info badge -->
        <div class="p-2.5 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-default flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Object:</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">{{ currentObjectLabel }}</span>
          </div>
          <span
            class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
            :class="excelColForm.isCustomField
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50'
              : (excelColForm.isUserAdded
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-default')"
          >
            {{ excelColForm.isCustomField ? 'Custom Field' : (excelColForm.isUserAdded ? 'Added Column' : 'Standard Field') }}
          </span>
        </div>

        <!-- Column Header in Excel -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            Column Header in Excel <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="excelColForm.header"
            type="text"
            required
            placeholder="e.g. Student Name / Primary Mobile"
            class="w-full bg-surface border border-default rounded-lg px-3 py-2 outline-none focus:border-primary text-slate-800 dark:text-slate-200 font-bold"
          />
          <p class="text-[10px] text-slate-400 mt-1">
            Exact title that appears in row 1 of the generated spreadsheet.
          </p>
        </div>

        <!-- Mapped CRM Field Key -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            Mapped CRM Attribute Key
          </label>
          <input
            v-model="excelColForm.key"
            type="text"
            :disabled="!excelColForm.isUserAdded"
            class="w-full bg-surface border border-default rounded-lg px-3 py-2 outline-none focus:border-primary font-mono text-slate-800 dark:text-slate-200 font-bold disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
          />
          <p class="text-[10px] text-slate-400 mt-1">
            Internal database attribute mapped to this spreadsheet column.
          </p>
        </div>

        <!-- Sample Values Section -->
        <div class="space-y-2.5 p-3 bg-slate-50 dark:bg-slate-850/50 rounded-xl border border-default">
          <label class="block text-[10px] font-bold text-slate-500 uppercase">
            Template Sample Rows (Pre-populated values)
          </label>
          <div class="space-y-2">
            <div>
              <span class="text-[10px] text-slate-400 font-semibold block mb-0.5">Sample Row 1:</span>
              <input
                v-model="excelColForm.sample"
                type="text"
                placeholder="e.g. Aarav Sharma"
                class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>
            <div>
              <span class="text-[10px] text-slate-400 font-semibold block mb-0.5">Sample Row 2:</span>
              <input
                v-model="excelColForm.sample2"
                type="text"
                placeholder="e.g. Priya Verma"
                class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>
            <div>
              <span class="text-[10px] text-slate-400 font-semibold block mb-0.5">Sample Row 3:</span>
              <input
                v-model="excelColForm.sample3"
                type="text"
                placeholder="e.g. Rohan Patil"
                class="w-full bg-surface border border-default rounded-lg px-3 py-1.5 outline-none focus:border-primary text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>
          </div>
        </div>

        <!-- Toggles: Included in Template & Mark as Required -->
        <div class="space-y-2.5 pt-1">
          <!-- Include Toggle -->
          <label class="flex items-center justify-between cursor-pointer p-2.5 rounded-lg border border-default bg-surface hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
            <div>
              <span class="font-bold text-slate-800 dark:text-slate-200 block">Include in Excel Template</span>
              <span class="text-[10px] text-slate-400 block">Column will be exported when downloading the blank template</span>
            </div>
            <input
              v-model="excelColForm.enabled"
              type="checkbox"
              :disabled="excelColForm.isLockedRequired"
              class="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 disabled:opacity-50 cursor-pointer"
            />
          </label>

          <!-- Required Toggle -->
          <label class="flex items-center justify-between cursor-pointer p-2.5 rounded-lg border border-default bg-surface hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
            <div>
              <span class="font-bold text-slate-800 dark:text-slate-200 block">Mark as Required</span>
              <span class="text-[10px] text-slate-400 block">Spreadsheet import will validate that this column has a value</span>
            </div>
            <input
              v-model="excelColForm.required"
              type="checkbox"
              :disabled="excelColForm.isLockedRequired"
              class="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 disabled:opacity-50 cursor-pointer"
            />
          </label>
        </div>
      </form>

      <template #footer>
        <div class="grid grid-cols-2 gap-2.5 w-full sm:flex sm:justify-end">
          <button
            type="button"
            @click="closeExcelDrawer"
            class="btn-md btn-secondary justify-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-excel-col-form"
            class="btn-md btn-primary justify-center font-bold"
            :disabled="!excelColForm.header?.trim()"
          >
            {{ editingExcelCol ? 'Save Changes' : 'Add Column' }}
          </button>
        </div>
      </template>
    </AppDrawer>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      :isOpen="isDeleteModalOpen"
      title="Delete Custom Field?"
      :message="`Are you sure you want to delete custom field '${fieldToDelete?.label}'? Existing data stored under this field will remain in database records, but the field will no longer be visible in forms.`"
      :itemName="fieldToDelete?.label || ''"
      :loading="isDeleting"
      @cancel="isDeleteModalOpen = false; fieldToDelete = null"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import {
  PhPlus,
  PhSlidersHorizontal,
  PhTextT,
  PhListBullets,
  PhPencilSimple,
  PhTrash,
  PhX,
  PhStudent,
  PhUserCheck,
  PhLockSimple,
  PhMagnifyingGlass,
  PhFileXls,
  PhDownloadSimple,
  PhCheck,
  PhInfo,
} from '@phosphor-icons/vue';
import AppDrawer from '@/components/AppDrawer.vue';
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue';
import {
  fetchCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
} from '@/api/customFields';
import { downloadExcelWorkbook } from '@/utils/fileDownload';

const store = useStore();
const route = useRoute();
const router = useRouter();

const isEducation = computed(() => store.getters['organization/isEducationTenant']);

const OBJECTS = computed(() => [
  { key: 'leads', label: isEducation.value ? 'Student Leads' : 'Sales Leads', shortLabel: isEducation.value ? 'Leads' : 'Leads', icon: PhStudent },
  { key: 'students', label: 'Enrolled Students', shortLabel: 'Students', icon: PhUserCheck },
]);

const initialTarget = (route.query.target && ['leads', 'students'].includes(route.query.target))
  ? String(route.query.target)
  : ((route.query.tab && ['leads', 'students'].includes(route.query.tab))
      ? String(route.query.tab)
      : 'leads');
const activeObject = ref(initialTarget);

const initialView = (route.query.view && ['fields', 'template'].includes(route.query.view))
  ? String(route.query.view)
  : (route.query.tab === 'excel' ? 'template' : 'fields');
const activeView = ref(initialView);

watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.target && ['leads', 'students'].includes(newQuery.target)) {
      activeObject.value = String(newQuery.target);
    } else if (newQuery.tab && ['leads', 'students'].includes(newQuery.tab)) {
      activeObject.value = String(newQuery.tab);
    }
    if (newQuery.view && ['fields', 'template'].includes(newQuery.view)) {
      activeView.value = String(newQuery.view);
    } else if (newQuery.tab === 'excel') {
      activeView.value = 'template';
    }
  }
);

function selectObject(objKey) {
  activeObject.value = objKey;
  searchQuery.value = '';
  categoryFilter.value = 'all';
  excelSearchQuery.value = '';
  excelCategoryFilter.value = 'all';
  router.replace({
    query: {
      ...route.query,
      target: objKey,
      tab: activeView.value === 'template' ? 'excel' : objKey,
      view: activeView.value,
    },
  }).catch(() => {});
}

function selectView(viewKey) {
  activeView.value = viewKey;
  router.replace({
    query: {
      ...route.query,
      target: activeObject.value,
      tab: viewKey === 'template' ? 'excel' : activeObject.value,
      view: viewKey,
    },
  }).catch(() => {});
}

const allFields = ref([]);
const loading = ref(false);
const error = ref('');
const searchQuery = ref('');
const categoryFilter = ref('all'); // 'all' | 'standard' | 'custom'

// Drawer state for Object Manager
const isDrawerOpen = ref(false);
const editingField = ref(null);
const saving = ref(false);
const formError = ref('');
const newOptionInput = ref('');

const fieldForm = ref({
  module: 'leads',
  label: '',
  key: '',
  type: 'text',
  options: [],
  required: false,
  isActive: true,
  placeholder: '',
  helpText: '',
});

// Delete state
const isDeleteModalOpen = ref(false);
const fieldToDelete = ref(null);
const isDeleting = ref(false);

// =========================================================================
// EXCEL TEMPLATES MANAGEMENT STATE & LOGIC
const excelSearchQuery = ref('');
const excelCategoryFilter = ref('all'); // 'all' | 'standard' | 'custom' | 'added'
const isExcelDrawerOpen = ref(false);
const editingExcelCol = ref(null);
const excelColForm = ref({
  header: '',
  key: '',
  sample: '',
  sample2: '',
  sample3: '',
  enabled: true,
  required: false,
  isLockedRequired: false,
  isCustomField: false,
  isUserAdded: false,
});

const excelColumnsLeads = ref([]);
const excelColumnsStudents = ref([]);

function getDefaultLeadsColumns() {
  if (isEducation.value) {
    return [
      { key: 'firstName', header: 'Student Name', fieldLabel: 'First Name', isLockedRequired: true, enabled: true, sample: 'Aarav', sample2: 'Priya', sample3: 'Rohan' },
      { key: 'lastName', header: 'Last Name', fieldLabel: 'Last Name', isLockedRequired: false, enabled: true, sample: 'Sharma', sample2: 'Verma', sample3: 'Patil' },
      { key: 'mobile', header: 'Primary Mobile', fieldLabel: 'Primary Mobile', isLockedRequired: true, enabled: true, sample: '9876543210', sample2: '9876543211', sample3: '9876543212' },
      { key: 'alternativeMobile', header: 'Alternate Phone', fieldLabel: 'Alternate Phone', isLockedRequired: false, enabled: true, sample: '9876543299', sample2: '', sample3: '9812345678' },
      { key: 'schoolName', header: 'School Name', fieldLabel: 'School Name', isLockedRequired: true, enabled: true, sample: 'Delhi Public School', sample2: 'St. Xavier High School', sample3: 'Balmohan Vidyamandir' },
      { key: 'institutionType', header: 'Institution Type', fieldLabel: 'Institution Type', isLockedRequired: false, enabled: true, sample: 'School', sample2: 'School', sample3: 'Private Classes' },
      { key: 'educationBoard', header: 'Education Board', fieldLabel: 'Education Board', isLockedRequired: false, enabled: true, sample: 'CBSE', sample2: 'ICSE', sample3: 'State Board' },
      { key: 'standard', header: 'Standard / Grade', fieldLabel: 'Standard / Grade', isLockedRequired: false, enabled: true, sample: '10', sample2: '8', sample3: '10' },
      { key: 'academicStream', header: 'Academic Stream', fieldLabel: 'Academic Stream', isLockedRequired: false, enabled: true, sample: 'Science', sample2: '', sample3: 'Commerce' },
      { key: 'currentCoaching', header: 'Current Coaching', fieldLabel: 'Current Coaching', isLockedRequired: false, enabled: true, sample: 'Allen Career Institute', sample2: '', sample3: 'Mahesh Tutorials' },
      { key: 'source', header: 'Inquiry Source', fieldLabel: 'Inquiry Source', isLockedRequired: false, enabled: true, sample: 'walk_in', sample2: 'website', sample3: 'referral' },
      { key: 'parentName', header: 'Parent Name', fieldLabel: 'Parent Name', isLockedRequired: false, enabled: true, sample: 'Rajesh Sharma', sample2: 'Sunita Verma', sample3: 'Suresh Patil' },
      { key: 'parentMobile', header: 'Parent Mobile', fieldLabel: 'Parent Mobile', isLockedRequired: false, enabled: true, sample: '9876543200', sample2: '9876543201', sample3: '9876543202' },
      { key: 'email', header: 'Email Address', fieldLabel: 'Email Address', isLockedRequired: false, enabled: true, sample: 'student@example.com', sample2: 'priya@example.com', sample3: '' },
      { key: 'status', header: 'Lead Status', fieldLabel: 'Lead Status', isLockedRequired: false, enabled: true, sample: 'new', sample2: 'contacted', sample3: 'follow_up' },
      { key: 'notes', header: 'Notes', fieldLabel: 'Notes / Remarks', isLockedRequired: false, enabled: true, sample: 'Interested in morning foundation batch', sample2: 'Requested fee structure', sample3: 'Weekend batch preferred' },
    ];
  }

  return [
    { key: 'firstName', header: 'First Name', fieldLabel: 'First Name', isLockedRequired: true, enabled: true, sample: 'Rahul', sample2: 'Sneha', sample3: 'Amit' },
    { key: 'lastName', header: 'Last Name', fieldLabel: 'Last Name', isLockedRequired: false, enabled: true, sample: 'Mehta', sample2: 'Kapoor', sample3: 'Shah' },
    { key: 'mobile', header: 'Mobile', fieldLabel: 'Mobile', isLockedRequired: true, enabled: true, sample: '9876543210', sample2: '9876543211', sample3: '9876543212' },
    { key: 'email', header: 'Email', fieldLabel: 'Email Address', isLockedRequired: false, enabled: true, sample: 'rahul.mehta@example.com', sample2: 'sneha.k@example.com', sample3: '' },
    { key: 'propertyType', header: 'Property Type', fieldLabel: 'Property Type', isLockedRequired: false, enabled: true, sample: 'apartment', sample2: 'villa', sample3: 'plot' },
    { key: 'budget', header: 'Budget', fieldLabel: 'Budget', isLockedRequired: false, enabled: true, sample: '12500000', sample2: '25000000', sample3: '7500000' },
    { key: 'source', header: 'Source', fieldLabel: 'Inquiry Source', isLockedRequired: false, enabled: true, sample: 'website', sample2: 'walk_in', sample3: 'referral' },
    { key: 'status', header: 'Status', fieldLabel: 'Lead Status', isLockedRequired: false, enabled: true, sample: 'new', sample2: 'contacted', sample3: 'qualified' },
    { key: 'notes', header: 'Notes', fieldLabel: 'Notes / Remarks', isLockedRequired: false, enabled: true, sample: 'Looking for 3BHK in Whitefield', sample2: 'Ready to purchase within 3 months', sample3: 'Investment purpose' },
  ];
}

function getDefaultStudentsColumns() {
  return [
    { key: 'firstName', header: 'First Name', fieldLabel: 'First Name', isLockedRequired: true, enabled: true, sample: 'Rahul', sample2: 'Pooja', sample3: 'Ankit' },
    { key: 'lastName', header: 'Last Name', fieldLabel: 'Last Name', isLockedRequired: false, enabled: true, sample: 'Sharma', sample2: 'Deshmukh', sample3: 'Joshi' },
    { key: 'mobile', header: 'Primary Mobile', fieldLabel: 'Primary Mobile', isLockedRequired: true, enabled: true, sample: '9876543210', sample2: '9876543211', sample3: '9876543212' },
    { key: 'alternativeMobile', header: 'Alternate Phone', fieldLabel: 'Alternate Phone', isLockedRequired: false, enabled: true, sample: '9876543299', sample2: '', sample3: '' },
    { key: 'schoolName', header: 'College / School Name', fieldLabel: 'School Name', isLockedRequired: true, enabled: true, sample: 'St. Xavier High School', sample2: 'DPS Pune', sample3: 'National College' },
    { key: 'educationBoard', header: 'Education Board', fieldLabel: 'Education Board', isLockedRequired: false, enabled: true, sample: 'CBSE', sample2: 'State Board', sample3: 'ICSE' },
    { key: 'standard', header: 'Standard / Grade', fieldLabel: 'Standard / Grade', isLockedRequired: false, enabled: true, sample: '11', sample2: '12', sample3: '10' },
    { key: 'academicStream', header: 'Academic Stream', fieldLabel: 'Academic Stream', isLockedRequired: false, enabled: true, sample: 'Science', sample2: 'Commerce', sample3: 'Science' },
    { key: 'parentName', header: 'Parent Name', fieldLabel: 'Parent Name', isLockedRequired: false, enabled: true, sample: 'Suresh Sharma', sample2: 'Nitin Deshmukh', sample3: 'Manoj Joshi' },
    { key: 'parentMobile', header: 'Parent Mobile', fieldLabel: 'Parent Mobile', isLockedRequired: false, enabled: true, sample: '9876543200', sample2: '9876543201', sample3: '9876543202' },
    { key: 'email', header: 'Email Address', fieldLabel: 'Email Address', isLockedRequired: false, enabled: true, sample: 'rahul.s@example.com', sample2: 'pooja.d@example.com', sample3: '' },
    { key: 'status', header: 'Student Status', fieldLabel: 'Student Status', isLockedRequired: false, enabled: true, sample: 'active', sample2: 'active', sample3: 'active' },
    { key: 'notes', header: 'Academic Notes', fieldLabel: 'Academic Notes', isLockedRequired: false, enabled: true, sample: 'Enrolled in full-year batch', sample2: 'Targeting IIT JEE', sample3: 'Scholarship student' },
  ];
}

const currentExcelColumns = computed(() => {
  return activeObject.value === 'leads' ? excelColumnsLeads.value : excelColumnsStudents.value;
});

const enabledExcelColumnsCount = computed(() => {
  return currentExcelColumns.value.filter((c) => c.enabled).length;
});

const standardExcelColumnsCount = computed(() => {
  return currentExcelColumns.value.filter((c) => !c.isCustomField && !c.isUserAdded).length;
});

const customAttributesCount = computed(() => {
  return currentExcelColumns.value.filter((c) => c.isCustomField).length;
});

const userAddedColumnsCount = computed(() => {
  return currentExcelColumns.value.filter((c) => c.isUserAdded).length;
});

const customExcelColumnsCount = computed(() => {
  return customAttributesCount.value + userAddedColumnsCount.value;
});

const filteredExcelColumns = computed(() => {
  const query = excelSearchQuery.value.trim().toLowerCase();
  return currentExcelColumns.value.filter((c) => {
    if (excelCategoryFilter.value === 'standard' && (c.isCustomField || c.isUserAdded)) return false;
    if (excelCategoryFilter.value === 'custom' && !c.isCustomField) return false;
    if (excelCategoryFilter.value === 'added' && !c.isUserAdded) return false;
    if (!query) return true;
    return (
      (c.header && c.header.toLowerCase().includes(query)) ||
      (c.key && c.key.toLowerCase().includes(query)) ||
      (c.fieldLabel && c.fieldLabel.toLowerCase().includes(query))
    );
  });
});

function persistExcelColumns() {
  try {
    const key = activeObject.value === 'leads'
      ? (isEducation.value ? 'trackdeal_template_columns_leads' : 'trackdeal_template_columns_sales_leads')
      : 'trackdeal_template_columns_students';
    localStorage.setItem(key, JSON.stringify(currentExcelColumns.value));
  } catch (e) {}
}

function selectAllExcelColumns() {
  currentExcelColumns.value.forEach((c) => {
    c.enabled = true;
  });
  persistExcelColumns();
}

function resetExcelColumnsToDefault() {
  if (activeObject.value === 'leads') {
    excelColumnsLeads.value = getDefaultLeadsColumns();
    attachCustomFieldsToTemplate(excelColumnsLeads.value, 'leads');
  } else {
    excelColumnsStudents.value = getDefaultStudentsColumns();
    attachCustomFieldsToTemplate(excelColumnsStudents.value, 'students');
  }
  persistExcelColumns();
}

function openAddExcelColumnModal() {
  editingExcelCol.value = null;
  excelColForm.value = {
    header: '',
    key: '',
    sample: '',
    sample2: '',
    sample3: '',
    enabled: true,
    required: false,
    isLockedRequired: false,
    isCustomField: false,
    isUserAdded: true,
  };
  isExcelDrawerOpen.value = true;
}

function openEditExcelColumn(col) {
  editingExcelCol.value = col;
  excelColForm.value = {
    header: col.header || '',
    key: col.key || '',
    sample: col.sample || '',
    sample2: col.sample2 || '',
    sample3: col.sample3 || '',
    enabled: col.enabled !== false,
    required: Boolean(col.required || col.isLockedRequired),
    isLockedRequired: Boolean(col.isLockedRequired),
    isCustomField: Boolean(col.isCustomField),
    isUserAdded: Boolean(col.isUserAdded),
  };
  isExcelDrawerOpen.value = true;
}

function closeExcelDrawer() {
  isExcelDrawerOpen.value = false;
  editingExcelCol.value = null;
}

function saveExcelColumnDrawer() {
  const headerName = excelColForm.value.header?.trim();
  if (!headerName) return;

  if (editingExcelCol.value) {
    editingExcelCol.value.header = headerName;
    editingExcelCol.value.sample = excelColForm.value.sample?.trim() || '';
    editingExcelCol.value.sample2 = excelColForm.value.sample2?.trim() || '';
    editingExcelCol.value.sample3 = excelColForm.value.sample3?.trim() || '';
    if (!editingExcelCol.value.isLockedRequired) {
      editingExcelCol.value.enabled = excelColForm.value.enabled;
      editingExcelCol.value.required = excelColForm.value.required;
    }
  } else {
    const slugKey = excelColForm.value.key?.trim() || headerName.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
    currentExcelColumns.value.push({
      key: slugKey || `col_${Date.now()}`,
      header: headerName,
      fieldLabel: `Custom: ${headerName}`,
      isCustomField: false,
      isUserAdded: true,
      isLockedRequired: false,
      enabled: excelColForm.value.enabled,
      required: excelColForm.value.required,
      sample: excelColForm.value.sample?.trim() || 'Sample value',
      sample2: excelColForm.value.sample2?.trim() || '',
      sample3: excelColForm.value.sample3?.trim() || '',
    });
  }

  persistExcelColumns();
  closeExcelDrawer();
}

function removeExcelColumn(col) {
  const list = currentExcelColumns.value;
  const idx = list.findIndex((c) => c === col || (c.key === col.key && c.isUserAdded));
  if (idx !== -1) {
    list.splice(idx, 1);
    persistExcelColumns();
  }
}

async function downloadExcelTemplate() {
  const XLSX = await import('xlsx');
  const cols = currentExcelColumns.value.filter((c) => c.enabled);
  if (cols.length === 0) return;

  const headers = cols.map((c) => c.header);
  const sample1 = cols.map((c) => c.sample ?? '');
  const sample2 = cols.map((c) => c.sample2 ?? '');
  const sample3 = cols.map((c) => c.sample3 ?? '');

  const templateRows = [headers, sample1, sample2, sample3].filter(
    (row, idx) => idx === 0 || row.some((v) => v !== '')
  );

  const ws = XLSX.utils.aoa_to_sheet(templateRows);
  ws['!cols'] = cols.map((c) => ({
    wch: Math.max(c.header.length + 4, 16),
  }));

  const wb = XLSX.utils.book_new();
  const sheetName = activeObject.value === 'leads' ? 'Leads' : 'Students';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const filename = activeObject.value === 'leads'
    ? (isEducation.value ? 'TrackDeal_Student_Leads_Template.xlsx' : 'TrackDeal_Sales_Leads_Template.xlsx')
    : 'TrackDeal_Enrolled_Students_Template.xlsx';

  await downloadExcelWorkbook(wb, filename);
}

function attachCustomFieldsToTemplate(targetList, mod) {
  const customFields = allFields.value.filter(
    (f) => f.module === mod && !f.isStandard && f.isActive !== false
  );

  customFields.forEach((cf) => {
    const exists = targetList.some((c) => c.key === cf.key);
    if (!exists) {
      targetList.push({
        key: cf.key,
        header: cf.label,
        fieldLabel: `Custom: ${cf.label}`,
        isCustomField: true,
        isUserAdded: false,
        isLockedRequired: Boolean(cf.required),
        enabled: true,
        required: Boolean(cf.required),
        sample: cf.options?.length ? getOptionLabel(cf.options[0]) : `Sample ${cf.label}`,
        sample2: cf.options?.length > 1 ? getOptionLabel(cf.options[1]) : `Sample ${cf.label} 2`,
        sample3: cf.options?.length > 2 ? getOptionLabel(cf.options[2]) : `Sample ${cf.label} 3`,
      });
    }
  });
}

function loadPersistedExcelColumns() {
  const leadsKey = isEducation.value ? 'trackdeal_template_columns_leads' : 'trackdeal_template_columns_sales_leads';
  const savedLeads = localStorage.getItem(leadsKey);
  if (savedLeads) {
    try {
      const parsed = JSON.parse(savedLeads);
      if (Array.isArray(parsed) && parsed.length > 0) {
        excelColumnsLeads.value = parsed;
      } else {
        excelColumnsLeads.value = getDefaultLeadsColumns();
      }
    } catch (e) {
      excelColumnsLeads.value = getDefaultLeadsColumns();
    }
  } else {
    excelColumnsLeads.value = getDefaultLeadsColumns();
  }

  const savedStudents = localStorage.getItem('trackdeal_template_columns_students');
  if (savedStudents) {
    try {
      const parsed = JSON.parse(savedStudents);
      if (Array.isArray(parsed) && parsed.length > 0) {
        excelColumnsStudents.value = parsed;
      } else {
        excelColumnsStudents.value = getDefaultStudentsColumns();
      }
    } catch (e) {
      excelColumnsStudents.value = getDefaultStudentsColumns();
    }
  } else {
    excelColumnsStudents.value = getDefaultStudentsColumns();
  }

  attachCustomFieldsToTemplate(excelColumnsLeads.value, 'leads');
  attachCustomFieldsToTemplate(excelColumnsStudents.value, 'students');
}

// =========================================================================
// OBJECT MANAGER FIELDS STATE & LOGIC
// =========================================================================
const currentObjectLabel = computed(() => {
  const found = OBJECTS.value.find((o) => o.key === activeObject.value);
  return found ? found.label : 'Object';
});

const currentModuleFields = computed(() => {
  return allFields.value.filter((f) => f.module === activeObject.value);
});

const standardCount = computed(() => {
  return currentModuleFields.value.filter((f) => f.isStandard).length;
});

const customCount = computed(() => {
  return currentModuleFields.value.filter((f) => !f.isStandard).length;
});

const requiredCount = computed(() => {
  return currentModuleFields.value.filter((f) => f.required).length;
});

const filteredFields = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return currentModuleFields.value.filter((f) => {
    if (categoryFilter.value === 'standard' && !f.isStandard) return false;
    if (categoryFilter.value === 'custom' && f.isStandard) return false;
    if (!query) return true;
    return (
      (f.label && f.label.toLowerCase().includes(query)) ||
      (f.key && f.key.toLowerCase().includes(query))
    );
  });
});

function getObjectFieldCount(mod) {
  return allFields.value.filter((f) => f.module === mod).length;
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);
}

function handleLabelInput() {
  if (!editingField.value) {
    fieldForm.value.key = slugify(fieldForm.value.label);
  }
}

function getOptionLabel(opt) {
  if (opt === null || opt === undefined) return '';
  if (typeof opt === 'string') return opt;
  if (typeof opt === 'object') {
    return opt.label || opt.value || opt.name || opt.text || '';
  }
  return String(opt);
}

function getFieldOptions(field) {
  if (!field || !Array.isArray(field.options)) return [];
  return field.options
    .map(getOptionLabel)
    .filter((o) => o && o !== '[object Object]');
}

function addOption() {
  const text = newOptionInput.value.trim();
  if (!text) return;
  const items = text.split(',').map((s) => s.trim()).filter(Boolean);
  items.forEach((item) => {
    if (item === '[object Object]') return;
    const exists = fieldForm.value.options.some(
      (opt) => getOptionLabel(opt).toLowerCase() === item.toLowerCase()
    );
    if (!exists) {
      fieldForm.value.options.push(item);
    }
  });
  newOptionInput.value = '';
}

function removeOption(index) {
  fieldForm.value.options.splice(index, 1);
}

async function loadFields() {
  loading.value = true;
  error.value = '';
  try {
    const data = await fetchCustomFields(null, { includeStandard: true });
    allFields.value = Array.isArray(data) ? data : [];
    loadPersistedExcelColumns();
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to load fields.';
  } finally {
    loading.value = false;
  }
}

function openCreateDrawer() {
  editingField.value = null;
  formError.value = '';
  newOptionInput.value = '';
  fieldForm.value = {
    module: activeObject.value,
    label: '',
    key: '',
    type: 'text',
    options: [],
    required: false,
    isActive: true,
    placeholder: '',
    helpText: '',
  };
  isDrawerOpen.value = true;
}

function openEditDrawer(field) {
  editingField.value = field;
  formError.value = '';
  newOptionInput.value = '';
  fieldForm.value = {
    module: field.module || activeObject.value,
    label: field.label || '',
    key: field.key || '',
    type: field.type || 'text',
    options: getFieldOptions(field),
    required: !!field.required,
    isActive: field.isActive !== false,
    placeholder: field.placeholder || '',
    helpText: field.helpText || '',
  };
  isDrawerOpen.value = true;
}

function closeDrawer() {
  isDrawerOpen.value = false;
  editingField.value = null;
  formError.value = '';
}

async function onSaveField() {
  if (!fieldForm.value.label?.trim()) {
    formError.value = 'Field Label is required.';
    return;
  }
  if (!fieldForm.value.key?.trim()) {
    formError.value = 'API Field Key is required.';
    return;
  }

  const cleanOptions = (fieldForm.value.options || [])
    .map(getOptionLabel)
    .map((s) => String(s || '').trim())
    .filter((s) => s && s !== '[object Object]');

  if (fieldForm.value.type === 'select' && cleanOptions.length === 0) {
    formError.value = 'Please add at least one dropdown option.';
    return;
  }

  saving.value = true;
  formError.value = '';

  const payload = {
    module: fieldForm.value.module,
    label: fieldForm.value.label.trim(),
    key: fieldForm.value.key.trim(),
    type: fieldForm.value.type,
    options: fieldForm.value.type === 'select' ? cleanOptions : [],
    required: fieldForm.value.required,
    isActive: fieldForm.value.isActive,
    placeholder: fieldForm.value.placeholder?.trim() || '',
    helpText: fieldForm.value.helpText?.trim() || '',
  };

  try {
    if (editingField.value) {
      const fieldId = editingField.value._id || editingField.value.id;
      await updateCustomField(fieldId, payload);
    } else {
      await createCustomField(payload);
    }
    closeDrawer();
    await loadFields();
  } catch (err) {
    formError.value = err.data?.message || err.message || 'Failed to save field.';
  } finally {
    saving.value = false;
  }
}

function openDeleteDialog(field) {
  if (field.isStandard || field.isSystemLocked) return;
  fieldToDelete.value = field;
  isDeleteModalOpen.value = true;
}

async function handleConfirmDelete() {
  if (!fieldToDelete.value || fieldToDelete.value.isStandard || fieldToDelete.value.isSystemLocked) return;
  const fieldId = fieldToDelete.value._id || fieldToDelete.value.id;
  isDeleting.value = true;
  try {
    await deleteCustomField(fieldId);
    isDeleteModalOpen.value = false;
    fieldToDelete.value = null;
    await loadFields();
  } catch (err) {
    alert(err.data?.message || err.message || 'Failed to delete field.');
  } finally {
    isDeleting.value = false;
  }
}

onMounted(() => {
  loadFields();
});
</script>

<style scoped>
.btn-md {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 150ms ease;
}

.btn-sm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
  border-radius: 0.375rem;
  transition: all 150ms ease;
}

.btn-primary {
  background-color: hsl(var(--primary-600, 222 84% 52%));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: hsl(var(--primary-700, 222 84% 45%));
}

.btn-secondary {
  background-color: hsl(var(--surface, 0 0% 100%));
  border: 1px solid hsl(var(--border-default, 214 32% 91%));
  color: hsl(var(--text-main, 215 28% 17%));
}

.btn-secondary:hover:not(:disabled) {
  background-color: hsl(var(--neutral-50, 210 20% 98%));
}
</style>
