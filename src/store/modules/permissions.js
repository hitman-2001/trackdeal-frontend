export default {
  namespaced: true,
  state: () => {
    let stored = [];
    try {
      const val = localStorage.getItem('capabilities');
      stored = val ? JSON.parse(val) : [];
    } catch (e) {
      stored = [];
    }
    return {
      capabilities: stored
    };
  },
  mutations: {
    SET_CAPABILITIES(state, capabilities) {
      if (Array.isArray(capabilities)) {
        state.capabilities = capabilities;
      } else if (capabilities && typeof capabilities === 'object') {
        const list = [];
        Object.entries(capabilities).forEach(([scope, actions]) => {
          if (actions && typeof actions === 'object') {
            Object.entries(actions).forEach(([action, val]) => {
              if (val === true) {
                list.push(`${scope}.${action}`);
                list.push(`${scope}:${action}`);
              }
            });
          } else if (actions === true) {
            list.push(scope);
          }
        });
        state.capabilities = list;
      } else {
        state.capabilities = [];
      }
      localStorage.setItem('capabilities', JSON.stringify(state.capabilities));
    },
    CLEAR_CAPABILITIES(state) {
      state.capabilities = [];
      localStorage.removeItem('capabilities');
    }
  },
  getters: {
    hasCapability: (state, getters, rootState, rootGetters) => (permission) => {
      if (!permission) return true;
      const role = String(rootGetters?.['auth/userRole'] || '').toLowerCase().trim();

      // 1. Super admins always have root access
      if (['super_admin', 'system_admin'].includes(role)) {
        return true;
      }

      const normalized = permission.replace(/:/g, '.').toLowerCase().trim();
      const colonFormat = permission.replace(/\./g, ':').toLowerCase().trim();

      const alternateNormalized = normalized.endsWith('.read')
        ? normalized.replace(/\.read$/, '.view')
        : normalized.endsWith('.view')
        ? normalized.replace(/\.view$/, '.read')
        : null;

      const isReportsOrAnalytics =
        normalized.startsWith('reports.') ||
        normalized.startsWith('reports:') ||
        normalized.startsWith('analytics.') ||
        normalized.startsWith('analytics:') ||
        normalized === 'reports' ||
        normalized === 'analytics';

      // 2. Check user explicit overrides (removed permissions take precedence)
      const user = rootState?.auth?.currentUser;
      const removed = (user?.permissionOverrides?.removed || []).map((p) =>
        String(p).toLowerCase().trim()
      );
      if (
        removed.includes(normalized) ||
        removed.includes(colonFormat) ||
        removed.includes(permission.toLowerCase().trim()) ||
        (alternateNormalized && removed.includes(alternateNormalized)) ||
        (isReportsOrAnalytics && removed.some((r) => r === 'reports' || r === 'analytics' || r.startsWith('reports.') || r.startsWith('analytics.')))
      ) {
        return false;
      }

      // 3. Collect all active capabilities across state, user overrides, and profile
      const addedOverrides = (user?.permissionOverrides?.added || []).map((p) =>
        String(p).toLowerCase().trim()
      );
      const userPermArray = Array.isArray(user?.permissions)
        ? user.permissions.map((p) => String(p).toLowerCase().trim())
        : [];
      const rolePermArray = Array.isArray(user?.role?.permissions)
        ? user.role.permissions.map((p) => String(p).toLowerCase().trim())
        : Array.isArray(user?.roleId?.permissions)
        ? user.roleId.permissions.map((p) => String(p).toLowerCase().trim())
        : [];

      const allCapabilities = new Set([
        ...state.capabilities.map((c) => String(c).toLowerCase().trim()),
        ...addedOverrides,
        ...userPermArray,
        ...rolePermArray,
      ]);

      // 4. Wildcard check
      if (allCapabilities.has('*')) return true;

      // 5. Direct and colon matches
      if (
        allCapabilities.has(normalized) ||
        allCapabilities.has(colonFormat) ||
        allCapabilities.has(permission.toLowerCase().trim())
      ) {
        return true;
      }

      // 6. Read / View synonyms
      if (alternateNormalized && allCapabilities.has(alternateNormalized)) {
        return true;
      }

      // 7. Special Equivalence: Reports & Analytics

      if (isReportsOrAnalytics) {
        const reportsKeys = [
          'reports.view',
          'reports.read',
          'reports:view',
          'reports:read',
          'analytics.view',
          'analytics.read',
          'analytics:view',
          'analytics:read',
          'reports',
          'analytics',
        ];
        if (reportsKeys.some((k) => allCapabilities.has(k))) {
          return true;
        }
      }

      // 8. Module-level permission grant (e.g. granted 'reports' or 'leads' gives access to reports.read)
      const moduleScope = normalized.split('.')[0];
      if (moduleScope && allCapabilities.has(moduleScope)) {
        return true;
      }

      // 9. Object-based dictionary structure check
      const userPerms = user?.permissions || user?.role?.permissions || user?.roleId?.permissions;
      if (userPerms && typeof userPerms === 'object' && !Array.isArray(userPerms)) {
        const parts = normalized.split('.');
        if (parts.length === 2) {
          const [scope, action] = parts;
          const alternateAction = action === 'read' ? 'view' : action === 'view' ? 'read' : null;
          
          if (userPerms[scope]) {
            if (userPerms[scope][action] === true || (alternateAction && userPerms[scope][alternateAction] === true)) {
              return true;
            }
          }
          if (scope === 'reports' && userPerms['analytics']) {
            if (userPerms['analytics'][action] === true || (alternateAction && userPerms['analytics'][alternateAction] === true)) {
              return true;
            }
          }
        }
      }

      return false;
    }
  }
};
