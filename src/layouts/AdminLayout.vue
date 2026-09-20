<template>
  <div class="app-container">
    <!-- Skip navigation link for accessibility -->
    <a href="#admin-main" class="skip-link">Skip to console</a>

    <!-- ── Top Navbar (Full Width Across Top) ────────────────────────── -->
    <header class="app-navbar glass" role="banner">
      <!-- Left: Brand Logo -->
      <div class="navbar-left">
        <router-link
          to="/admin/dashboard"
          class="logo-container"
          title="TrackDeal Platform Admin"
        >
          <div class="brand-mark-box shrink-0">
            <PhLightning weight="fill" :size="20" class="text-white" />
          </div>
          <div class="brand-text flex flex-col min-w-0">
            <div class="flex items-center gap-2">
              <span class="brand-name font-heading">
                Track<span class="brand-highlight">Deal</span>
              </span>
              <span
                class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary dark:bg-primary/25 dark:text-accent-300 border border-primary/20"
              >
                Super Admin
              </span>
            </div>
            <span class="brand-subline">
              Multi-Tenant Cluster Console
            </span>
          </div>
        </router-link>
      </div>

      <!-- Center: Global Search Bar (Trigger for Ctrl + K modal) -->
      <div class="navbar-center flex relative">
        <div
          class="search-box relative cursor-pointer select-none"
          role="search"
          @click="adminSearchOpen = true"
          title="Search or press Ctrl + K"
        >
          <PhMagnifyingGlass :size="15" class="search-icon text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search organizations, tenants, users..."
            aria-label="Platform global search"
            readonly
            class="cursor-pointer select-none"
          />
          <span class="search-command-pill" aria-hidden="true">Ctrl + K</span>
        </div>
      </div>

      <!-- Right: User Profile Pill (Light/Dark theme toggle removed per request) -->
      <div class="navbar-right">
        <!-- User Profile Pill -->
        <div
          class="user-profile"
          ref="profileMenuRef"
          @click="userMenuOpen = !userMenuOpen"
          @keydown.enter="userMenuOpen = !userMenuOpen"
          @keydown.space.prevent="userMenuOpen = !userMenuOpen"
          tabindex="0"
          role="button"
          :aria-expanded="userMenuOpen"
          aria-haspopup="menu"
          :aria-label="`User menu — ${currentUserName}`"
        >
          <div class="user-avatar" aria-hidden="true">
            {{ userInitials }}
          </div>
          <div class="user-info-brief hidden sm:flex">
            <span class="user-name">{{ currentUserName }}</span>
            <span class="user-role font-black text-primary dark:text-accent-400">SUPER ADMIN</span>
          </div>
          <PhCaretDown
            :size="14"
            weight="bold"
            class="dropdown-arrow hidden sm:block transition-transform duration-150"
            :class="{ 'rotate-180': userMenuOpen }"
            aria-hidden="true"
          />

          <!-- Profile Dropdown Menu -->
          <Transition name="dropdown">
            <div
              v-if="userMenuOpen"
              class="dropdown-menu shadow-xl"
              role="menu"
              @click.stop
            >
              <div class="dropdown-header">
                <p class="user-name-full">{{ currentUserName }}</p>
                <p class="email-display">{{ currentUserEmail }}</p>
              </div>
              <div class="dropdown-divider"></div>
              <router-link
                to="/app"
                class="dropdown-item"
                role="menuitem"
                @click="userMenuOpen = false"
              >
                <PhArrowSquareOut :size="16" />
                <span>Go to App Workspace</span>
              </router-link>
              <div class="dropdown-divider"></div>
              <button
                @click="handleLogout"
                class="dropdown-item logout-btn"
                role="menuitem"
              >
                <PhSignOut :size="16" />
                <span>Sign out</span>
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <!-- ── Layout Body (Sidebar + Content Container) ─────────────────── -->
    <div class="layout-body">
      <!-- Desktop Floating Sidebar -->
      <aside
        class="floating-sidebar hidden lg:flex flex-col flex-shrink-0 select-none"
        :class="[sidebarCollapsed ? 'sidebar-collapsed w-[72px]' : 'w-[250px]']"
        aria-label="Admin navigation"
      >
        <!-- Navigation List -->
        <nav class="sidebar-nav flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-0.5">
          <template
            v-for="(group, groupIndex) in navGroups"
            :key="group.title"
          >
            <!-- Section Header -->
            <div
              v-if="!sidebarCollapsed"
              class="sidebar-group-header px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
            >
              {{ group.title }}
            </div>
            <div
              v-else-if="groupIndex > 0"
              class="my-2 border-t border-slate-200/50 dark:border-neutral-800 mx-2"
            ></div>

            <!-- Nav Item Link -->
            <router-link
              v-for="item in group.items"
              :key="item.name"
              :to="item.to"
              :title="sidebarCollapsed ? item.name : undefined"
              class="nav-link flex items-center rounded-xl transition-all duration-150 relative group"
              :class="[
                sidebarCollapsed
                  ? 'h-10 w-10 mx-auto justify-center'
                  : 'h-10 px-3 gap-3',
                isActiveRoute(item) ? 'active' : 'inactive',
              ]"
            >
              <component
                :is="item.icon"
                :size="19"
                :weight="isActiveRoute(item) ? 'bold' : 'regular'"
                class="nav-icon shrink-0 transition-all"
              />
              <span
                v-if="!sidebarCollapsed"
                class="truncate text-[13px] font-medium tracking-tight"
              >
                {{ item.name }}
              </span>

              <!-- Tooltip on collapsed hover -->
              <div
                v-if="sidebarCollapsed"
                class="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              >
                {{ item.name }}
              </div>
            </router-link>
          </template>
        </nav>

        <!-- Sidebar Telemetry & Footer -->
        <div class="sidebar-footer-wrapper p-3 border-t border-slate-100 dark:border-neutral-800/80 space-y-2">
          <!-- Cluster Status Chip (Visible only when expanded) -->
          <div
            v-if="!sidebarCollapsed"
            class="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-1 select-none"
          >
            <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Cluster: Healthy</span>
            </div>
            <div class="text-[10px] text-slate-400 font-mono">
              v2.4.0 • Fastify/Mongo
            </div>
          </div>

          <!-- Bottom Footer Row: Logout + Collapse Toggle -->
          <div class="sidebar-footer flex items-center gap-2">
            <button
              @click="handleLogout"
              :class="[
                'logout-action-btn flex items-center justify-center gap-2 transition-all',
                sidebarCollapsed
                  ? 'w-10 h-10 p-0 rounded-xl'
                  : 'flex-1 h-9 px-3 rounded-xl text-xs font-semibold',
              ]"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <PhSignOut :size="18" weight="bold" />
              <span v-if="!sidebarCollapsed">Sign Out</span>
            </button>
            <button
              @click="toggleSidebar"
              class="toggle-btn w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all"
              :title="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
              aria-label="Toggle sidebar"
            >
              <component
                :is="sidebarCollapsed ? PhCaretRight : PhCaretLeft"
                :size="14"
                weight="bold"
              />
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Layout Container (Scrollable Content Canvas + Pinned Footer) -->
      <div class="main-layout-container flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Main Scrollable Content Area: ONLY THIS SCROLLS -->
        <main
          id="admin-main"
          tabindex="-1"
          class="content flex-1 min-h-0 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-6"
        >
          <!-- Dynamic Workspace Breadcrumb Header -->
          <nav
            class="breadcrumb-bar flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-4 select-none"
            aria-label="Breadcrumb"
          >
            <span>Platform Admin</span>
            <PhCaretRight :size="11" class="text-slate-300 dark:text-slate-600" />
            <span class="font-semibold text-slate-700 dark:text-slate-200">
              {{ activePageName }}
            </span>
          </nav>

          <!-- Nested Route View with Page Fade Transition -->
          <router-view v-slot="{ Component }">
            <Transition name="page-fade" mode="out-in">
              <component :is="Component" :key="route?.fullPath || 'admin'" />
            </Transition>
          </router-view>
        </main>

        <!-- Enterprise Docked Footer (Desktop only) -->
        <footer
          class="app-footer shrink-0 hidden lg:flex items-center justify-between px-6 select-none"
          role="contentinfo"
        >
          <div class="footer-left flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>&copy; {{ currentYear }} TrackDeal Technologies. All rights reserved.</span>
          </div>
          <div class="footer-right flex items-center gap-2 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            <span>TrackDeal Multi-Tenant Cluster Admin</span>
          </div>
        </footer>
      </div>
    </div>

    <!-- Mobile Bottom Navigation (Only visible on small screens) -->
    <nav class="admin-mobile-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-4 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      <router-link
        to="/admin/dashboard"
        class="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-accent-300 transition-colors"
        exact-active-class="!text-primary dark:!text-accent-400 font-bold"
      >
        <PhChartBar :size="20" weight="regular" />
        <span class="text-[10px] font-semibold">Home</span>
      </router-link>
      <router-link
        to="/admin/organizations"
        class="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-accent-300 transition-colors"
        exact-active-class="!text-primary dark:!text-accent-400 font-bold"
      >
        <PhBuildings :size="20" weight="regular" />
        <span class="text-[10px] font-semibold">Orgs</span>
      </router-link>
      <button
        @click="adminSearchOpen = true"
        class="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-accent-300 transition-colors"
        aria-label="Search"
      >
        <PhMagnifyingGlass :size="20" weight="bold" />
        <span class="text-[10px] font-semibold">Search</span>
      </button>
      <router-link
        to="/admin/users"
        class="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-accent-300 transition-colors"
        exact-active-class="!text-primary dark:!text-accent-400 font-bold"
      >
        <PhUsersThree :size="20" weight="regular" />
        <span class="text-[10px] font-semibold">Users</span>
      </router-link>
      <router-link
        to="/admin/audit-logs"
        class="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-accent-300 transition-colors"
        exact-active-class="!text-primary dark:!text-accent-400 font-bold"
      >
        <PhScroll :size="20" weight="regular" />
        <span class="text-[10px] font-semibold">Logs</span>
      </router-link>
    </nav>

    <!-- Global Admin Search Modal (Ctrl + K / Cmd + K) -->
    <AdminSearchModal
      :isOpen="adminSearchOpen"
      @close="adminSearchOpen = false"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import {
  PhLightning,
  PhMagnifyingGlass,
  PhChartBar,
  PhBuildings,
  PhBriefcase,
  PhUsersThree,
  PhScroll,
  PhGearSix,
  PhCaretDown,
  PhCaretLeft,
  PhCaretRight,
  PhArrowSquareOut,
  PhSignOut,
} from "@phosphor-icons/vue";
import AdminSearchModal from "../modules/admin/components/AdminSearchModal.vue";

const store = useStore();
const router = useRouter();
const route = useRoute();

const currentYear = new Date().getFullYear();
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

const adminSearchOpen = ref(false);
const userMenuOpen = ref(false);
const profileMenuRef = ref(null);

const sidebarCollapsed = ref(
  localStorage.getItem("trackdeal_admin_sidebar_collapsed") === "true",
);

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  localStorage.setItem(
    "trackdeal_admin_sidebar_collapsed",
    sidebarCollapsed.value ? "true" : "false",
  );
}

const activePageName = computed(() => {
  const p = route.path;
  if (p.includes("/admin/dashboard") || p === "/admin") return "Dashboard";
  if (p.includes("/admin/organizations")) {
    if (p.match(/\/admin\/organizations\/[a-zA-Z0-9_-]+/))
      return "Organization Details";
    return "Tenant Organizations";
  }
  if (p.includes("/admin/tenants")) return "Tenants";
  if (p.includes("/admin/users")) return "Platform Users";
  if (p.includes("/admin/audit-logs")) return "Audit Logs";
  if (p.includes("/admin/settings")) return "System Settings";
  return "Console";
});

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
      { name: "Tenants", to: "/admin/tenants", icon: PhBriefcase },
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

// ── Keyboard Shortcuts (Ctrl + K / Cmd + K to open search) ───────────
const handleKeyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
    e.preventDefault();
    adminSearchOpen.value = !adminSearchOpen.value;
  }
  if (e.key === "Escape") {
    adminSearchOpen.value = false;
  }
};

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
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleDocumentClick);
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
/* ==========================================================================
   Root Application Container
   ========================================================================== */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f8fafc;
  background-image:
    radial-gradient(at 0% 0%, rgba(0, 133, 255, 0.04) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(0, 78, 146, 0.04) 0px, transparent 50%);
  color: #0f172a;
  position: relative;
  font-family: inherit;
}

.dark .app-container {
  background-color: #020617;
  background-image:
    radial-gradient(at 0% 0%, rgba(0, 133, 255, 0.07) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(0, 78, 146, 0.07) 0px, transparent 50%);
  color: #f8fafc;
}

/* Accessibility Skip Link */
.skip-link {
  position: absolute;
  top: -100px;
  left: 16px;
  background: #0284c7;
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  z-index: 99999;
  transition: top 0.2s;
}
.skip-link:focus {
  top: 16px;
}

/* ==========================================================================
   Top Header (Enterprise Navbar)
   ========================================================================== */
.app-navbar {
  height: 60px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid rgba(0, 78, 146, 0.08);
  position: relative;
  z-index: 40;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.dark .app-navbar {
  background: rgba(15, 23, 42, 0.85);
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
}

.brand-mark-box {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);
}

.brand-name {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
  line-height: 1.15;
}

.dark .brand-name {
  color: #ffffff;
}

.brand-highlight {
  color: #0284c7;
}

.dark .brand-highlight {
  color: #38bdf8;
}

.brand-subline {
  font-size: 10px;
  font-weight: 500;
  color: #64748b;
  letter-spacing: -0.01em;
}

.dark .brand-subline {
  color: #94a3b8;
}

/* Navbar Center (Search) */
.navbar-center {
  flex: 1;
  max-width: 440px;
  margin: 0 16px;
}

@media (max-width: 768px) {
  .navbar-center {
    display: none;
  }
}

.search-box {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 6px 12px;
  transition: all 0.15s ease;
}

.dark .search-box {
  background: #1e293b;
  border-color: #334155;
}

.search-box:hover {
  border-color: #0284c7;
  background: #ffffff;
}

.dark .search-box:hover {
  border-color: #38bdf8;
  background: #0f172a;
}

.search-box input {
  border: none;
  background: transparent;
  width: 100%;
  font-size: 12px;
  color: #0f172a;
  outline: none;
}

.dark .search-box input {
  color: #f8fafc;
}

.search-box input::placeholder {
  color: #94a3b8;
}

.search-command-pill {
  font-size: 10px;
  font-family: monospace;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #64748b;
  padding: 1px 5px;
  border-radius: 5px;
  white-space: nowrap;
}

.dark .search-command-pill {
  background: #0f172a;
  border-color: #475569;
  color: #94a3b8;
}

/* Navbar Right */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* User Profile Pill */
.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 5px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
  user-select: none;
}

.dark .user-profile {
  background: #1e293b;
  border-color: #334155;
}

.user-profile:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.dark .user-profile:hover {
  border-color: #475569;
  background: #243044;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #e0f2fe;
  color: #0284c7;
  font-weight: 700;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .user-avatar {
  background: rgba(2, 132, 199, 0.2);
  color: #38bdf8;
}

.user-info-brief {
  flex-direction: column;
  line-height: 1.15;
}

.user-name {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
}

.dark .user-name {
  color: #f8fafc;
}

.user-role {
  font-size: 9px;
  letter-spacing: 0.04em;
}

.dropdown-arrow {
  color: #94a3b8;
}

/* Profile Dropdown */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 6px;
  z-index: 100;
}

.dark .dropdown-menu {
  background: #0f172a;
  border-color: #1e293b;
}

.dropdown-header {
  padding: 8px 10px;
}

.user-name-full {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
}

.dark .user-name-full {
  color: #ffffff;
}

.email-display {
  font-size: 10px;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .email-display {
  color: #94a3b8;
}

.dropdown-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 4px 0;
}

.dark .dropdown-divider {
  background: #1e293b;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #334155;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  transition: all 0.1s ease;
}

.dark .dropdown-item {
  color: #cbd5e1;
}

.dropdown-item:hover {
  background: #f1f5f9;
  color: #0284c7;
}

.dark .dropdown-item:hover {
  background: #1e293b;
  color: #38bdf8;
}

.dropdown-item.logout-btn {
  color: #ef4444;
}

.dropdown-item.logout-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

.dark .dropdown-item.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

/* ==========================================================================
   Layout Body (Padded Canvas for Sidebar & Content)
   ========================================================================== */
.layout-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 16px;
  gap: 16px;
  background: transparent;
  position: relative;
  min-height: 0;
}

@media (max-width: 640px) {
  .layout-body {
    padding: 8px;
    gap: 8px;
  }
}

/* ==========================================================================
   Floating Sidebar
   ========================================================================== */
.floating-sidebar {
  height: 100%;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(18px) saturate(1.15);
  -webkit-backdrop-filter: blur(18px) saturate(1.15);
  border: 1px solid rgba(0, 78, 146, 0.08);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  transition: width 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  z-index: 20;
}

.dark .floating-sidebar {
  background: rgba(15, 23, 42, 0.85);
  border-color: rgba(255, 255, 255, 0.08);
}

.sidebar-nav::-webkit-scrollbar {
  display: none;
}

.nav-link {
  height: 40px;
  text-decoration: none;
  margin-bottom: 3px;
  border: 1px solid transparent;
}

.nav-link.inactive {
  color: #64748b;
}

.dark .nav-link.inactive {
  color: #94a3b8;
}

.nav-link.inactive:hover {
  background: rgba(0, 78, 146, 0.04);
  color: #0f172a;
}

.dark .nav-link.inactive:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
}

.nav-link.active {
  background: #e0f2fe;
  color: #0284c7;
  font-weight: 600;
  border-color: rgba(2, 132, 199, 0.15);
}

.dark .nav-link.active {
  background: rgba(2, 132, 199, 0.18);
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.2);
}

.nav-link.active::before {
  content: "";
  position: absolute;
  left: 4px;
  top: 25%;
  width: 3px;
  height: 50%;
  background: #0284c7;
  border-radius: 99px;
}

.dark .nav-link.active::before {
  background: #38bdf8;
}

.nav-link.active .nav-icon {
  color: #0284c7;
}

.dark .nav-link.active .nav-icon {
  color: #38bdf8;
}

/* Collapsed Sidebar Adjustments */
.sidebar-collapsed .nav-link {
  width: 40px;
  height: 40px;
  padding: 0 !important;
  margin: 2px auto !important;
  justify-content: center;
}

.sidebar-collapsed .nav-link.active::before {
  display: none !important;
}

.sidebar-collapsed .nav-icon {
  margin: 0 !important;
}

.sidebar-collapsed .sidebar-footer {
  flex-direction: column !important;
  padding: 0 !important;
  gap: 8px !important;
  align-items: center !important;
  justify-content: center !important;
}

.sidebar-collapsed .logout-action-btn {
  width: 40px !important;
  height: 40px !important;
  padding: 0 !important;
  border-radius: 12px !important;
  flex: none !important;
}

.sidebar-collapsed .toggle-btn {
  width: 32px !important;
  height: 32px !important;
  border-radius: 9999px !important;
  flex: none !important;
}

/* Sidebar Footer */
.logout-action-btn {
  background: #fef2f2;
  border: 1px solid rgba(239, 68, 68, 0.12);
  color: #ef4444;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dark .logout-action-btn {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
  color: #f87171;
}

.logout-action-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.toggle-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
  cursor: pointer;
}

.dark .toggle-btn {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.toggle-btn:hover {
  background: #e2e8f0;
  color: #0284c7;
}

.dark .toggle-btn:hover {
  background: #334155;
  color: #38bdf8;
}

/* ==========================================================================
   Main Content Container & Pinned Enterprise Footer
   ========================================================================== */
.main-layout-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 0;
  min-width: 0;
  min-height: 0;
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  background-color: #ffffff;
  background-image:
    linear-gradient(135deg, rgba(0, 133, 255, 0.02) 0%, transparent 45%),
    linear-gradient(200deg, transparent 45%, rgba(0, 78, 146, 0.02) 100%);
  background-attachment: local;
  border-radius: 16px 16px 0 0;
  border: 1px solid rgba(0, 78, 146, 0.08);
  border-bottom: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.dark .content {
  background-color: #0b1329;
  background-image:
    linear-gradient(135deg, rgba(0, 133, 255, 0.03) 0%, transparent 45%),
    linear-gradient(200deg, transparent 45%, rgba(0, 78, 146, 0.03) 100%);
  border-color: rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.app-footer {
  height: 40px;
  background-color: #ffffff;
  border: 1px solid rgba(0, 78, 146, 0.08);
  border-top: 1px solid rgba(0, 78, 146, 0.06);
  border-radius: 0 0 16px 16px;
}

.dark .app-footer {
  background-color: #0b1329;
  border-color: rgba(255, 255, 255, 0.06);
  border-top-color: rgba(255, 255, 255, 0.04);
}

/* Page Transitions */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
