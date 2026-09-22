export const applyThemeTokensToDOM = (tokens) => {
  const existingStyle = document.getElementById('dynamic-brand-styles');
  if (existingStyle) existingStyle.remove();

  if (!tokens) {
    document.documentElement.style.removeProperty('--accent-600');
    document.documentElement.style.removeProperty('--accent-500');
    document.documentElement.style.removeProperty('--accent-700');
    document.documentElement.style.removeProperty('--accent-200');
    document.documentElement.style.removeProperty('--accent-100');
    document.documentElement.style.removeProperty('--accent-50');
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--highlight-500');
    document.documentElement.style.removeProperty('--secondary');
    return;
  }

  const hexToHsl = (hex) => {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  let h = 142, s = 71, l = 29;
  let secH = 201, secS = 96, secL = 32;

  if (tokens.primaryHex) {
    [h, s, l] = hexToHsl(tokens.primaryHex);
  } else {
    h = Number(tokens.primaryH) || 142;
    s = Number(tokens.primaryS) || 71;
    l = Number(tokens.primaryL) || 29;
  }

  if (tokens.secondaryHex) {
    [secH, secS, secL] = hexToHsl(tokens.secondaryHex);
  } else {
    secH = Number(tokens.secondaryH) || 210;
    secS = Number(tokens.secondaryS) || 25;
    secL = Number(tokens.secondaryL) || 35;
  }

  document.documentElement.style.setProperty('--accent-600', `${h} ${s}% ${l}%`);
  document.documentElement.style.setProperty('--accent-500', `${h} ${s}% ${Math.min(92, l + 12)}%`);
  document.documentElement.style.setProperty('--accent-700', `${h} ${s}% ${Math.max(10, l - 10)}%`);
  document.documentElement.style.setProperty('--accent-200', `${h} ${Math.max(15, Math.round(s * 0.6))}% 75%`);
  document.documentElement.style.setProperty('--accent-100', `${h} ${Math.max(15, Math.round(s * 0.6))}% 88%`);
  document.documentElement.style.setProperty('--accent-50', `${h} ${Math.max(15, Math.round(s * 0.6))}% 95%`);
  document.documentElement.style.setProperty('--primary', `${h} ${s}% ${l}%`);

  document.documentElement.style.setProperty('--highlight-500', `${secH} ${secS}% ${secL}%`);
  document.documentElement.style.setProperty('--secondary', `${secH} ${secS}% ${secL}%`);

  let customCSS = '';
  if (tokens.navbarHex) {
    customCSS += `
      aside, header, .product-sidebar, .product-topbar { background-color: ${tokens.navbarHex} !important; border-color: transparent !important; }
      aside .text-slate-800, aside .text-neutral-900, header .text-slate-800, header .text-neutral-900 { color: #ffffff !important; }
      aside .text-slate-500, aside .text-neutral-500, header .text-slate-500, header .text-neutral-500 { color: rgba(255,255,255,0.7) !important; }
      aside svg, header svg { fill: currentColor; }
    `;
  }
  if (tokens.backgroundHex) {
    customCSS += `
      body, main, .product-shell, .bg-slate-50, .dark .bg-neutral-950 { background-color: ${tokens.backgroundHex} !important; }
    `;
  }
  if (customCSS) {
    const style = document.createElement('style');
    style.id = 'dynamic-brand-styles';
    style.innerHTML = customCSS;
    document.head.appendChild(style);
  }
};

export default {
  namespaced: true,
  state: () => ({
    sidebarCollapsed: false,
    activeThemeMode: localStorage.getItem('theme_mode') || 'light'
  }),
  mutations: {
    TOGGLE_SIDEBAR(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    SET_THEME_MODE(state, mode) {
      state.activeThemeMode = mode;
      localStorage.setItem('theme_mode', mode);
      
      // Update HTML node class list to toggle Tailwind's dark utility selectors
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },
  actions: {
    initializeTheme({ commit, state }) {
      commit('SET_THEME_MODE', state.activeThemeMode);
      try {
        const savedTokens = localStorage.getItem('theme_custom_hsl');
        if (savedTokens) {
          applyThemeTokensToDOM(JSON.parse(savedTokens));
        }
      } catch (e) {
        // ignore parse error
      }
    }
  }
};
