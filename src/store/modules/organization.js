import { applyThemeTokensToDOM } from './ui';

export default {
  namespaced: true,
  state: () => {
    const tenantId = null;
    const tenantSlug = null;
    const tenantVertical = 'realEstate';
    const featuresFlags = {};
    const branding = {
      primaryHsl: '220 85% 45%', // Default Deep Indigo
      secondaryHsl: '210 25% 35%', // Default Slate
      logoUrl: '',
      logoDarkUrl: '',
      themeTokens: null,
    };

    const organizationType = 'AGENCY';
 
    // Inject HSL colors / dynamic theme tokens to stylesheet root on boot
    if (typeof window !== 'undefined' && window.document) {
      if (branding?.themeTokens) {
        applyThemeTokensToDOM(branding.themeTokens);
      } else if (branding?.primaryHsl) {
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
      
      // Inject HSL colors / dynamic theme tokens to stylesheet root
      if (branding?.themeTokens) {
        applyThemeTokensToDOM(branding.themeTokens);
        localStorage.setItem('theme_custom_hsl', JSON.stringify(branding.themeTokens));
      } else if (branding?.primaryHsl) {
        document.documentElement.style.setProperty('--primary', branding.primaryHsl);
      }
      if (branding?.secondaryHsl) {
        document.documentElement.style.setProperty('--secondary', branding.secondaryHsl);
      }
    },
    SET_ORGANIZATION_BRANDING(state, branding) {
      if (!branding) return;
      state.branding = { ...state.branding, ...branding };
      if (branding.themeTokens) {
        applyThemeTokensToDOM(branding.themeTokens);
        localStorage.setItem('theme_custom_hsl', JSON.stringify(branding.themeTokens));
      } else if (branding.primaryHsl) {
        document.documentElement.style.setProperty('--primary', branding.primaryHsl);
      }
      if (branding.secondaryHsl) {
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
