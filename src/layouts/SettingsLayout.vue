<template>
  <div class="settings-workspace">
    <nav class="settings-subnav" aria-label="Workspace settings">
      <div class="settings-subnav__intro">
        <p class="eyebrow">Workspace settings</p>
        <p>{{ isEducation ? 'Configure your institute, staff access, and campus policies.' : 'Configure your organization, access, and policies.' }}</p>
      </div>
      <div class="settings-subnav__items" role="tablist" aria-label="Settings sections">
        <router-link
          v-for="item in filteredSettingsMenu"
          :key="item.name"
          :to="item.to"
          class="settings-subnav__item"
          :class="{ 'is-active': isActive(item.to) }"
          role="tab"
          :aria-selected="isActive(item.to)"
        >
          <component :is="item.icon" :size="16" :weight="isActive(item.to) ? 'bold' : 'regular'" />
          <span>{{ item.name }}</span>
        </router-link>
      </div>
    </nav>

    <section class="settings-content">
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
  PhShieldCheck,
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
  // Only include Roles & Permissions tab for non-education verticals
  if (!isEducation.value) {
    items.push({ name: 'Roles & Permissions', to: '/app/settings/roles', icon: PhShieldCheck, permission: 'roles.read' });
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
    if ((item.to === '/app/settings/users' || item.to === '/app/settings/roles') && orgType === 'INDIVIDUAL_AGENT') {
      return false;
    }
    if (!item.permission || isSuperAdmin) return true;
    return store.getters['permissions/hasCapability'](item.permission);
  });
});
</script>

<style scoped>
.settings-workspace { width: min(100%, 88rem); margin-inline: auto; display: grid; gap: 1.5rem; }
.settings-subnav { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; padding: 1rem 1.125rem; border: 1px solid hsl(var(--neutral-100)); border-radius: 12px; background: hsl(var(--bg-surface) / 0.86); box-shadow: 0 1px 2px rgb(26 22 18 / 0.025); }
.settings-subnav__intro { flex: 0 0 auto; }
.settings-subnav__intro > p:last-child { margin-top: 0.25rem; color: hsl(var(--neutral-400)); font-size: 11px; }
.settings-subnav__items { display: flex; align-items: center; gap: 0.25rem; min-width: 0; padding: 0.25rem; border: 1px solid hsl(var(--neutral-100)); border-radius: 9px; background: hsl(var(--neutral-25)); }
.settings-subnav__item { display: inline-flex; align-items: center; gap: 0.45rem; min-height: 2rem; padding: 0 0.65rem; border-radius: 6px; color: hsl(var(--neutral-500)); font-size: 11px; font-weight: 600; white-space: nowrap; transition: color 150ms ease, background-color 150ms ease, box-shadow 150ms ease; }
.settings-subnav__item:hover { color: hsl(var(--neutral-900)); background: hsl(var(--bg-surface)); }
.settings-subnav__item.is-active { color: hsl(var(--accent-700)); background: hsl(var(--bg-surface)); box-shadow: 0 1px 2px rgb(26 22 18 / 0.08); }
.settings-content { min-width: 0; }
@media (max-width: 900px) { .settings-subnav { align-items: stretch; flex-direction: column; } .settings-subnav__items { width: 100%; overflow-x: auto; } }
</style>
