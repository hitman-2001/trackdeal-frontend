import store from "@/store";

let sessionChecked = false;

export function setupRouterGuards(router) {
  router.beforeEach(async (to, from, next) => {
    // The public landing page must render without waiting for the API.
    if (to.meta.public) return next();
    // 1. Session Restoration on Application Boot
    if (!sessionChecked) {
      sessionChecked = true;
      const isAuthenticated = store.getters["auth/isAuthenticated"];
      const hasRefreshToken = !!store.state.auth?.refreshToken;
      const isAuthPage =
        to.path.startsWith("/login") ||
        to.path.startsWith("/forgot-password") ||
        to.path.startsWith("/reset-password") ||
        to.path.startsWith("/accept-invitation");

      if (!isAuthenticated && hasRefreshToken && !isAuthPage) {
        try {
          await store.dispatch("auth/refreshUserTokens");
        } catch (error) {
          // Silent refresh failed, ignore and let standard guards handle redirects
        }
      }
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const requiresSystemAdmin = to.matched.some(
      (record) => record.meta.requiresSystemAdmin,
    );
    const isAuthenticated = store.getters["auth/isAuthenticated"];
    const userRole = store.getters["auth/userRole"];
    const isPlatformAdmin = ["system_admin", "super_admin"].includes(userRole);

    if (requiresAuth && !isAuthenticated) {
      store.dispatch("notifications/triggerToast", {
        message: "Your session has expired. Please log in to continue.",
        type: "error",
      });
      return next({ path: "/login", query: { redirect: to.fullPath } });
    }

    // System Admin route protection
    if (requiresSystemAdmin) {
      if (!isPlatformAdmin) {
        store.dispatch("notifications/triggerToast", {
          message: "Access restricted to TrackDeal Super Administrators.",
          type: "error",
        });
        return next({ path: "/app/dashboard" });
      }
    }

    if (isPlatformAdmin && to.path.startsWith("/app")) {
      return next({ path: "/admin" });
    }

    if (to.path === "/login" && isAuthenticated) {
      if (isPlatformAdmin) {
        return next({ path: "/admin" });
      }
      return next({ path: "/app/dashboard" });
    }


    // Team and Settings accessible to org_admin only
    if (to.path.startsWith("/app/settings")) {
      const role = String(userRole || "").toLowerCase();
      const isOrgAdmin = ["org_admin", "organization_admin", "super_admin", "system_admin"].includes(role);
      if (!isOrgAdmin) {
        store.dispatch("notifications/triggerToast", {
          message: "Access restricted to Organization Administrators.",
          type: "error",
        });
        return next({ path: "/app/dashboard" });
      }
    }

    const requiredModule = to.meta.module;
    if (requiredModule) {
      const isFeatureActive =
        store.getters["organization/isFeatureEnabled"](requiredModule);
      if (!isFeatureActive) {
        store.dispatch("notifications/triggerToast", {
          message: "This module is not enabled for your tenant.",
          type: "warning",
        });
        return next({ path: "/app/dashboard" });
      }
    }

    const tenantVertical = store.getters["organization/tenantVertical"] || "realEstate";
    const requiredVertical = to.meta.vertical;
    if (requiredVertical && requiredVertical !== tenantVertical) {
      store.dispatch("notifications/triggerToast", {
        message: "This screen is not available for your tenant vertical.",
        type: "warning",
      });
      return next({ path: "/app/dashboard" });
    }

    // 2. Feature Flag Check
    const requiredFeature = to.meta.featureFlag;
    if (requiredFeature) {
      const isFeatureActive =
        store.getters["organization/isFeatureEnabled"](requiredFeature);
      if (!isFeatureActive) {
        store.dispatch("notifications/triggerToast", {
          message: "Requested module is disabled for your organization.",
          type: "warning",
        });
        return next({ path: "/app/dashboard" });
      }
    }

    // 3. RBAC Scopes Check
    const requiredPermission = to.meta.permission;
    if (requiredPermission) {
      const isSuperAdmin = ["super_admin", "system_admin"].includes(
        store.getters["auth/userRole"],
      );
      if (!isSuperAdmin) {
        const hasCapability =
          store.getters["permissions/hasCapability"](requiredPermission);
        if (!hasCapability) {
          store.dispatch("notifications/triggerToast", {
            message:
              "Unauthorized: You do not possess access permissions for this route.",
            type: "error",
          });
          return next({ path: "/app/dashboard" });
        }
      }
    }

    // 4. Org Type Guard (before navigation)
    const requiredOrgTypes = to.meta.requiresOrgType;
    if (requiredOrgTypes && Array.isArray(requiredOrgTypes)) {
      const orgType = store.getters["organization/organizationType"];
      if (!requiredOrgTypes.includes(orgType)) {
        store.dispatch("notifications/triggerToast", {
          message: "This feature is not available for your organization type.",
          type: "warning",
        });
        return next({ path: "/app/dashboard" });
      }
    }

    next();
  });
}
