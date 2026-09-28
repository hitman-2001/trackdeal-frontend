function getStoredJson(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
}

export default {
  namespaced: true,
  state: () => {
    const tenantId = localStorage.getItem('tenant_id') || null;
    const tenantSlug = localStorage.getItem('tenant_slug') || null;
    const tenantVertical =
      localStorage.getItem('tenant_vertical')
      || getStoredJson('currentUser', null)?.tenantVertical
      || getStoredJson('currentUser', null)?.tenantDomain
      || 'realEstate';
    const featuresFlags = getStoredJson('featuresFlags', {});
    const branding = getStoredJson('branding', {
      primaryHsl: '220 85% 45%', // Default Deep Indigo
      secondaryHsl: '210 25% 35%', // Default Slate
      logoUrl: '',
      logoDarkUrl: ''
    });

    const organizationType = localStorage.getItem('org_type') || 'AGENCY';
 
    // Inject HSL colors dynamic theme tokens to stylesheet root on boot
    if (typeof window !== 'undefined' && window.document) {
      if (branding?.primaryHsl) {
        document.documentElement.style.setProperty('--primary', branding.primaryHsl);
      }
      if (branding?.secondaryHsl) {
        document.documentElement.style.setProperty('--secondary', branding.secondaryHsl);
      }
    }
 
    return {
      tenantId,
      tenantSlug,
      tenantVertical,
      organizationType,
      featuresFlags,
      branding
    };
  },
  mutations: {
    SET_ORGANIZATION(state, { tenantId, tenantSlug, tenantVertical, organizationType, branding, featuresFlags }) {
      state.tenantId = tenantId;
      state.tenantSlug = tenantSlug || state.tenantSlug || null;
      state.tenantVertical = tenantVertical || state.tenantVertical || 'realEstate';
      state.organizationType = organizationType || 'AGENCY';
      state.featuresFlags = featuresFlags || {};
      state.branding = { ...state.branding, ...branding };
      
      if (tenantId) {
        localStorage.setItem('tenant_id', tenantId);
      }
      if (tenantSlug) {
        localStorage.setItem('tenant_slug', tenantSlug);
      }
      if (state.tenantVertical) {
        localStorage.setItem('tenant_vertical', state.tenantVertical);
      }
      localStorage.setItem('org_type', state.organizationType);
      localStorage.setItem('featuresFlags', JSON.stringify(state.featuresFlags));
      localStorage.setItem('branding', JSON.stringify(state.branding));
      
      // Inject HSL colors dynamic theme tokens to stylesheet root
      if (branding?.primaryHsl) {
        document.documentElement.style.setProperty('--primary', branding.primaryHsl);
      }
      if (branding?.secondaryHsl) {
        document.documentElement.style.setProperty('--secondary', branding.secondaryHsl);
      }
    },
    CLEAR_ORGANIZATION(state) {
      state.tenantId = null;
      state.tenantSlug = null;
      state.tenantVertical = 'realEstate';
      state.organizationType = 'AGENCY';
      state.featuresFlags = {};
      state.branding = {
        primaryHsl: '220 85% 45%',
        secondaryHsl: '210 25% 35%',
        logoUrl: '',
        logoDarkUrl: ''
      };
      localStorage.removeItem('tenant_id');
      localStorage.removeItem('tenant_slug');
      localStorage.removeItem('tenant_vertical');
      localStorage.removeItem('org_type');
      localStorage.removeItem('featuresFlags');
      localStorage.removeItem('branding');
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--secondary');
    }
  },
  getters: {
    isFeatureEnabled: (state) => (featureKey) => {
      // If feature flags metadata is empty, allow all by default for fallback
      if (Object.keys(state.featuresFlags).length === 0) return true;
      return !!state.featuresFlags[featureKey];
    },
    organizationType: (state) => state.organizationType,
    tenantVertical: (state) => state.tenantVertical || 'realEstate',
    isEducationTenant: (state) => (state.tenantVertical || 'realEstate') === 'education',
    isRealEstateTenant: (state) => (state.tenantVertical || 'realEstate') !== 'education',
    verticalLogoUrl: (state) => {
      return (state.tenantVertical || 'realEstate') === 'education'
        ? '/education_logo.png'
        : '/real_estate_black.png';
    },
    isEnterpriseAgency: (state) => state.organizationType === 'ENTERPRISE_AGENCY',
    isIndividualAgent: (state) => state.organizationType === 'INDIVIDUAL_AGENT',
    isAgency: (state) => state.organizationType === 'AGENCY',
    isBranchEnabled: (state) => state.organizationType === 'ENTERPRISE_AGENCY',
  }
};
