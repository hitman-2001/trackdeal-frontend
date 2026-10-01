<template>
  <GlobalApiSpinner />
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import GlobalApiSpinner from '@/components/GlobalApiSpinner.vue';

const store = useStore();

onMounted(() => {
  // Initialize dynamic styles and theme modes
  store.dispatch('ui/initializeTheme');
});
</script>
