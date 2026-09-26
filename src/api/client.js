import axios from 'axios';
import { isRef } from 'vue';

let storeInstance = null;

export function injectStore(store) {
  storeInstance = store;
}

function unwrap(val) {
  if (isRef(val)) {
    return unwrap(val.value);
  }
  if (Array.isArray(val)) {
    return val.map(unwrap);
  }
  if (val !== null && typeof val === 'object') {
    if (
      val instanceof Date ||
      val instanceof RegExp ||
      val instanceof Blob ||
      val instanceof File ||
      (typeof FormData !== 'undefined' && val instanceof FormData) ||
      (typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams)
    ) {
      return val;
    }
    const copy = {};
    for (const key of Object.keys(val)) {
      copy[key] = unwrap(val[key]);
    }
    return copy;
  }
  return val;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  withCredentials: true, // Crucial for HTTP-only cookies transmission
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Request Interceptor: Inject JWT and Tenant ID Headers
apiClient.interceptors.request.use(
  (config) => {
    // Un-wrap any Vue refs/reactives in params/data to avoid sending proxy/ref wrappers
    if (config.params) {
      config.params = unwrap(config.params);
    }
    if (config.data) {
      config.data = unwrap(config.data);
    }

    if (storeInstance) {
      // Read JWT session token from Vuex store auth module
      const token = storeInstance.state.auth?.token;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      // Read Tenant ID from Vuex store organization module
      const tenantId = storeInstance.state.organization?.tenantId;
      if (tenantId) {
        config.headers['X-Tenant-ID'] = tenantId;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Manage Global Errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      if (storeInstance) {
        storeInstance.dispatch('notifications/triggerToast', {
          message: 'Network connection failed. Please check your internet connectivity.',
          type: 'error'
        });
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const isAuthRequest = originalRequest.url && (
      originalRequest.url.includes('/auth/refresh') ||
      originalRequest.url.includes('/auth/login')
    );

    if (status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        // Queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      if (storeInstance) {
        try {
          const res = await storeInstance.dispatch('auth/refreshUserTokens');
          const newToken = res.accessToken;
          isRefreshing = false;
          processQueue(null, newToken);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError, null);
          await storeInstance.dispatch('auth/logoutSession');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    if (storeInstance && !originalRequest?.silent && !originalRequest?.skipErrorToast) {
      switch (status) {
        case 403:
          storeInstance.dispatch('notifications/triggerToast', {
            message: 'Access Denied: You do not possess sufficient permissions for this action.',
            type: 'error'
          });
          break;

        case 422:
          return Promise.reject(error.response);

        case 500:
          storeInstance.dispatch('notifications/triggerToast', {
            message: data.message || 'An unexpected server error occurred. Please contact administrative support.',
            type: 'error'
          });
          break;

        default:
          break;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
