<template>
  <div class="app-container">
    <!-- Skip navigation link for accessibility -->
    <a href="#workspace-main" class="skip-link">Skip to workspace</a>

    <!-- ── Top Navbar (Full Width Across Top) ────────────────────────── -->
    <header class="app-navbar glass" role="banner">
      <!-- Left: Brand Logo -->
      <div class="navbar-left">
        <!-- Brand Logo & Workspace Tag -->
        <router-link
          to="/app/dashboard"
          class="logo-container"
          title="TrackDeal Home"
        >
          <div class="brand-mark-box shrink-0">
            <PhGraduationCap
              v-if="isEducationWorkspace"
              weight="bold"
              :size="20"
              class="text-white"
            />
            <PhBuildings v-else weight="bold" :size="20" class="text-white" />
          </div>
          <div class="brand-text flex flex-col min-w-0">
            <span class="brand-name font-heading">
              Track<span class="brand-highlight">Deal</span>
            </span>
            <span class="brand-subline">
              {{
                isEducationWorkspace
                  ? "Education workspace"
                  : "Revenue workspace"
              }}
            </span>
          </div>
        </router-link>
      </div>

      <!-- Center: Centered Global Search Input -->
      <div class="navbar-center flex">
        <div class="search-box" role="search" @click="globalSearchOpen = true">
          <input
            type="text"
            placeholder="Search or press Ctrl + K..."
            aria-label="Global search"
            readonly
          />
          <span class="search-command-pill" aria-hidden="true">Ctrl + K</span>
        </div>
      </div>

      <!-- Right: Actions & User Profile Pill -->
      <div class="navbar-right">
        <!-- Quick Add Action Button -->
        <button
          @click="quickAddOpen = true"
          class="quick-add-btn"
          title="Quick Add Record"
        >
          <PhPlus :size="14" weight="bold" />
          <span class="hidden sm:inline">Add</span>
        </button>

        <!-- Theme Toggle Button (Commented out per request) -->
        <!-- <button
          @click="toggleTheme"
          class="action-btn"
          :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
          :aria-label="
            isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
          "
        >
          <PhSun v-if="isDarkMode" :size="20" weight="regular" />
          <PhMoon v-else :size="20" weight="regular" />
        </button> -->

        <!-- Notifications Bell with Unread Badge -->
        <button
          @click="toggleNotifications"
          class="action-btn relative"
          :title="
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : 'Notifications'
          "
          aria-label="Notifications"
        >
          <PhBell :size="20" weight="regular" />
          <span v-if="unreadCount > 0" class="badge">
            {{ unreadCount > 9 ? "9+" : unreadCount }}
          </span>
        </button>

        <!-- Admin Settings Direct Icon (Only for Org Admin) -->
        <button
          v-if="isOrgAdmin"
          @click="$router.push('/app/settings')"
          :class="[
            'action-btn hidden sm:flex',
            { 'action-btn-active': route.path.startsWith('/app/settings') },
          ]"
          title="System Settings"
          aria-label="System Settings"
        >
          <PhGearSix :size="20" weight="regular" />
        </button>

        <!-- User Profile Pill -->
        <div
          class="user-profile"
          @click="userMenuOpen = !userMenuOpen"
          @keydown.enter="userMenuOpen = !userMenuOpen"
          @keydown.space.prevent="userMenuOpen = !userMenuOpen"
          @keydown.esc="userMenuOpen = false"
          tabindex="0"
          role="button"
          :aria-expanded="userMenuOpen"
          aria-haspopup="menu"
          :aria-label="`User menu — ${userName}`"
        >
          <div class="user-avatar" aria-hidden="true">
            {{ userInitials }}
          </div>
          <div class="user-info-brief hidden sm:flex">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ userRoleName }}</span>
          </div>
          <PhCaretDown
            :size="15"
            weight="bold"
            class="dropdown-arrow hidden sm:block"
            :class="{ 'arrow-open': userMenuOpen }"
            aria-hidden="true"
          />

          <!-- Profile Dropdown Menu -->
          <Transition name="dropdown">
            <div
              v-if="userMenuOpen"
              v-click-outside="() => (userMenuOpen = false)"
              class="dropdown-menu shadow-lg"
              role="menu"
              @click.stop
            >
              <div class="dropdown-header">
                <p class="user-name-full">{{ userName }}</p>
                <p class="email-display">{{ userEmail }}</p>
              </div>
              <div class="dropdown-divider"></div>
              <router-link
                v-if="isOrgAdmin"
                to="/app/settings"
                class="dropdown-item"
                role="menuitem"
                @click="userMenuOpen = false"
              >
                <PhGearSix :size="16" /> Settings
              </router-link>
              <div v-if="isOrgAdmin" class="dropdown-divider"></div>
              <button
                @click="handleLogout"
                class="dropdown-item logout-btn"
                role="menuitem"
              >
                <PhSignOut :size="16" /> Sign out
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <!-- ── Layout Body (Sidebar + Unified Main Content Container) ───── -->
    <div class="layout-body">
      <!-- Desktop Floating Sidebar -->
      <aside
        class="floating-sidebar hidden lg:flex flex-col flex-shrink-0 select-none"
        :class="[sidebarCollapsed ? 'sidebar-collapsed w-[72px]' : 'w-[250px]']"
        aria-label="Main navigation"
      >
        <!-- Navigation List -->
        <nav
          class="sidebar-nav flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-0.5"
        >
          <template
            v-for="(group, groupIndex) in filteredMenuGroups"
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

        <!-- Sidebar Footer: Red Sign Out Button + Round Collapse Toggle -->
        <div
          class="sidebar-footer p-3 border-t border-slate-100 dark:border-neutral-800/80 flex items-center gap-2"
        >
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
      </aside>

      <!-- Main Layout Container (Scrollable Content Canvas + Docked Footer) -->
      <div
        class="main-layout-container flex-1 flex flex-col min-w-0 overflow-hidden"
      >
        <!-- Main Scrollable Content Area: ONLY THIS SCROLLS -->
        <main
          id="workspace-main"
          tabindex="-1"
          class="content flex-1 min-h-0 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-6"
        >
          <!-- Dynamic Workspace Breadcrumb Header -->
          <nav
            class="breadcrumb-bar flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-4 select-none"
            aria-label="Breadcrumb"
          >
            <span>Workspace</span>
            <PhCaretRight
              :size="11"
              class="text-slate-300 dark:text-slate-600"
            />
            <span class="font-semibold text-slate-700 dark:text-slate-200">{{
              activePageName
            }}</span>
          </nav>

          <!-- Nested Route View with Page Fade Transition -->
          <router-view v-slot="{ Component }">
            <Transition name="page-fade" mode="out-in">
              <component
                :is="Component"
                :key="route?.fullPath || 'workspace'"
              />
            </Transition>
          </router-view>
        </main>

        <!-- Enterprise Docked Footer (Desktop only) -->
        <footer
          class="app-footer shrink-0 hidden lg:flex items-center justify-between px-6 select-none"
          role="contentinfo"
        >
          <div
            class="footer-left flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            <span
              >&copy; {{ currentYear }} TrackDeal Technologies. All rights
              reserved.</span
            >
          </div>
          <div
            class="footer-right flex items-center gap-2 text-[11px] font-medium text-slate-400 dark:text-slate-500"
          >
            <span>{{
              isEducationWorkspace
                ? "TrackDeal Education CRM"
                : "TrackDeal Enterprise CRM"
            }}</span>
          </div>
        </footer>
      </div>
    </div>

    <!-- ── Mobile Drawer Sidebar ───────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="backdrop">
        <div
          v-if="mobileMenuOpen"
          class="fixed inset-0 z-[1000] lg:hidden"
          style="
            background-color: rgba(9, 14, 26, 0.5);
            backdrop-filter: blur(4px);
          "
          @click="mobileMenuOpen = false"
        />
      </Transition>
      <Transition name="drawer">
        <aside
          v-if="mobileMenuOpen"
          class="fixed left-0 top-0 z-[1010] h-full w-[260px] flex flex-col bg-white dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-800 shadow-2xl"
        >
          <div
            class="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-neutral-800 shrink-0"
          >
            <div class="flex items-center gap-3">
              <div
                class="brand-mark-box w-8 h-8 rounded-xl flex items-center justify-center text-white"
              >
                <PhBuildings weight="bold" :size="18" />
              </div>
              <span
                class="font-heading font-extrabold text-base text-neutral-900 dark:text-neutral-100"
              >
                Track<span class="brand-highlight">Deal</span>
              </span>
            </div>
            <button
              @click="mobileMenuOpen = false"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <PhX :size="18" weight="bold" />
            </button>
          </div>

          <nav class="flex-1 px-3 py-3 overflow-y-auto space-y-1">
            <template v-for="group in filteredMenuGroups" :key="group.title">
              <div
                class="px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400"
              >
                {{ group.title }}
              </div>
              <router-link
                v-for="item in group.items"
                :key="item.name"
                :to="item.to"
                @click="mobileMenuOpen = false"
                class="flex items-center h-10 px-3 gap-3 rounded-xl text-sm font-medium transition-colors"
                :class="isActiveRoute(item) ? 'active' : 'inactive'"
              >
                <component
                  :is="item.icon"
                  :size="19"
                  :weight="isActiveRoute(item) ? 'bold' : 'regular'"
                  class="shrink-0"
                />
                <span class="truncate">{{ item.name }}</span>
              </router-link>
            </template>
          </nav>

          <div class="p-3 border-t border-slate-100 dark:border-neutral-800">
            <button
              @click="handleLogout"
              class="logout-action-btn w-full h-10 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold"
            >
              <PhSignOut :size="16" weight="bold" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <!-- ── Notifications Drawer ────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="backdrop">
        <div
          v-if="notificationsOpen"
          class="fixed inset-0 z-[1000]"
          style="
            background-color: rgba(9, 14, 26, 0.4);
            backdrop-filter: blur(2px);
          "
          @click="notificationsOpen = false"
        />
      </Transition>
      <Transition name="slide-right">
        <aside
          v-if="notificationsOpen"
          class="fixed right-0 top-0 h-full w-80 z-[1010] border-l border-slate-200 dark:border-neutral-800 flex flex-col shadow-2xl bg-white dark:bg-neutral-900"
        >
          <header
            class="h-16 px-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between shrink-0"
          >
            <div class="flex items-center gap-2">
              <PhBell :size="18" class="text-slate-500 dark:text-slate-400" />
              <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">
                Notifications
              </h3>
              <span
                v-if="unreadCount > 0"
                class="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white bg-red-500"
              >
                {{ unreadCount }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="unreadCount > 0"
                @click="markAllNotificationsRead"
                class="text-xs font-semibold text-blue-600 hover:underline"
              >
                Mark all read
              </button>
              <button
                @click="notificationsOpen = false"
                class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <PhX :size="15" weight="bold" />
              </button>
            </div>
          </header>

          <div class="flex-1 overflow-y-auto p-3 space-y-2">
            <div
              v-for="item in mockNotifications"
              :key="item.id"
              class="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 transition-all"
              :class="
                item.read
                  ? 'opacity-60 bg-transparent'
                  : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
              "
            >
              <div class="flex justify-between items-start gap-2 mb-1">
                <span
                  class="text-xs font-bold text-slate-800 dark:text-slate-200"
                  >{{ item.title }}</span
                >
                <span class="text-[10px] text-slate-400">{{ item.time }}</span>
              </div>
              <p
                class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed"
              >
                {{ item.message }}
              </p>
              <button
                v-if="!item.read"
                @click="markNotificationRead(item.id)"
                class="text-[10px] font-semibold text-blue-600 hover:underline mt-1.5"
              >
                Mark as read
              </button>
            </div>
            <div
              v-if="mockNotifications.length === 0"
              class="text-center py-16"
            >
              <PhBellSlash
                :size="32"
                class="mx-auto mb-2 text-slate-300 dark:text-slate-600"
              />
              <p class="text-xs font-medium text-slate-400">
                You're all caught up
              </p>
            </div>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <!-- ── Toast Notifications Stack ───────────────────────────────── -->
    <div
      class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-[380px] w-full pointer-events-none"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-start gap-3 p-3.5 rounded-xl border-l-[3px] shadow-xl pointer-events-auto bg-neutral-900 text-white"
          :style="{
            borderLeftColor:
              toast.type === 'error'
                ? '#ef4444'
                : toast.type === 'warning'
                  ? '#f59e0b'
                  : '#10b981',
          }"
        >
          <component
            :is="
              toast.type === 'error'
                ? PhXCircle
                : toast.type === 'warning'
                  ? PhWarningCircle
                  : PhCheckCircle
            "
            :size="18"
            class="shrink-0 mt-0.5"
            :style="{
              color:
                toast.type === 'error'
                  ? '#ef4444'
                  : toast.type === 'warning'
                    ? '#f59e0b'
                    : '#10b981',
            }"
          />
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-slate-100">
              {{ toast.message }}
            </p>
          </div>
          <button
            @click="dismissToast(toast.id)"
            class="shrink-0 w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-white"
          >
            <PhX :size="12" weight="bold" />
          </button>
        </div>
      </TransitionGroup>
    </div>

    <!-- Modals -->
    <GlobalSearchModal
      :isOpen="globalSearchOpen"
      @close="globalSearchOpen = false"
    />
    <QuickAddModal :isOpen="quickAddOpen" @close="quickAddOpen = false" />
    <!-- Mobile Bottom Navigation (Only visible on small screens) -->
    <nav class="mobile-bottom-nav lg:hidden">
      <router-link to="/app/dashboard" class="mobile-nav-item" exact-active-class="active">
        <PhChartBar :size="22" weight="regular" class="nav-icon" />
        <span>Home</span>
      </router-link>
      <router-link to="/app/leads" class="mobile-nav-item" exact-active-class="active">
        <PhUsersThree :size="22" weight="regular" class="nav-icon" />
        <span>Leads</span>
      </router-link>
      
      <!-- Quick Add Fab-style button in the center -->
      <button @click="quickAddOpen = true" class="mobile-nav-fab" aria-label="Quick Add">
        <PhPlus :size="24" weight="bold" />
      </button>
      
      <router-link to="/app/tasks" class="mobile-nav-item" exact-active-class="active">
        <PhCheckSquare :size="22" weight="regular" class="nav-icon" />
        <span>Tasks</span>
      </router-link>
      <button @click="mobileMenuOpen = true" class="mobile-nav-item" aria-label="Menu">
        <PhList :size="22" weight="regular" class="nav-icon" />
        <span>Menu</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

import {
  PhBuildings,
  PhChartBar,
  PhUsersThree,
  PhCheckSquare,
  PhHouseLine,
  PhHandshake,
  PhCurrencyInr,
  PhTrendUp,
  PhGearSix,
  PhBell,
  PhBellSlash,
  PhList,
  PhCaretRight,
  PhCaretLeft,
  PhCaretDown,
  PhX,
  PhSun,
  PhMoon,
  PhSignOut,
  PhCheckCircle,
  PhXCircle,
  PhWarningCircle,
  PhHardHat,
  PhReceipt,
  PhPlus,
  PhBank,
  PhScroll,
  PhStudent,
  PhChalkboardTeacher,
  PhBookOpen,
  PhGraduationCap,
} from "@phosphor-icons/vue";

import GlobalSearchModal from "@/components/GlobalSearchModal.vue";
import QuickAddModal from "@/components/QuickAddModal.vue";

const store = useStore();
const route = useRoute();
const router = useRouter();

// ── State ───────────────────────────────────────────────────────────────────
const sidebarCollapsed = computed(() => store.state.ui.sidebarCollapsed);
const toasts = computed(() => store.state.notifications.toasts);

const globalSearchOpen = ref(false);
const quickAddOpen = ref(false);
const mobileMenuOpen = ref(false);
const userMenuOpen = ref(false);
const notificationsOpen = ref(false);

// ── Workspace & Vertical Context ────────────────────────────────────────────
const isEducationWorkspace = computed(
  () => store.getters["organization/isEducationTenant"],
);

// ── User Information ────────────────────────────────────────────────────────
const userProfile = computed(() => store.state.auth.currentUser);
const userName = computed(() => {
  if (userProfile.value?.name) return userProfile.value.name;
  if (userProfile.value?.firstName) {
    return `${userProfile.value.firstName} ${userProfile.value.lastName || ""}`.trim();
  }
  return "Mayank Rai";
});

const userEmail = computed(() => {
  return userProfile.value?.email || "admin@swarajyaconsultancy.com";
});

const userInitials = computed(() => {
  if (!userName.value) return "MR";
  return userName.value
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
});

const userRoleName = computed(() => {
  const role = String(store.getters["auth/userRole"] || "").toLowerCase();
  if (role === "org_admin" || role === "organization_admin") return "ADMIN";
  if (role === "system_admin" || role === "super_admin") return "SUPER ADMIN";
  if (role === "branch_manager")
    return isEducationWorkspace.value ? "CAMPUS MANAGER" : "BRANCH MANAGER";
  if (role === "manager")
    return isEducationWorkspace.value ? "STAFF MANAGER" : "MANAGER";
  if (role === "agent") return isEducationWorkspace.value ? "STAFF" : "AGENT";
  if (role === "read_only") return "READ ONLY";
  const formatted = role ? role.replace(/_/g, " ").toUpperCase() : "ADMIN";
  return isEducationWorkspace.value
    ? formatted.replace(/AGENT/gi, "STAFF")
    : formatted;
});

// ── Page / Route ────────────────────────────────────────────────────────────
const activePageName = computed(() => {
  if (route.path === "/app/leads" || route.path.startsWith("/app/leads/")) {
    return isEducationWorkspace.value ? "Student Leads" : "Leads";
  }
  if (
    route.path === "/app/students" ||
    route.path.startsWith("/app/students/")
  ) {
    return "Students";
  }
  if (route.path === "/app/classes" || route.path.startsWith("/app/classes/")) {
    return isEducationWorkspace.value ? "Classes & Batches" : "Classes";
  }
  if (route.path === "/app/tasks" || route.path.startsWith("/app/tasks/")) {
    return isEducationWorkspace.value
      ? "Tasks & Counseling"
      : "Tasks & Follow-ups";
  }
  if (route.path === "/app/agents" || route.path.startsWith("/app/agents/")) {
    return "Channel Partners";
  }
  if (route.path === "/app/deals" || route.path.startsWith("/app/deals/")) {
    return "Deals";
  }
  if (
    route.path === "/app/properties" ||
    route.path.startsWith("/app/properties/")
  ) {
    return "Properties";
  }
  if (
    route.path === "/app/projects" ||
    route.path.startsWith("/app/projects/")
  ) {
    return "Projects";
  }
  if (
    route.path === "/app/builders" ||
    route.path.startsWith("/app/builders/")
  ) {
    return "Builders";
  }
  if (route.path === "/app/loans" || route.path.startsWith("/app/loans/")) {
    return "Loans";
  }
  if (
    route.path === "/app/agreements" ||
    route.path.startsWith("/app/agreements/")
  ) {
    return "Agreements";
  }
  if (
    route.path === "/app/commissions" ||
    route.path.startsWith("/app/commissions/")
  ) {
    return "Commissions";
  }
  if (route.path === "/app/reports" || route.path.startsWith("/app/reports/")) {
    return isEducationWorkspace.value ? "Admission Reports" : "Reports";
  }
  if (route.path === "/app/settings/users") {
    return isEducationWorkspace.value ? "Staff Directory" : "Team";
  }
  if (route.path === "/app/settings/roles") {
    return "Roles & Permissions";
  }
  if (route.path === "/app/settings/branches") {
    return isEducationWorkspace.value ? "Campuses & Centres" : "Branches";
  }
  if (route.path.startsWith("/app/settings")) {
    return isEducationWorkspace.value ? "Institute Settings" : "Settings";
  }
  const name = route.name;
  if (!name) return "Dashboard";
  return String(name)
    .replace(/([A-Z])/g, " $1")
    .trim();
});

const isActiveRoute = (item) => {
  const to = typeof item === "string" ? item : item.to;
  if (!to) return false;
  if (
    item?.activeExcludes?.some(
      (excludedPath) =>
        route.path === excludedPath ||
        route.path.startsWith(`${excludedPath}/`),
    )
  ) {
    return false;
  }
  return route.path === to || route.path.startsWith(`${to}/`);
};

// ── Theme & Sidebar ─────────────────────────────────────────────────────────
const isDarkMode = computed(() => store.state.ui.activeThemeMode === "dark");
const toggleTheme = () =>
  store.commit("ui/SET_THEME_MODE", isDarkMode.value ? "light" : "dark");
const toggleSidebar = () => store.commit("ui/TOGGLE_SIDEBAR");
const currentYear = computed(() => new Date().getFullYear());

// ── Navigation Menu Data ───────────────────────────────────────────────────
const realEstateMenuGroups = [
  {
    title: "Overview",
    items: [{ name: "Dashboard", to: "/app/dashboard", icon: PhChartBar }],
  },
  {
    title: "Sales",
    items: [
      {
        name: "Leads",
        to: "/app/leads",
        icon: PhUsersThree,
        permission: "leads:read",
        module: "leads",
      },
      {
        name: "Tasks & Follow-ups",
        to: "/app/tasks",
        icon: PhCheckSquare,
        permission: "tasks:read",
        module: "tasks",
      },
      {
        name: "Channel Partners",
        to: "/app/agents",
        icon: PhHandshake,
        permission: "agents:read",
        module: "agents",
      },
    ],
  },
  {
    title: "Portfolio",
    items: [
      {
        name: "Properties",
        to: "/app/properties",
        icon: PhHouseLine,
        permission: "properties:read",
        module: "properties",
      },
      {
        name: "Projects",
        to: "/app/projects",
        icon: PhBuildings,
        permission: "projects:read",
        module: "projects",
      },
      {
        name: "Builders",
        to: "/app/builders",
        icon: PhHardHat,
        permission: "projects:read",
        module: "projects",
      },
    ],
  },
  {
    title: "Business",
    items: [
      {
        name: "Deals",
        to: "/app/deals",
        icon: PhHandshake,
        permission: "deals:read",
        module: "deals",
      },
      {
        name: "Loans",
        to: "/app/loans",
        icon: PhBank,
        permission: "loans:read",
        module: "loans",
      },
      {
        name: "Agreements",
        to: "/app/agreements",
        icon: PhScroll,
        permission: "agreements:read",
        module: "agreements",
      },
    ],
  },
  {
    title: "Financials",
    items: [
      {
        name: "Commissions",
        to: "/app/commissions",
        icon: PhCurrencyInr,
        permission: "commissions:read",
        featureFlag: "commissionModule",
        module: "commissions",
      },
      {
        name: "Receivables",
        to: "/app/commissions/receivables",
        icon: PhReceipt,
        permission: "commissions:read",
        featureFlag: "commissionModule",
        module: "commissions",
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        name: "Reports",
        to: "/app/reports",
        icon: PhTrendUp,
        permission: "reports:read",
        featureFlag: "reportsModule",
        module: "reports",
      },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        name: "Team",
        to: "/app/settings/users",
        icon: PhUsersThree,
        permission: "users:read",
        module: "settings",
      },
      {
        name: "Settings",
        to: "/app/settings",
        icon: PhGearSix,
        permission: "settings:read",
        module: "settings",
        activeExcludes: ["/app/settings/users"],
      },
    ],
  },
];

const educationMenuGroups = [
  {
    title: "Overview",
    items: [{ name: "Dashboard", to: "/app/dashboard", icon: PhChartBar }],
  },
  {
    title: "Admissions",
    items: [
      {
        name: "Student Leads",
        to: "/app/leads",
        icon: PhUsersThree,
        permission: "leads:read",
        module: "leads",
      },
      {
        name: "Students",
        to: "/app/students",
        icon: PhStudent,
        permission: "leads:read",
        module: "students",
      },
      {
        name: "Classes & Batches",
        to: "/app/classes",
        icon: PhChalkboardTeacher,
        permission: "leads:read",
        module: "classes",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        name: "Tasks & Follow-ups",
        to: "/app/tasks",
        icon: PhCheckSquare,
        permission: "tasks:read",
        module: "tasks",
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        name: "Reports",
        to: "/app/reports",
        icon: PhBookOpen,
        permission: "reports:read",
        module: "reports",
      },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        name: "Team",
        to: "/app/settings/users",
        icon: PhUsersThree,
        permission: "users:read",
        module: "settings",
      },
      {
        name: "Settings",
        to: "/app/settings",
        icon: PhGearSix,
        permission: "settings:read",
        module: "settings",
        activeExcludes: ["/app/settings/users"],
      },
    ],
  },
];

const menuGroups = computed(() =>
  isEducationWorkspace.value ? educationMenuGroups : realEstateMenuGroups,
);

const isOrgAdmin = computed(() => {
  const role = String(store.getters["auth/userRole"] || "").toLowerCase();
  return [
    "super_admin",
    "system_admin",
    "org_admin",
    "organization_admin",
  ].includes(role);
});

const filteredMenuGroups = computed(() => {
  return menuGroups.value
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        // 1. Settings & Admin modules restricted to org_admin
        if (
          (item.to === "/app/settings" ||
            item.to.startsWith("/app/settings")) &&
          !isOrgAdmin.value
        ) {
          return false;
        }

        // 2. Explicit access check for Tasks & Follow-ups
        if (item.to === "/app/tasks" || item.module === "tasks") {
          if (isEducationWorkspace.value) {
            return false;
          }

          const hasTaskPermission =
            store.getters["permissions/hasCapability"]("tasks:read") ||
            store.getters["permissions/hasCapability"]("tasks.read");
          const isTaskEnabled =
            store.getters["organization/isFeatureEnabled"]("tasks");
          if (!hasTaskPermission || !isTaskEnabled) {
            return false;
          }
        }

        // 3. General module/feature flag checks
        if (
          item.module &&
          !store.getters["organization/isFeatureEnabled"](item.module)
        ) {
          return false;
        }

        if (
          item.featureFlag &&
          !store.getters["organization/isFeatureEnabled"](item.featureFlag)
        ) {
          return false;
        }

        // 4. Granular permission check
        if (
          item.permission &&
          !store.getters["permissions/hasCapability"](item.permission)
        ) {
          return false;
        }

        return true;
      }),
    }))
    .filter((g) => g.items.length > 0);
});

// ── Notifications ────────────────────────────────────────────────────────────
const mockNotifications = ref([]);
const unreadCount = computed(
  () => mockNotifications.value.filter((n) => !n.read).length,
);
const toggleNotifications = () => {
  notificationsOpen.value = !notificationsOpen.value;
};
const markNotificationRead = (id) => {
  const n = mockNotifications.value.find((n) => n.id === id);
  if (n) n.read = true;
};
const markAllNotificationsRead = () =>
  mockNotifications.value.forEach((n) => (n.read = true));

// ── Toasts ───────────────────────────────────────────────────────────────────
const dismissToast = (id) => store.commit("notifications/REMOVE_TOAST", id);

// ── Keyboard Shortcuts ───────────────────────────────────────────────────────
const handleKeyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    globalSearchOpen.value = !globalSearchOpen.value;
  }
  if (e.key === "Escape") {
    globalSearchOpen.value = false;
    mobileMenuOpen.value = false;
    userMenuOpen.value = false;
    notificationsOpen.value = false;
  }
};

// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  store.dispatch("ui/initializeTheme");
});
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

// ── Logout ───────────────────────────────────────────────────────────────────
const handleLogout = async () => {
  userMenuOpen.value = false;
  await store.dispatch("auth/logoutSession");
  router.push("/login");
};

// ── Click outside directive ──────────────────────────────────────────────────
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (e) => {
      if (!el.contains(e.target)) binding.value(e);
    };
    document.addEventListener("click", el._clickOutside, true);
  },
  unmounted(el) {
    document.removeEventListener("click", el._clickOutside, true);
  },
};
</script>

<style scoped>
/* ==========================================================================
   Corevian-grade Shell & Atmosphere
   ========================================================================== */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  background: #f0f6fc;
  background-image:
    radial-gradient(at 100% 0%, rgba(0, 163, 255, 0.12) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(0, 78, 146, 0.08) 0px, transparent 50%);
  position: relative;
  overflow: hidden;
}

.dark .app-container {
  background: #090e17;
  background-image:
    radial-gradient(at 100% 0%, rgba(0, 163, 255, 0.06) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(0, 78, 146, 0.08) 0px, transparent 50%);
}

/* Ambient Orbs */
.app-container::before {
  content: "";
  position: fixed;
  top: -180px;
  right: -100px;
  width: 520px;
  height: 520px;
  background: radial-gradient(
    circle,
    rgba(0, 163, 255, 0.22) 0%,
    rgba(0, 133, 255, 0.08) 40%,
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.app-container::after {
  content: "";
  position: fixed;
  bottom: -140px;
  left: -80px;
  width: 480px;
  height: 480px;
  background: radial-gradient(
    circle,
    rgba(0, 78, 146, 0.18) 0%,
    rgba(0, 133, 255, 0.06) 45%,
    transparent 72%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

/* ==========================================================================
   Full Width Top Navbar (Corevian Navbar Standards)
   ========================================================================== */
.app-navbar {
  height: 70px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 30;
  background: rgba(232, 243, 252, 0.78);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  border-bottom: 1px solid rgba(0, 78, 146, 0.08);
  flex-shrink: 0;
}

.dark .app-navbar {
  background: rgba(13, 21, 35, 0.82);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-mark-box {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: linear-gradient(135deg, #0085ff, #004e92);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 78, 146, 0.22);
}

.brand-name {
  font-size: 1.125rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #0f172a;
  line-height: 1.15;
}

.dark .brand-name {
  color: #f8fafc;
}

.brand-highlight {
  color: #0085ff;
}

.brand-subline {
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #64748b;
  text-transform: uppercase;
}

.dark .brand-subline {
  color: #94a3b8;
}

/* Centered Search Box */
.navbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 480px;
  cursor: pointer;
}

.search-box input {
  width: 100%;
  padding: 10px 76px 10px 16px;
  background: #f8fafc;
  border: 1px solid rgba(0, 78, 146, 0.1);
  border-radius: 12px;
  font-size: 0.875rem;
  color: #0f172a;
  transition: all 0.2s ease;
  cursor: pointer;
}

.dark .search-box input {
  background: #0f172a;
  border-color: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
}

.search-box:hover input {
  background: #ffffff;
  border-color: #0085ff;
  box-shadow: 0 0 0 3px rgba(0, 133, 255, 0.12);
}

.dark .search-box:hover input {
  background: #141f36;
  border-color: #38bdf8;
}

.search-command-pill {
  position: absolute;
  right: 12px;
  padding: 2px 8px;
  background: #f1f5f9;
  border: 1px solid rgba(0, 78, 146, 0.1);
  border-radius: 6px;
  color: #64748b;
  font-size: 0.6875rem;
  font-weight: 700;
  pointer-events: none;
  font-family: monospace;
}

.dark .search-command-pill {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
}

/* Navbar Right Actions */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 16px;
}

.quick-add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  background: #004e92;
  color: white;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(0, 78, 146, 0.2);
}

.quick-add-btn:hover {
  background: #003d73;
  box-shadow: 0 4px 12px rgba(0, 78, 146, 0.3);
  transform: translateY(-1px);
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #64748b;
  background: transparent;
  transition: all 0.15s ease;
  position: relative;
}

.action-btn:hover,
.action-btn.action-btn-active {
  background: rgba(0, 78, 146, 0.08);
  color: #004e92;
}

.dark .action-btn:hover,
.dark .action-btn.action-btn-active {
  background: rgba(255, 255, 255, 0.08);
  color: #38bdf8;
}

.badge {
  position: absolute;
  top: 3px;
  right: 3px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #ef4444;
  border-radius: 999px;
  border: 2px solid white;
  font-size: 0.5625rem;
  font-weight: 800;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .badge {
  border-color: #0d1523;
}

/* User Profile Pill */
.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 10px 4px 5px;
  border-radius: 12px;
  transition: all 0.15s ease;
  position: relative;
  user-select: none;
  border: 1px solid transparent;
}

.user-profile:hover {
  background: rgba(0, 78, 146, 0.06);
  border-color: rgba(0, 78, 146, 0.1);
}

.dark .user-profile:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #0085ff, #004e92);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8125rem;
  box-shadow: 0 2px 6px rgba(0, 78, 146, 0.2);
  flex-shrink: 0;
}

.user-info-brief {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.2;
}

.dark .user-name {
  color: #f8fafc;
}

.user-role {
  font-size: 0.625rem;
  font-weight: 700;
  color: #64748b;
  line-height: 1.3;
  letter-spacing: 0.04em;
  margin-top: 1px;
}

.dark .user-role {
  color: #94a3b8;
}

.dropdown-arrow {
  color: #94a3b8;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.dropdown-arrow.arrow-open {
  transform: rotate(180deg);
}

/* User Profile Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 240px;
  padding: 6px;
  z-index: 40;
  background: white;
  border: 1px solid rgba(0, 78, 146, 0.1);
  border-radius: 14px;
  box-shadow: 0 10px 25px -5px rgba(0, 78, 146, 0.15);
  transform-origin: top right;
}

.dark .dropdown-menu {
  background: #0f172a;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
}

.dropdown-header {
  padding: 10px 12px;
}

.user-name-full {
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px;
}

.dark .user-name-full {
  color: #f8fafc;
}

.email-display {
  font-size: 0.75rem;
  color: #64748b;
  word-break: break-all;
  margin: 0;
}

.dropdown-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 6px 0;
}

.dark .dropdown-divider {
  background: #1e293b;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #334155;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
}

.dark .dropdown-item {
  color: #cbd5e1;
}

.dropdown-item:hover {
  background: #f8fafc;
  color: #004e92;
}

.dark .dropdown-item:hover {
  background: #1e293b;
  color: #38bdf8;
}

.dropdown-item.logout-btn:hover {
  background: #fef2f2;
  color: #ef4444;
}

.dark .dropdown-item.logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
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
   Floating Sidebar (Corevian Sidebar Standards)
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
  padding: 12px 8px !important;
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

.nav-link.active .nav-icon {
  color: #0284c7;
}

.dark .nav-link.active .nav-icon {
  color: #38bdf8;
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
  box-shadow: 0 4px 24px rgba(0, 78, 146, 0.04);
  position: relative;
  min-height: 0;
}

.content > * {
  position: relative;
  z-index: 1;
}

.dark .content {
  background-color: #0f172a;
  background-image: none;
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.app-footer {
  width: 100%;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 78, 146, 0.08);
  border-top: 1px solid rgba(0, 78, 146, 0.06);
  height: 38px;
  display: flex;
  align-items: center;
  z-index: 10;
  border-radius: 0 0 16px 16px;
}

.dark .app-footer {
  background: rgba(15, 23, 42, 0.94);
  border-color: rgba(255, 255, 255, 0.08);
  border-top-color: rgba(255, 255, 255, 0.05);
}

/* Page Fade Transitions */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.18s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

/* Dropdown & Drawers */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.toast-enter-active {
  animation: toast-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(calc(100% + 16px));
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ==========================================================================
   Mobile Bottom Navigation (Strictly hidden on desktop, active on mobile)
   ========================================================================== */
.mobile-bottom-nav {
  display: none !important;
}

@media (max-width: 1023px) {
  .mobile-bottom-nav {
    display: flex !important;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background-color: hsl(var(--bg-surface));
    border-top: 1px solid hsl(var(--border-default));
    align-items: center;
    justify-content: space-around;
    padding: 0 0.5rem;
    z-index: 999;
    padding-bottom: env(safe-area-inset-bottom);
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
  }
}

.dark .mobile-bottom-nav {
  border-top-color: hsl(var(--neutral-800));
  background-color: hsl(var(--bg-surface));
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: hsl(var(--neutral-400));
  font-size: 10px;
  font-weight: 600;
  flex: 1;
  text-decoration: none;
  background: transparent;
  border: none;
  padding: 6px 0;
  transition: color 150ms ease;
  cursor: pointer;
}
.mobile-nav-item:hover,
.mobile-nav-item:active {
  color: hsl(var(--neutral-700));
}
.dark .mobile-nav-item:hover,
.dark .mobile-nav-item:active {
  color: hsl(var(--neutral-200));
}

.mobile-nav-item.active {
  color: hsl(var(--accent-600));
}
.mobile-nav-item.active .nav-icon {
  color: hsl(var(--accent-600));
}

.mobile-nav-fab {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background-color: hsl(var(--accent-500));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  margin-top: -22px;
  box-shadow: 0 4px 14px rgba(var(--accent-500), 0.35);
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 150ms ease;
}
.mobile-nav-fab:active {
  transform: scale(0.92);
}

@media (max-width: 1023px) {
  .layout-body {
    padding-bottom: calc(64px + env(safe-area-inset-bottom) + 12px) !important;
  }
  .navbar-left {
    min-width: auto;
  }
}

@media (max-width: 640px) {
  .navbar-center {
    display: none;
  }
  .app-navbar {
    padding-left: 12px;
    padding-right: 12px;
  }
}
</style>
