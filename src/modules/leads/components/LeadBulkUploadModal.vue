<template>
  <AppDrawer
    :isOpen="isOpen"
    :title="modalTitle"
    :subtitle="modalSubtitle"
    width="760px"
    @close="handleClose"
  >
    <div class="space-y-6 text-xs">
      <!-- Top Action: Download Sample Template Card -->
      <!-- Top Action: Download Sample Template Card & Inline Customizer -->
      <div class="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-3.5 sm:p-4 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 shrink-0">
              <PhFileXls :size="22" weight="bold" />
            </div>
            <div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 text-xs">
                Spreadsheet Template ({{ target === 'students' ? 'Enrolled Students' : (isEducation ? 'Student Leads' : 'Sales Leads') }})
              </h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {{ enabledTemplateColumnsCount }} of {{ availableColumns.length }} columns active. Customize headers or download.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              @click="showCustomizeTemplate = !showCustomizeTemplate"
              class="btn-sm btn-secondary font-semibold text-xs gap-1.5 justify-center hover:border-primary/60 transition-colors w-full sm:w-auto"
              :class="{ 'bg-primary-50 dark:bg-primary-950/30 border-primary text-primary': showCustomizeTemplate }"
              title="Customize template headers and active columns"
            >
              <PhSlidersHorizontal :size="14" weight="bold" />
              <span>{{ showCustomizeTemplate ? 'Hide Customizer' : 'Customize Columns' }}</span>
            </button>
            <button
              type="button"
              @click="downloadTemplate"
              class="btn-sm btn-primary font-bold text-xs gap-1.5 justify-center hover:bg-primary-600 shadow-xs transition-colors w-full sm:w-auto"
            >
              <PhDownloadSimple :size="14" weight="bold" />
              <span>Download .XLSX</span>
            </button>
          </div>
        </div>

        <!-- Inline Customizer Collapsible Panel -->
        <div v-if="showCustomizeTemplate" class="pt-3 border-t border-slate-200 dark:border-slate-700/60 space-y-3">
          <!-- Toolbar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="relative flex-1">
              <input
                v-model="templateSearchQuery"
                type="text"
                placeholder="Filter columns..."
                class="w-full bg-surface border border-default rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary"
              />
              <PhMagnifyingGlass :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button
                type="button"
                @click="selectAllColumns"
                class="btn-sm btn-secondary text-[11px] font-semibold py-1 px-2.5"
              >
                Select All
              </button>
              <button
                type="button"
                @click="resetColumnsToDefault"
                class="btn-sm btn-secondary text-[11px] font-semibold py-1 px-2.5"
              >
                Reset Defaults
              </button>
              <button
                type="button"
                @click="showAddColumnRow = !showAddColumnRow"
                class="btn-sm btn-secondary text-[11px] font-semibold py-1 px-2.5 gap-1 text-primary"
              >
                <PhPlus :size="12" weight="bold" />
                <span>Add Column</span>
              </button>
            </div>
          </div>

          <!-- Add custom column inline form -->
          <div v-if="showAddColumnRow" class="p-2.5 bg-surface rounded-xl border border-primary/30 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              v-model="newColumnHeader"
              type="text"
              placeholder="New column header (e.g. Bus Route No.)"
              class="flex-1 bg-white dark:bg-slate-900 border border-default rounded-lg px-2.5 py-1 text-xs outline-none focus:border-primary"
            />
            <input
              v-model="newColumnSample"
              type="text"
              placeholder="Sample value (e.g. Route 42)"
              class="flex-1 bg-white dark:bg-slate-900 border border-default rounded-lg px-2.5 py-1 text-xs outline-none focus:border-primary"
            />
            <div class="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                @click="handleAddInlineColumn"
                class="btn-sm btn-primary font-bold text-xs py-1 px-3"
              >
                Save
              </button>
              <button
                type="button"
                @click="showAddColumnRow = false"
                class="btn-sm btn-secondary text-xs py-1 px-2"
              >
                Cancel
              </button>
            </div>
          </div>

          <!-- Columns List -->
          <div class="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800/60">
            <div
              v-for="(col, idx) in filteredTemplateColumns"
              :key="col.key || idx"
              class="pt-1.5 first:pt-0 flex items-center gap-2"
            >
              <input
                v-model="col.enabled"
                type="checkbox"
                :disabled="col.isLockedRequired"
                @change="persistTemplateColumns"
                class="rounded text-primary focus:ring-primary w-4 h-4 disabled:opacity-50 cursor-pointer shrink-0"
              />
              <div class="flex-1 min-w-0">
                <input
                  v-model="col.header"
                  type="text"
                  @input="persistTemplateColumns"
                  class="w-full bg-surface border border-default focus:border-primary rounded px-2 py-0.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none"
                  placeholder="Column header"
                />
              </div>
              <span
                v-if="col.isLockedRequired"
                class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 uppercase shrink-0"
              >
                Required
              </span>
              <span
                v-else-if="col.isCustomField"
                class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 uppercase shrink-0"
              >
                Custom Field
              </span>
              <span
                v-else-if="col.isUserAdded"
                class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 uppercase shrink-0"
              >
                Added
              </span>
              <button
                v-if="col.isUserAdded"
                type="button"
                @click="removeTemplateColumn(col)"
                class="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950 shrink-0"
                title="Remove column"
              >
                <PhTrash :size="13" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 1: Drag and Drop Upload Zone -->
      <div
        v-if="!file"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        class="border-2 border-dashed rounded-2xl p-5 sm:p-8 text-center transition-all cursor-pointer select-none relative overflow-hidden"
        :class="[
          isDragging
            ? 'border-primary bg-primary/5 scale-[0.99]'
            : 'border-slate-300 dark:border-slate-700 hover:border-primary/60 bg-surface hover:bg-slate-50/50 dark:hover:bg-slate-800/20 active:scale-[0.99]'
        ]"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv, text/plain, application/csv, application/x-csv"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
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
          <div v-if="missingRequiredColumns.length > 0" class="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <span class="text-[10px] font-bold text-rose-600 dark:text-rose-400">Missing Required Column(s):</span>
            <span
              v-for="col in missingRequiredColumns"
              :key="col.key"
              class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60 inline-flex items-center gap-1"
            >
              <PhX :size="10" weight="bold" />
              {{ col.header }} (Column Mismatch)
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
import { ref, computed, watch, onMounted } from 'vue';
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
  PhX,
  PhCheck,
  PhMagnifyingGlass,
} from '@phosphor-icons/vue';

import AppDrawer from '@/components/AppDrawer.vue';
import apiClient from '@/api/client';
import { createEducationLead, createEducationStudent } from '@/modules/education/api/endpoints';
import { fetchCustomFields } from '@/api/customFields';
import { downloadExcelWorkbook } from '@/utils/fileDownload';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  target: { type: String, default: 'leads' }, // 'leads' | 'students'
  availableClasses: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'success']);

const store = useStore();
const isEducation = computed(() => store.getters['organization/isEducationTenant']);

const modalTitle = computed(() => {
  if (props.target === 'students') return 'Bulk Import Enrolled Students';
  return isEducation.value ? 'Bulk Import Student Leads' : 'Bulk Import Sales Leads';
});

const modalSubtitle = computed(() => {
  if (props.target === 'students') {
    return 'Upload Excel or CSV spreadsheets to batch enroll admitted students into the database.';
  }
  return isEducation.value
    ? 'Upload Excel or CSV spreadsheets to batch enroll admissions prospects.'
    : 'Upload Excel or CSV spreadsheets to batch import property sales leads.';
});

// Drawer & upload state
const fileInput = ref(null);
const file = ref(null);
const isDragging = ref(false);
const parsedRows = ref([]);
const detectedHeaders = ref([]);
const rawJsonData = ref([]);
const cachedDuplicates = ref(new Map());
const isUploading = ref(false);
const uploadedCount = ref(0);

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
        sample2: 'College',
        sample3: 'Private',
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

function getDefaultStudentsColumns() {
  return [
    { key: 'firstName', header: 'First Name', fieldLabel: 'First Name', isLockedRequired: true, enabled: true, sample: 'Rahul', sample2: 'Pooja', sample3: 'Ankit' },
    { key: 'lastName', header: 'Last Name', fieldLabel: 'Last Name', isLockedRequired: false, enabled: true, sample: 'Sharma', sample2: 'Deshmukh', sample3: 'Joshi' },
    { key: 'mobile', header: 'Primary Mobile', fieldLabel: 'Primary Mobile', type: 'phone', isLockedRequired: true, enabled: true, sample: '9876543210', sample2: '9876543211', sample3: '9876543212' },
    { key: 'alternativeMobile', header: 'Alternate Phone', fieldLabel: 'Alternate Phone', type: 'phone', isLockedRequired: false, enabled: true, sample: '9876543299', sample2: '', sample3: '' },
    { key: 'schoolName', header: 'College / School Name', fieldLabel: 'School Name', isLockedRequired: true, enabled: true, sample: 'St. Xavier High School', sample2: 'DPS Pune', sample3: 'National College' },
    { key: 'institutionType', header: 'Institution Type', fieldLabel: 'Institution Type', isLockedRequired: false, enabled: true, sample: 'School', sample2: 'College', sample3: 'Private' },
    { key: 'educationBoard', header: 'Education Board', fieldLabel: 'Education Board', isLockedRequired: false, enabled: true, sample: 'CBSE', sample2: 'State Board', sample3: 'ICSE' },
    { key: 'standard', header: 'Standard / Grade', fieldLabel: 'Standard / Grade', type: 'select', options: ['8', '9', '10', '11', '12'], isLockedRequired: false, enabled: true, sample: '11', sample2: '12', sample3: '10' },
    { key: 'academicStream', header: 'Academic Stream', fieldLabel: 'Academic Stream', isLockedRequired: false, enabled: true, sample: 'Science', sample2: 'Commerce', sample3: 'Science' },
    { key: 'parentName', header: 'Parent Name', fieldLabel: 'Parent Name', isLockedRequired: false, enabled: true, sample: 'Suresh Sharma', sample2: 'Nitin Deshmukh', sample3: 'Manoj Joshi' },
    { key: 'parentMobile', header: 'Parent Mobile', fieldLabel: 'Parent Mobile', type: 'phone', isLockedRequired: false, enabled: true, sample: '9876543200', sample2: '9876543201', sample3: '9876543202' },
    { key: 'email', header: 'Email Address', fieldLabel: 'Email Address', type: 'email', isLockedRequired: false, enabled: true, sample: 'rahul.s@example.com', sample2: 'pooja.d@example.com', sample3: '' },
    { key: 'status', header: 'Student Status', fieldLabel: 'Student Status', isLockedRequired: false, enabled: true, sample: 'active', sample2: 'active', sample3: 'active' },
    { key: 'notes', header: 'Academic Notes', fieldLabel: 'Academic Notes', isLockedRequired: false, enabled: true, sample: 'Enrolled in full-year batch', sample2: 'Targeting IIT JEE', sample3: 'Scholarship student' },
  ];
}

function loadTemplateColumns() {
  const key = props.target === 'students'
    ? 'trackdeal_template_columns_students'
    : (isEducation.value ? 'trackdeal_template_columns_leads' : 'trackdeal_template_columns_sales_leads');

  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        availableColumns.value = parsed;
        return;
      }
    } catch (e) {}
  }
  availableColumns.value = props.target === 'students' ? getDefaultStudentsColumns() : getDefaultColumns();
}

function persistTemplateColumns() {
  try {
    const key = props.target === 'students'
      ? 'trackdeal_template_columns_students'
      : (isEducation.value ? 'trackdeal_template_columns_leads' : 'trackdeal_template_columns_sales_leads');
    localStorage.setItem(key, JSON.stringify(availableColumns.value));
  } catch (e) {}
  revalidateParsedRows();
}

const showCustomizeTemplate = ref(false);
const templateSearchQuery = ref('');
const showAddColumnRow = ref(false);
const newColumnHeader = ref('');
const newColumnSample = ref('');
const newColumnType = ref('text');

const enabledTemplateColumnsCount = computed(() => {
  return availableColumns.value.filter((c) => c.enabled).length;
});

const filteredTemplateColumns = computed(() => {
  const q = templateSearchQuery.value.trim().toLowerCase();
  if (!q) return availableColumns.value;
  return availableColumns.value.filter(
    (c) =>
      (c.header && c.header.toLowerCase().includes(q)) ||
      (c.key && c.key.toLowerCase().includes(q)) ||
      (c.fieldLabel && c.fieldLabel.toLowerCase().includes(q))
  );
});

function selectAllColumns() {
  availableColumns.value.forEach((c) => {
    c.enabled = true;
  });
  persistTemplateColumns();
}

function resetColumnsToDefault() {
  if (props.target === 'students') {
    availableColumns.value = getDefaultStudentsColumns();
  } else {
    availableColumns.value = getDefaultColumns();
  }
  loadCustomFieldsForTemplate();
  persistTemplateColumns();
}

function removeTemplateColumn(col) {
  const idx = availableColumns.value.findIndex((c) => c === col || (c.key === col.key && c.isUserAdded));
  if (idx !== -1) {
    availableColumns.value.splice(idx, 1);
    persistTemplateColumns();
  }
}

function handleAddInlineColumn() {
  const name = newColumnHeader.value.trim();
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
    required: false,
    sample: newColumnSample.value.trim() || 'Sample value',
    sample2: '',
    sample3: '',
  });
  persistTemplateColumns();
  newColumnHeader.value = '';
  newColumnSample.value = '';
  showAddColumnRow.value = false;
}

const validRowsCount = computed(() => parsedRows.value.filter((r) => r._isValid).length);
const invalidRowsCount = computed(() => parsedRows.value.filter((r) => !r._isValid).length);
const uploadProgress = computed(() => {
  if (validRowsCount.value === 0) return 0;
  return Math.round((uploadedCount.value / validRowsCount.value) * 100);
});

const missingRequiredColumns = computed(() => {
  if (detectedHeaders.value.length === 0) return [];

  const detectedClean = detectedHeaders.value.map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, '')
  );

  return availableColumns.value.filter((col) => {
    if (!col.enabled || !col.required) return false;

    const cleanHeader = (col.header || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanKey = (col.key || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const aliases = [cleanHeader, cleanKey];
    if (col.key === 'firstName') aliases.push('firstname', 'studentname', 'name', 'first');
    else if (col.key === 'mobile') aliases.push('mobile', 'phone', 'contact', 'cell', 'primaryphone', 'primarymobile');
    else if (col.key === 'schoolName') aliases.push('schoolname', 'school', 'institute', 'institution', 'college', 'collegename');

    const matched = detectedClean.some((dh) =>
      aliases.some((alias) => dh === alias || dh.includes(alias) || alias.includes(dh))
    );

    return !matched;
  });
});

const invalidReasonsSummary = computed(() => {
  const reasons = new Set();
  parsedRows.value
    .filter((r) => !r._isValid && r._errorReason)
    .forEach((r) => reasons.add(r._errorReason));
  return Array.from(reasons);
});

function revalidateParsedRows() {
  if (rawJsonData.value.length === 0) return;
  const seenMobilesInFile = new Map();
  parsedRows.value = rawJsonData.value.map((row, idx) =>
    normalizeRow(row, idx, { seenMobilesInFile, existingDbMobiles: cachedDuplicates.value })
  );
}

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
    const mod = props.target === 'students' ? 'students' : 'leads';
    const list = await fetchCustomFields(mod);
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
          type: cf.type || 'text',
          options: cf.options || [],
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

function hasLetters(val) {
  if (!val) return false;
  return /[a-zA-Z]/.test(String(val).trim());
}

function cleanDigitsOnly(val) {
  if (!val) return '';
  return String(val).replace(/[^0-9]/g, '');
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
  rawJsonData.value = [];
  cachedDuplicates.value = new Map();
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
      rawJsonData.value = rawJson;

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

function normalizeRow(row, rowIndex = 0, context = {}) {
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
  let institutionType = getColVal('institutionType', ['institutiontype', 'insttype', 'schooltype']);
  if (institutionType) {
    const itLower = institutionType.trim().toLowerCase();
    if (itLower === 'school') institutionType = 'School';
    else if (itLower === 'college') institutionType = 'College';
    else if (itLower === 'private' || itLower === 'private classes' || itLower === 'classes' || itLower === 'tuition' || itLower === 'coaching') institutionType = 'Private';
    else if (itLower === 'integrated' || itLower === 'integrated college' || itLower === 'integrated school') institutionType = 'Integrated';
  }
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

  const mobileDigits = cleanDigitsOnly(rawMobile);

  // Salesforce-grade field validation:
  // 1. Primary Mobile Validation (Format & Letters Check)
  if (!rawMobile || !rawMobile.trim()) {
    errorReason = isEducation.value ? 'Missing primary phone number' : 'Missing mobile number';
  } else if (hasLetters(rawMobile)) {
    errorReason = `Invalid primary phone: "${rawMobile}" contains letters or text. Mobile number must be numeric.`;
  } else if (mobileDigits.length < 10 || mobileDigits.length > 15) {
    errorReason = `Invalid primary phone: "${rawMobile}". Must be a valid 10-digit mobile number.`;
  } else if (!firstName || firstName === 'Unknown') {
    errorReason = isEducation.value ? 'Missing student name' : 'Missing name';
  } else if (isEducation.value && !schoolName) {
    errorReason = 'Missing school name';
  } else {
    isValid = true;
  }

  // 2. Duplicate Phone Check (Spreadsheet In-file & Database Lookup)
  if (isValid && mobileDigits) {
    const s10 = mobileDigits.slice(-10);
    if (context.seenMobilesInFile && context.seenMobilesInFile.has(s10)) {
      const prevRow = context.seenMobilesInFile.get(s10);
      isValid = false;
      errorReason = `Duplicate in spreadsheet: Phone "${rawMobile}" was already found in row ${prevRow}`;
    } else if (context.existingDbMobiles && context.existingDbMobiles.has(s10)) {
      const existingName = context.existingDbMobiles.get(s10);
      isValid = false;
      errorReason = `Duplicate record: Phone "${rawMobile}" is already registered in TrackDeal (${existingName})`;
    } else if (context.seenMobilesInFile) {
      context.seenMobilesInFile.set(s10, (rowIndex ?? 0) + 2);
    }
  }

  // 3. Class / Standard Validation in Education
  if (isValid && isEducation.value && standard && standard.trim()) {
    const standardCol = availableColumns.value.find((c) => c.key === 'standard');
    const allowedStandards = standardCol?.options?.length
      ? standardCol.options.map((o) => getOptionString(o).trim().toLowerCase())
      : ['8', '9', '10', '11', '12'];

    const stdClean = standard.trim().toLowerCase();
    const isAllowed = allowedStandards.some((opt) => opt === stdClean);

    if (!isAllowed) {
      isValid = false;
      const allowedDisplay = standardCol?.options?.length
        ? standardCol.options.map(getOptionString).join(', ')
        : '8, 9, 10, 11, 12';
      errorReason = `Invalid Standard / Grade: "${standard}". Allowed values are: ${allowedDisplay}`;
    }
  }

  // 4. Alternate Phone Validation
  if (isValid && rawAltMobile && rawAltMobile.trim()) {
    if (hasLetters(rawAltMobile)) {
      isValid = false;
      errorReason = `Invalid alternate phone: "${rawAltMobile}" contains letters. Mobile number must be numeric.`;
    } else if (cleanDigitsOnly(rawAltMobile).length < 10) {
      isValid = false;
      errorReason = `Invalid alternate phone: "${rawAltMobile}". Must be a valid 10-digit mobile number.`;
    }
  }

  // 5. Parent Mobile Validation
  if (isValid && rawParentMobile && rawParentMobile.trim()) {
    if (hasLetters(rawParentMobile)) {
      isValid = false;
      errorReason = `Invalid parent mobile: "${rawParentMobile}" contains letters. Mobile number must be numeric.`;
    } else if (cleanDigitsOnly(rawParentMobile).length < 10) {
      isValid = false;
      errorReason = `Invalid parent mobile: "${rawParentMobile}". Must be a valid 10-digit mobile number.`;
    }
  }

  // 6. Email Address Validation
  if (isValid && email && email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      isValid = false;
      errorReason = `Invalid email address format: "${email}"`;
    }
  }

  // 7. Institution Type & Board Validation
  if (isValid && isEducation.value && institutionType && institutionType.trim()) {
    const allowedInst = ['School', 'College', 'Private', 'Integrated'];
    if (!allowedInst.some((a) => a.toLowerCase() === institutionType.toLowerCase())) {
      isValid = false;
      errorReason = `Invalid Institution Type: "${institutionType}". Allowed: ${allowedInst.join(', ')}`;
    }
  }

  if (isValid && isEducation.value && educationBoard && educationBoard.trim()) {
    const allowedBoards = ['CBSE', 'ICSE', 'State Board'];
    if (!allowedBoards.some((b) => b.toLowerCase() === educationBoard.toLowerCase())) {
      isValid = false;
      errorReason = `Invalid Education Board: "${educationBoard}". Allowed: ${allowedBoards.join(', ')}`;
    }
  }

  // 8. Custom Columns Data Type Validation
  if (isValid) {
    for (const col of availableColumns.value.filter((c) => c.enabled)) {
      if (isEducation.value || props.target === 'students') {
        if (['budget', 'propertyType'].includes(col.key)) continue;
      }
      const val = customFields[col.key] || customFields[col.header];
      if (col.required && (!val || !String(val).trim())) {
        isValid = false;
        const isHeaderMissing = !detectedHeaders.value.some((h) => {
          const cleanH = h.toLowerCase().replace(/[^a-z0-9]/g, '');
          const cleanHeader = (col.header || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const cleanKey = (col.key || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          return cleanH === cleanHeader || cleanH === cleanKey || cleanH.includes(cleanKey) || cleanH.includes(cleanHeader);
        });

        if (isHeaderMissing) {
          errorReason = `Column header mismatch: "${col.header}" is required in template but not found in spreadsheet`;
        } else {
          errorReason = `Missing required field: "${col.header}"`;
        }
        break;
      }
      if (val && col.type) {
        const type = String(col.type).toLowerCase();
        if (type === 'number') {
          const numClean = String(val).replace(/,/g, '').trim();
          if (isNaN(Number(numClean))) {
            isValid = false;
            errorReason = `Invalid number in "${col.header}": "${val}". Expected numeric value.`;
            break;
          }
        } else if (type === 'phone') {
          if (hasLetters(val)) {
            isValid = false;
            errorReason = `Invalid phone in "${col.header}": "${val}". Cannot contain letters.`;
            break;
          } else if (cleanDigitsOnly(val).length < 10) {
            isValid = false;
            errorReason = `Invalid phone in "${col.header}": "${val}". Must be a valid 10-digit number.`;
            break;
          }
        } else if (type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(val).trim())) {
            isValid = false;
            errorReason = `Invalid email in "${col.header}": "${val}".`;
            break;
          }
        } else if (type === 'date') {
          if (isNaN(Date.parse(val))) {
            isValid = false;
            errorReason = `Invalid date format in "${col.header}": "${val}".`;
            break;
          }
        } else if (type === 'select' && Array.isArray(col.options) && col.options.length > 0) {
          const optStrings = col.options.map(getOptionString).map((s) => s.toLowerCase().trim());
          const valLower = String(val).toLowerCase().trim();
          if (!optStrings.includes(valLower)) {
            isValid = false;
            errorReason = `Invalid option in "${col.header}": "${val}". Allowed: ${col.options.map(getOptionString).join(', ')}`;
            break;
          }
        }
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
  const sheetName = props.target === 'students' ? 'Students' : 'Leads';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const filename = props.target === 'students'
    ? 'TrackDeal_Enrolled_Students_Template.xlsx'
    : (isEducation.value
        ? 'TrackDeal_Student_Leads_Template.xlsx'
        : 'TrackDeal_Sales_Leads_Template.xlsx');

  await downloadExcelWorkbook(wb, filename);
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
      if (props.target === 'students') {
        let classId = undefined;
        if (row.classInterest && props.availableClasses?.length) {
          const target = row.classInterest.toLowerCase().trim();
          const match = props.availableClasses.find(
            (c) =>
              c.name?.toLowerCase().trim() === target ||
              c.name?.toLowerCase().includes(target) ||
              target.includes(c.name?.toLowerCase() || '')
          );
          if (match) classId = match._id;
        }

        await createEducationStudent({
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
          source: row.source || 'walk_in',
          classId: classId || undefined,
          status: ['active', 'inactive', 'graduated', 'dropped'].includes(row.status?.toLowerCase())
            ? row.status.toLowerCase()
            : 'active',
          notes: row.notes || undefined,
          customFields: row.customFields && Object.keys(row.customFields).length > 0
            ? row.customFields
            : undefined,
        });
      } else if (isEducation.value) {
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
      const errMsg = err?.response?.data?.message || err?.message || 'Import failed';
      row._isValid = false;
      row._errorReason = errMsg;
    } finally {
      uploadedCount.value++;
    }
  }

  isUploading.value = false;

  const entityLabel = props.target === 'students' ? 'students' : 'leads';
  store.dispatch('notifications/triggerToast', {
    message: `Batch import finished. Successfully imported ${successCount} ${entityLabel}${failCount > 0 ? ` (${failCount} failed)` : ''}.`,
    type: successCount > 0 ? 'success' : 'error',
  });

  resetFile();
  emit('success');
  emit('close');
}

onMounted(() => {
  loadTemplateColumns();
  loadCustomFieldsForTemplate();
});

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      loadTemplateColumns();
      loadCustomFieldsForTemplate();
    }
  }
);
</script>
