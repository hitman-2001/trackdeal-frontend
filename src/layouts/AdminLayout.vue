<template>
  <div
    class="min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-accent-500 selection:text-white font-sans"
  >
    <!-- TOP HEADER -->
    <header
      class="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between"
    >
      <!-- Brand / Logo -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2.5">
          <div
            class="brand-mark w-9 h-9 rounded-[11px] bg-primary flex items-center justify-center text-white shadow-xs"
          >
            <PhLightning :size="20" weight="fill" />
          </div>
          <div>
            <div
              class="font-heading font-black text-sm text-slate-900 dark:text-white tracking-wider flex items-center gap-2"
            >
              TRACKDEAL
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent-400 border border-primary/20"
              >
                PLATFORM ADMIN
              </span>
            </div>
            <div
              class="text-[11px] text-slate-500 dark:text-slate-400 font-medium"
            >
              SaaS Multi-Tenant Management Console
            </div>
          </div>
        </div>
      </div>

      <!-- Global Search Bar -->
      <div class="relative max-w-md w-full hidden md:block">
        <div class="relative flex items-center">
          <PhMagnifyingGlass
            :size="15"
            class="absolute left-3.5 text-slate-400 pointer-events-none"
          />
          <input
            v-model="searchQuery"
            @input="handleGlobalSearch"
            type="text"
            placeholder="Search organizations, tenants, users..."
            class="w-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-16 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition shadow-xs"
          />
          <kbd
            class="absolute right-3 text-slate-400 text-[10px] font-mono border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 bg-white/50 dark:bg-slate-900/50"
            >Ctrl K</kbd
          >
        </div>

        <!-- Global Search Results Dropdown -->
        <div
          v-if="
            searchResults &&
            (searchResults.organizations?.length || searchResults.users?.length)
          "
          class="absolute left-0 right-0 top-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 z-50 space-y-3"
        >
          <div v-if="searchResults.organizations?.length">
            <span
              class="text-[10px] font-bold uppercase tracking-wider text-primary px-2"
              >Organizations</span
            >
            <div class="mt-1 space-y-1">
              <router-link
                v-for="org in searchResults.organizations"
                :key="org._id"
                :to="`/admin/organizations/${org._id}`"
                @click="clearSearch"
                class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 transition"
              >
                <span class="font-semibold">{{ org.name }}</span>
                <span class="text-[10px] text-slate-500 dark:text-slate-400"
                  >{{ org.code }} •
                  {{ org.organizationType || org.vertical || "Agency" }}</span
                >
              </router-link>
            </div>
          </div>

          <div v-if="searchResults.users?.length">
            <span
              class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2"
              >Users</span
            >
            <div class="mt-1 space-y-1">
              <router-link
                v-for="u in searchResults.users"
                :key="u._id"
                to="/admin/users"
                @click="clearSearch"
                class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 transition"
              >
                <span class="font-semibold"
                  >{{ u.firstName }} {{ u.lastName }} ({{ u.email }})</span
                >
                <span class="text-[10px] text-slate-500 dark:text-slate-400">{{
                  u.organizationId?.name || "No Org"
                }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Header Actions & Profile -->
      <div class="flex items-center gap-3">
        <!-- Theme Toggle -->
        <button
          @click="toggleTheme"
          class="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80 transition"
          :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <PhSun v-if="isDarkMode" :size="17" />
          <PhMoon v-else :size="17" />
        </button>

        <!-- User Profile Pill & Dropdown -->
        <div class="relative" ref="profileMenuRef">
          <button
            @click="userMenuOpen = !userMenuOpen"
            class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition select-none text-left"
          >
            <div
              class="w-7 h-7 rounded-full bg-primary/15 text-primary dark:bg-primary/25 dark:text-accent-300 font-bold flex items-center justify-center text-xs"
            >
              {{ userInitials }}
            </div>
            <div class="hidden sm:block">
              <div
                class="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight"
              >
                {{ currentUserName }}
              </div>
              <div
                class="text-[10px] text-primary dark:text-accent-400 font-semibold tracking-tight"
              >
                SUPER ADMIN
              </div>
            </div>
            <PhCaretDown
              :size="13"
              class="text-slate-400 transition-transform duration-150"
              :class="{ 'rotate-180': userMenuOpen }"
            />
          </button>

          <!-- Profile Dropdown Menu -->
          <div
            v-if="userMenuOpen"
            class="absolute right-0 top-12 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 z-50 space-y-1"
          >
            <div
              class="px-3 py-2 border-b border-slate-100 dark:border-slate-800"
            >
              <div class="text-xs font-bold text-slate-900 dark:text-white">
                {{ currentUserName }}
              </div>
              <div class="text-[10px] text-slate-500 truncate">
                {{ currentUserEmail }}
              </div>
            </div>
            <router-link
              to="/app"
              class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              @click="userMenuOpen = false"
            >
              <PhArrowSquareOut :size="15" />
              <span>Go to App Workspace</span>
            </router-link>
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            >
              <PhSignOut :size="15" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- MAIN BODY: SIDEBAR + CONTENT -->
    <div class="flex-1 flex overflow-hidden">
      <!-- SIDEBAR -->
      <aside
        class="w-64 bg-white dark:bg-slate-900/70 border-r border-slate-200 dark:border-slate-800/80 shrink-0 p-4 space-y-6 flex flex-col justify-between hidden md:flex"
      >
        <div class="space-y-6">
          <div v-for="group in navGroups" :key="group.title" class="space-y-1">
            <span
              class="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 px-3 py-1 block"
            >
              {{ group.title }}
            </span>
            <div class="space-y-0.5">
              <router-link
                v-for="item in group.items"
                :key="item.name"
                :to="item.to"
                class="relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group"
                :class="
                  isActiveRoute(item)
                    ? 'bg-primary/10 text-primary font-semibold dark:bg-primary/20 dark:text-accent-300'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                "
              >
                <!-- Active Indicator Bar on Left -->
                <span
                  v-if="isActiveRoute(item)"
                  class="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full"
                ></span>
                <component
                  :is="item.icon"
                  :size="17"
                  :weight="isActiveRoute(item) ? 'bold' : 'regular'"
                  class="shrink-0 transition-colors"
                  :class="
                    isActiveRoute(item)
                      ? 'text-primary dark:text-accent-300'
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                  "
                />
                <span class="truncate">{{ item.name }}</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- FOOTER STATUS CHIP -->
        <div
          class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5"
        >
          <div
            class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold"
          >
            <span
              class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
            ></span>
            <span>Cluster Status: Healthy</span>
          </div>
          <div class="text-[10px] text-slate-400">
            TrackDeal Engine v2.4.0 (Prod)
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT VIEWPORT -->
      <main
        class="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 sm:p-8 pb-24 md:pb-8"
      >
        <router-view />
      </main>
    </div>

    <!-- Mobile Bottom Navigation (Only visible on small screens) -->
    <nav class="admin-mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-4 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      <router-link to="/admin/dashboard" class="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-accent-300 transition-colors" exact-active-class="!text-primary dark:!text-accent-400 font-bold">
        <PhChartBar :size="20" weight="regular" />
        <span class="text-[10px] font-semibold">Home</span>
      </router-link>
      <router-link to="/admin/organizations" class="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-accent-300 transition-colors" exact-active-class="!text-primary dark:!text-accent-400 font-bold">
        <PhBuildings :size="20" weight="regular" />
        <span class="text-[10px] font-semibold">Tenants</span>
      </router-link>
      <router-link to="/admin/users" class="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-accent-300 transition-colors" exact-active-class="!text-primary dark:!text-accent-400 font-bold">
        <PhUsersThree :size="20" weight="regular" />
        <span class="text-[10px] font-semibold">Users</span>
      </router-link>
      <router-link to="/admin/audit-logs" class="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-accent-300 transition-colors" exact-active-class="!text-primary dark:!text-accent-400 font-bold">
        <PhScroll :size="20" weight="regular" />
        <span class="text-[10px] font-semibold">Logs</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import {
  PhMoon,
  PhSun,
  PhLightning,
  PhMagnifyingGlass,
  PhChartBar,
  PhBuildings,
  PhUsersThree,
  PhScroll,
  PhGearSix,
  PhCaretDown,
  PhArrowSquareOut,
  PhSignOut,
} from "@phosphor-icons/vue";
import { searchAdminGlobal } from "../modules/admin/api/endpoints";

const store = useStore();
const router = useRouter();
const route = useRoute();

const currentUser = computed(() => store.state.auth.currentUser);
const currentUserName = computed(() => {
  const u = currentUser.value;
  if (!u) return "Super Admin";
  return `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Super Admin";
});
const currentUserEmail = computed(
  () => currentUser.value?.email || "admin@trackdeal.in",
);
const userInitials = computed(() => {
  const name = currentUserName.value;
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || "SA";
});

const isDarkMode = computed(() => store.state.ui.activeThemeMode === "dark");

const searchQuery = ref("");
const searchResults = ref(null);
const userMenuOpen = ref(false);
const profileMenuRef = ref(null);
let searchTimeout = null;

const navGroups = [
  {
    title: "Platform Overview",
    items: [
      {
        name: "Dashboard",
        to: "/admin/dashboard",
        icon: PhChartBar,
        exact: true,
      },
    ],
  },
  {
    title: "Tenant Management",
    items: [
      { name: "Tenants", to: "/admin/tenants", icon: PhBuildings },
      { name: "Organizations", to: "/admin/organizations", icon: PhBuildings },
      { name: "Platform Users", to: "/admin/users", icon: PhUsersThree },
    ],
  },
  {
    title: "Platform Monitoring",
    items: [
      { name: "Audit Logs", to: "/admin/audit-logs", icon: PhScroll },
      { name: "System Settings", to: "/admin/settings", icon: PhGearSix },
    ],
  },
];

function isActiveRoute(item) {
  if (item.exact) {
    return route.path === item.to || route.path === "/admin";
  }
  return route.path.startsWith(item.to);
}

function toggleTheme() {
  store.commit("ui/SET_THEME_MODE", isDarkMode.value ? "light" : "dark");
}

function handleGlobalSearch() {
  clearTimeout(searchTimeout);
  if (!searchQuery.value.trim()) {
    searchResults.value = null;
    return;
  }
  searchTimeout = setTimeout(async () => {
    try {
      const res = await searchAdminGlobal(searchQuery.value.trim());
      searchResults.value = res?.data || res || null;
    } catch (e) {
      searchResults.value = null;
    }
  }, 250);
}

function clearSearch() {
  searchQuery.value = "";
  searchResults.value = null;
}

function handleLogout() {
  userMenuOpen.value = false;
  store.dispatch("auth/logoutSession");
  router.push("/login");
}

function handleDocumentClick(e) {
  if (profileMenuRef.value && !profileMenuRef.value.contains(e.target)) {
    userMenuOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleDocumentClick);
});
</script>

<style scoped>
.admin-mobile-bottom-nav {
  display: none !important;
}
@media (max-width: 767px) {
  .admin-mobile-bottom-nav {
    display: flex !important;
  }
}
</style>
