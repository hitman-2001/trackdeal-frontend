<template>
  <GlobalApiSpinner />
  <GlobalToastContainer />
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import GlobalApiSpinner from '@/components/GlobalApiSpinner.vue';
import GlobalToastContainer from '@/components/GlobalToastContainer.vue';

const store = useStore();

onMounted(() => {
  // Initialize dynamic styles and theme modes immediately from store / local cache
  store.dispatch('ui/initializeTheme');

  // Synchronize latest organization theme from server for all logged-in users
  if (store.getters['auth/isAuthenticated'] || localStorage.getItem('accessToken')) {
    store.dispatch('ui/syncOrgTheme');
  }

  // Cross-tab theme sync: if another tab updates the organization theme, apply it live
  window.addEventListener('storage', (event) => {
    if (event.key === 'theme_custom_hsl' && event.newValue) {
      try {
        store.dispatch('ui/initializeTheme');
      } catch (e) {}
    }
  });
});
</script>
