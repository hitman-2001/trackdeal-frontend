<template>
  <div class="workspace-page properties-page w-full max-w-full min-w-0 pb-28 sm:pb-16 space-y-3.5 sm:space-y-5">
    <!-- Page Header (Education Section 6 Standard) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div class="flex items-center justify-between w-full sm:w-auto">
        <div>
          <h1 class="text-xl sm:text-[28px] font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Properties
          </h1>
          <p class="text-xs sm:text-[13px] text-slate-500 mt-0.5 hidden sm:block">
            Development inventory, project units, and availability status.
          </p>
        </div>

        <!-- Mobile Compact Add Property Button -->
        <button 
          type="button"
          @click="isCreateOpen = true"
          class="sm:hidden btn btn-primary btn-sm rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition-transform shrink-0"
        >
          <PhPlus :size="14" weight="bold" />
          <span>Add Property</span>
        </button>
      </div>

      <!-- Desktop Action Buttons (sm and above) -->
      <div class="hidden sm:flex items-center gap-2.5 flex-wrap">
        <!-- View Toggle Pills -->
        <div class="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-neutral-850 rounded-xl">
          <button 
            type="button"
            @click="viewMode = 'table'"
            class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
            :class="viewMode === 'table' ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'"
            title="Table View"
          >
            <PhTable :size="13" weight="bold" />
            <span>Table</span>
          </button>
          <button 
            type="button"
            @click="viewMode = 'board'"
            class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
            :class="viewMode === 'board' ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'"
            title="Inventory Board View"
          >
            <PhColumns :size="13" weight="bold" />
            <span>Board</span>
          </button>
          <button 
            type="button"
            @click="viewMode = 'tree'"
            class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
            :class="viewMode === 'tree' ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'"
            title="Project Hierarchy Tree"
          >
            <PhTreeStructure :size="13" weight="bold" />
            <span>Tree</span>
          </button>
        </div>

        <!-- Bulk Reserve Action -->
        <button 
          v-if="selectedRows.length > 0"
          type="button"
          @click="openBulkReserve"
          class="btn btn-secondary btn-sm rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
        >
          <PhBookmarkSimple :size="14" weight="bold" />
          <span>Reserve ({{ selectedRows.length }})</span>
        </button>

        <!-- Desktop Add Property Button -->
        <button 
          type="button"
          @click="isCreateOpen = true"
          class="btn btn-primary btn-sm rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition-transform"
        >
          <PhPlus :size="15" weight="bold" />
          <span>Add Property</span>
        </button>
      </div>
    </div>

    <!-- Mobile View Switcher Segmented Bar (< 640px) -->
    <div class="sm:hidden flex items-center gap-1 p-1 bg-slate-100 dark:bg-neutral-850 rounded-xl w-full shadow-2xs">
      <button 
        type="button"
        @click="viewMode = 'table'"
        class="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
        :class="viewMode === 'table' ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'"
      >
        <PhTable :size="13" weight="bold" />
        <span>Table</span>
      </button>
      <button 
        type="button"
        @click="viewMode = 'board'"
        class="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
        :class="viewMode === 'board' ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'"
      >
        <PhColumns :size="13" weight="bold" />
        <span>Board</span>
      </button>
      <button 
        type="button"
        @click="viewMode = 'tree'"
        class="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
        :class="viewMode === 'tree' ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'"
      >
        <PhTreeStructure :size="13" weight="bold" />
        <span>Tree</span>
      </button>
    </div>

    <!-- Mobile Mini KPI Strip (< 640px) -->
    <div class="sm:hidden grid grid-cols-4 gap-1.5 bg-surface border border-default rounded-2xl p-2.5 shadow-2xs text-center">
      <div class="px-1">
        <div class="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
          {{ propertiesCount }}
        </div>
        <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">Total</span>
      </div>

      <div class="px-1 border-l border-slate-100 dark:border-neutral-800">
        <div class="text-base font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
          {{ availableCount }}
        </div>
        <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">Available</span>
      </div>

      <div class="px-1 border-l border-slate-100 dark:border-neutral-800">
        <div class="text-base font-bold text-amber-600 dark:text-amber-400 leading-tight">
          {{ reservedCount }}
        </div>
        <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">On Hold</span>
      </div>

      <div class="px-1 border-l border-slate-100 dark:border-neutral-800">
        <div class="text-base font-bold text-rose-600 dark:text-rose-400 leading-tight">
          {{ soldCount }}
        </div>
        <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">Sold</span>
      </div>
    </div>

    <!-- Desktop KPI Cards Grid (>= 640px) -->
    <div class="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-surface border border-default rounded-2xl p-4 shadow-xs">
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Total Listings</span>
        <div class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
          {{ propertiesCount }}
        </div>
        <span class="text-[11px] text-slate-400 font-medium block mt-1">Units tracked</span>
      </div>

      <div class="bg-surface border border-default rounded-2xl p-4 shadow-xs">
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Available Units</span>
        <div class="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
          {{ availableCount }}
        </div>
        <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">Ready for booking</span>
      </div>

      <div class="bg-surface border border-default rounded-2xl p-4 shadow-xs">
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Active Holds</span>
        <div class="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 mt-1">
          {{ reservedCount }}
        </div>
        <span class="text-[11px] text-amber-600 dark:text-amber-400 font-medium block mt-1">Token paid holds</span>
      </div>

      <div class="bg-surface border border-default rounded-2xl p-4 shadow-xs">
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Sold Units</span>
        <div class="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 mt-1">
          {{ soldCount }}
        </div>
        <span class="text-[11px] text-slate-400 font-medium block mt-1">Closed transactions</span>
      </div>
    </div>

    <!-- Search & Filters Section -->
    <div class="space-y-3">
      <!-- Mobile: Search Bar + Filter Trigger Row (< 640px) -->
      <div class="sm:hidden space-y-2.5">
        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <PhMagnifyingGlass :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search properties, location..."
              class="w-full h-10 pl-9 pr-8 bg-surface border border-default rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 shadow-2xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <button
              v-if="searchQuery"
              type="button"
              @click="clearSearch"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label="Clear search"
            >
              <PhX :size="14" weight="bold" />
            </button>
          </div>

          <button
            type="button"
            @click="isFilterModalOpen = true"
            class="h-10 px-3.5 rounded-xl border font-semibold text-xs inline-flex items-center gap-1.5 shadow-2xs shrink-0 active:scale-95 transition-all"
            :class="activeFilterCount > 0
              ? 'border-primary bg-primary/10 text-primary font-bold'
              : 'border-default bg-surface text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-800'"
          >
            <PhSlidersHorizontal :size="16" weight="bold" />
            <span>Filters</span>
            <span
              v-if="activeFilterCount > 0"
              class="w-4.5 h-4.5 rounded-full bg-primary text-white text-[10px] font-bold inline-flex items-center justify-center shrink-0"
            >
              {{ activeFilterCount }}
            </span>
          </button>
        </div>

        <!-- Mobile Status Filter Swipeable Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 -mx-1 px-1 flex-nowrap w-full">
          <button
            v-for="pill in statusPills"
            :key="pill.value"
            type="button"
            @click="selectStatusPill(pill.value)"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all"
            :class="filterStatus === pill.value
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
              : 'bg-surface text-slate-600 dark:text-slate-300 border border-default hover:bg-slate-50 dark:hover:bg-neutral-800'"
          >
            {{ pill.label }}
          </button>
        </div>

        <!-- Mobile Active Filter Chips -->
        <div v-if="activeFilterCount > 0" class="flex items-center gap-1.5 flex-wrap pt-0.5">
          <button
            v-if="filterType"
            type="button"
            @click="filterType = ''"
            class="h-6 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold text-blue-700 dark:text-blue-300 inline-flex items-center gap-1 active:scale-95 transition-all"
          >
            <span>Type: {{ getTypeLabel(filterType) }}</span>
            <PhX :size="11" weight="bold" class="opacity-70 hover:opacity-100" />
          </button>

          <button
            v-if="filterMinPrice"
            type="button"
            @click="filterMinPrice = ''"
            class="h-6 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1 active:scale-95 transition-all"
          >
            <span>Min: {{ formatCompactPrice(filterMinPrice) }}</span>
            <PhX :size="11" weight="bold" class="opacity-70 hover:opacity-100" />
          </button>

          <button
            v-if="filterMaxPrice"
            type="button"
            @click="filterMaxPrice = ''"
            class="h-6 px-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[11px] font-semibold text-purple-700 dark:text-purple-300 inline-flex items-center gap-1 active:scale-95 transition-all"
          >
            <span>Max: {{ formatCompactPrice(filterMaxPrice) }}</span>
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

      <!-- Desktop Toolbar (>= 640px) -->
      <div class="hidden sm:block bg-surface border border-default rounded-2xl p-4 shadow-xs space-y-3">
        <!-- Top Row: Status Pills + Search -->
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <!-- Status Pills -->
          <div class="flex items-center gap-1 p-1 bg-slate-100 dark:bg-neutral-850 rounded-xl">
            <button
              v-for="pill in statusPills"
              :key="pill.value"
              type="button"
              @click="selectStatusPill(pill.value)"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              :class="filterStatus === pill.value
                ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'"
            >
              {{ pill.label }}
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative min-w-0 flex-1 max-w-sm">
            <PhMagnifyingGlass :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search properties, location..."
              class="filter-control !pl-9 !h-9 text-xs"
            />
            <button
              v-if="searchQuery"
              type="button"
              @click="clearSearch"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <PhX :size="12" weight="bold" />
            </button>
          </div>
        </div>

        <!-- Secondary Row: Type & Price Dropdowns -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-neutral-800/80 items-center">
          <select 
            v-model="filterType" 
            class="filter-control !h-9 text-xs"
          >
            <option value="">All Property Types</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
          </select>

          <input 
            v-model.number="filterMinPrice" 
            type="number" 
            placeholder="Min Price (INR)"
            class="filter-control !h-9 text-xs"
          />

          <input 
            v-model.number="filterMaxPrice" 
            type="number" 
            placeholder="Max Price (INR)"
            class="filter-control !h-9 text-xs"
          />

          <div class="flex items-center justify-end">
            <button
              v-if="activeFilterCount > 0"
              type="button"
              @click="clearAllFilters"
              class="btn btn-ghost btn-sm !h-9 px-2.5 text-xs text-rose-600 dark:text-rose-400 inline-flex items-center gap-1.5"
              title="Reset all filters"
            >
              <PhArrowCounterClockwise :size="14" weight="bold" />
              <span>Reset filters</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Selection Toolbar (When properties are selected) -->
    <div
      v-if="selectedRows.length > 0"
      class="rounded-xl bg-surface border border-default shadow-sm p-3 sm:px-4 sm:py-2.5 transition-all flex items-center justify-between gap-3 flex-wrap"
    >
      <div class="flex items-center gap-2">
        <span class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold font-tabular shadow-2xs shrink-0">
          {{ selectedRows.length }}
        </span>
        <span class="text-xs font-bold text-slate-900 dark:text-slate-100">
          {{ selectedRows.length === 1 ? '1 property selected' : `${selectedRows.length} properties selected` }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="selectedRows.length < filteredProperties.length"
          type="button"
          @click="selectAllRows"
          class="text-xs font-semibold text-primary hover:underline px-1 py-0.5 cursor-pointer"
        >
          Select all ({{ filteredProperties.length }})
        </button>

        <button
          type="button"
          @click="openBulkReserve"
          class="btn btn-primary btn-sm flex items-center gap-1.5 rounded-lg text-xs font-semibold shadow-xs"
        >
          <PhBookmarkSimple :size="14" weight="bold" />
          <span>Reserve Selected</span>
        </button>

        <button
          type="button"
          @click="clearSelection"
          class="btn btn-ghost btn-sm text-xs font-medium"
        >
          <PhX :size="13" weight="bold" />
          <span>Deselect</span>
        </button>
      </div>
    </div>

    <!-- Active Views Canvas -->
    <div v-if="isLoading" class="animate-pulse space-y-3">
      <div class="h-10 bg-slate-200 dark:bg-neutral-850 rounded-xl w-full"></div>
      <div class="h-64 bg-slate-200 dark:bg-neutral-850 rounded-2xl w-full"></div>
    </div>
    
    <div v-else class="space-y-4">
      <!-- A. TABLE VIEW -->
      <div v-if="viewMode === 'table'">
        <PropertyTable 
          :rows="filteredProperties"
          :isLoading="isLoading"
          :selectedProperties="selectedRows"
          :pagination="pagination"
          @selectionChange="handleSelectionChange"
          @sort="handleSort"
          @pageChange="handlePageChange"
          @pageSizeChange="handlePageSizeChange"
        />
      </div>

      <!-- B. BOARD VIEW -->
      <div v-else-if="viewMode === 'board'">
        <InventoryBoard 
          :items="filteredProperties"
          @statusChange="handleBoardStatusChange"
        />
      </div>

      <!-- C. TREE HIERARCHY VIEW -->
      <div v-else-if="viewMode === 'tree'" class="bg-surface border border-default rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div class="border-b border-default pb-3">
          <h3 class="font-bold text-sm text-slate-800 dark:text-slate-100">
            Project Hierarchy Tree
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">Explore inventory structured by builder, project, tower, and floor level.</p>
        </div>
        
        <div class="space-y-3 pl-1">
          <div v-for="builder in hierarchyData" :key="builder.id" class="space-y-2">
            <!-- Builder node -->
            <div 
              @click="toggleNode('b_' + builder.id)"
              class="flex items-center space-x-2 font-bold text-xs text-slate-800 dark:text-slate-200 cursor-pointer select-none py-1 hover:text-primary transition-colors"
            >
              <component :is="isNodeOpen('b_' + builder.id) ? PhCaretDown : PhCaretRight" :size="12" class="text-slate-400 shrink-0" />
              <PhBuilding :size="15" class="text-primary shrink-0" />
              <span>{{ builder.name }}</span>
            </div>

            <!-- Projects nested under builder -->
            <div 
              v-if="isNodeOpen('b_' + builder.id)" 
              class="pl-4 space-y-2.5 border-l border-default ml-2.5"
            >
              <div v-for="proj in builder.projects" :key="proj.id" class="space-y-2">
                <div 
                  @click="toggleNode('p_' + proj.id)"
                  class="flex items-center space-x-2 font-bold text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none py-1 hover:text-primary transition-colors"
                >
                  <component :is="isNodeOpen('p_' + proj.id) ? PhCaretDown : PhCaretRight" :size="11" class="text-slate-400 shrink-0" />
                  <PhBuildings :size="14" class="text-indigo-500 shrink-0" />
                  <span>{{ proj.name }}</span>
                </div>

                <!-- Towers nested under project -->
                <div 
                  v-if="isNodeOpen('p_' + proj.id)" 
                  class="pl-4 space-y-2 border-l border-default ml-2"
                >
                  <div v-for="tower in proj.towers" :key="tower.id" class="space-y-2">
                    <div 
                      @click="toggleNode('t_' + tower.id)"
                      class="flex items-center space-x-2 font-bold text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer select-none py-0.5 hover:text-primary transition-colors"
                    >
                      <component :is="isNodeOpen('t_' + tower.id) ? PhCaretDown : PhCaretRight" :size="10" class="text-slate-400 shrink-0" />
                      <PhHouseLine :size="13" class="text-slate-450 shrink-0" />
                      <span>{{ tower.name }}</span>
                    </div>

                    <!-- Floors/Units under Tower -->
                    <div 
                      v-if="isNodeOpen('t_' + tower.id)" 
                      class="pl-4 space-y-2 ml-2"
                    >
                      <div v-for="floor in tower.floors" :key="floor.floor" class="flex items-center space-x-3 py-1">
                        <span class="text-[10px] font-bold text-slate-400 w-12 shrink-0 text-right">Floor {{ floor.floor }}</span>
                        
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <div 
                            v-for="unit in floor.units" 
                            :key="unit._id || unit.id"
                            @click="triggerTreeUnitClick(unit)"
                            class="px-2.5 py-1 rounded-lg font-bold text-[10px] cursor-pointer hover:scale-105 transition-all shadow-2xs border flex items-center space-x-1.5"
                            :class="getUnitBadgeClass(unit)"
                          >
                            <span>{{ unit.title || unit.unitNumber }}</span>
                            <span class="opacity-75">●</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Filter Modal (AppModal) -->
    <AppModal
      :isOpen="isFilterModalOpen"
      title="Filter Properties"
      subtitle="Refine inventory by status, type, and budget"
      maxSize="440px"
      @cancel="isFilterModalOpen = false"
      @confirm="isFilterModalOpen = false"
    >
      <div class="space-y-4 py-1">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Availability Status</label>
          <select 
            v-model="filterStatus"
            class="filter-control"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved / Hold</option>
            <option value="blocked">Blocked</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Property Type</label>
          <select 
            v-model="filterType"
            class="filter-control"
          >
            <option value="">All Property Types</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Minimum Price (INR)</label>
          <input 
            v-model.number="filterMinPrice" 
            type="number" 
            placeholder="e.g. 5000000"
            class="filter-control"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Maximum Price (INR)</label>
          <input 
            v-model.number="filterMaxPrice" 
            type="number" 
            placeholder="e.g. 20000000"
            class="filter-control"
          />
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="clearAllFilters"
          class="btn btn-secondary btn-sm"
        >
          Reset All
        </button>
        <button
          type="button"
          @click="isFilterModalOpen = false"
          class="btn btn-primary btn-sm"
        >
          Done
        </button>
      </template>
    </AppModal>

    <!-- Drawer Modals Mounting -->
    <PropertyCreateDrawer 
      :isOpen="isCreateOpen" 
      @close="isCreateOpen = false"
      @success="refetch"
    />

    <PropertyEditDrawer 
      v-if="selectedProperty"
      :isOpen="isEditOpen" 
      :property="selectedProperty"
      @close="isEditOpen = false"
      @success="refetch"
    />

    <PropertyReservationDrawer 
      v-if="selectedProperty"
      :isOpen="isReserveOpen"
      :property="selectedProperty"
      @close="isReserveOpen = false"
      @success="refetch"
    />

    <ReservationReleaseModal 
      v-if="selectedProperty"
      :isOpen="isReleaseOpen"
      :property="selectedProperty"
      :tokenPaid="100000"
      @close="isReleaseOpen = false"
      @success="refetch"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { usePropertiesQuery } from '../queries';
import PropertyTable from '../components/PropertyTable.vue';
import InventoryBoard from '../components/InventoryBoard.vue';
import PropertyCreateDrawer from '../components/PropertyCreateDrawer.vue';
import PropertyEditDrawer from '../components/PropertyEditDrawer.vue';
import PropertyReservationDrawer from '../components/PropertyReservationDrawer.vue';
import ReservationReleaseModal from '../components/ReservationReleaseModal.vue';
import AppModal from '@/components/AppModal.vue';

// Phosphor icons
import { 
  PhTable, PhColumns, PhTreeStructure, 
  PhCaretDown, PhCaretRight, PhBuilding, PhBuildings, 
  PhHouseLine, PhMagnifyingGlass, PhPlus, PhX,
  PhBookmarkSimple, PhSlidersHorizontal, PhArrowCounterClockwise
} from '@phosphor-icons/vue';
import Swal from 'sweetalert2';

const store = useStore();

const viewMode = ref('table');
const selectedRows = ref([]);
const searchQuery = ref('');
const filterType = ref('');
const filterStatus = ref('');
const filterMinPrice = ref('');
const filterMaxPrice = ref('');
const isFilterModalOpen = ref(false);

const statusPills = [
  { value: '', label: 'All Units' },
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'On Hold' },
  { value: 'sold', label: 'Sold' },
  { value: 'blocked', label: 'Blocked' }
];

const selectStatusPill = (status) => {
  filterStatus.value = status;
};

const activeFilterCount = computed(() => {
  let count = 0;
  if (filterType.value) count++;
  if (filterMinPrice.value) count++;
  if (filterMaxPrice.value) count++;
  return count;
});

const clearSearch = () => {
  searchQuery.value = '';
};

const clearAllFilters = () => {
  searchQuery.value = '';
  filterType.value = '';
  filterStatus.value = '';
  filterMinPrice.value = '';
  filterMaxPrice.value = '';
};

const getTypeLabel = (val) => {
  switch (val) {
    case 'apartment': return 'Apartment';
    case 'villa': return 'Villa';
    case 'plot': return 'Plot';
    case 'commercial': return 'Commercial';
    default: return val;
  }
};

const formatCompactPrice = (val) => {
  if (!val) return '';
  if (val >= 10000000) return (val / 10000000).toFixed(1) + ' Cr';
  if (val >= 100000) return (val / 100000).toFixed(1) + ' L';
  if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
  return val.toString();
};

const propertyPaging = ref({ page: 1, limit: 20 });
const propertyQueryParams = computed(() => ({
  ...propertyPaging.value,
  type: filterType.value || undefined,
  status: filterStatus.value || undefined,
  minPrice: filterMinPrice.value || undefined,
  maxPrice: filterMaxPrice.value || undefined,
}));

watch([filterType, filterStatus, filterMinPrice, filterMaxPrice], () => {
  propertyPaging.value = { ...propertyPaging.value, page: 1 };
  selectedRows.value = [];
});

const isCreateOpen = ref(false);
const isEditOpen = ref(false);
const isReserveOpen = ref(false);
const isReleaseOpen = ref(false);
const selectedProperty = ref(null);

const { data: propertiesData, isLoading, refetch } = usePropertiesQuery(propertyQueryParams);

const propertiesList = computed(() => propertiesData.value?.data || []);
const pagination = computed(() => propertiesData.value?.pagination || {
  ...propertyPaging.value,
  total: propertiesList.value.length,
  totalPages: 1,
});

const filteredProperties = computed(() => {
  return propertiesList.value.filter(item => {
    const matchesSearch = !searchQuery.value || 
      item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (item.location?.area || '').toLowerCase().includes(searchQuery.value.toLowerCase());
      
    const matchesType = !filterType.value || item.type === filterType.value;
    const matchesStatus = !filterStatus.value || item.status === filterStatus.value;
    const matchesMinPrice = !filterMinPrice.value || item.price >= filterMinPrice.value;
    const matchesMaxPrice = !filterMaxPrice.value || item.price <= filterMaxPrice.value;

    return matchesSearch && matchesType && matchesStatus && matchesMinPrice && matchesMaxPrice;
  });
});

const propertiesCount = computed(() => filteredProperties.value.length);
const availableCount = computed(() => filteredProperties.value.filter(i => i.status === 'available').length);
const reservedCount = computed(() => filteredProperties.value.filter(i => i.status === 'reserved').length);
const soldCount = computed(() => filteredProperties.value.filter(i => i.status === 'sold').length);

const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

const selectAllRows = () => {
  selectedRows.value = [...filteredProperties.value];
};

const clearSelection = () => {
  selectedRows.value = [];
};

const handleSort = (sortOption) => {
  // Sort handles internally or via query
};

const handlePageChange = (page) => {
  propertyPaging.value = { ...propertyPaging.value, page };
  selectedRows.value = [];
};

const handlePageSizeChange = (limit) => {
  propertyPaging.value = { page: 1, limit };
  selectedRows.value = [];
};

const handleBoardStatusChange = async ({ item, oldStatus, newStatus, isLocked }) => {
  selectedProperty.value = item;
  
  if (isLocked) {
    const result = await Swal.fire({ 
      title: 'Confirm', 
      text: 'Reverting a sold property booking requires Admin privileges. Verify credentials to unlock?', 
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonText: 'Yes', 
      cancelButtonText: 'Cancel' 
    }); 
    if (result.isConfirmed) {
      isReleaseOpen.value = true;
    }
    return;
  }

  if (newStatus === 'reserved') {
    isReserveOpen.value = true;
  } else if (newStatus === 'sold') {
    isEditOpen.value = true;
  } else if (newStatus === 'available') {
    isReleaseOpen.value = true;
  } else {
    item.status = newStatus;
  }
};

const openBulkReserve = () => {
  if (selectedRows.value.length === 0) return;
  const target = selectedRows.value[0];
  const targetId = typeof target === 'object' ? (target._id || target.id) : target;
  selectedProperty.value = filteredProperties.value.find(p => (p._id || p.id) === targetId);
  isReserveOpen.value = true;
};

const openReleaseHold = () => {
  if (selectedRows.value.length === 0) return;
  const target = selectedRows.value[0];
  const targetId = typeof target === 'object' ? (target._id || target.id) : target;
  selectedProperty.value = filteredProperties.value.find(p => (p._id || p.id) === targetId);
  isReleaseOpen.value = true;
};

// Tree nodes collapse-state dictionary
const openNodes = ref(new Set(['b_1', 'p_1']));

const toggleNode = (nodeId) => {
  if (openNodes.value.has(nodeId)) {
    openNodes.value.delete(nodeId);
  } else {
    openNodes.value.add(nodeId);
  }
};

const isNodeOpen = (nodeId) => openNodes.value.has(nodeId);

// Build structured nested builder -> project -> tower -> floor data
const hierarchyData = computed(() => {
  return [
    {
      id: '1',
      name: 'Skyway Builders Group',
      projects: [
        {
          id: 'p_1',
          name: 'Skyway Prestige Residency',
          towers: [
            {
              id: 't_1',
              name: 'Tower A Block',
              floors: [
                {
                  floor: 8,
                  units: filteredProperties.value.slice(0, 3)
                },
                {
                  floor: 7,
                  units: filteredProperties.value.slice(3, 6)
                }
              ]
            }
          ]
        }
      ]
    }
  ];
});

const triggerTreeUnitClick = (unit) => {
  selectedProperty.value = unit;
  isEditOpen.value = true;
};

const getUnitBadgeClass = (unit) => {
  const s = unit.status;
  if (s === 'available') return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-400';
  if (s === 'reserved') return 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/20 dark:text-amber-400';
  if (s === 'sold') return 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/20 dark:text-rose-400';
  return 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-neutral-800 dark:text-slate-400';
};
</script>
