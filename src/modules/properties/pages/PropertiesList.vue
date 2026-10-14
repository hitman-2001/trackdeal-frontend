<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
      <div>
        <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100">Development Inventory</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Track and manage builder development projects and unit availability statuses.
        </p>
      </div>

      <!-- Action buttons & Views toggle -->
      <div class="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto shrink-0 flex-wrap">
        <!-- View Toggle buttons -->
        <div class="border border-default rounded-lg p-0.5 bg-slate-55/50 dark:bg-slate-900 flex space-x-0.5">
          <button 
            @click="viewMode = 'table'"
            class="px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1.5"
            :class="viewMode === 'table' ? 'bg-surface text-slate-800 dark:text-slate-200 shadow-xs' : 'text-slate-400 hover:text-slate-650'"
            title="Table View"
          >
            <PhTable :size="12" />
            <span>Table</span>
          </button>
          <button 
            @click="viewMode = 'board'"
            class="px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1.5"
            :class="viewMode === 'board' ? 'bg-surface text-slate-800 dark:text-slate-200 shadow-xs' : 'text-slate-400 hover:text-slate-650'"
            title="Inventory Board View"
          >
            <PhColumns :size="12" />
            <span>Board</span>
          </button>
          <button 
            @click="viewMode = 'tree'"
            class="px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1.5"
            :class="viewMode === 'tree' ? 'bg-surface text-slate-800 dark:text-slate-200 shadow-xs' : 'text-slate-400 hover:text-slate-650'"
            title="Project Hierarchy Tree"
          >
            <PhTreeStructure :size="12" />
            <span>Project Tree</span>
          </button>
        </div>

        <!-- Bulk Actions -->
        <button 
          v-if="selectedRows.length > 0"
          @click="openBulkReserve"
          class="btn btn-sm btn-secondary text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900"
        >
          Reserve Selected ({{ selectedRows.length }})
        </button>

        <button 
          @click="isCreateOpen = true"
          class="btn btn-sm btn-primary ml-auto sm:ml-0"
        >
          + Add Property
        </button>
      </div>
    </div>

    <!-- KPI Metric Cards strip -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-[9px] text-slate-450 font-bold block uppercase tracking-wider">Total Listings</span>
          <span class="font-heading font-bold text-lg text-slate-800 dark:text-slate-100">{{ propertiesCount }}</span>
        </div>
        <PhKey :size="18" class="text-indigo-500" />
      </div>
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-[9px] text-emerald-600 font-bold block uppercase tracking-wider">Available Units</span>
          <span class="font-heading font-bold text-lg text-emerald-600 dark:text-emerald-450">{{ availableCount }}</span>
        </div>
        <span class="flex h-2.5 w-2.5 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
      </div>
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-[9px] text-amber-600 font-bold block uppercase tracking-wider">Active holds</span>
          <span class="font-heading font-bold text-lg text-amber-600 dark:text-amber-450">{{ reservedCount }}</span>
        </div>
        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
      </div>
      <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-[9px] text-red-650 font-bold block uppercase tracking-wider">Sold Units</span>
          <span class="font-heading font-bold text-lg text-red-650 dark:text-red-455">{{ soldCount }}</span>
        </div>
        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
      </div>
    </div>

    <!-- Search & Filters Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3">
      <div class="flex flex-col md:flex-row gap-3">
        <!-- Search -->
        <div class="flex-1 relative flex items-center">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search by title, location, unit code..."
            class="w-full bg-slate-55/35 border border-default rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary"
          />
          <PhMagnifyingGlass class="absolute left-2.5 text-slate-400 w-3.5 h-3.5" />
        </div>

        <!-- Dropdown filters -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs shrink-0">
          <select v-model="filterType" class="bg-surface border border-default rounded-lg px-2.5 py-1.5 outline-none">
            <option value="">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
          </select>
          
          <select v-model="filterStatus" class="bg-surface border border-default rounded-lg px-2.5 py-1.5 outline-none">
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="blocked">Blocked</option>
            <option value="sold">Sold</option>
          </select>

          <input 
            v-model.number="filterMinPrice" 
            type="number" 
            placeholder="Min Price"
            class="bg-surface border border-default rounded-lg px-2.5 py-1.5 outline-none w-full"
          />
          <input 
            v-model.number="filterMaxPrice" 
            type="number" 
            placeholder="Max Price"
            class="bg-surface border border-default rounded-lg px-2.5 py-1.5 outline-none w-full"
          />
        </div>
      </div>
    </div>

    <!-- Active Views Canvas -->
    <div v-if="isLoading" class="animate-pulse space-y-4">
      <div class="h-10 bg-slate-200 dark:bg-slate-850 rounded w-full"></div>
      <div class="h-64 bg-slate-200 dark:bg-slate-850 rounded-xl w-full"></div>
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
      <div v-else-if="viewMode === 'tree'" class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-4">
        <h3 class="font-heading font-bold text-sm text-slate-800 dark:text-slate-100 border-b border-default pb-2">
          Project Hierarchy Tree
        </h3>
        
        <div class="space-y-3.5 pl-2">
          <div v-for="builder in hierarchyData" :key="builder.id" class="space-y-2">
            <!-- Builder node -->
            <div 
              @click="toggleNode('b_' + builder.id)"
              class="flex items-center space-x-2 font-bold text-xs text-slate-700 dark:text-slate-350 cursor-pointer select-none py-0.5"
            >
              <component :is="isNodeOpen('b_' + builder.id) ? PhCaretDown : PhCaretRight" :size="10" class="text-slate-400 shrink-0" />
              <PhBuilding :size="14" class="text-slate-450 shrink-0" />
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
                  class="flex items-center space-x-2 font-bold text-xs text-slate-800 dark:text-slate-200 cursor-pointer select-none py-0.5"
                >
                  <component :is="isNodeOpen('p_' + proj.id) ? PhCaretDown : PhCaretRight" :size="10" class="text-slate-400 shrink-0" />
                  <PhBuildings :size="14" class="text-slate-450 shrink-0" />
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
                      class="flex items-center space-x-2 font-bold text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer select-none py-0.5"
                    >
                      <component :is="isNodeOpen('t_' + tower.id) ? PhCaretDown : PhCaretRight" :size="10" class="text-slate-400 shrink-0" />
                      <PhHouseLine :size="14" class="text-slate-450 shrink-0" />
                      <span>{{ tower.name }}</span>
                    </div>

                    <!-- Floors/Units under Tower -->
                    <div 
                      v-if="isNodeOpen('t_' + tower.id)" 
                      class="pl-4 space-y-2 ml-2"
                    >
                      <div v-for="floor in tower.floors" :key="floor.floor" class="flex items-center space-x-3 py-1">
                        <span class="text-[10px] font-bold text-slate-450 w-14 shrink-0 text-right">F{{ floor.floor }}</span>
                        
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <div 
                            v-for="unit in floor.units" 
                            :key="unit._id || unit.id"
                            @click="triggerTreeUnitClick(unit)"
                            class="px-2.5 py-1.2 rounded-lg font-bold text-[10px] cursor-pointer hover:scale-105 transition-all shadow-xs border flex items-center space-x-1.5"
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

// Phosphor icons
import { 
  PhTable, PhColumns, PhTreeStructure, PhKey, 
  PhCaretDown, PhCaretRight, PhBuilding, PhBuildings, 
  PhHouseLine, PhMagnifyingGlass 
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

const handleSort = (sortOption) => {
  console.log('Sorting table list by:', sortOption);
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
    // Prompt justification and password if Sold status reversal is triggered
    const result = await Swal.fire({ title: 'Confirm', text: 'Reverting a sold property booking requires Admin privileges. Verify credentials to unlock?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes', cancelButtonText: 'Cancel' }); if (result.isConfirmed) {
      isReleaseOpen.value = true;
    }
    return;
  }

  if (newStatus === 'reserved') {
    isReserveOpen.value = true;
  } else if (newStatus === 'sold') {
    // Mark as sold directly or prompt details
    isEditOpen.value = true;
  } else if (newStatus === 'available') {
    isReleaseOpen.value = true;
  } else {
    // Update direct status lock
    item.status = newStatus;
  }
};

const openBulkReserve = () => {
  selectedProperty.value = filteredProperties.value.find(p => p._id === selectedRows.value[0]);
  isReserveOpen.value = true;
};

const openReleaseHold = () => {
  selectedProperty.value = filteredProperties.value.find(p => p._id === selectedRows.value[0]);
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
  // Mock grouping for demonstration
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
  if (s === 'available') return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-450';
  if (s === 'reserved') return 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/20 dark:text-amber-450';
  if (s === 'sold') return 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/20 dark:text-red-450';
  return 'bg-slate-100 text-slate-500 border-slate-300';
};
</script>
