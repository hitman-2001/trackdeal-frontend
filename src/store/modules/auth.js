import authApi from '@/modules/auth/api/endpoints';
import { clearSessionCookieBackup } from '@/services/sessionCookies';

function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (e) {
    return null;
  }
}

// Remove credentials and identity/authorization caches created by older builds.
// Browser-readable storage must never be the source of session authority on web.
[
  'accessToken', 'refreshToken', 'trackdeal_native_refresh_token',
  'sessionExpiresAt', 'currentUser',
  'capabilities', 'tenant_id', 'tenant_slug', 'tenant_vertical',
  'org_type', 'featuresFlags', 'branding',
].forEach((key) => localStorage.removeItem(key));

function expiresAt(token) {
  const exp = parseJwt(token)?.exp;
  return exp ? exp * 1000 : null;
}

export default {
  namespaced: true,
  state: () => ({
    token: null,
    sessionExpiresAt: null,
    currentUser: null
  }),
  mutations: {
    SET_TOKEN(state, { accessToken }) {
      state.token = accessToken;
      state.sessionExpiresAt = expiresAt(accessToken);
    },
    CLEAR_SESSION(state) {
      state.token = null;
      state.sessionExpiresAt = null;
      state.currentUser = null;
    },
    SET_USER_PROFILE(state, profile) {
      state.currentUser = profile;
    }
  },
  actions: {
    loginUser({ commit }, { accessToken, profile }) {
      commit('SET_TOKEN', { accessToken });
      commit('SET_USER_PROFILE', profile);
      
      const decoded = parseJwt(accessToken) || {};
      const permissions = decoded.permissions || profile?.permissions || [];
      const tenantId = decoded.tenantId || profile?.tenantId || decoded.organizationId || profile?.organizationId;
      const tenantSlug = decoded.tenantSlug || profile?.tenantSlug || null;
      const tenantVertical = decoded.tenantVertical || decoded.tenantDomain || profile?.tenantVertical || profile?.tenantDomain || 'realEstate';
      const organizationType = decoded.organizationType || profile?.organizationType || 'AGENCY';
      const featuresFlags = decoded.featuresFlags || profile?.featuresFlags || {};
 
      // Fetch permissions scoping
      commit('permissions/SET_CAPABILITIES', permissions, { root: true });
      // Fetch dynamic tenant values
      commit('organization/SET_ORGANIZATION', {
        tenantId,
        tenantSlug,
        tenantVertical,
        organizationType,
        branding: profile?.branding || decoded?.branding || {},
        featuresFlags,
      }, { root: true });
    },
    async logoutSession({ commit }) {
      try {
        await authApi.logout();
      } finally {
        try {
          await clearSessionCookieBackup();
        } catch (error) {
          console.error('Unable to clear native session backup', error);
        }
        commit('CLEAR_SESSION');
        commit('permissions/CLEAR_CAPABILITIES', null, { root: true });
        commit('organization/CLEAR_ORGANIZATION', null, { root: true });
      }
    },
    async refreshUserTokens({ commit }) {
      try {
        const data = await authApi.refreshTokens();
        const payload = data.data || data;
        
        commit('SET_TOKEN', { accessToken: payload.accessToken });
        commit('SET_USER_PROFILE', payload.user);
        const decoded = parseJwt(payload.accessToken) || {};
        const permissions = decoded.permissions || payload.user?.permissions || [];
        const tenantId = decoded.tenantId || payload.user?.tenantId || decoded.organizationId || payload.user?.organizationId;
        const tenantSlug = decoded.tenantSlug || payload.user?.tenantSlug || null;
        const tenantVertical = decoded.tenantVertical || decoded.tenantDomain || payload.user?.tenantVertical || payload.user?.tenantDomain || 'realEstate';
        const organizationType = decoded.organizationType || payload.user?.organizationType || 'AGENCY';
        const featuresFlags = decoded.featuresFlags || payload.user?.featuresFlags || {};
 
        commit('permissions/SET_CAPABILITIES', permissions, { root: true });
        commit('organization/SET_ORGANIZATION', {
          tenantId,
          tenantSlug,
          tenantVertical,
          organizationType,
          branding: payload.user?.branding || decoded?.branding || {},
          featuresFlags
        }, { root: true });
        
        return payload;
      } catch (error) {
        if (error.response?.status === 401) {
          try {
            await clearSessionCookieBackup();
          } catch (clearError) {
            console.error('Unable to clear invalid native session backup', clearError);
          }
        }
        commit('CLEAR_SESSION');
        commit('permissions/CLEAR_CAPABILITIES', null, { root: true });
        commit('organization/CLEAR_ORGANIZATION', null, { root: true });
        throw error;
      }
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => {
      if (!state.token) return null;
      const decoded = parseJwt(state.token);
      return decoded?.role || state.currentUser?.role || null;
    },
    organizationType: (state) => {
      if (!state.token) return null;
      const decoded = parseJwt(state.token);
      return decoded?.organizationType || state.currentUser?.organizationType || null;
    }
  }
};
