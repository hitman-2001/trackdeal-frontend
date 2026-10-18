<template>
  <div class="workspace-page w-full max-w-full min-w-0 space-y-4 sm:space-y-6 pb-28 sm:pb-12 text-xs">
    <!-- Subnav Tabs (Education Standard: swipeable horizontal line tabs) -->
    <div class="border-b border-default pb-0.5">
      <div
        class="flex items-center gap-1 sm:gap-3 overflow-x-auto scrollbar-none w-full min-w-0 -mb-px"
        style="-webkit-overflow-scrolling: touch;"
      >
        <router-link
          v-for="item in filteredSettingsMenu"
          :key="item.name"
          :to="item.to"
          class="flex items-center gap-2 py-2.5 px-3 border-b-2 font-bold text-xs transition-colors shrink-0 whitespace-nowrap"
          :class="isActive(item.to)
            ? 'border-primary text-primary'
            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
        >
          <component :is="item.icon" :size="15" :weight="isActive(item.to) ? 'bold' : 'regular'" />
          <span>{{ item.name }}</span>
        </router-link>
      </div>
    </div>

    <!-- Content Area -->
    <section class="w-full max-w-full min-w-0">
      <router-view />
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import {
  PhBuildings, PhMapPin, PhUsersThree,
  PhSlidersHorizontal,
} from '@phosphor-icons/vue';

const store = useStore();
const route = useRoute();
const isEducation = computed(() => store.getters['organization/isEducationTenant']);

const settingsMenu = computed(() => {
  const items = [
    { name: isEducation.value ? 'Institute Profile' : 'Organization', to: '/app/settings/org', icon: PhBuildings, permission: 'organizations.read' },
    { name: isEducation.value ? 'Campuses & Centres' : 'Branches', to: '/app/settings/branches', icon: PhMapPin, permission: 'branches.read' },
    { name: isEducation.value ? 'Staff Directory' : 'Users', to: '/app/settings/users', icon: PhUsersThree, permission: 'users.read' },
  ];
  // Custom Fields is only for Education vertical
  if (isEducation.value) {
    items.push({ name: 'Custom Fields', to: '/app/settings/custom-fields', icon: PhSlidersHorizontal, permission: 'organizations.read' });
  }
  return items;
});

const isActive = (to) => route.path === to || route.path.startsWith(`${to}/`);

const filteredSettingsMenu = computed(() => {
  const isSuperAdmin = store.getters['auth/userRole'] === 'super_admin';
  const orgType = store.getters['organization/organizationType'];

  return settingsMenu.value.filter(item => {
    if (item.to === '/app/settings/branches' && orgType !== 'ENTERPRISE_AGENCY') {
      return false;
    }
    if (item.to === '/app/settings/users' && orgType === 'INDIVIDUAL_AGENT') {
      return false;
    }
    if (!item.permission || isSuperAdmin) return true;
    return store.getters['permissions/hasCapability'](item.permission);
  });
});
</script>
