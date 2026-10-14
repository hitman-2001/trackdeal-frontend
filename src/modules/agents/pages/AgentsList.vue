<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-title font-bold tracking-tight" style="color: hsl(var(--neutral-900));">
          Agent / Channel Partner Directory
        </h1>
        <p class="text-body-sm" style="color: hsl(var(--neutral-400));">
          Manage master brokers, channel partners, agency contracts, and lead assignments
        </p>
      </div>

      <button
        @click="openCreateDrawer"
        class="h-10 px-4 rounded-lg font-medium text-caption text-white transition-opacity flex items-center justify-center gap-2 shrink-0 shadow-sm w-full sm:w-auto"
        style="background-color: hsl(var(--accent-600));"
      >
        <PhUserPlus :size="18" weight="bold" />
        <span>+ Add Agent / Channel Partner</span>
      </button>
    </div>

    <!-- Search & Filters Toolbar -->
    <div
      class="p-4 rounded-xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs"
      style="background-color: hsl(var(--bg-surface)); border-color: hsl(var(--neutral-100));"
    >
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <PhMagnifyingGlass :size="16" class="absolute left-3 top-1/2 -translate-y-1/2" style="color: hsl(var(--neutral-400));" />
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search by Agent name, office, phone, email, RERA..."
          class="w-full h-9 pl-9 pr-3 rounded-md border text-body-sm outline-none transition-all"
          style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-900));"
        />
      </div>

      <!-- Filter Controls -->
      <div class="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5">
        <!-- Status Filter -->
        <select
          v-model="filters.status"
          class="h-9 px-3 rounded-md border text-caption outline-none cursor-pointer w-full sm:w-auto"
          style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-700));"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <!-- Agent Type Filter -->
        <select
          v-model="filters.agentType"
          class="h-9 px-3 rounded-md border text-caption outline-none cursor-pointer w-full sm:w-auto"
          style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-700));"
        >
          <option value="">All Agent Types</option>
          <option value="channel_partner">Channel Partner</option>
          <option value="individual">Individual Broker</option>
          <option value="company">Real Estate Agency</option>
          <option value="broker">Independent Broker</option>
          <option value="other">Other</option>
        </select>

        <!-- City Filter -->
        <input
          v-model="filters.city"
          type="text"
          placeholder="Filter by city..."
          class="h-9 px-3 rounded-md border text-caption outline-none col-span-2 sm:col-span-1 w-full sm:w-32"
          style="border-color: hsl(var(--neutral-200)); background-color: hsl(var(--bg-surface)); color: hsl(var(--neutral-700));"
        />
      </div>
    </div>

    <!-- Data Table -->
    <div
      class="rounded-xl border overflow-hidden shadow-xs"
      style="background-color: hsl(var(--bg-surface)); border-color: hsl(var(--neutral-100));"
    >
      <!-- Desktop Table View -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="border-b text-micro uppercase tracking-wider font-semibold"
              style="border-color: hsl(var(--neutral-100)); background-color: hsl(var(--neutral-50)); color: hsl(var(--neutral-500));"
            >
              <th class="px-4 py-3">Agent / Office Name</th>
              <th class="px-4 py-3">Phone & Email</th>
              <th class="px-4 py-3">RERA & Reg. No.</th>
              <th class="px-4 py-3">City</th>
              <th class="px-4 py-3">Agent Type</th>
              <th class="px-4 py-3">Leads Assigned</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y" style="border-color: hsl(var(--neutral-100));">
            <!-- Loading skeleton -->
            <template v-if="isLoading">
              <tr v-for="n in 5" :key="n" class="animate-pulse">
                <td colspan="8" class="px-4 py-4">
                  <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                </td>
              </tr>
            </template>

            <!-- Empty state -->
            <template v-else-if="agents.length === 0">
              <tr>
                <td colspan="8" class="px-4 py-12 text-center">
                  <PhUsersThree :size="36" class="mx-auto mb-2" style="color: hsl(var(--neutral-300));" />
                  <p class="font-medium text-body-sm" style="color: hsl(var(--neutral-600));">
                    No Agents or Channel Partners found
                  </p>
                  <p class="text-caption" style="color: hsl(var(--neutral-400));">
                    Click "+ Add Agent / Channel Partner" to register your first partner
                  </p>
                </td>
              </tr>
            </template>

            <!-- Table Rows -->
            <tr
              v-for="agent in agents"
              :key="agent._id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <!-- Name & Office -->
              <td class="px-4 py-3.5">
                <router-link
                  :to="`/app/agents/${agent._id}`"
                  class="font-semibold text-body-sm hover:underline block"
                  style="color: hsl(var(--neutral-900));"
                >
                  {{ agent.name }}
                </router-link>
                <span class="text-micro font-medium" style="color: hsl(var(--neutral-500));">
                  <AppIcon name="buildings" :size="12" /> {{ agent.officeName }}
                </span>
              </td>

              <!-- Phone & Email -->
              <td class="px-4 py-3.5 text-caption">
                <div class="font-medium" style="color: hsl(var(--neutral-800));">
                  <AppIcon name="phone" :size="12" /> {{ agent.phone }}
                </div>
                <div v-if="agent.email" class="text-micro" style="color: hsl(var(--neutral-400));">
                  <AppIcon name="email" :size="12" /> {{ agent.email }}
                </div>
              </td>

              <!-- RERA Number -->
              <td class="px-4 py-3.5 text-caption">
                <span v-if="agent.reraNumber" class="font-mono text-micro px-1.5 py-0.5 rounded border" style="background-color: hsl(var(--neutral-50)); border-color: hsl(var(--neutral-200)); color: hsl(var(--neutral-700));">
                  {{ agent.reraNumber }}
                </span>
                <span v-else class="text-micro" style="color: hsl(var(--neutral-400));">—</span>
              </td>

              <!-- City -->
              <td class="px-4 py-3.5 text-caption font-medium" style="color: hsl(var(--neutral-700));">
                {{ agent.city || '—' }}
              </td>

              <!-- Agent Type -->
              <td class="px-4 py-3.5">
                <span
                  class="inline-block px-2 py-0.5 rounded-full text-micro font-medium capitalize"
                  style="background-color: hsl(var(--accent-50)); color: hsl(var(--accent-700));"
                >
                  {{ formatAgentType(agent.agentType) }}
                </span>
              </td>

              <!-- Assigned Leads Count -->
              <td class="px-4 py-3.5">
                <span class="font-bold text-caption" style="color: hsl(var(--accent-700));">
                  {{ agent.totalLeadsAssigned || 0 }}
                </span>
                <span class="text-micro ml-1" style="color: hsl(var(--neutral-400));">leads</span>
              </td>

              <!-- Status -->
              <td class="px-4 py-3.5">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-micro font-semibold capitalize"
                  :style="{
                    backgroundColor: agent.status === 'active' ? 'hsl(var(--success-50))' : 'hsl(var(--neutral-100))',
                    color: agent.status === 'active' ? 'hsl(var(--success-700))' : 'hsl(var(--neutral-600))'
                  }"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :style="{ backgroundColor: agent.status === 'active' ? 'hsl(var(--success-500))' : 'hsl(var(--neutral-400))' }"
                  ></span>
                  {{ agent.status }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3.5 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <router-link
                    :to="`/app/agents/${agent._id}`"
                    class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                    title="View Details & Performance"
                  >
                    <PhEye :size="16" />
                  </router-link>

                  <button
                    @click="openEditDrawer(agent)"
                    class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                    title="Edit Agent"
                  >
                    <PhPencilSimple :size="16" />
                  </button>

                  <button
                    @click="toggleAgentStatus(agent)"
                    class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    :class="agent.status === 'active' ? 'text-amber-600' : 'text-emerald-600'"
                    :title="agent.status === 'active' ? 'Deactivate Agent' : 'Activate Agent'"
                  >
                    <PhPower :size="16" />
                  </button>

                  <button
                    @click="confirmDeleteAgent(agent)"
                    class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-red-500 transition-colors"
                    title="Delete Agent"
                  >
                    <PhTrash :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Agents Card Feed -->
      <div class="sm:hidden divide-y divide-default">
        <!-- Loading skeleton -->
        <template v-if="isLoading">
          <div v-for="n in 4" :key="'agent-skel-' + n" class="p-4 space-y-3 animate-pulse">
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          </div>
        </template>

        <!-- Empty state -->
        <template v-else-if="agents.length === 0">
          <div class="p-8 text-center">
            <PhUsersThree :size="36" class="mx-auto mb-2" style="color: hsl(var(--neutral-300));" />
            <p class="font-medium text-body-sm" style="color: hsl(var(--neutral-600));">
              No Agents or Channel Partners found
            </p>
            <p class="text-caption mt-1" style="color: hsl(var(--neutral-400));">
              Click "+ Add Agent / Channel Partner" to register your first partner
            </p>
          </div>
        </template>

        <!-- Mobile Agent Cards -->
        <template v-else>
          <div
            v-for="agent in agents"
            :key="'mob-agent-' + agent._id"
            class="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
          >
            <!-- Header: Agent Name, Office & Status -->
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <router-link
                  :to="`/app/agents/${agent._id}`"
                  class="font-semibold text-body-sm hover:underline block truncate"
                  style="color: hsl(var(--neutral-900));"
                >
                  {{ agent.name }}
                </router-link>
                <div class="flex items-center gap-1.5 mt-0.5 text-micro text-slate-500 truncate">
                  <AppIcon name="buildings" :size="12" />
                  <span class="truncate">{{ agent.officeName || 'Direct' }}</span>
                </div>
              </div>

              <!-- Status Badge -->
              <span
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-micro font-semibold capitalize shrink-0"
                :style="{
                  backgroundColor: agent.status === 'active' ? 'hsl(var(--success-50))' : 'hsl(var(--neutral-100))',
                  color: agent.status === 'active' ? 'hsl(var(--success-700))' : 'hsl(var(--neutral-600))'
                }"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :style="{ backgroundColor: agent.status === 'active' ? 'hsl(var(--success-500))' : 'hsl(var(--neutral-400))' }"
                ></span>
                {{ agent.status }}
              </span>
            </div>

            <!-- Chips Row: Type, City, Leads Count -->
            <div class="flex items-center flex-wrap gap-2 text-micro">
              <span
                class="px-2 py-0.5 rounded-full font-medium capitalize"
                style="background-color: hsl(var(--accent-50)); color: hsl(var(--accent-700));"
              >
                {{ formatAgentType(agent.agentType) }}
              </span>

              <span v-if="agent.city" class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                {{ agent.city }}
              </span>

              <span class="px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 font-medium">
                <b>{{ agent.totalLeadsAssigned || 0 }}</b> leads
              </span>

              <span v-if="agent.reraNumber" class="font-mono px-1.5 py-0.5 rounded border text-[10px] bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300">
                RERA: {{ agent.reraNumber }}
              </span>
            </div>

            <!-- Contact Row with Direct Call Button -->
            <div class="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50/70 dark:bg-slate-900/40 border border-default text-xs">
              <div class="min-w-0 flex-1">
                <div class="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <AppIcon name="phone" :size="12" />
                  <span>{{ agent.phone }}</span>
                </div>
                <div v-if="agent.email" class="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                  <AppIcon name="email" :size="11" />
                  <span class="truncate">{{ agent.email }}</span>
                </div>
              </div>

              <a
                v-if="agent.phone"
                :href="'tel:' + agent.phone"
                class="h-8 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs flex items-center gap-1.5 shrink-0 hover:bg-emerald-100 transition-colors"
                title="Call Agent"
              >
                <PhPhone :size="13" weight="bold" />
                <span>Call</span>
              </a>
            </div>

            <!-- Actions Row -->
            <div class="flex items-center justify-between pt-1 border-t border-default/50">
              <router-link
                :to="`/app/agents/${agent._id}`"
                class="h-8 px-3 rounded-lg border border-default text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <PhEye :size="14" weight="bold" />
                <span>View Details</span>
              </router-link>

              <div class="flex items-center gap-1">
                <button
                  @click="openEditDrawer(agent)"
                  class="w-8 h-8 rounded-lg border border-default flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Agent"
                  aria-label="Edit Agent"
                >
                  <PhPencilSimple :size="15" />
                </button>

                <button
                  @click="toggleAgentStatus(agent)"
                  class="w-8 h-8 rounded-lg border border-default flex items-center justify-center transition-colors"
                  :class="agent.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'"
                  :title="agent.status === 'active' ? 'Deactivate Agent' : 'Activate Agent'"
                  aria-label="Toggle Status"
                >
                  <PhPower :size="15" />
                </button>

                <button
                  @click="confirmDeleteAgent(agent)"
                  class="w-8 h-8 rounded-lg border border-default flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Delete Agent"
                  aria-label="Delete Agent"
                >
                  <PhTrash :size="15" />
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <AppPagination
        :page="pagination.page"
        :page-size="filters.limit"
        :total="pagination.total"
        :total-pages="pagination.totalPages"
        @page-change="filters.page = $event"
        @page-size-change="filters.limit = $event; filters.page = 1"
      />
    </div>

    <!-- Create / Edit Drawer -->
    <AgentCreateDrawer
      :open="drawerOpen"
      :agent-data="selectedAgent"
      @close="drawerOpen = false"
      @saved="refetch"
    />
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import {
  PhUserPlus,
  PhMagnifyingGlass,
  PhUsersThree,
  PhEye,
  PhPencilSimple,
  PhPower,
  PhTrash,
  PhPhone,
} from '@phosphor-icons/vue';
import { useAgentsQuery, useAgentStatusMutation, useDeleteAgentMutation } from '../queries';
import AgentCreateDrawer from '../components/AgentCreateDrawer.vue';
import Swal from 'sweetalert2';

const filters = reactive({
  search: '',
  status: '',
  agentType: '',
  city: '',
  page: 1,
  limit: 20,
});

watch(
  () => [filters.search, filters.status, filters.agentType, filters.city],
  () => { filters.page = 1; }
);

const drawerOpen = ref(false);
const selectedAgent = ref(null);

const { data: agentsRes, isLoading, refetch } = useAgentsQuery(filters);
const statusMutation = useAgentStatusMutation();
const deleteMutation = useDeleteAgentMutation();

const agents = computed(() => agentsRes.value?.data || []);
const pagination = computed(() => agentsRes.value?.pagination || { page: 1, totalPages: 1, total: 0 });

const formatAgentType = (type) => {
  if (!type) return 'Channel Partner';
  return type.replace(/_/g, ' ');
};

const openCreateDrawer = () => {
  selectedAgent.value = null;
  drawerOpen.value = true;
};

const openEditDrawer = (agent) => {
  selectedAgent.value = agent;
  drawerOpen.value = true;
};

const toggleAgentStatus = async (agent) => {
  const newStatus = agent.status === 'active' ? 'inactive' : 'active';
  const result = await Swal.fire({ title: 'Confirm', text: `Are you sure you want to change '${agent.name}' status to ${newStatus}?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes', cancelButtonText: 'Cancel' });
  if (result.isConfirmed) {
    try {
      await statusMutation.mutateAsync({ id: agent._id, status: newStatus });
    } catch (err) {
      Swal.fire({ text: err.response?.data?.error?.message || 'Failed to update status', icon: 'error' });
    }
  }
};

const confirmDeleteAgent = async (agent) => {
  const result = await Swal.fire({ title: 'Confirm', text: `Are you sure you want to delete '${agent.name}'? This action cannot be undone.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes', cancelButtonText: 'Cancel' });
  if (result.isConfirmed) {
    try {
      await deleteMutation.mutateAsync(agent._id);
    } catch (err) {
      Swal.fire({ text: err.response?.data?.error?.message || 'Failed to delete agent', icon: 'error' });
    }
  }
};
</script>
