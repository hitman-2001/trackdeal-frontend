<template>
  <div class="w-full max-w-full min-w-0 space-y-3 sm:space-y-4 text-xs">
    <!-- Accordion 1: Institute Identity / Organization Details -->
    <div class="bg-surface border border-default rounded-xl shadow-xs overflow-hidden transition-all">
      <button
        type="button"
        @click="toggleSection('identity')"
        class="w-full flex items-center justify-between p-3.5 sm:p-4 text-left bg-surface hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors select-none"
      >
        <div class="flex items-center gap-3 min-w-0">
          <span class="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <PhBuilding :size="18" weight="bold" />
          </span>
          <div class="min-w-0">
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {{ isEducation ? 'Institute Identity' : 'Organization Details' }}
            </h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Official registered details of your organization across reports and documents.
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0 ml-2">
          <span v-if="orgForm.companyName" class="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 max-w-[150px] truncate">
            {{ orgForm.companyName }}
          </span>
          <component :is="openSections.identity ? PhCaretUp : PhCaretDown" :size="16" class="text-slate-400" weight="bold" />
        </div>
      </button>

      <div v-show="openSections.identity" class="p-3.5 sm:p-5 border-t border-default space-y-4 sm:space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full min-w-0">
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {{ isEducation ? 'Institute / Organization Name' : 'Company / Legal Name' }}
              <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="orgForm.companyName"
              type="text"
              :placeholder="isEducation ? 'e.g. Manch Classes Institute' : 'e.g. TrackDeal Technologies Pvt Ltd'"
              class="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 font-medium transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Primary Administrator / SPOC
              <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="orgForm.spoc"
              type="text"
              placeholder="e.g. Mayank Rai"
              class="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              GSTIN / Tax ID
              <span class="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              v-model="orgForm.gstin"
              type="text"
              placeholder="e.g. 27AAAAA1111A1Z1"
              class="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 uppercase tracking-wider font-mono transition-all"
            />
          </div>
        </div>

        <div class="flex justify-end pt-3 border-t border-default">
          <button
            @click="saveProfile"
            class="btn-md btn-primary gap-1.5 w-full sm:w-auto justify-center shadow-xs active:scale-[0.98] transition-transform"
            :disabled="isUpdating"
          >
            <PhFloppyDisk :size="15" weight="bold" />
            <span>{{ isUpdating ? 'Saving Changes...' : 'Save Identity Details' }}</span>
          </button>
        </div>
      </div>
    </div>
    <!-- Accordion 2: Regional Localization & Currency -->
    <div class="bg-surface border border-default rounded-xl shadow-xs overflow-hidden transition-all">
      <button
        type="button"
        @click="toggleSection('localization')"
        class="w-full flex items-center justify-between p-3.5 sm:p-4 text-left bg-surface hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors select-none"
      >
        <div class="flex items-center gap-3 min-w-0">
          <span class="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <PhGlobe :size="18" weight="bold" />
          </span>
          <div class="min-w-0">
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              Regional Localization & Currency
            </h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Set standard financial currency formats and scheduling timezones.
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0 ml-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60">
            {{ orgForm.currency || 'INR' }}
          </span>
          <component :is="openSections.localization ? PhCaretUp : PhCaretDown" :size="16" class="text-slate-400" weight="bold" />
        </div>
      </button>

      <div v-show="openSections.localization" class="p-3.5 sm:p-5 border-t border-default space-y-4 sm:space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full min-w-0">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Default Currency
            </label>
            <select
              v-model="orgForm.currency"
              class="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 font-medium transition-all"
            >
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="USD" disabled>USD ($) - US Dollar (Enterprise Plan only)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Default Timezone
            </label>
            <select
              v-model="orgForm.timezone"
              class="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 transition-all"
            >
              <option value="Asia/Kolkata">(GMT+05:30) Mumbai, New Delhi, Kolkata</option>
              <option value="GMT">(GMT+00:00) UTC / London</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end pt-3 border-t border-default">
          <button
            @click="saveProfile"
            class="btn-md btn-primary gap-1.5 w-full sm:w-auto justify-center shadow-xs active:scale-[0.98] transition-transform"
            :disabled="isUpdating"
          >
            <PhFloppyDisk :size="15" weight="bold" />
            <span>{{ isUpdating ? 'Saving Changes...' : 'Save Regional Settings' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Accordion 3: Branding & Theme Colors -->
    <div class="bg-surface border border-default rounded-xl shadow-xs overflow-hidden transition-all">
      <button
        type="button"
        @click="toggleSection('theme')"
        class="w-full flex items-center justify-between p-3.5 sm:p-4 text-left bg-surface hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors select-none"
      >
        <div class="flex items-center gap-3 min-w-0">
          <span class="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <PhPalette :size="18" weight="bold" />
          </span>
          <div class="min-w-0">
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              Branding & Theme Colors
            </h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Curated color themes and workspace palette customization.
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0 ml-2">
          <!-- Active theme preview swatch dot -->
          <span class="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs" :style="{ backgroundColor: themeConfig.primaryHex }"></span>
          <component :is="openSections.theme ? PhCaretUp : PhCaretDown" :size="16" class="text-slate-400" weight="bold" />
        </div>
      </button>

      <div v-show="openSections.theme" class="p-3.5 sm:p-5 border-t border-default space-y-4 sm:space-y-6">
        <!-- Admin Restriction Notice -->
        <div
          v-if="!isOrgAdmin"
          class="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-300 text-xs"
        >
          <PhLockKey :size="20" weight="bold" class="shrink-0 text-amber-600" />
          <div>
            <div class="font-bold">Admin Privileges Required</div>
            <div class="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
              Workspace branding colors can only be altered by Organization Administrators.
            </div>
          </div>
        </div>

        <!-- Preset Palettes Card -->
        <div class="bg-surface border border-default rounded-xl p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-default pb-3">
            <div>
              <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Curated Color Themes</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Quickly apply a professionally balanced color scheme, or fine-tune individual colors below.
              </p>
            </div>
            <button
              v-if="isOrgAdmin"
              @click="resetBrandingColors"
              class="text-xs text-slate-500 hover:text-primary dark:hover:text-accent-400 font-semibold flex items-center gap-1.5 transition-colors"
              title="Reset all colors to system defaults"
            >
              <PhArrowCounterClockwise :size="14" weight="bold" />
              <span>Reset to Defaults</span>
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <button
              v-for="preset in presets"
              :key="preset.name"
              type="button"
              :disabled="!isOrgAdmin"
              @click="selectPreset(preset)"
              class="p-3 rounded-xl border text-left transition-all relative flex flex-col gap-2 group hover:shadow-xs disabled:cursor-not-allowed"
              :class="[
                isPresetActive(preset)
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                  : 'border-default hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
              ]"
            >
              <!-- Color swatch chips -->
              <div class="flex items-center gap-1.5">
                <span class="w-4 h-4 rounded-full border border-black/10 shadow-xs" :style="{ backgroundColor: preset.primaryHex }"></span>
                <span class="w-4 h-4 rounded-full border border-black/10 shadow-xs" :style="{ backgroundColor: preset.navbarHex }"></span>
                <span class="w-4 h-4 rounded-full border border-black/10 shadow-xs" :style="{ backgroundColor: preset.backgroundHex }"></span>
                <span class="w-4 h-4 rounded-full border border-black/10 shadow-xs" :style="{ backgroundColor: preset.fontHex }"></span>
              </div>
              <div>
                <div class="font-bold text-xs text-slate-800 dark:text-slate-100 leading-tight">
                  {{ preset.name }}
                </div>
                <div class="text-[10px] text-slate-400 mt-0.5">
                  {{ preset.desc }}
                </div>
              </div>
              <div
                v-if="isPresetActive(preset)"
                class="absolute top-2 right-2 text-primary"
              >
                <PhCheck :size="14" weight="bold" />
              </div>
            </button>
          </div>
        </div>

        <!-- Custom Color Customizers Card -->
        <div class="bg-surface border border-default rounded-xl p-6 shadow-xs space-y-5">
          <div class="border-b border-default pb-3">
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Custom Brand Palette</h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Click any color swatch or type a hexadecimal color code to customize specific interface elements.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- 1. Buttons & Primary Accents -->
            <div class="p-4 rounded-xl border border-default bg-slate-50/60 dark:bg-slate-800/40 flex items-start gap-4">
              <div class="relative w-11 h-11 rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-600 shrink-0 cursor-pointer">
                <input
                  v-model="themeConfig.primaryHex"
                  :disabled="!isOrgAdmin"
                  type="color"
                  class="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0 disabled:cursor-not-allowed"
                  @input="updateColorsInRealTime"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-800 dark:text-slate-100 text-xs">Buttons & Accents</span>
                  <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    Primary
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Primary buttons, active tabs, and highlights</p>
                <div class="mt-2.5 flex items-center gap-1.5">
                  <span class="text-xs font-mono font-bold text-slate-400">#</span>
                  <input
                    :value="cleanHex(themeConfig.primaryHex)"
                    @input="handleHexInput('primaryHex', $event.target.value)"
                    :disabled="!isOrgAdmin"
                    maxlength="6"
                    placeholder="264F3C"
                    class="w-24 px-2 py-1 text-xs font-mono font-semibold uppercase bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-primary focus:border-primary outline-none disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <!-- 2. Navigation Bar & Sidebar -->
            <div class="p-4 rounded-xl border border-default bg-slate-50/60 dark:bg-slate-800/40 flex items-start gap-4">
              <div class="relative w-11 h-11 rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-600 shrink-0 cursor-pointer">
                <input
                  v-model="themeConfig.navbarHex"
                  :disabled="!isOrgAdmin"
                  type="color"
                  class="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0 disabled:cursor-not-allowed"
                  @input="updateColorsInRealTime"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-800 dark:text-slate-100 text-xs">Navigation Bar</span>
                  <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    Header
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Top navigation header and sidebar menu background</p>
                <div class="mt-2.5 flex items-center gap-1.5">
                  <span class="text-xs font-mono font-bold text-slate-400">#</span>
                  <input
                    :value="cleanHex(themeConfig.navbarHex)"
                    @input="handleHexInput('navbarHex', $event.target.value)"
                    :disabled="!isOrgAdmin"
                    maxlength="6"
                    placeholder="FFFFFF"
                    class="w-24 px-2 py-1 text-xs font-mono font-semibold uppercase bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-primary focus:border-primary outline-none disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <!-- 3. Workspace Background -->
            <div class="p-4 rounded-xl border border-default bg-slate-50/60 dark:bg-slate-800/40 flex items-start gap-4">
              <div class="relative w-11 h-11 rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-600 shrink-0 cursor-pointer">
                <input
                  v-model="themeConfig.backgroundHex"
                  :disabled="!isOrgAdmin"
                  type="color"
                  class="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0 disabled:cursor-not-allowed"
                  @input="updateColorsInRealTime"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-800 dark:text-slate-100 text-xs">App Background</span>
                  <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    Canvas
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Workspace page background and layout canvas</p>
                <div class="mt-2.5 flex items-center gap-1.5">
                  <span class="text-xs font-mono font-bold text-slate-400">#</span>
                  <input
                    :value="cleanHex(themeConfig.backgroundHex)"
                    @input="handleHexInput('backgroundHex', $event.target.value)"
                    :disabled="!isOrgAdmin"
                    maxlength="6"
                    placeholder="F8FAFC"
                    class="w-24 px-2 py-1 text-xs font-mono font-semibold uppercase bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-primary focus:border-primary outline-none disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <!-- 4. Text & Typography Color -->
            <div class="p-4 rounded-xl border border-default bg-slate-50/60 dark:bg-slate-800/40 flex items-start gap-4">
              <div class="relative w-11 h-11 rounded-xl overflow-hidden shadow-xs border border-slate-300 dark:border-slate-600 shrink-0 cursor-pointer">
                <input
                  v-model="themeConfig.fontHex"
                  :disabled="!isOrgAdmin"
                  type="color"
                  class="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0 disabled:cursor-not-allowed"
                  @input="updateColorsInRealTime"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-800 dark:text-slate-100 text-xs">Text & Font Color</span>
                  <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    Typography
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Headings, titles, and body content text color</p>
                <div class="mt-2.5 flex items-center gap-1.5">
                  <span class="text-xs font-mono font-bold text-slate-400">#</span>
                  <input
                    :value="cleanHex(themeConfig.fontHex)"
                    @input="handleHexInput('fontHex', $event.target.value)"
                    :disabled="!isOrgAdmin"
                    maxlength="6"
                    placeholder="0F172A"
                    class="w-24 px-2 py-1 text-xs font-mono font-semibold uppercase bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-primary focus:border-primary outline-none disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Real-Time Interactive Preview -->
        <div class="bg-surface border border-default rounded-xl p-6 shadow-xs space-y-4">
          <div class="border-b border-default pb-3">
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Live Preview</h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Simulated interface preview displaying your customized palette.
            </p>
          </div>

          <div
            class="rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden shadow-inner transition-colors duration-200"
            :style="{ backgroundColor: themeConfig.backgroundHex || '#f8fafc' }"
          >
            <!-- Mock Navbar -->
            <div
              class="px-4 py-2.5 flex items-center justify-between border-b border-black/10 transition-colors duration-200"
              :style="{ backgroundColor: themeConfig.navbarHex || '#ffffff' }"
            >
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-md flex items-center justify-center font-bold text-white text-[11px] shadow-xs" :style="{ backgroundColor: themeConfig.primaryHex }">
                  TD
                </span>
                <span class="font-bold text-xs text-slate-800 tracking-tight">
                  {{ orgForm.companyName || 'TrackDeal Workspace' }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                <span class="px-2 py-1 rounded bg-black/5">Dashboard</span>
                <span class="px-2 py-1 rounded" :style="{ backgroundColor: themeConfig.primaryHex + '18', color: themeConfig.primaryHex }">
                  {{ isEducation ? 'Classes' : 'Deals' }}
                </span>
                <span class="px-2 py-1 rounded bg-black/5">Reports</span>
              </div>
            </div>

            <!-- Mock Workspace Area -->
            <div class="p-5 space-y-3">
              <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg p-4 border border-black/5 shadow-xs space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <h4
                      class="text-xs font-bold transition-colors duration-200"
                      :style="{ color: themeConfig.fontHex || '#0f172a' }"
                    >
                      Active Operations Overview
                    </h4>
                    <p
                      class="text-[10px] mt-0.5 transition-colors duration-200 opacity-75"
                      :style="{ color: themeConfig.fontHex || '#0f172a' }"
                    >
                      Real-time records and administrative workflow metrics.
                    </p>
                  </div>
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg text-white font-bold text-[11px] shadow-xs transition-colors duration-200"
                    :style="{ backgroundColor: themeConfig.primaryHex || '#264f3c' }"
                  >
                    + Add Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Action -->
        <div v-if="isOrgAdmin" class="flex justify-end pt-2">
          <button
            @click="saveBrandingColors"
            class="btn-md btn-primary gap-2 px-6"
          >
            <PhFloppyDisk :size="16" weight="bold" />
            <span>Apply Theme Changes</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { 
  PhBuilding, 
  PhGlobe,
  PhPalette, 
  PhFloppyDisk, 
  PhArrowCounterClockwise, 
  PhCheck, 
  PhLockKey,
  PhCaretDown,
  PhCaretUp,
} from '@phosphor-icons/vue';
import { applyThemeTokensToDOM } from '@/store/modules/ui';
import { useOrgSettingsQuery, useUpdateOrgSettingsMutation } from '../queries';

const store = useStore();

const isEducation = computed(() => store.getters['organization/isEducationTenant']);

const isOrgAdmin = computed(() => {
  const role = String(store.getters['auth/userRole'] || '').toLowerCase();
  return ['super_admin', 'system_admin', 'org_admin', 'organization_admin'].includes(role);
});

// Branding default tokens (TrackDeal teal-green default)
const defaultTokens = {
  primaryHex: '#264f3c',
  secondaryHex: '#43617e',
  navbarHex: '#ffffff',
  backgroundHex: '#f8fafc',
  fontHex: '#0f172a'
};

const getInitialTheme = () => {
  try {
    const orgTokens = store?.state?.organization?.branding?.themeTokens;
    if (orgTokens) return { ...defaultTokens, ...orgTokens };
    const saved = localStorage.getItem('theme_custom_hsl');
    if (saved) return { ...defaultTokens, ...JSON.parse(saved) };
  } catch (e) {}
  return { ...defaultTokens };
};

const themeConfig = ref(getInitialTheme());

const presets = [
  {
    name: 'TrackDeal Emerald',
    desc: 'Signature Green',
    primaryHex: '#264f3c',
    navbarHex: '#ffffff',
    backgroundHex: '#f8fafc',
    fontHex: '#0f172a'
  },
  {
    name: 'Corporate Navy',
    desc: 'Executive Deep Blue',
    primaryHex: '#1d4ed8',
    navbarHex: '#ffffff',
    backgroundHex: '#f8fafc',
    fontHex: '#0f172a'
  },
  {
    name: 'Indigo Modern',
    desc: 'Vibrant & Clean',
    primaryHex: '#4f46e5',
    navbarHex: '#ffffff',
    backgroundHex: '#f8fafc',
    fontHex: '#0f172a'
  },
  {
    name: 'Royal Burgundy',
    desc: 'Refined Crimson',
    primaryHex: '#881337',
    navbarHex: '#ffffff',
    backgroundHex: '#f8fafc',
    fontHex: '#0f172a'
  },
  {
    name: 'Slate Minimal',
    desc: 'Balanced Charcoal',
    primaryHex: '#334155',
    navbarHex: '#ffffff',
    backgroundHex: '#f8fafc',
    fontHex: '#0f172a'
  }
];

// Accordion open/close state: identity open by default on mobile; all open on desktop
const openSections = ref({
  identity: true,
  localization: typeof window !== 'undefined' ? window.innerWidth >= 640 : true,
  theme: typeof window !== 'undefined' ? window.innerWidth >= 640 : false,
});

const toggleSection = (section) => {
  openSections.value[section] = !openSections.value[section];
};

// Local forms state
const orgForm = ref({
  companyName: '',
  spoc: '',
  gstin: '',
  currency: 'INR',
  timezone: 'Asia/Kolkata'
});

// Fetch Query Layer
const { data: orgSettings } = useOrgSettingsQuery();
const { mutateAsync: updateOrgSettings, isPending: isUpdating } = useUpdateOrgSettingsMutation();

watch(orgSettings, (newVal) => {
  if (newVal) {
    orgForm.value = {
      companyName: newVal.name || newVal.companyName || '',
      spoc: newVal.spoc || '',
      gstin: newVal.gstNumber || newVal.gstin || '',
      currency: newVal.settings?.currency || newVal.currency || 'INR',
      timezone: newVal.settings?.timezone || newVal.timezone || 'Asia/Kolkata'
    };
    if (newVal.branding?.themeTokens) {
      themeConfig.value = { ...defaultTokens, ...newVal.branding.themeTokens };
      applyThemeTokensToDOM(themeConfig.value);
    }
  }
}, { immediate: true });

function cleanHex(val) {
  return String(val || '').replace('#', '').toUpperCase();
}

function handleHexInput(key, rawVal) {
  const clean = rawVal.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
  if (clean.length === 6) {
    themeConfig.value[key] = `#${clean}`;
    updateColorsInRealTime();
  }
}

function selectPreset(preset) {
  if (!isOrgAdmin.value) return;
  themeConfig.value.primaryHex = preset.primaryHex;
  themeConfig.value.navbarHex = preset.navbarHex;
  themeConfig.value.backgroundHex = preset.backgroundHex;
  themeConfig.value.fontHex = preset.fontHex;
  updateColorsInRealTime();
}

function isPresetActive(preset) {
  return (
    themeConfig.value.primaryHex?.toLowerCase() === preset.primaryHex.toLowerCase() &&
    themeConfig.value.navbarHex?.toLowerCase() === preset.navbarHex.toLowerCase() &&
    themeConfig.value.backgroundHex?.toLowerCase() === preset.backgroundHex.toLowerCase() &&
    themeConfig.value.fontHex?.toLowerCase() === preset.fontHex.toLowerCase()
  );
}

// Branding save & preview
function updateColorsInRealTime() {
  applyThemeTokensToDOM(themeConfig.value);
}

async function resetBrandingColors() {
  themeConfig.value = { ...defaultTokens };
  applyThemeTokensToDOM(null);
  localStorage.removeItem('theme_custom_hsl');
  try {
    await updateOrgSettings({
      branding: {
        primaryColor: defaultTokens.primaryHex,
        secondaryColor: defaultTokens.navbarHex,
        themeTokens: defaultTokens,
      }
    });
    store.commit('organization/SET_ORGANIZATION_BRANDING', {
      primaryColor: defaultTokens.primaryHex,
      secondaryColor: defaultTokens.navbarHex,
      themeTokens: defaultTokens,
    });
    store.dispatch('notifications/triggerToast', {
      message: 'Theme colors restored to defaults for all organization members.',
      type: 'info'
    });
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to sync theme reset with organization server.',
      type: 'error'
    });
  }
}

async function saveBrandingColors() {
  applyThemeTokensToDOM(themeConfig.value);
  localStorage.setItem('theme_custom_hsl', JSON.stringify(themeConfig.value));
  try {
    await updateOrgSettings({
      branding: {
        primaryColor: themeConfig.value.primaryHex,
        secondaryColor: themeConfig.value.navbarHex,
        themeTokens: themeConfig.value,
      }
    });
    store.commit('organization/SET_ORGANIZATION_BRANDING', {
      primaryColor: themeConfig.value.primaryHex,
      secondaryColor: themeConfig.value.navbarHex,
      themeTokens: themeConfig.value,
    });
    store.dispatch('notifications/triggerToast', {
      message: 'Theme colors saved and applied for all organization users.',
      type: 'success'
    });
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Theme applied locally, but could not sync to organization server.',
      type: 'warning'
    });
  }
}

// Save General Profile
async function saveProfile() {
  try {
    const payload = {
      name: orgForm.value.companyName,
      gstNumber: orgForm.value.gstin,
      settings: {
        currency: orgForm.value.currency,
        timezone: orgForm.value.timezone
      }
    };
    await updateOrgSettings(payload);
    store.dispatch('notifications/triggerToast', {
      message: 'Profile configuration updated.',
      type: 'success'
    });
  } catch (err) {
    store.dispatch('notifications/triggerToast', {
      message: 'Failed to update organization metadata details.',
      type: 'error'
    });
  }
}
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
