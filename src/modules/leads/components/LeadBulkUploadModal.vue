<template>
  <AppDrawer
    :isOpen="isOpen"
    :title="isEducation ? 'Bulk Import Student Leads' : 'Bulk Import Sales Leads'"
    :subtitle="isEducation ? 'Upload Excel or CSV spreadsheets to batch enroll admissions prospects.' : 'Upload Excel or CSV spreadsheets to batch import property sales leads.'"
    width="760px"
    @close="handleClose"
  >
    <div class="space-y-6 text-xs">
      <!-- Top Action: Download Sample Template & Column Controls Card -->
      <div class="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 space-y-3.5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 shrink-0">
              <PhFileXls :size="22" weight="bold" />
            </div>
            <div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 text-xs">
                Spreadsheet Template & Column Controls
              </h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Download a pre-structured spreadsheet or customize column headers to match your file.
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              @click="isDesignerOpen = !isDesignerOpen"
              class="btn-sm font-semibold text-xs gap-1.5 justify-center transition-colors"
              :class="isDesignerOpen
                ? 'bg-primary text-white hover:bg-primary-600 border border-primary'
                : 'btn-secondary text-slate-700 dark:text-slate-200 hover:border-primary/60'"
            >
              <PhSlidersHorizontal :size="14" weight="bold" />
              <span class="truncate">{{ isDesignerOpen ? 'Hide' : 'Columns' }}</span>
              <span
                class="px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0"
                :class="isDesignerOpen ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'"
              >
                {{ enabledColumnsCount }}
              </span>
            </button>
            <button
              type="button"
              @click="downloadTemplate"
              class="btn-sm btn-secondary font-bold text-xs gap-1.5 justify-center hover:border-emerald-500 hover:text-emerald-600 transition-colors"
            >
              <PhDownloadSimple :size="14" weight="bold" />
              <span class="truncate">Download .XLSX</span>
            </button>
          </div>
        </div>

        <!-- Collapsible Template Designer Section -->
        <div v-if="isDesignerOpen" class="pt-3 border-t border-slate-200/80 dark:border-slate-700/60 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                Template Columns ({{ enabledColumnsCount }} of {{ availableColumns.length }} enabled)
              </span>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                @click="selectAllColumns"
                class="text-[11px] font-semibold text-primary hover:underline"
              >
                Select All
              </button>
              <span class="text-slate-300 dark:text-slate-600">|</span>
              <button
                type="button"
                @click="resetToDefaultColumns"
                class="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Reset to Defaults
              </button>
              <span class="text-slate-300 dark:text-slate-600">|</span>
              <button
                type="button"
                @click="showAddColumnModal = true"
                class="btn-xs btn-primary gap-1 font-semibold"
              >
                <PhPlus :size="12" weight="bold" />
                <span>Add Custom Column</span>
              </button>
            </div>
          </div>

          <!-- Inline New Column Creator -->
          <div
            v-if="showAddColumnModal"
            class="p-3 bg-white dark:bg-slate-900 border border-primary/40 rounded-xl space-y-2.5 shadow-xs"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-800 dark:text-slate-100 text-xs">Add New Column to Template</span>
              <button
                type="button"
                @click="showAddColumnModal = false; newColName = ''; newColSample = ''"
                class="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <PhX :size="14" weight="bold" />
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Column Header Name *</label>
                <input
                  v-model="newColName"
                  type="text"
                  placeholder="e.g. City / Transport Required / Target Exam"
                  class="w-full bg-surface border border-default rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-200 font-semibold"
                  @keydown.enter.prevent="handleAddCustomColumn"
                />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sample Value (Optional)</label>
                <input
                  v-model="newColSample"
                  type="text"
                  placeholder="e.g. Mumbai / Yes / JEE Main"
                  class="w-full bg-surface border border-default rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary text-slate-800 dark:text-slate-200"
                  @keydown.enter.prevent="handleAddCustomColumn"
                />
              </div>
            </div>
            <div class="flex items-center justify-between pt-1 flex-wrap gap-2">
              <label class="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input v-model="newColRequired" type="checkbox" class="rounded text-primary focus:ring-primary w-3.5 h-3.5" />
                <span>Mark column as required during upload</span>
              </label>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="showAddColumnModal = false"
                  class="btn-xs btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  @click="handleAddCustomColumn"
                  class="btn-xs btn-primary gap-1 font-semibold"
                  :disabled="!newColName.trim()"
                >
                  <PhCheck :size="12" weight="bold" />
                  <span>Add to Template</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Column Editor List (Desktop Table >= 640px) -->
          <div class="hidden sm:block border border-default rounded-xl overflow-hidden bg-white dark:bg-slate-900 max-h-56 overflow-y-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-[10px] uppercase font-bold text-slate-400 border-b border-default bg-slate-50 dark:bg-slate-850 sticky top-0 z-10">
                <tr>
                  <th class="py-1.5 px-3 w-12 text-center">Include</th>
                  <th class="py-1.5 px-3">Column Header in Excel</th>
                  <th class="py-1.5 px-3">Mapped Attribute</th>
                  <th class="py-1.5 px-3">Sample Value</th>
                  <th class="py-1.5 px-3 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr
                  v-for="(col, idx) in availableColumns"
                  :key="col.key || idx"
                  class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <!-- Checkbox -->
                  <td class="py-1.5 px-3 text-center">
                    <input
                      v-model="col.enabled"
                      type="checkbox"
                      :disabled="col.isLockedRequired"
                      class="rounded text-primary focus:ring-primary w-3.5 h-3.5 disabled:opacity-50"
                    />
                  </td>
                  <!-- Editable Header Title -->
                  <td class="py-1.5 px-3">
                    <div class="flex items-center gap-1.5">
                      <input
                        v-model="col.header"
                        type="text"
                        class="bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary focus:bg-white dark:focus:bg-slate-800 rounded px-1.5 py-0.5 text-xs font-semibold text-slate-800 dark:text-slate-100 w-full outline-none transition-colors"
                        placeholder="Column header"
                      />
                      <span
                        v-if="col.isLockedRequired"
                        class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 shrink-0"
                      >
                        Required
                      </span>
                    </div>
                  </td>
                  <!-- Mapped Attribute Badge -->
                  <td class="py-1.5 px-3 text-slate-500 dark:text-slate-400">
                    <span
                      class="px-1.5 py-0.2 rounded text-[10px] font-mono"
                      :class="col.isCustomField
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50'
                        : col.isUserAdded
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
                    >
                      {{ col.fieldLabel || col.key }}
                    </span>
                  </td>
                  <!-- Sample Value Preview -->
                  <td class="py-1.5 px-3 text-slate-400 text-[11px] truncate max-w-[140px]">
                    {{ col.sample || '—' }}
                  </td>
                  <!-- Action (Remove for user-added) -->
                  <td class="py-1.5 px-3 text-center">
                    <button
                      v-if="col.isUserAdded"
                      type="button"
                      @click="removeCustomColumn(idx)"
                      class="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                      title="Remove custom column"
                    >
                      <PhTrash :size="13" />
                    </button>
                    <span v-else class="text-slate-300 dark:text-slate-600 text-[10px] select-none" title="Built-in standard field">
                      <PhLock :size="11" />
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Column Editor Mobile List (< 640px) -->
          <div class="block sm:hidden border border-default rounded-xl divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 max-h-56 overflow-y-auto">
            <div
              v-for="(col, idx) in availableColumns"
              :key="col.key || idx"
              class="p-2.5 flex flex-col gap-1.5"
              :class="col.enabled ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/70 dark:bg-slate-850/40 opacity-70'"
            >
              <div class="flex items-center gap-2">
                <input
                  v-model="col.enabled"
                  type="checkbox"
                  :disabled="col.isLockedRequired"
                  class="rounded text-primary focus:ring-primary w-4 h-4 disabled:opacity-50 shrink-0"
                />
                <input
                  v-model="col.header"
                  type="text"
                  class="bg-surface border border-default focus:border-primary rounded px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 w-full outline-none"
                  placeholder="Column header"
                />
                <button
                  v-if="col.isUserAdded"
                  type="button"
                  @click="removeCustomColumn(idx)"
                  class="text-red-500 p-1 shrink-0"
                >
                  <PhTrash :size="14" />
                </button>
              </div>
              <div class="flex items-center justify-between text-[10px] text-slate-400 pl-6">
                <span class="font-mono text-slate-600 dark:text-slate-300">{{ col.fieldLabel || col.key }}</span>
                <span v-if="col.isLockedRequired" class="text-amber-600 font-bold">Required</span>
                <span v-else-if="col.sample" class="truncate max-w-[120px]">Sample: {{ col.sample }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-1">
            <p class="text-[10px] text-slate-400">
              Columns checked will be included in the template. Click any header name above to rename it.
            </p>
            <button
              type="button"
              @click="downloadTemplate"
              class="btn-xs btn-primary gap-1 font-bold shrink-0"
            >
              <PhDownloadSimple :size="13" weight="bold" />
              <span>Download Customized .XLSX</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 1: Drag and Drop Upload Zone -->
      <div
        v-if="!file"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        class="border-2 border-dashed rounded-2xl p-5 sm:p-8 text-center transition-all cursor-pointer select-none"
        :class="[
          isDragging
            ? 'border-primary bg-primary/5 scale-[0.99]'
            : 'border-slate-300 dark:border-slate-700 hover:border-primary/60 bg-surface hover:bg-slate-50/50 dark:hover:bg-slate-800/20 active:scale-[0.99]'
        ]"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx, .xls, .csv"
          class="hidden"
          @change="handleFileSelect"
        />
        <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto mb-2.5 sm:mb-3 shadow-xs">
          <PhUploadSimple :size="26" weight="bold" />
        </div>
        <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm">
          Tap to choose file <span class="hidden sm:inline">or drag & drop spreadsheet</span>
        </h4>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Supports Microsoft Excel (.xlsx, .xls) and CSV files up to 20MB.
        </p>
      </div>

      <!-- Step 2: Parsed File Preview & Summary Card -->
      <div v-else class="space-y-4">
        <!-- Selected File Header -->
        <div class="bg-surface border border-default rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-xs">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
              <PhFileXls :size="20" weight="bold" />
            </div>
            <div class="min-w-0">
              <h4 class="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">{{ file.name }}</h4>
              <p class="text-[10px] text-slate-400 mt-0.5">{{ formatFileSize(file.size) }} • {{ parsedRows.length }} rows detected</p>
            </div>
          </div>
          <button
            v-if="!isUploading"
            type="button"
            @click="resetFile"
            class="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline shrink-0"
          >
            Change File
          </button>
        </div>

        <!-- Metric Highlights -->
        <div class="grid grid-cols-3 gap-2 sm:gap-3">
          <div class="bg-surface border border-default rounded-xl p-2.5 sm:p-3 text-center shadow-xs">
            <span class="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Total Rows</span>
            <p class="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 font-tabular">{{ parsedRows.length }}</p>
          </div>
          <div class="bg-surface border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-2.5 sm:p-3 text-center shadow-xs">
            <span class="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block truncate">Ready</span>
            <p class="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 font-tabular">{{ validRowsCount }}</p>
          </div>
          <div class="bg-surface border border-amber-200 dark:border-amber-900/40 rounded-xl p-2.5 sm:p-3 text-center shadow-xs">
            <span class="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block truncate">Skipped</span>
            <p class="text-sm sm:text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 font-tabular">{{ invalidRowsCount }}</p>
          </div>
        </div>

        <!-- Detected Column Mappings Strip -->
        <div v-if="detectedHeaders.length > 0" class="p-3 bg-surface border border-default rounded-xl space-y-1.5">
          <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Detected Columns in File ({{ detectedHeaders.length }})</span>
            <span class="text-slate-500 font-medium">Mapped to lead attributes</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="hdr in detectedHeaders"
              :key="hdr"
              class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-default"
            >
              {{ hdr }}
            </span>
          </div>
        </div>

        <!-- Incomplete Rows Notice -->
        <div v-if="invalidRowsCount > 0" class="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
          <PhWarningCircle :size="16" class="shrink-0 mt-0.5 text-amber-600" />
          <span>{{ invalidRowsCount }} row(s) are missing required fields ({{ isEducation ? 'First Name, Primary Mobile, or School Name' : 'Name or Mobile' }}) and will be skipped during import.</span>
        </div>

        <!-- Progress Bar when uploading -->
        <div v-if="isUploading" class="space-y-2 bg-surface border border-default rounded-xl p-4">
          <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
            <span>Importing leads...</span>
            <span>{{ uploadProgress }}% ({{ uploadedCount }}/{{ validRowsCount }})</span>
          </div>
          <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div class="bg-primary h-full transition-all duration-200 rounded-full" :style="{ width: `${uploadProgress}%` }"></div>
          </div>
        </div>

        <!-- Dynamic Preview Table -->
        <div class="border border-default rounded-xl overflow-hidden bg-surface">
          <div class="px-3.5 sm:px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border-b border-default flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="font-bold text-xs text-slate-700 dark:text-slate-200 truncate">Parsed Records Preview</span>
              <span class="text-[10px] font-semibold text-slate-400 shrink-0">({{ Math.min(parsedRows.length, 15) }} of {{ parsedRows.length }})</span>
            </div>
            <span class="text-[10px] text-slate-400 font-medium sm:hidden shrink-0">Swipe sideways &rarr;</span>
          </div>
          <div class="max-h-64 overflow-x-auto overflow-y-auto">
            <table class="w-full text-left text-xs whitespace-nowrap">
              <thead class="text-[10px] uppercase font-bold text-slate-400 border-b border-default bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10">
                <tr>
                  <th class="py-2 px-3">Status</th>
                  <th class="py-2 px-3">Name</th>
                  <th class="py-2 px-3">Primary Mobile</th>
                  <th class="py-2 px-3">Alternate Phone</th>
                  <th v-if="isEducation" class="py-2 px-3">School Name</th>
                  <th class="py-2 px-3">{{ isEducation ? 'Standard / Grade' : 'Property Type' }}</th>
                  <th v-if="isEducation" class="py-2 px-3">Education Board</th>
                  <th v-if="isEducation" class="py-2 px-3">Parent Name</th>
                  <th v-if="isEducation" class="py-2 px-3">Parent Mobile</th>
                  <th v-if="hasDetectedCustomAttributes" class="py-2 px-3">Custom Attributes</th>
                  <th class="py-2 px-3">Notes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr
                  v-for="(row, idx) in parsedRows.slice(0, 15)"
                  :key="idx"
                  :class="row._isValid ? 'hover:bg-slate-50/50 dark:hover:bg-slate-850/40' : 'bg-rose-50/30 dark:bg-rose-950/10 text-rose-700 dark:text-rose-400'"
                >
                  <td class="py-2 px-3">
                    <span
                      v-if="row._isValid"
                      class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full"
                    >
                      <PhCheckCircle :size="10" weight="bold" /> Valid
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded-full"
                      :title="row._errorReason"
                    >
                      <PhXCircle :size="10" weight="bold" /> Skip
                    </span>
                  </td>
                  <td class="py-2 px-3 font-semibold">{{ row.firstName }} {{ row.lastName }}</td>
                  <td class="py-2 px-3 font-mono text-[11px]">{{ row.mobile || '—' }}</td>
                  <td class="py-2 px-3 font-mono text-[11px] text-slate-500">{{ row.alternativeMobile || '—' }}</td>
                  <td v-if="isEducation" class="py-2 px-3 font-medium text-slate-700 dark:text-slate-200">
                    {{ row.schoolName || '—' }}
                  </td>
                  <td class="py-2 px-3">
                    <span v-if="isEducation" class="text-slate-600 dark:text-slate-300">
                      {{ row.standard || row.classInterest || '—' }}
                    </span>
                    <span v-else class="text-slate-600 dark:text-slate-300">{{ row.propertyType || row.budget || '—' }}</span>
                  </td>
                  <td v-if="isEducation" class="py-2 px-3 text-slate-600 dark:text-slate-300">
                    {{ row.educationBoard || '—' }}
                  </td>
                  <td v-if="isEducation" class="py-2 px-3 text-slate-600 dark:text-slate-300">
                    {{ row.parentName || '—' }}
                  </td>
                  <td v-if="isEducation" class="py-2 px-3 font-mono text-[11px] text-slate-500">
                    {{ row.parentMobile || '—' }}
                  </td>
                  <td v-if="hasDetectedCustomAttributes" class="py-2 px-3">
                    <div v-if="row.customFields && Object.keys(row.customFields).length > 0" class="flex flex-wrap gap-1 max-w-xs">
                      <span
                        v-for="(val, k) in row.customFields"
                        :key="k"
                        class="px-1.5 py-0.2 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 rounded text-[9px]"
                      >
                        {{ k }}: {{ val }}
                      </span>
                    </div>
                    <span v-else class="text-slate-400">—</span>
                  </td>
                  <td class="py-2 px-3 text-slate-400 truncate max-w-[140px]">{{ row.notes || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Drawer Footer Actions -->
    <template #footer>
      <div class="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:justify-end">
        <button
          type="button"
          @click="handleClose"
          class="btn-sm btn-secondary justify-center text-xs font-semibold py-2"
          :disabled="isUploading"
        >
          Cancel
        </button>
        <button
          v-if="file"
          type="button"
          @click="executeImport"
          class="btn-sm btn-primary gap-1.5 font-bold justify-center text-xs py-2 shadow-xs active:scale-[0.98] transition-transform truncate"
          :disabled="isUploading || validRowsCount === 0"
        >
          <PhFloppyDisk :size="14" weight="bold" class="shrink-0" />
          <span v-if="isUploading">Importing... ({{ uploadProgress }}%)</span>
          <span v-else class="truncate">Import {{ validRowsCount }} {{ isEducation ? 'Leads' : 'Leads' }}</span>
        </button>
      </div>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import {
  PhFileXls,
  PhUploadSimple,
  PhDownloadSimple,
  PhCheckCircle,
  PhXCircle,
  PhWarningCircle,
  PhFloppyDisk,
  PhSlidersHorizontal,
  PhPlus,
  PhTrash,
  PhLock,
  PhX,
  PhCheck,
} from '@phosphor-icons/vue';

import AppDrawer from '@/components/AppDrawer.vue';
import apiClient from '@/api/client';
import { createEducationLead } from '@/modules/education/api/endpoints';
import { fetchCustomFields } from '@/api/customFields';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  availableClasses: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'success']);

const store = useStore();
const isEducation = computed(() => store.getters['organization/isEducationTenant']);

// Drawer & upload state
const fileInput = ref(null);
const file = ref(null);
const isDragging = ref(false);
const parsedRows = ref([]);
const detectedHeaders = ref([]);
const isUploading = ref(false);
const uploadedCount = ref(0);

// Template Designer State
const isDesignerOpen = ref(false);
const showAddColumnModal = ref(false);
const newColName = ref('');
const newColSample = ref('');
const newColRequired = ref(false);

// Column Definitions List
const availableColumns = ref([]);

function getDefaultColumns() {
  if (isEducation.value) {
    return [
      {
        key: 'firstName',
        header: 'Student Name',
        fieldLabel: 'First Name',
        isLockedRequired: true,
        enabled: true,
        sample: 'Aarav',
        sample2: 'Priya',
        sample3: 'Rohan',
      },
      {
        key: 'lastName',
        header: 'Last Name',
        fieldLabel: 'Last Name',
        isLockedRequired: false,
        enabled: true,
        sample: 'Sharma',
        sample2: 'Verma',
        sample3: 'Patil',
      },
      {
        key: 'mobile',
        header: 'Primary Mobile',
        fieldLabel: 'Primary Mobile',
        isLockedRequired: true,
        enabled: true,
        sample: '9876543210',
        sample2: '9876543211',
        sample3: '9876543212',
      },
      {
        key: 'alternativeMobile',
        header: 'Alternate Phone',
        fieldLabel: 'Alternate Phone',
        isLockedRequired: false,
        enabled: true,
        sample: '9876543299',
        sample2: '',
        sample3: '9812345678',
      },
      {
        key: 'schoolName',
        header: 'School Name',
        fieldLabel: 'School Name',
        isLockedRequired: true,
        enabled: true,
        sample: 'Delhi Public School',
        sample2: 'St. Xavier High School',
        sample3: 'Balmohan Vidyamandir',
      },
      {
        key: 'institutionType',
        header: 'Institution Type',
        fieldLabel: 'Institution Type',
        isLockedRequired: false,
        enabled: true,
        sample: 'School',
        sample2: 'School',
        sample3: 'Private Classes',
      },
      {
        key: 'educationBoard',
        header: 'Education Board',
        fieldLabel: 'Education Board',
        isLockedRequired: false,
        enabled: true,
        sample: 'CBSE',
        sample2: 'ICSE',
        sample3: 'State Board',
      },
      {
        key: 'standard',
        header: 'Standard / Grade',
        fieldLabel: 'Standard / Grade',
        isLockedRequired: false,
        enabled: true,
        sample: '10',
        sample2: '8',
        sample3: '10',
      },
      {
        key: 'academicStream',
        header: 'Academic Stream',
        fieldLabel: 'Academic Stream',
        isLockedRequired: false,
        enabled: true,
        sample: 'Science',
        sample2: '',
        sample3: 'Commerce',
      },
      {
        key: 'currentCoaching',
        header: 'Current Coaching',
        fieldLabel: 'Current Coaching',
        isLockedRequired: false,
        enabled: true,
        sample: 'Allen Career Institute',
        sample2: '',
        sample3: 'Mahesh Tutorials',
      },
      {
        key: 'source',
        header: 'Inquiry Source',
        fieldLabel: 'Inquiry Source',
        isLockedRequired: false,
        enabled: true,
        sample: 'walk_in',
        sample2: 'website',
        sample3: 'referral',
      },
      {
        key: 'parentName',
        header: 'Parent Name',
        fieldLabel: 'Parent Name',
        isLockedRequired: false,
        enabled: true,
        sample: 'Rajesh Sharma',
        sample2: 'Sunita Verma',
        sample3: 'Suresh Patil',
      },
      {
        key: 'parentMobile',
        header: 'Parent Mobile',
        fieldLabel: 'Parent Mobile',
        isLockedRequired: false,
        enabled: true,
        sample: '9876543200',
        sample2: '9876543201',
        sample3: '9876543202',
      },
      {
        key: 'email',
        header: 'Email Address',
        fieldLabel: 'Email Address',
        isLockedRequired: false,
        enabled: true,
        sample: 'student@example.com',
        sample2: 'priya@example.com',
        sample3: '',
      },
      {
        key: 'status',
        header: 'Lead Status',
        fieldLabel: 'Lead Status',
        isLockedRequired: false,
        enabled: true,
        sample: 'new',
        sample2: 'contacted',
        sample3: 'follow_up',
      },
      {
        key: 'notes',
        header: 'Notes',
        fieldLabel: 'Notes / Remarks',
        isLockedRequired: false,
        enabled: true,
        sample: 'Interested in morning foundation batch',
        sample2: 'Requested fee structure',
        sample3: 'Weekend batch preferred',
      },
    ];
  }

  // Real estate workspace defaults
  return [
    {
      key: 'firstName',
      header: 'First Name',
      fieldLabel: 'First Name',
      isLockedRequired: true,
      enabled: true,
      sample: 'Rahul',
      sample2: 'Sneha',
      sample3: 'Amit',
    },
    {
      key: 'lastName',
      header: 'Last Name',
      fieldLabel: 'Last Name',
      isLockedRequired: false,
      enabled: true,
      sample: 'Mehta',
      sample2: 'Kapoor',
      sample3: 'Shah',
    },
    {
      key: 'mobile',
      header: 'Mobile',
      fieldLabel: 'Mobile',
      isLockedRequired: true,
      enabled: true,
      sample: '9876543210',
      sample2: '9876543211',
      sample3: '9876543212',
    },
    {
      key: 'email',
      header: 'Email',
      fieldLabel: 'Email Address',
      isLockedRequired: false,
      enabled: true,
      sample: 'rahul.mehta@example.com',
      sample2: 'sneha.k@example.com',
      sample3: '',
    },
    {
      key: 'propertyType',
      header: 'Property Type',
      fieldLabel: 'Property Type',
      isLockedRequired: false,
      enabled: true,
      sample: 'apartment',
      sample2: 'villa',
      sample3: 'plot',
    },
    {
      key: 'budget',
      header: 'Budget',
      fieldLabel: 'Budget',
      isLockedRequired: false,
      enabled: true,
      sample: '12500000',
      sample2: '25000000',
      sample3: '7500000',
    },
    {
      key: 'source',
      header: 'Source',
      fieldLabel: 'Inquiry Source',
      isLockedRequired: false,
      enabled: true,
      sample: 'website',
      sample2: 'walk_in',
      sample3: 'referral',
    },
    {
      key: 'status',
      header: 'Status',
      fieldLabel: 'Lead Status',
      isLockedRequired: false,
      enabled: true,
      sample: 'new',
      sample2: 'contacted',
      sample3: 'qualified',
    },
    {
      key: 'notes',
      header: 'Notes',
      fieldLabel: 'Notes / Remarks',
      isLockedRequired: false,
      enabled: true,
      sample: 'Looking for 3BHK in Whitefield',
      sample2: 'Ready to purchase within 3 months',
      sample3: 'Investment purpose',
    },
  ];
}

const enabledColumnsCount = computed(() => availableColumns.value.filter((c) => c.enabled).length);
const validRowsCount = computed(() => parsedRows.value.filter((r) => r._isValid).length);
const invalidRowsCount = computed(() => parsedRows.value.filter((r) => !r._isValid).length);
const uploadProgress = computed(() => {
  if (validRowsCount.value === 0) return 0;
  return Math.round((uploadedCount.value / validRowsCount.value) * 100);
});

const hasDetectedCustomAttributes = computed(() => {
  return parsedRows.value.some((r) => r.customFields && Object.keys(r.customFields).length > 0);
});

function getOptionString(opt) {
  if (!opt) return '';
  if (typeof opt === 'string') return opt;
  return opt.label || opt.value || opt.name || opt.text || String(opt);
}

async function loadCustomFieldsForTemplate() {
  try {
    const list = await fetchCustomFields('leads');
    const customFields = (Array.isArray(list) ? list : []).filter(
      (f) => !f.isStandard && f.isActive !== false
    );

    customFields.forEach((cf) => {
      const exists = availableColumns.value.some((c) => c.key === cf.key);
      if (!exists) {
        availableColumns.value.push({
          key: cf.key,
          header: cf.label,
          fieldLabel: `Custom: ${cf.label}`,
          isCustomField: true,
          isUserAdded: false,
          isLockedRequired: Boolean(cf.required),
          enabled: true,
          required: Boolean(cf.required),
          sample: cf.options?.length ? getOptionString(cf.options[0]) : `Sample ${cf.label}`,
          sample2: cf.options?.length > 1 ? getOptionString(cf.options[1]) : `Sample ${cf.label} 2`,
          sample3: cf.options?.length > 2 ? getOptionString(cf.options[2]) : `Sample ${cf.label} 3`,
        });
      }
    });
  } catch (err) {
    // Custom fields optional fallback
  }
}

function handleAddCustomColumn() {
  const name = newColName.value.trim();
  if (!name) return;
  const slugKey = name.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
  availableColumns.value.push({
    key: slugKey || `col_${Date.now()}`,
    header: name,
    fieldLabel: `Custom: ${name}`,
    isCustomField: false,
    isUserAdded: true,
    isLockedRequired: false,
    enabled: true,
    required: newColRequired.value,
    sample: newColSample.value.trim() || 'Sample value',
    sample2: '',
    sample3: '',
  });

  newColName.value = '';
  newColSample.value = '';
  newColRequired.value = false;
  showAddColumnModal.value = false;
}

function removeCustomColumn(index) {
  availableColumns.value.splice(index, 1);
}

function selectAllColumns() {
  availableColumns.value.forEach((c) => {
    c.enabled = true;
  });
}

function resetToDefaultColumns() {
  availableColumns.value = getDefaultColumns();
  loadCustomFieldsForTemplate();
}

function cleanMobileNumber(raw) {
  if (!raw) return '';
  let str = String(raw).trim();
  str = str.replace(/\.0+$/, '');
  str = str.replace(/[\s\-\(\)\[\]]/g, '');
  return str;
}

function normalizePropertyType(raw) {
  if (!raw) return undefined;
  const lower = String(raw).toLowerCase().trim();
  if (['apartment', 'flat', '1bhk', '2bhk', '3bhk', '4bhk', 'condo', 'penthouse'].some((k) => lower.includes(k))) {
    return 'apartment';
  }
  if (['villa', 'house', 'bungalow', 'rowhouse', 'row house', 'duplex'].some((k) => lower.includes(k))) {
    return 'villa';
  }
  if (['plot', 'land', 'site', 'layout'].some((k) => lower.includes(k))) {
    return 'plot';
  }
  if (['commercial', 'shop', 'retail', 'showroom', 'mall'].some((k) => lower.includes(k))) {
    return 'commercial';
  }
  if (['office', 'workspace', 'it park', 'co-working'].some((k) => lower.includes(k))) {
    return 'office';
  }
  return undefined;
}

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileSelect(e) {
  const selected = e.target.files?.[0];
  if (selected) {
    parseSpreadsheet(selected);
  }
}

function handleDrop(e) {
  isDragging.value = false;
  const dropped = e.dataTransfer.files?.[0];
  if (dropped) {
    parseSpreadsheet(dropped);
  }
}

function parseSpreadsheet(selectedFile) {
  file.value = selectedFile;
  parsedRows.value = [];
  detectedHeaders.value = [];
  uploadedCount.value = 0;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const XLSX = await import('xlsx');
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

      if (rawJson.length > 0) {
        detectedHeaders.value = Object.keys(rawJson[0]).map((h) => h.trim()).filter(Boolean);
      }

      parsedRows.value = rawJson.map((row) => normalizeRow(row));
    } catch (err) {
      store.dispatch('notifications/triggerToast', {
        message: 'Failed to read file. Please ensure it is a valid Excel or CSV spreadsheet.',
        type: 'error',
      });
      resetFile();
    }
  };
  reader.readAsArrayBuffer(selectedFile);
}

function isStandardProperty(cleanName) {
  const standardTokens = [
    'firstname', 'studentname', 'name', 'first', 'lastname', 'surname', 'last',
    'mobile', 'phone', 'contact', 'cell', 'tel', 'primaryphone', 'primarymobile',
    'altmobile', 'alternatemobile', 'altphone', 'alternatephone', 'secondarymobile',
    'schoolname', 'school', 'institute', 'institution', 'college', 'collegename',
    'institutiontype', 'insttype', 'educationboard', 'board', 'boardname',
    'standard', 'grade', 'standardgrade', 'academicstream', 'stream',
    'currentcoaching', 'coaching', 'privateclasses', 'classes', 'tuition',
    'source', 'inquirysource', 'parentname', 'parent', 'guardian', 'father', 'mother',
    'parentmobile', 'parentphone', 'email', 'mail', 'propertytype', 'budget',
    'notes', 'note', 'remarks', 'remark', 'inquiry', 'status', 'stage',
  ];
  return standardTokens.some((token) => cleanName === token || cleanName.includes(token));
}

function normalizeRow(row) {
  const rowKeys = Object.keys(row);

  // Helper: Find value from row matching given keywords
  const findVal = (keywords) => {
    for (const key of rowKeys) {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const kw of keywords) {
        const cleanKw = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanKey === cleanKw || cleanKey.includes(cleanKw)) {
          return String(row[key] ?? '').trim();
        }
      }
    }
    return '';
  };

  // Check user-configured column header first, then fallback to aliases
  const getColVal = (colKey, defaultKeywords) => {
    const col = availableColumns.value.find((c) => c.key === colKey);
    const keywords = [...defaultKeywords];
    if (col && col.header) {
      keywords.unshift(col.header);
    }
    return findVal(keywords);
  };

  const firstName = getColVal('firstName', ['firstname', 'studentname', 'name', 'first']) || 'Unknown';
  const lastName = getColVal('lastName', ['lastname', 'surname', 'last']);
  const rawMobile = getColVal('mobile', ['mobile', 'phone', 'contact', 'cell', 'tel', 'primaryphone', 'primarymobile']);
  const mobile = cleanMobileNumber(rawMobile);
  const rawAltMobile = getColVal('alternativeMobile', ['altmobile', 'alternatemobile', 'altphone', 'alternatephone', 'secondarymobile', 'secondaryphone', 'otherphone']);
  const alternativeMobile = cleanMobileNumber(rawAltMobile);
  const schoolName = getColVal('schoolName', ['schoolname', 'school', 'institute', 'institution', 'college', 'collegename', 'schoolcollege']);
  const institutionType = getColVal('institutionType', ['institutiontype', 'insttype', 'schooltype']);
  const educationBoard = getColVal('educationBoard', ['educationboard', 'board', 'boardname', 'syllabus']);
  const standard = getColVal('standard', ['standard', 'grade', 'standardgrade', 'class', 'std']);
  const academicStream = getColVal('academicStream', ['academicstream', 'stream', 'academic']);
  const currentCoaching = getColVal('currentCoaching', ['currentcoaching', 'coaching', 'privateclasses', 'classes', 'tuition']);
  const email = getColVal('email', ['email', 'mail', 'emailaddress']);
  const classInterest = getColVal('classInterest', ['class', 'grade', 'batch', 'course']);
  const parentName = getColVal('parentName', ['parentname', 'parent', 'guardian', 'father', 'mother']);
  const rawParentMobile = getColVal('parentMobile', ['parentmobile', 'parentphone', 'guardianmobile', 'guardianphone']);
  const parentMobile = cleanMobileNumber(rawParentMobile);
  const source = getColVal('source', ['source', 'inquirysource', 'channel']) || 'manual_entry';
  const propertyType = getColVal('propertyType', ['property', 'prop', 'propertytype']);
  const budget = getColVal('budget', ['budget', 'price', 'target']);
  const notes = getColVal('notes', ['note', 'notes', 'inquiry', 'remarks', 'comment', 'comments']);
  const status = getColVal('status', ['status', 'stage', 'leadstatus']) || 'new';

  // Dynamic Custom Fields & Extra User Columns Mapping
  const customFields = {};

  // 1. Check custom fields from Object Manager
  availableColumns.value
    .filter((c) => c.isCustomField)
    .forEach((cf) => {
      const val = findVal([cf.header, cf.key]);
      if (val !== undefined && val !== null && val !== '') {
        customFields[cf.key] = val;
      }
    });

  // 2. Check user-added custom columns
  availableColumns.value
    .filter((c) => c.isUserAdded)
    .forEach((col) => {
      const val = findVal([col.header, col.key]);
      if (val !== undefined && val !== null && val !== '') {
        customFields[col.key || col.header] = val;
      }
    });

  // 3. Catch-all for any extra columns present in the file that weren't standard attributes
  for (const rawKey of rowKeys) {
    const cleanToken = rawKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanToken) continue;
    if (!isStandardProperty(cleanToken)) {
      const val = String(row[rawKey] ?? '').trim();
      if (val && !customFields[rawKey] && !customFields[cleanToken]) {
        customFields[rawKey.trim()] = val;
      }
    }
  }

  let isValid = false;
  let errorReason = '';

  if (isEducation.value) {
    if (!mobile) {
      errorReason = 'Missing primary phone number';
    } else if (mobile.length < 7) {
      errorReason = 'Primary phone number too short (minimum 7 digits)';
    } else if (!firstName || firstName === 'Unknown') {
      errorReason = 'Missing student name';
    } else if (!schoolName) {
      errorReason = 'Missing school name';
    } else {
      isValid = true;
    }
  } else {
    if (!mobile) {
      errorReason = 'Missing mobile number';
    } else if (mobile.length < 7) {
      errorReason = 'Mobile number too short (minimum 7 digits)';
    } else if (!firstName || firstName === 'Unknown') {
      errorReason = 'Missing name';
    } else {
      isValid = true;
    }
  }

  // Check required custom columns
  if (isValid) {
    for (const col of availableColumns.value.filter((c) => c.enabled && c.required)) {
      const val = customFields[col.key] || customFields[col.header];
      if (!val) {
        isValid = false;
        errorReason = `Missing required column: ${col.header}`;
        break;
      }
    }
  }

  return {
    firstName,
    lastName,
    mobile,
    rawMobile,
    alternativeMobile,
    schoolName,
    institutionType,
    educationBoard,
    standard,
    academicStream,
    currentCoaching,
    email,
    classInterest,
    parentName,
    parentMobile,
    source,
    propertyType,
    budget,
    notes,
    status,
    customFields,
    _isValid: isValid,
    _errorReason: errorReason,
  };
}

async function downloadTemplate() {
  const XLSX = await import('xlsx');
  const cols = availableColumns.value.filter((c) => c.enabled);
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
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');

  const filename = isEducation.value
    ? 'TrackDeal_Student_Leads_Template.xlsx'
    : 'TrackDeal_Sales_Leads_Template.xlsx';

  XLSX.writeFile(wb, filename);
}

function resetFile() {
  file.value = null;
  parsedRows.value = [];
  detectedHeaders.value = [];
  uploadedCount.value = 0;
  if (fileInput.value) fileInput.value.value = '';
}

function handleClose() {
  if (isUploading.value) return;
  resetFile();
  emit('close');
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

async function executeImport() {
  const validRows = parsedRows.value.filter((r) => r._isValid);
  if (validRows.length === 0) return;

  isUploading.value = true;
  uploadedCount.value = 0;
  let successCount = 0;
  let failCount = 0;

  for (const row of validRows) {
    try {
      if (isEducation.value) {
        let classInterestId = undefined;
        if (row.classInterest && props.availableClasses?.length) {
          const target = row.classInterest.toLowerCase().trim();
          const match = props.availableClasses.find(
            (c) =>
              c.name?.toLowerCase().trim() === target ||
              c.name?.toLowerCase().includes(target) ||
              target.includes(c.name?.toLowerCase() || '')
          );
          if (match) classInterestId = match._id;
        }

        const noteParts = [];
        if (row.classInterest && !classInterestId) {
          noteParts.push(`Interested in: ${row.classInterest}`);
        }
        if (row.notes) {
          noteParts.push(row.notes);
        }

        await createEducationLead({
          firstName: row.firstName,
          lastName: row.lastName || '',
          mobile: row.mobile,
          alternativeMobile: row.alternativeMobile || undefined,
          schoolName: row.schoolName,
          institutionType: row.institutionType || undefined,
          educationBoard: row.educationBoard || undefined,
          standard: row.standard || undefined,
          academicStream: row.academicStream || undefined,
          currentCoaching: row.currentCoaching || undefined,
          email: row.email || undefined,
          parentName: row.parentName || undefined,
          parentMobile: row.parentMobile || undefined,
          source: row.source || 'manual_entry',
          classInterestId: classInterestId || undefined,
          status: ['new', 'assigned', 'contacted', 'follow_up', 'interested', 'demo_scheduled', 'demo_completed', 'negotiation', 'enrolled', 'lost'].includes(row.status?.toLowerCase())
            ? row.status.toLowerCase()
            : 'new',
          notes: noteParts.join(' | ') || undefined,
          customFields: row.customFields && Object.keys(row.customFields).length > 0
            ? row.customFields
            : undefined,
        });
      } else {
        const propType = normalizePropertyType(row.propertyType);
        const budgetNumber = row.budget ? Number(String(row.budget).replace(/[^0-9.]/g, '')) : undefined;

        const noteParts = [];
        if (row.propertyType && !propType) {
          noteParts.push(`Property Interest: ${row.propertyType}`);
        }
        if (row.notes) {
          noteParts.push(row.notes);
        }

        await apiClient.post('/leads', {
          firstName: row.firstName,
          lastName: row.lastName || '',
          mobile: row.mobile,
          email: row.email || undefined,
          source: row.source || 'manual_entry',
          status: row.status || 'new',
          notes: noteParts.join(' | ') || undefined,
          requirements: {
            propertyType: propType ? [propType] : undefined,
            budgetMax: budgetNumber && !isNaN(budgetNumber) ? budgetNumber : undefined,
          },
          customFields: row.customFields && Object.keys(row.customFields).length > 0
            ? row.customFields
            : undefined,
        });
      }
      successCount++;
    } catch (err) {
      failCount++;
    } finally {
      uploadedCount.value++;
    }
  }

  isUploading.value = false;

  store.dispatch('notifications/triggerToast', {
    message: `Batch import finished. Successfully imported ${successCount} leads${failCount > 0 ? ` (${failCount} failed)` : ''}.`,
    type: successCount > 0 ? 'success' : 'error',
  });

  resetFile();
  emit('success');
  emit('close');
}

onMounted(() => {
  availableColumns.value = getDefaultColumns();
  loadCustomFieldsForTemplate();
});
</script>
