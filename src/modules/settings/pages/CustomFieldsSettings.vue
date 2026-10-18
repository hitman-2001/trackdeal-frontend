<template>
  <div class="w-full max-w-full min-w-0 space-y-3 sm:space-y-6 text-xs pb-28 sm:pb-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="font-heading text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100">
          Object Manager & Form Fields
        </h1>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Review standard built-in fields and configure custom metadata attributes for your CRM objects.
        </p>
      </div>
      <button
        type="button"
        @click="openCreateDrawer"
        class="btn-md btn-primary gap-1.5 w-full sm:w-auto justify-center shrink-0 shadow-xs active:scale-[0.98] transition-transform"
      >
        <PhPlus :size="15" weight="bold" />
        <span>New Custom Field</span>
      </button>
    </div>

    <!-- Object Selector Tabs -->
    <div class="flex items-center border-b border-default overflow-x-auto space-x-2 pb-0.5 scrollbar-none w-full min-w-0" style="-webkit-overflow-scrolling: touch;">
      <button
        v-for="obj in OBJECTS"
        :key="obj.key"
        type="button"
        @click="selectModule(obj.key)"
        class="py-2 px-3 border-b-2 font-bold text-xs transition-colors shrink-0 flex items-center gap-2"
        :class="activeModule === obj.key
          ? 'border-primary text-primary dark:text-primary-400'
          : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'"
      >
        <component :is="obj.icon" :size="15" weight="bold" />
        <span>{{ obj.label }}</span>
        <span
          class="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
          :class="activeModule === obj.key
            ? 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'"
        >
          {{ getModuleTotalCount(obj.key) }}
        </span>
      </button>
    </div>

    <!-- Stats Row (Desktop 4-col; hidden on mobile to eliminate clutter) -->
    <div class="hidden sm:grid sm:grid-cols-4 gap-3">
      <div class="bg-surface border border-default rounded-xl p-3 shadow-xs">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Total Fields</span>
        <span class="text-lg font-extrabold text-slate-800 dark:text-slate-100 font-tabular">{{ currentModuleFields.length }}</span>
      </div>
      <div class="bg-surface border border-default rounded-xl p-3 shadow-xs">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Standard Built-in</span>
        <span class="text-lg font-extrabold text-slate-700 dark:text-slate-300 font-tabular">{{ standardCount }}</span>
      </div>
      <div class="bg-surface border border-default rounded-xl p-3 shadow-xs">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Custom Fields</span>
        <span class="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 font-tabular">{{ customCount }}</span>
      </div>
      <div class="bg-surface border border-default rounded-xl p-3 shadow-xs">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Mandatory Fields</span>
        <span class="text-lg font-extrabold text-amber-600 dark:text-amber-400 font-tabular">{{ requiredCount }}</span>
      </div>
    </div>

    <!-- Mobile Clean Summary (One single unobtrusive line) -->
    <div class="flex sm:hidden items-center justify-between px-1 text-[11px] text-slate-500 font-medium">
      <span>{{ currentModuleFields.length }} total fields ({{ standardCount }} standard, {{ customCount }} custom)</span>
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
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            title="Clear search"
          >
            <PhX :size="12" weight="bold" />
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-12 text-center text-slate-400 space-y-2">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
        <p class="text-xs">Loading fields...</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center justify-between"
      >
        <span>{{ error }}</span>
        <button
          type="button"
          @click="loadFields"
          class="underline font-bold text-[11px] hover:text-red-700"
        >
          Retry
        </button>
      </div>

      <!-- Content Views: Desktop Table & Mobile Cards -->
      <div v-else-if="filteredFields.length > 0">
        <!-- 1. Desktop High-Density Table (>= 768px) -->
        <div class="hidden md:block overflow-x-auto border border-default rounded-lg">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-b border-default font-semibold">
                <th class="p-3">Field Label</th>
                <th class="p-3">API Key</th>
                <th class="p-3">Data Type</th>
                <th class="p-3">Options / Choices</th>
                <th class="p-3 text-center">Required</th>
                <th class="p-3 text-center">Status</th>
                <th class="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr
                v-for="field in filteredFields"
                :key="field._id || field.key"
                class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <!-- Label with Standard vs Custom Badge -->
                <td class="p-3">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-850 dark:text-slate-100">
                      {{ field.label }}
                    </span>
                    <span
                      v-if="field.isStandard"
                      class="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-default tracking-wide uppercase"
                    >
                      Standard
                    </span>
                    <span
                      v-else
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
                  <template v-if="field.type === 'select' && field.options && field.options.length">
                    <div class="flex flex-wrap gap-1 max-w-xs">
                      <span
                        v-for="(opt, idx) in field.options.slice(0, 3)"
                        :key="idx"
                        class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-700 dark:text-slate-300 border border-default"
                      >
                        {{ opt.label || opt.value || opt }}
                      </span>
                      <span
                        v-if="field.options.length > 3"
                        class="text-[10px] text-slate-400 self-center font-semibold"
                      >
                        +{{ field.options.length - 3 }} more
                      </span>
                    </div>
                  </template>
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
                  <div v-if="!field.isStandard" class="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      @click="openEditDrawer(field)"
                      title="Edit custom field"
                      class="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <PhPencilSimple :size="14" />
                    </button>
                    <button
                      type="button"
                      @click="openDeleteDialog(field)"
                      title="Delete custom field"
                      class="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <PhTrash :size="14" />
                    </button>
                  </div>
                  <span
                    v-else
                    class="text-slate-400 dark:text-slate-500 text-[11px] font-medium inline-flex items-center justify-center gap-1 select-none"
                    title="System built-in standard field"
                  >
                    <PhLockSimple :size="12" />
                    <span>Standard</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 2. Mobile Clean Streamlined List (< 768px) -->
        <div class="block md:hidden bg-white dark:bg-slate-900 rounded-xl border border-default divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-xs">
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
                  <span>{{ field.type === 'select' ? `Dropdown (${field.options?.length || 0})` : 'Text' }}</span>
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

              <!-- Actions (Custom edit/delete or Standard lock) -->
              <div v-if="!field.isStandard" class="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  @click="openEditDrawer(field)"
                  class="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Edit custom field"
                >
                  <PhPencilSimple :size="14" />
                </button>
                <button
                  type="button"
                  @click="openDeleteDialog(field)"
                  class="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 transition-colors"
                  title="Delete custom field"
                >
                  <PhTrash :size="14" />
                </button>
              </div>
              <div
                v-else
                class="text-slate-400 dark:text-slate-500 shrink-0 p-0.5"
                title="System Standard Built-in"
              >
                <PhLockSimple :size="12" />
              </div>
            </div>

            <!-- Row 3 (optional): Options preview for select dropdowns -->
            <div
              v-if="field.type === 'select' && field.options && field.options.length"
              class="flex items-center gap-1 flex-wrap pt-0.5"
            >
              <span
                v-for="(opt, idx) in field.options.slice(0, 3)"
                :key="idx"
                class="px-1.5 py-0.2 bg-slate-50 dark:bg-slate-800/80 rounded text-[9px] text-slate-600 dark:text-slate-300 border border-default"
              >
                {{ opt.label || opt.value || opt }}
              </span>
              <span v-if="field.options.length > 3" class="text-[9px] text-slate-400 font-semibold">
                +{{ field.options.length - 3 }} more
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
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

    <!-- Create / Edit Drawer -->
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
              <span>{{ opt.label || opt.value || opt }}</span>
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
import { ref, computed, onMounted } from 'vue';
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
} from '@phosphor-icons/vue';
import AppDrawer from '@/components/AppDrawer.vue';
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue';
import {
  fetchCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
} from '@/api/customFields';

const OBJECTS = [
  { key: 'leads', label: 'Student Leads', icon: PhStudent },
  { key: 'students', label: 'Enrolled Students', icon: PhUserCheck },
];

const activeModule = ref('leads');
const allFields = ref([]);
const loading = ref(false);
const error = ref('');
const searchQuery = ref('');
const categoryFilter = ref('all'); // 'all' | 'standard' | 'custom'

// Drawer state
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

const currentObjectLabel = computed(() => {
  const found = OBJECTS.find((o) => o.key === activeModule.value);
  return found ? found.label : 'Object';
});

const currentModuleFields = computed(() => {
  return allFields.value.filter((f) => f.module === activeModule.value);
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

function getModuleTotalCount(mod) {
  return allFields.value.filter((f) => f.module === mod).length;
}

function selectModule(mod) {
  activeModule.value = mod;
  categoryFilter.value = 'all';
  searchQuery.value = '';
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

function addOption() {
  const text = newOptionInput.value.trim();
  if (!text) return;
  // Support comma-separated batch adding
  const items = text.split(',').map((s) => s.trim()).filter(Boolean);
  items.forEach((item) => {
    const exists = fieldForm.value.options.some(
      (opt) => (opt.value || opt.label || opt) === item
    );
    if (!exists) {
      fieldForm.value.options.push({ label: item, value: item });
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
    // Fetch all fields (standard catalog + custom fields) across objects
    const data = await fetchCustomFields(null, { includeStandard: true });
    allFields.value = Array.isArray(data) ? data : [];
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
    module: activeModule.value,
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
  if (field.isStandard) return;
  editingField.value = field;
  formError.value = '';
  newOptionInput.value = '';
  fieldForm.value = {
    module: field.module || activeModule.value,
    label: field.label || '',
    key: field.key || '',
    type: field.type || 'text',
    options: Array.isArray(field.options) ? [...field.options] : [],
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
  if (fieldForm.value.type === 'select' && (!fieldForm.value.options || !fieldForm.value.options.length)) {
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
    options: fieldForm.value.type === 'select' ? fieldForm.value.options : [],
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
    formError.value = err.data?.message || err.message || 'Failed to save custom field.';
  } finally {
    saving.value = false;
  }
}

function openDeleteDialog(field) {
  if (field.isStandard) return;
  fieldToDelete.value = field;
  isDeleteModalOpen.value = true;
}

async function handleConfirmDelete() {
  if (!fieldToDelete.value || fieldToDelete.value.isStandard) return;
  const fieldId = fieldToDelete.value._id || fieldToDelete.value.id;
  isDeleting.value = true;
  try {
    await deleteCustomField(fieldId);
    isDeleteModalOpen.value = false;
    fieldToDelete.value = null;
    await loadFields();
  } catch (err) {
    alert(err.data?.message || err.message || 'Failed to delete custom field.');
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
