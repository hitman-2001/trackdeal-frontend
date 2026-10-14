<template>
  <div class="space-y-6">
    <!-- Header Block -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
      <div>
        <h2 class="font-heading text-lg font-bold text-slate-800 dark:text-slate-100">Projects Directory</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Directory of development projects partner-represented by the sales organization.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <button 
          @click="isCreateOpen = true"
          class="btn btn-sm btn-primary"
        >
          + Add Project
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-surface border border-default rounded-xl p-4 shadow-sm space-y-3">
      <div class="flex flex-col md:flex-row gap-3">
        <div class="flex-grow relative flex items-center">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search by project name, builder, locality..."
            class="w-full bg-slate-55/35 border border-default rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary"
          />
          <PhMagnifyingGlass :size="14" class="absolute left-2.5 top-2.5 text-slate-400" />
        </div>

        <select v-model="filterStatus" class="bg-surface border border-default rounded-lg px-3 py-1.5 text-xs outline-none">
          <option value="">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="under_construction">Under Construction</option>
          <option value="ready_to_move">Ready to Move</option>
          <option value="sold_out">Sold Out</option>
        </select>
      </div>
    </div>

    <!-- Projects Table Grid -->
    <div v-if="isLoading" class="animate-pulse space-y-4">
      <div class="h-64 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
    </div>

    <div v-else class="bg-surface border border-default rounded-xl shadow-sm overflow-hidden">
      <!-- Desktop Projects Table -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="bg-slate-50/50 dark:bg-slate-900 border-b border-default text-slate-450 uppercase font-bold text-[10px] tracking-wider">
              <th class="p-4">Project Name</th>
              <th class="p-4">Builder</th>
              <th class="p-4">Locality / City</th>
              <th class="p-4 text-center">Total Units</th>
              <th class="p-4 text-center">Available</th>
              <th class="p-4 text-center">Reserved</th>
              <th class="p-4 text-center">Sold</th>
              <th class="p-4">RERA Registration</th>
              <th class="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default text-slate-655 font-medium">
            <tr v-for="proj in paginatedProjects" :key="proj._id || proj.id" class="hover:bg-slate-50/40">
              <td class="p-4">
                <router-link 
                  :to="`/app/projects/${proj._id || proj.id}`" 
                  class="font-bold text-primary hover:underline text-sm"
                >
                  {{ proj.name }}
                </router-link>
                <span class="text-[9px] text-slate-400 block font-mono">{{ proj.code }}</span>
              </td>
              <td class="p-4">
                <span v-if="proj.builderId" class="text-slate-800 dark:text-slate-200 font-semibold">
                  {{ proj.builderId.name }}
                </span>
                <span v-else class="text-slate-400 italic">—</span>
              </td>
              <td class="p-4">
                <span>{{ proj.locality || '—' }}</span>
                <span class="text-slate-400 block text-[10px]">{{ proj.city }}</span>
              </td>
              <td class="p-4 text-center font-bold text-slate-700 dark:text-slate-350">
                {{ projectUnitsStats[proj._id || proj.id]?.total || 0 }}
              </td>
              <td class="p-4 text-center font-bold text-emerald-600">
                {{ projectUnitsStats[proj._id || proj.id]?.available || 0 }}
              </td>
              <td class="p-4 text-center font-bold text-amber-500">
                {{ projectUnitsStats[proj._id || proj.id]?.reserved || 0 }}
              </td>
              <td class="p-4 text-center font-bold text-red-650">
                {{ projectUnitsStats[proj._id || proj.id]?.sold || 0 }}
              </td>
              <td class="p-4">
                <div v-if="proj.rera" class="flex items-center space-x-1.5">
                  <span class="bg-indigo-50 border border-indigo-200 text-indigo-750 dark:bg-indigo-950/20 dark:border-indigo-900 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold">
                    {{ proj.rera }}
                  </span>
                  <button @click="copyRera(proj.rera)" class="text-[9px] opacity-60 hover:opacity-100 text-primary" title="Copy RERA ID">
                    <PhCopy :size="12" />
                  </button>
                </div>
                <span v-else class="text-slate-400 italic">—</span>
              </td>
              <td class="p-4 text-center">
                <div class="inline-flex items-center gap-1 justify-center">
                  <router-link 
                    :to="`/app/projects/${proj._id || proj.id}`" 
                    class="inline-flex items-center justify-center w-7 h-7 rounded-md text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View details"
                    aria-label="View details"
                  >
                    <PhEye :size="15" weight="bold" />
                  </router-link>
                  <button 
                    @click="openEditProject(proj)" 
                    class="inline-flex items-center justify-center w-7 h-7 rounded-md text-slate-500 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/40 transition-colors"
                    title="Edit project"
                    aria-label="Edit project"
                  >
                    <PhPencilSimple :size="15" weight="bold" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredProjects.length === 0">
              <td colspan="9" class="text-center py-12 text-slate-450 italic">
                No developmental projects registered. Click "+ Add Project" to create.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Projects Card Feed -->
      <div class="sm:hidden divide-y divide-default">
        <div 
          v-for="proj in paginatedProjects" 
          :key="'mob-' + (proj._id || proj.id)" 
          class="p-4 space-y-3"
        >
          <!-- Top Row: Name, Code & Status -->
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <router-link 
                :to="`/app/projects/${proj._id || proj.id}`" 
                class="font-bold text-primary hover:underline text-sm block truncate"
              >
                {{ proj.name }}
              </router-link>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[9px] font-mono text-slate-400 uppercase">{{ proj.code }}</span>
                <span v-if="proj.builderId" class="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate">
                  &bull; {{ proj.builderId.name }}
                </span>
              </div>
            </div>
            <span 
              class="px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 capitalize"
              :class="getStatusBadgeClass(proj.status)"
            >
              {{ formatStatus(proj.status) }}
            </span>
          </div>

          <!-- Location & RERA Info -->
          <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
            <div>
              <span class="font-medium text-slate-700 dark:text-slate-200">{{ proj.locality || '—' }}</span>
              <span v-if="proj.city" class="text-slate-400">, {{ proj.city }}</span>
            </div>

            <div v-if="proj.rera" class="flex items-center gap-1.5 shrink-0">
              <span class="bg-indigo-50 border border-indigo-200 text-indigo-750 dark:bg-indigo-950/20 dark:border-indigo-900 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
                RERA: {{ proj.rera }}
              </span>
              <button @click="copyRera(proj.rera)" class="text-primary hover:opacity-80 p-1" title="Copy RERA ID">
                <PhCopy :size="13" />
              </button>
            </div>
          </div>

          <!-- Units Stats Grid -->
          <div class="grid grid-cols-4 gap-1.5 bg-slate-50/70 dark:bg-slate-900/40 border border-default rounded-lg p-2 text-center">
            <div>
              <div class="text-[9px] uppercase font-bold text-slate-400">Total</div>
              <div class="font-bold text-xs text-slate-700 dark:text-slate-200">
                {{ projectUnitsStats[proj._id || proj.id]?.total || 0 }}
              </div>
            </div>
            <div>
              <div class="text-[9px] uppercase font-bold text-emerald-600">Avail</div>
              <div class="font-bold text-xs text-emerald-600">
                {{ projectUnitsStats[proj._id || proj.id]?.available || 0 }}
              </div>
            </div>
            <div>
              <div class="text-[9px] uppercase font-bold text-amber-500">Hold</div>
              <div class="font-bold text-xs text-amber-500">
                {{ projectUnitsStats[proj._id || proj.id]?.reserved || 0 }}
              </div>
            </div>
            <div>
              <div class="text-[9px] uppercase font-bold text-red-500">Sold</div>
              <div class="font-bold text-xs text-red-500">
                {{ projectUnitsStats[proj._id || proj.id]?.sold || 0 }}
              </div>
            </div>
          </div>

          <!-- Actions Row -->
          <div class="flex items-center justify-end gap-2 pt-1">
            <router-link 
              :to="`/app/projects/${proj._id || proj.id}`" 
              class="h-8 px-3 rounded-lg border border-default text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <PhEye :size="14" weight="bold" />
              <span>Details</span>
            </router-link>
            <button 
              @click="openEditProject(proj)" 
              class="h-8 px-3 rounded-lg border border-default text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <PhPencilSimple :size="14" weight="bold" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        <div v-if="filteredProjects.length === 0" class="p-8 text-center text-slate-450 italic text-xs">
          No developmental projects registered. Click "+ Add Project" to create.
        </div>
      </div>

      <AppPagination v-bind="projectPagination" @page-change="setProjectPage" @page-size-change="setProjectPageSize" />
    </div>

    <!-- Add / Edit Project Drawer -->
    <AppDrawer 
      :isOpen="isCreateOpen" 
      :title="isEditMode ? 'Edit Development Project' : 'Add Development Project'" 
      width="500px"
      @close="closeDrawer"
    >
      <form @submit.prevent="handleSaveProject" class="space-y-4 text-xs">
        <div v-if="validationError" class="p-3 rounded bg-red-50 text-red-700 border border-red-200 font-medium">
          {{ validationError }}
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Project Name *</label>
          <input 
            v-model="newProj.name" 
            type="text" 
            placeholder="e.g. Prestige Heights"
            class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary"
            required
          />
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Project Short Code *</label>
            <input 
              v-model="newProj.code" 
              type="text" 
              placeholder="Auto-generated if empty"
              class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary uppercase"
              :disabled="isEditMode"
            />
          </div>
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-[10px] font-bold text-slate-500 uppercase">Builder Developer *</label>
              <button
                type="button"
                @click="isBuilderDrawerOpen = true"
                class="text-[9px] font-bold text-primary hover:underline"
              >
                + Add Builder
              </button>
            </div>
            <select 
              v-model="newProj.builderId" 
              class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary"
              required
            >
              <option value="">Select Builder</option>
              <option v-for="b in builders" :key="b._id || b.id" :value="b._id || b.id">
                {{ b.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">RERA Registration ID</label>
            <input 
              v-model="newProj.rera" 
              type="text" 
              placeholder="e.g. PRM/KA/RERA/1258"
              class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Construction Status</label>
            <select 
              v-model="newProj.status" 
              class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary"
            >
              <option value="upcoming">Upcoming</option>
              <option value="under_construction">Under Construction</option>
              <option value="ready_to_move">Ready to Move</option>
              <option value="sold_out">Sold Out</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">City *</label>
            <input 
              v-model="newProj.city" 
              type="text" 
              placeholder="e.g. Mumbai"
              class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Locality</label>
            <input 
              v-model="newProj.locality" 
              type="text" 
              placeholder="Whitefield"
              class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Address Coordinates</label>
          <textarea 
            v-model="newProj.address" 
            rows="2"
            class="w-full bg-surface border border-default rounded px-3 py-1.5 outline-none focus:border-primary resize-none"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button @click="closeDrawer" class="btn-md btn-secondary">Cancel</button>
        <button @click="handleSaveProject" :disabled="isSaving" class="btn-md btn-primary">
          {{ isSaving ? 'Saving...' : 'Save Project' }}
        </button>
      </template>
    </AppDrawer>

    <BuilderCreateDrawer
      :isOpen="isBuilderDrawerOpen"
      @close="isBuilderDrawerOpen = false"
      @success="handleBuilderSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { PhMagnifyingGlass, PhCopy, PhEye, PhPencilSimple } from '@phosphor-icons/vue';
import { useProjectsQuery, useUnitsQuery, useCreateProjectMutation, useUpdateProjectMutation } from '../queries';
import { useClientPagination } from '@/composables/useClientPagination';
import apiClient from '@/api/client';
import AppDrawer from '@/components/AppDrawer.vue';
import BuilderCreateDrawer from '../components/BuilderCreateDrawer.vue';

const store = useStore();

const searchQuery = ref('');
const filterStatus = ref('');
const isCreateOpen = ref(false);
const isBuilderDrawerOpen = ref(false);
const isSaving = ref(false);
const isEditMode = ref(false);
const editingProjectId = ref(null);
const validationError = ref('');

const newProj = ref({
  name: '',
  code: '',
  builderId: '',
  city: 'Mumbai',
  locality: '',
  address: '',
  rera: '',
  status: 'upcoming'
});

const builders = ref([]);

const { data: projectsData, isLoading, refetch } = useProjectsQuery();
const { data: unitsData } = useUnitsQuery();

const projectsList = computed(() => projectsData.value?.data || []);
const unitsList = computed(() => unitsData.value?.data || []);

const filteredProjects = computed(() => {
  return projectsList.value.filter(item => {
    const matchesSearch = !searchQuery.value ||
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (item.locality || '').toLowerCase().includes(searchQuery.value.toLowerCase());
      
    const matchesStatus = !filterStatus.value || item.status === filterStatus.value;
    return matchesSearch && matchesStatus;
  });
});

const { paginatedItems: paginatedProjects, pagination: projectPagination, setPage: setProjectPage, setPageSize: setProjectPageSize } = useClientPagination(filteredProjects);

const projectUnitsStats = computed(() => {
  const stats = {};
  projectsList.value.forEach(p => {
    stats[p._id || p.id] = {
      total: 0,
      available: 0,
      reserved: 0,
      sold: 0
    };
  });
  
  unitsList.value.forEach(u => {
    const projId = u.projectId?._id || u.projectId;
    if (projId && stats[projId]) {
      stats[projId].total++;
      if (u.availability === 'available') {
        stats[projId].available++;
      } else if (u.availability === 'reserved') {
        stats[projId].reserved++;
      } else if (u.availability === 'sold') {
        stats[projId].sold++;
      }
    }
  });
  
  return stats;
});

const loadBuilders = async () => {
  try {
    const res = await apiClient.get('/projects/builders');
    builders.value = res.data?.data || [];

    // Auto-create default builder if none exists
    if (builders.value.length === 0) {
      try {
        const defaultBuilderRes = await apiClient.post('/projects/builders', {
          name: 'TrackDeal Developer Group',
          code: 'TRACKDEAL_DEV',
          address: 'Main Office'
        });
        if (defaultBuilderRes.data?.data) {
          builders.value = [defaultBuilderRes.data.data];
          if (!newProj.value.builderId) {
            newProj.value.builderId = defaultBuilderRes.data.data._id;
          }
        }
      } catch (e) {
        console.error('Failed to create default builder:', e);
      }
    } else if (!newProj.value.builderId && builders.value.length > 0) {
      newProj.value.builderId = builders.value[0]._id || builders.value[0].id;
    }
  } catch (error) {
    console.error('Failed to load builders list for project creation:', error);
  }
};

onMounted(loadBuilders);

const handleBuilderSuccess = async () => {
  await loadBuilders();
  if (builders.value.length > 0) {
    newProj.value.builderId = builders.value[builders.value.length - 1]._id || builders.value[builders.value.length - 1].id;
  }
};

const { mutateAsync: createProject } = useCreateProjectMutation();
const { mutateAsync: updateProject } = useUpdateProjectMutation();

const openEditProject = (proj) => {
  isEditMode.value = true;
  editingProjectId.value = proj._id || proj.id;
  validationError.value = '';
  newProj.value = {
    name: proj.name,
    code: proj.code,
    builderId: proj.builderId?._id || proj.builderId,
    city: proj.city || 'Mumbai',
    locality: proj.locality || '',
    address: proj.address || '',
    rera: proj.rera || '',
    status: proj.status || 'upcoming'
  };
  isCreateOpen.value = true;
};

const closeDrawer = () => {
  isCreateOpen.value = false;
  isEditMode.value = false;
  editingProjectId.value = null;
  validationError.value = '';
  newProj.value = {
    name: '',
    code: '',
    builderId: builders.value[0]?._id || '',
    city: 'Mumbai',
    locality: '',
    address: '',
    rera: '',
    status: 'upcoming'
  };
};

const handleSaveProject = async () => {
  validationError.value = '';

  if (!newProj.value.name?.trim()) {
    validationError.value = 'Project Name is mandatory.';
    return;
  }

  // Auto-generate code if empty
  if (!newProj.value.code?.trim()) {
    newProj.value.code = newProj.value.name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8);
    if (!newProj.value.code) {
      newProj.value.code = 'PROJ' + Math.floor(1000 + Math.random() * 9000);
    }
  }

  // Ensure builder is selected
  if (!newProj.value.builderId) {
    if (builders.value.length > 0) {
      newProj.value.builderId = builders.value[0]._id || builders.value[0].id;
    } else {
      await loadBuilders();
      if (builders.value.length > 0) {
        newProj.value.builderId = builders.value[0]._id || builders.value[0].id;
      } else {
        validationError.value = 'Please select or add a Builder Developer before saving.';
        return;
      }
    }
  }

  if (!newProj.value.city?.trim()) {
    newProj.value.city = 'Mumbai';
  }

  isSaving.value = true;
  try {
    if (isEditMode.value) {
      const { code, ...updatePayload } = newProj.value;
      await updateProject({
        id: editingProjectId.value,
        ...updatePayload
      });
      
      store.dispatch('notifications/triggerToast', {
        message: 'Project details updated successfully.',
        type: 'success'
      });
    } else {
      await createProject({
        ...newProj.value
      });
      
      store.dispatch('notifications/triggerToast', {
        message: 'New development project added successfully.',
        type: 'success'
      });
    }
    
    closeDrawer();
    refetch();
  } catch (err) {
    validationError.value = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to save project.';
    store.dispatch('notifications/triggerToast', {
      message: validationError.value,
      type: 'error'
    });
  } finally {
    isSaving.value = false;
  }
};

const copyRera = (reraId) => {
  if (!reraId) return;
  navigator.clipboard.writeText(reraId);
  store.dispatch('notifications/triggerToast', {
    message: 'RERA Registration ID copied to clipboard.',
    type: 'success'
  });
};

const formatStatus = (status) => {
  switch (status) {
    case 'upcoming': return 'Upcoming';
    case 'under_construction': return 'Under Const.';
    case 'ready_to_move': return 'Ready to Move';
    case 'sold_out': return 'Sold Out';
    default: return status || '—';
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'ready_to_move': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800';
    case 'under_construction': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800';
    case 'upcoming': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800';
    case 'sold_out': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800';
    default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
};
</script>
