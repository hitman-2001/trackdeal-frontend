<template>
  <div class="space-y-6">
    <!-- Header Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
      <div>
        <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100">Builders Directory</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Directory of developer partners partner-linked to the CRM organization.
        </p>
      </div>

      <!-- CTAs -->
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <button 
          @click="isCreateOpen = true"
          class="btn btn-sm btn-primary w-full sm:w-auto justify-center"
        >
          + Add Builder
        </button>
      </div>
    </div>

    <!-- Search Section -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3">
      <div class="flex flex-col md:flex-row gap-3">
        <div class="flex-1 relative">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search builder by name, corporate code..."
            class="w-full bg-slate-55/35 border border-default rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary"
          />
          <PhMagnifyingGlass :size="14" class="absolute left-2.5 top-2.5 text-slate-400" />
        </div>
      </div>
    </div>

    <!-- Builders Grid -->
    <div v-if="isLoading" class="animate-pulse space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="h-44 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <BuilderCard 
        v-for="builder in filteredBuilders" 
        :key="builder._id || builder.id"
        :builder="builder"
        :projectCount="builderStats[builder._id || builder.id]?.projectCount || 0"
        :holdsCount="builderStats[builder._id || builder.id]?.holdsCount || 0"
        :receivables="builderStats[builder._id || builder.id]?.receivables || 0"
      />
      
      <div v-if="filteredBuilders.length === 0" class="col-span-full text-center py-12 text-slate-450 italic text-xs">
        No developer profiles found. Click "+ Add Builder" to register developer partners.
      </div>
    </div>

    <!-- Create Builder Drawer Modal -->
    <BuilderCreateDrawer 
      :isOpen="isCreateOpen" 
      @close="isCreateOpen = false"
      @success="refetch"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PhMagnifyingGlass } from '@phosphor-icons/vue';
import { useBuildersQuery, useProjectsQuery } from '../queries';
import { useDealsQuery } from '@/modules/deals/queries';
import BuilderCard from '../components/BuilderCard.vue';
import BuilderCreateDrawer from '../components/BuilderCreateDrawer.vue';

const searchQuery = ref('');
const isCreateOpen = ref(false);

const { data: buildersData, isLoading, refetch } = useBuildersQuery();
const { data: projectsData } = useProjectsQuery();
const { data: dealsData } = useDealsQuery();

const buildersList = computed(() => buildersData.value?.data || []);
const projectsList = computed(() => projectsData.value?.data || []);
const dealsList = computed(() => dealsData.value?.data || []);

const filteredBuilders = computed(() => {
  return buildersList.value.filter(item => {
    return !searchQuery.value || 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

const builderStats = computed(() => {
  const stats = {};
  
  // Initialize
  buildersList.value.forEach(b => {
    stats[b._id || b.id] = {
      projectCount: 0,
      holdsCount: 0,
      receivables: 0
    };
  });
  
  // 1. Project Count
  projectsList.value.forEach(p => {
    const bId = p.builderId?._id || p.builderId;
    if (bId && stats[bId]) {
      stats[bId].projectCount++;
    }
  });
  
  // 2. Holds & Receivables
  dealsList.value.forEach(d => {
    const proj = projectsList.value.find(p => (p._id || p.id) === (d.project?._id || d.project));
    if (proj) {
      const bId = proj.builderId?._id || proj.builderId;
      if (bId && stats[bId]) {
        // Count active holds
        if (['draft', 'token_received', 'booking_initiated'].includes(d.status)) {
          stats[bId].holdsCount++;
        }
        // Sum receivables (active commissions)
        if (!['cancelled', 'commission_received', 'deal_closed'].includes(d.status)) {
          stats[bId].receivables += d.commissionAmount || 0;
        }
      }
    }
  });
  
  return stats;
});
</script>
