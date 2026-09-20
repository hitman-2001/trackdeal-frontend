<template>
  <Teleport to="body">
    <Transition name="search-modal-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[1000] overflow-y-auto bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4"
        @click.self="close"
      >
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden text-xs transition-all"
          role="dialog"
          aria-modal="true"
          aria-label="Platform global search"
        >
          <!-- Search Input Header -->
          <div class="p-3.5 sm:p-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
            <PhMagnifyingGlass :size="18" class="text-slate-400 shrink-0" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Search organizations, tenants, users... (Esc to close)"
              class="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none font-medium"
              @keydown.esc="close"
              @input="handleInput"
            />
            <PhCircleNotch
              v-if="loading"
              :size="16"
              class="text-primary dark:text-accent-400 animate-spin shrink-0"
            />
            <button
              @click="close"
              class="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Close search (Esc)"
            >
              ESC
            </button>
          </div>

          <!-- Search Body / Results -->
          <div class="max-h-[60vh] overflow-y-auto p-3 space-y-4">
            <!-- Loading indicator text -->
            <div v-if="loading && !results" class="py-8 text-center text-slate-400 text-xs">
              Searching TrackDeal cluster records...
            </div>

            <!-- Empty query: Quick navigation links -->
            <div v-else-if="!searchQuery.trim()" class="space-y-3 p-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 block">
                Quick Platform Navigation
              </span>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <router-link
                  to="/admin/dashboard"
                  @click="close"
                  class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                >
                  <div class="w-6 h-6 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent-300 flex items-center justify-center shrink-0">
                    <PhChartBar :size="14" />
                  </div>
                  <span class="truncate">Dashboard</span>
                </router-link>

                <router-link
                  to="/admin/organizations"
                  @click="close"
                  class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                >
                  <div class="w-6 h-6 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent-300 flex items-center justify-center shrink-0">
                    <PhBuildings :size="14" />
                  </div>
                  <span class="truncate">Organizations</span>
                </router-link>

                <router-link
                  to="/admin/tenants"
                  @click="close"
                  class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                >
                  <div class="w-6 h-6 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent-300 flex items-center justify-center shrink-0">
                    <PhBriefcase :size="14" />
                  </div>
                  <span class="truncate">Tenants</span>
                </router-link>

                <router-link
                  to="/admin/users"
                  @click="close"
                  class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                >
                  <div class="w-6 h-6 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent-300 flex items-center justify-center shrink-0">
                    <PhUsersThree :size="14" />
                  </div>
                  <span class="truncate">Platform Users</span>
                </router-link>

                <router-link
                  to="/admin/audit-logs"
                  @click="close"
                  class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                >
                  <div class="w-6 h-6 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent-300 flex items-center justify-center shrink-0">
                    <PhScroll :size="14" />
                  </div>
                  <span class="truncate">Audit Logs</span>
                </router-link>

                <router-link
                  to="/admin/settings"
                  @click="close"
                  class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                >
                  <div class="w-6 h-6 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent-300 flex items-center justify-center shrink-0">
                    <PhGearSix :size="14" />
                  </div>
                  <span class="truncate">Settings</span>
                </router-link>
              </div>
            </div>

            <!-- No results found -->
            <div
              v-else-if="
                results &&
                (!results.organizations || results.organizations.length === 0) &&
                (!results.users || results.users.length === 0)
              "
              class="py-8 text-center text-slate-400 space-y-1"
            >
              <PhMagnifyingGlass :size="24" class="mx-auto text-slate-300 dark:text-slate-600 mb-1" />
              <p class="font-bold text-slate-700 dark:text-slate-300 text-xs">
                No results found for "{{ searchQuery }}"
              </p>
              <p class="text-[11px] text-slate-400">
                Try searching by organization name, tenant code, city, or user email.
              </p>
            </div>

            <!-- Search Results Display -->
            <div v-else class="space-y-4">
              <!-- Organizations Group -->
              <div v-if="results?.organizations?.length > 0" class="space-y-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-accent-400 px-2 block">
                  Organizations ({{ results.organizations.length }})
                </span>
                <router-link
                  v-for="org in results.organizations"
                  :key="org._id"
                  :to="`/admin/organizations/${org._id}`"
                  @click="close"
                  class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors block group"
                >
                  <div class="space-y-0.5">
                    <div class="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                      <span>{{ org.name }}</span>
                      <span class="px-1.5 py-0.2 rounded font-mono text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {{ org.code }}
                      </span>
                    </div>
                    <div class="text-[10px] text-slate-400">
                      {{ org.email || org.city || "Tenant Organization" }} • {{ org.organizationType || org.vertical || "Agency" }}
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="px-2 py-0.5 rounded-full text-[9px] font-bold capitalize"
                      :class="
                        org.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                      "
                    >
                      {{ org.status }}
                    </span>
                    <PhArrowRight :size="12" class="text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                </router-link>
              </div>

              <!-- Users Group -->
              <div v-if="results?.users?.length > 0" class="space-y-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2 block">
                  Platform Users ({{ results.users.length }})
                </span>
                <router-link
                  v-for="u in results.users"
                  :key="u._id"
                  to="/admin/users"
                  @click="close"
                  class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors block group"
                >
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0 border border-emerald-200 dark:border-emerald-800">
                      {{ (u.firstName?.[0] || "U") + (u.lastName?.[0] || "") }}
                    </div>
                    <div class="space-y-0.5">
                      <div class="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {{ u.firstName }} {{ u.lastName }}
                      </div>
                      <div class="text-[10px] text-slate-400">
                        {{ u.email }} <span v-if="u.organizationId">• {{ u.organizationId.name }}</span>
                      </div>
                    </div>
                  </div>
                  <PhArrowRight :size="12" class="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </router-link>
              </div>
            </div>
          </div>

          <!-- Modal Footer Hint -->
          <div class="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>Navigation: Click or Enter</span>
            <div class="flex items-center gap-2">
              <span>Close: <kbd class="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">Esc</kbd></span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import {
  PhMagnifyingGlass,
  PhBuildings,
  PhBriefcase,
  PhUsersThree,
  PhScroll,
  PhGearSix,
  PhChartBar,
  PhArrowRight,
  PhCircleNotch,
} from "@phosphor-icons/vue";
import { searchAdminGlobal } from "../api/endpoints";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const searchInputRef = ref(null);
const searchQuery = ref("");
const results = ref(null);
const loading = ref(false);
let searchTimer = null;

function close() {
  emit("close");
}

function handleInput() {
  clearTimeout(searchTimer);
  if (!searchQuery.value.trim()) {
    results.value = null;
    loading.value = false;
    return;
  }
  loading.value = true;
  searchTimer = setTimeout(async () => {
    try {
      const res = await searchAdminGlobal(searchQuery.value.trim());
      results.value = res?.data || res || null;
    } catch (err) {
      console.error("Admin search failed:", err);
      results.value = null;
    } finally {
      loading.value = false;
    }
  }, 200);
}

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      searchQuery.value = "";
      results.value = null;
      loading.value = false;
      nextTick(() => {
        searchInputRef.value?.focus();
      });
    }
  },
);
</script>

<style scoped>
.search-modal-fade-enter-active,
.search-modal-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.search-modal-fade-enter-from,
.search-modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>

