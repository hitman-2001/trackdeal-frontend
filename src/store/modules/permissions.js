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
      const role = String(rootGetters?.['auth/userRole'] || '').toLowerCase();

      const normalized = permission.replace(/:/g, '.');
      const colonFormat = permission.replace(/\./g, ':');

      // 1. Check user explicit overrides (removed permissions)
      const user = rootState?.auth?.currentUser;
      const removed = user?.permissionOverrides?.removed || [];
      if (
        removed.includes(normalized) ||
        removed.includes(colonFormat) ||
        removed.includes(permission)
      ) {
        return false;
      }

      // 2. Check user/role permissions dictionary if stored as an object
      const userPerms = user?.permissions || user?.role?.permissions || user?.roleId?.permissions;
      if (userPerms && typeof userPerms === 'object' && !Array.isArray(userPerms)) {
        const parts = normalized.split('.');
        if (parts.length === 2) {
          const [scope, action] = parts;
          const alternateAction = action === 'read' ? 'view' : action === 'view' ? 'read' : null;
          if (userPerms[scope] && (userPerms[scope][action] === false || (alternateAction && userPerms[scope][alternateAction] === false))) {
            return false;
          }
          if (userPerms[scope] && (userPerms[scope][action] === true || (alternateAction && userPerms[scope][alternateAction] === true))) {
            return true;
          }
        }
      }

      // 3. Super admins have root access (unless explicitly removed above)
      if (['super_admin', 'system_admin'].includes(role)) {
        return true;
      }

      // 4. Wildcard check
      if (state.capabilities.includes('*')) return true;

      // 5. Capabilities list check (with read/view synonyms)
      const alternateNormalized = normalized.endsWith('.read')
        ? normalized.replace(/\.read$/, '.view')
        : normalized.endsWith('.view')
        ? normalized.replace(/\.view$/, '.read')
        : null;
      const alternateColon = alternateNormalized ? alternateNormalized.replace(/\./g, ':') : null;

      return (
        state.capabilities.includes(normalized) ||
        state.capabilities.includes(colonFormat) ||
        state.capabilities.includes(permission) ||
        (alternateNormalized && state.capabilities.includes(alternateNormalized)) ||
        (alternateColon && state.capabilities.includes(alternateColon))
      );
    }
  }
};
