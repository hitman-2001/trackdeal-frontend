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
  // Initialize dynamic styles and theme modes
  store.dispatch('ui/initializeTheme');
});
</script>
