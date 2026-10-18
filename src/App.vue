<template>
  <GlobalApiSpinner />
  <GlobalToastContainer />
  <router-view />
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import GlobalApiSpinner from '@/components/GlobalApiSpinner.vue';
import GlobalToastContainer from '@/components/GlobalToastContainer.vue';
import {
  onForegroundNotification,
  syncPushTokenIfPermissionGranted,
} from '@/services/firebase';

const store = useStore();
const router = useRouter();

let unsubForegroundPush = null;

onMounted(() => {
  // Expose router for push notification action callbacks
  if (typeof window !== 'undefined') {
    window.$router = router;
  }

  // Initialize dynamic styles and theme modes immediately from store / local cache
  store.dispatch('ui/initializeTheme');

  // Synchronize latest organization theme and push tokens for all logged-in users
  const isAuth = store.getters['auth/isAuthenticated'] || localStorage.getItem('accessToken');
  if (isAuth) {
    store.dispatch('ui/syncOrgTheme');
    syncPushTokenIfPermissionGranted().catch(() => {});
  }

  // Cross-tab theme sync: if another tab updates the organization theme, apply it live
  window.addEventListener('storage', (event) => {
    if (event.key === 'theme_custom_hsl' && event.newValue) {
      try {
        store.dispatch('ui/initializeTheme');
      } catch (e) {}
    }
  });

  // Native Deep Linking via Capacitor
  if (Capacitor.isNativePlatform()) {
    let lastHandledDeepLink = null;
    let lastHandledTime = 0;

    CapApp.addListener('appUrlOpen', (data) => {
      Browser.close().catch(() => {});
      if (!data?.url) return;

      const now = Date.now();
      if (data.url === lastHandledDeepLink && now - lastHandledTime < 1500) {
        return;
      }
      lastHandledDeepLink = data.url;
      lastHandledTime = now;

      try {
        let urlToParse = data.url;
        if (urlToParse.startsWith('intent://')) {
          const intentPart = urlToParse.substring('intent://'.length).split('#Intent;')[0];
          urlToParse = `https://trackdeal.internal/${intentPart}`;
        } else if (/^trackdeal:\/+/i.test(urlToParse)) {
          urlToParse = urlToParse.replace(/^trackdeal:\/+/i, 'https://trackdeal.internal/');
        }

        const parsed = new URL(urlToParse);
        let pathname = parsed.pathname;
        if (pathname.endsWith('/') && pathname.length > 1) pathname = pathname.slice(0, -1);
        if (!pathname) pathname = '/';

        const query = {};
        parsed.searchParams.forEach((val, key) => {
          query[key] = val;
        });

        router.replace({ path: pathname, query }).catch(() => {});
      } catch (err) {
        console.error('[DeepLink] Failed parsing deep link URL:', err);
      }
    });
  }

  // Real-time foreground notification listener
  unsubForegroundPush = onForegroundNotification((payload) => {
    const title = payload?.notification?.title || 'TrackDeal';
    const body = payload?.notification?.body || '';
    store.dispatch('notifications/triggerToast', {
      message: body ? `${title}: ${body}` : title,
      type: 'info',
      duration: 5000,
    });
  });
});

onBeforeUnmount(() => {
  if (typeof unsubForegroundPush === 'function') {
    unsubForegroundPush();
  }
});
</script>
