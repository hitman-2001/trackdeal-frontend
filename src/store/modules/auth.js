import authApi from '@/modules/auth/api/endpoints';
import { Capacitor } from '@capacitor/core';

const NATIVE_REFRESH_TOKEN_KEY = 'trackdeal_native_refresh_token';

function getNativeRefreshToken() {
  if (Capacitor.isNativePlatform() && typeof localStorage !== 'undefined') {
    return localStorage.getItem(NATIVE_REFRESH_TOKEN_KEY);
  }
  return null;
}

function setNativeRefreshToken(token) {
  if (Capacitor.isNativePlatform() && typeof localStorage !== 'undefined') {
    if (token) {
      localStorage.setItem(NATIVE_REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(NATIVE_REFRESH_TOKEN_KEY);
    }
  }
}

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
// Browser-readable storage must never be the source of session authority.
[
  'accessToken', 'refreshToken', 'sessionExpiresAt', 'currentUser',
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
    loginUser({ commit }, { accessToken, refreshToken, profile }) {
      commit('SET_TOKEN', { accessToken });
      commit('SET_USER_PROFILE', profile);
      if (refreshToken) {
        setNativeRefreshToken(refreshToken);
      }
      
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
        const nativeToken = getNativeRefreshToken();
        await authApi.logout(nativeToken);
      } finally {
        setNativeRefreshToken(null);
        commit('CLEAR_SESSION');
        commit('permissions/CLEAR_CAPABILITIES', null, { root: true });
        commit('organization/CLEAR_ORGANIZATION', null, { root: true });
      }
    },
    async refreshUserTokens({ commit }) {
      try {
        const nativeToken = getNativeRefreshToken();
        const data = await authApi.refreshTokens(nativeToken);
        const payload = data.data || data;
        
        commit('SET_TOKEN', { accessToken: payload.accessToken });
        commit('SET_USER_PROFILE', payload.user);
        if (payload.refreshToken) {
          setNativeRefreshToken(payload.refreshToken);
        }
        
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
        setNativeRefreshToken(null);
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
