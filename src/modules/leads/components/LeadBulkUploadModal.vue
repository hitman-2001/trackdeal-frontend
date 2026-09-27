<template>
  <AppDrawer
    :isOpen="isOpen"
    :title="isEducation ? 'Bulk Import Student Leads' : 'Bulk Import Sales Leads'"
    :subtitle="isEducation ? 'Upload Excel or CSV spreadsheets to batch enroll admissions prospects.' : 'Upload Excel or CSV spreadsheets to batch import property sales leads.'"
    width="680px"
    @close="handleClose"
  >
    <div class="space-y-6 text-xs">
      <!-- Maglo-Style Top Action: Download Sample Template Card -->
      <div class="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 shrink-0">
            <PhFileXls :size="22" weight="bold" />
          </div>
          <div>
            <h4 class="font-bold text-slate-800 dark:text-slate-100 text-xs">Formatted Excel Template</h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Download our pre-structured spreadsheet with standardized columns.</p>
          </div>
        </div>
        <button
          type="button"
          @click="downloadTemplate"
          class="btn-sm btn-secondary font-bold text-xs gap-1.5 shrink-0 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
        >
          <PhDownloadSimple :size="14" weight="bold" />
          <span>Download .XLSX</span>
        </button>
      </div>

      <!-- Step 1: Drag and Drop Upload Zone -->
      <div
        v-if="!file"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        class="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer select-none"
        :class="[
          isDragging
            ? 'border-primary bg-primary/5 scale-[0.99]'
            : 'border-slate-300 dark:border-slate-700 hover:border-primary/60 bg-surface hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
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
        <div class="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <PhUploadSimple :size="28" weight="bold" />
        </div>
        <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm">
          Click or drag & drop spreadsheet here
        </h4>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Supports Microsoft Excel (.xlsx, .xls) and standard CSV files up to 20MB.
        </p>
      </div>

      <!-- Step 2: Parsed File Preview & Summary Card -->
      <div v-else class="space-y-4">
        <!-- Selected File Header -->
        <div class="bg-surface border border-default rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
              <PhFileXls :size="22" weight="bold" />
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

        <!-- Maglo Metric Pill Highlights -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-surface border border-default rounded-xl p-3 text-center">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Rows</span>
            <p class="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{{ parsedRows.length }}</p>
          </div>
          <div class="bg-surface border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-3 text-center">
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Ready to Import</span>
            <p class="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{{ validRowsCount }}</p>
          </div>
          <div class="bg-surface border border-amber-200 dark:border-amber-900/40 rounded-xl p-3 text-center">
            <span class="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Incomplete</span>
            <p class="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{{ invalidRowsCount }}</p>
          </div>
        </div>

        <!-- Incomplete Rows Notice -->
        <div v-if="invalidRowsCount > 0" class="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
          <PhWarningCircle :size="16" class="shrink-0 mt-0.5 text-amber-600" />
          <span>{{ invalidRowsCount }} row(s) are missing required student/lead Name or Mobile number and will be skipped during import.</span>
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

        <!-- Preview Table (First 15 records) -->
        <div class="border border-default rounded-xl overflow-hidden bg-surface">
          <div class="px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border-b border-default flex items-center justify-between">
            <span class="font-bold text-xs text-slate-700 dark:text-slate-200">Parsed Records Preview</span>
            <span class="text-[10px] font-semibold text-slate-400">Showing first {{ Math.min(parsedRows.length, 15) }} of {{ parsedRows.length }}</span>
          </div>
          <div class="max-h-60 overflow-y-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-[10px] uppercase font-bold text-slate-400 border-b border-default bg-slate-50/50 dark:bg-slate-900/50 sticky top-0">
                <tr>
                  <th class="py-2 px-3">Status</th>
                  <th class="py-2 px-3">Name</th>
                  <th class="py-2 px-3">Mobile</th>
                  <th class="py-2 px-3">{{ isEducation ? 'Class / Interest' : 'Property / Budget' }}</th>
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
                  <td class="py-2 px-3">
                    <span v-if="isEducation" class="text-slate-600 dark:text-slate-300">{{ row.classInterest || row.grade || '—' }}</span>
                    <span v-else class="text-slate-600 dark:text-slate-300">{{ row.propertyType || row.budget || '—' }}</span>
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
      <button
        type="button"
        @click="handleClose"
        class="btn-sm btn-secondary"
        :disabled="isUploading"
      >
        Cancel
      </button>
      <button
        v-if="file"
        type="button"
        @click="executeImport"
        class="btn-sm btn-primary gap-1.5 font-bold"
        :disabled="isUploading || validRowsCount === 0"
      >
        <PhFloppyDisk :size="14" weight="bold" />
        <span v-if="isUploading">Importing... ({{ uploadProgress }}%)</span>
        <span v-else>Import {{ validRowsCount }} {{ isEducation ? 'Student Leads' : 'Leads' }}</span>
      </button>
    </template>
  </AppDrawer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import {
  PhFileXls,
  PhUploadSimple,
  PhDownloadSimple,
  PhCheckCircle,
  PhXCircle,
  PhWarningCircle,
  PhFloppyDisk,
} from '@phosphor-icons/vue';

import AppDrawer from '@/components/AppDrawer.vue';
import apiClient from '@/api/client';
import { createEducationLead } from '@/modules/education/api/endpoints';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  availableClasses: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'success']);

const store = useStore();
const isEducation = computed(() => store.getters['organization/isEducationTenant']);

const fileInput = ref(null);
const file = ref(null);
const isDragging = ref(false);
const parsedRows = ref([]);
const isUploading = ref(false);
const uploadedCount = ref(0);

const validRowsCount = computed(() => parsedRows.value.filter((r) => r._isValid).length);
const invalidRowsCount = computed(() => parsedRows.value.filter((r) => !r._isValid).length);
const uploadProgress = computed(() => {
  if (validRowsCount.value === 0) return 0;
  return Math.round((uploadedCount.value / validRowsCount.value) * 100);
});

function cleanMobileNumber(raw) {
  if (!raw) return '';
  let str = String(raw).trim();
  // Strip trailing .0 if Excel parsed integer as float
  str = str.replace(/\.0+$/, '');
  // Strip common formatting spaces, dashes, parentheses
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

function normalizeRow(row) {
  // Normalize column keys regardless of casing or formatting
  const findVal = (keywords) => {
    for (const key of Object.keys(row)) {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const kw of keywords) {
        if (cleanKey.includes(kw)) {
          return String(row[key] ?? '').trim();
        }
      }
    }
    return '';
  };

  const firstName = findVal(['firstname', 'studentname', 'name', 'first']) || 'Unknown';
  const lastName = findVal(['lastname', 'surname', 'last']);
  const rawMobile = findVal(['mobile', 'phone', 'contact', 'cell', 'tel']);
  const mobile = cleanMobileNumber(rawMobile);
  const email = findVal(['email', 'mail']);
  const classInterest = findVal(['class', 'grade', 'batch', 'course']);
  const parentName = findVal(['parent', 'guardian', 'father', 'mother']);
  const propertyType = findVal(['property', 'prop', 'type']);
  const budget = findVal(['budget', 'price', 'target']);
  const notes = findVal(['note', 'inquiry', 'remarks', 'comment']);
  const status = findVal(['status']) || 'new';

  const isValid = Boolean(firstName && firstName !== 'Unknown' && mobile && mobile.length >= 7);
  const errorReason = !mobile
    ? 'Missing mobile number'
    : mobile.length < 7
    ? 'Mobile number too short (minimum 7 digits)'
    : (!firstName || firstName === 'Unknown')
    ? 'Missing name'
    : '';

  return {
    firstName,
    lastName,
    mobile,
    rawMobile,
    email,
    classInterest,
    parentName,
    propertyType,
    budget,
    notes,
    status,
    _isValid: isValid,
    _errorReason: errorReason,
  };
}

async function downloadTemplate() {
  const XLSX = await import('xlsx');
  const templateData = isEducation.value
    ? [
        ['First Name', 'Last Name', 'Mobile', 'Email', 'Class Interest', 'Parent Name', 'Status', 'Notes'],
        ['Aarav', 'Sharma', '9876543210', 'aarav.parent@gmail.com', '12th JEE', 'Rajesh Sharma', 'new', 'Interested in weekend batch'],
        ['Priya', 'Verma', '9876543211', 'priya.v@gmail.com', '10th Foundation', 'Sunita Verma', 'contacted', 'Requested fee details'],
        ['Rohan', 'Iyer', '9876543212', 'rohan.iyer@gmail.com', 'NEET Batch 2026', 'Venkat Iyer', 'new', 'Hostel requirement'],
      ]
    : [
        ['First Name', 'Last Name', 'Mobile', 'Email', 'Property Type', 'Budget', 'Source', 'Notes'],
        ['Rahul', 'Mehta', '9876543210', 'rahul.mehta@example.com', 'apartment', '12500000', 'website', 'Looking for 3BHK in Whitefield'],
        ['Sneha', 'Kapoor', '9876543211', 'sneha.k@example.com', 'villa', '25000000', 'walk_in', 'Ready to purchase within 3 months'],
      ];

  const ws = XLSX.utils.aoa_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');
  XLSX.writeFile(wb, isEducation.value ? 'TrackDeal_Student_Leads_Template.xlsx' : 'TrackDeal_Sales_Leads_Template.xlsx');
}

function resetFile() {
  file.value = null;
  parsedRows.value = [];
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
        // Resolve classInterest against available classes if provided
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
          email: row.email || undefined,
          parentName: row.parentName || undefined,
          classInterestId: classInterestId || undefined,
          status: ['new', 'assigned', 'contacted', 'follow_up'].includes(row.status?.toLowerCase())
            ? row.status.toLowerCase()
            : 'new',
          notes: noteParts.join(' | ') || undefined,
          source: 'manual_entry',
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
          source: 'manual_entry',
          notes: noteParts.join(' | ') || undefined,
          requirements: {
            propertyType: propType ? [propType] : undefined,
            budgetMax: budgetNumber && !isNaN(budgetNumber) ? budgetNumber : undefined,
          },
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
</script>
