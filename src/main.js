import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { injectStore } from "@/api/client";
import AppIcon from "@/components/AppIcon.vue";
import AppPagination from "@/components/AppPagination.vue";
import { Capacitor } from "@capacitor/core";
import { restoreSessionCookies } from "@/services/sessionCookies";
import { markSessionChecked } from "@/router/guards";

// Import Tailwind CSS layer configurations
import "./assets/css/index.css";

// Inject Store instance to Axios client immediately to break circular dependency
injectStore(store);

const app = createApp(App);

// Semantic icon primitive used across legacy and modernized screens.
app.component("AppIcon", AppIcon);
app.component("AppPagination", AppPagination);

// 1. Configure TanStack Query plugin defaults (staleTime set to 0 for real-time consistency)
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        retry: 1,
        staleTime: 0,
      },
    },
  },
});

// 2. Register Vuex Store and Vue Router
app.use(store);

// Helper function to evaluate permissions reactively
function evaluatePermission(el, binding) {
  const requiredPermission = binding.value;
  const isSuperAdmin = ["super_admin", "system_admin"].includes(
    store.getters["auth/userRole"],
  );
  const hasCapability =
    store.getters["permissions/hasCapability"](requiredPermission);

  if (!isSuperAdmin && requiredPermission && !hasCapability) {
    el.style.display = "none";
  } else {
    el.style.display = "";
  }
}

// 3. Register Global RBAC Directive (v-permission) with reactive lifecycles
app.directive("permission", {
  mounted(el, binding) {
    evaluatePermission(el, binding);
  },
  updated(el, binding) {
    evaluatePermission(el, binding);
  },
});

// 4. Configure Global Application Error Boundary Handler
app.config.errorHandler = (error, vm, info) => {
  console.error("Unhandled Vue Exception: ", error, info);

  // Alert the user via the global toast notification queue
  store.dispatch("notifications/triggerToast", {
    message:
      "An unexpected layout error occurred. Please refresh your browser.",
    type: "error",
  });
};

async function startApp() {
  if (Capacitor.isNativePlatform()) {
    try {
      await restoreSessionCookies();
      await store.dispatch("auth/refreshUserTokens");
    } catch (error) {
      // A missing or expired session opens the login screen via the router.
    } finally {
      markSessionChecked();
    }
  }

  app.use(router);
  app.mount("#app");
}

startApp();
