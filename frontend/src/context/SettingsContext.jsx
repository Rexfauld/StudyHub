import { createContext, useContext, useEffect, useState } from 'react';

const SettingsContext = createContext(null);

const DEFAULTS = {
  darkMode:     false,
  fontSize:     'medium',
  fontFamily:   'system',
  compactMode:  false,
  accentColor:  'gold',
  reduceMotion: false,
  highContrast: false,
};

export const FONT_SIZE_MAP    = { small: '13px', medium: '15px', large: '17px', xlarge: '19px' };
export const FONT_FAMILY_MAP  = {
  system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  serif:  "Georgia, 'Times New Roman', serif",
  mono:   "'Courier New', Courier, monospace",
};
export const ACCENT_MAP = {
  gold:  { primary: '#e8b84b', hover: '#c8980a', text: '#1a1a2e', shadow: 'rgba(232,184,75,0.4)' },
  blue:  { primary: '#3b82f6', hover: '#1d4ed8', text: '#ffffff', shadow: 'rgba(59,130,246,0.4)' },
  green: { primary: '#22c55e', hover: '#15803d', text: '#ffffff', shadow: 'rgba(34,197,94,0.4)'  },
  rose:  { primary: '#f43f5e', hover: '#be123c', text: '#ffffff', shadow: 'rgba(244,63,94,0.4)'  },
};

function buildCSS(s) {
  const accent  = ACCENT_MAP[s.accentColor] || ACCENT_MAP.gold;
  const fontSize = FONT_SIZE_MAP[s.fontSize] || '15px';
  const fontFamily = FONT_FAMILY_MAP[s.fontFamily] || FONT_FAMILY_MAP.system;
  const spacing  = s.compactMode ? '12px' : '20px';
  const transition = s.reduceMotion ? '0ms' : '180ms';

  const darkVars = s.darkMode ? `
    --sh-bg:          #0f0f1e;
    --sh-card:        #1a1a2e;
    --sh-text:        #f0f0f0;
    --sh-subtext:     rgba(255,255,255,0.45);
    --sh-border:      rgba(255,255,255,0.08);
    --sh-input-bg:    #0f0f1e;
    --sh-input-border:rgba(255,255,255,0.12);
  ` : `
    --sh-bg:          #f7f7fa;
    --sh-card:        #ffffff;
    --sh-text:        #1a1a2e;
    --sh-subtext:     #888888;
    --sh-border:      #eeeeee;
    --sh-input-bg:    #f7f7fa;
    --sh-input-border:#dddddd;
  `;

  return `
    :root {
      --sh-accent:        ${accent.primary};
      --sh-accent-hover:  ${accent.hover};
      --sh-accent-text:   ${accent.text};
      --sh-accent-shadow: ${accent.shadow};
      --sh-font-size:     ${fontSize};
      --sh-font-family:   ${fontFamily};
      --sh-spacing:       ${spacing};
      --sh-transition:    ${transition};
      ${darkVars}
    }

    /* Apply font globally */
    body, button, input, textarea, select {
      font-family: ${fontFamily} !important;
      font-size: ${fontSize};
      transition: background ${transition}, color ${transition};
    }

    /* Dark mode page background */
    ${s.darkMode ? `
      body { background: #0f0f1e !important; color: #f0f0f0 !important; }
      .sh-page { background: #0f0f1e !important; color: #f0f0f0 !important; }
    ` : `
      body { background: #f7f7fa; color: #1a1a2e; }
    `}

    /* Accent color — applied to all golden gradient elements */
    .sh-accent-bg,
    .year-card, .dept-card, .prog-card,
    .add-btn, .save-btn, .signin-trigger {
      background: linear-gradient(135deg, ${accent.primary}, ${accent.hover}) !important;
      color: ${accent.text} !important;
    }

    /* Accent borders on hover */
    .course-card:hover, .section-card:hover, .file-card:hover {
      border-color: ${accent.primary} !important;
    }

    /* Nav sign-in button */
    .signin-trigger {
      box-shadow: 0 4px 14px ${accent.shadow} !important;
    }

    /* Compact mode — reduce padding on cards */
    ${s.compactMode ? `
      .sh-card { padding: 14px 16px !important; }
      .sh-grid { gap: 10px !important; }
    ` : ''}

    /* Reduce motion */
    ${s.reduceMotion ? `
      *, *::before, *::after {
        animation-duration: 0ms !important;
        transition-duration: 0ms !important;
      }
    ` : ''}

    /* High contrast */
    ${s.highContrast ? `
      body { filter: contrast(1.15); }
    ` : ''}
  `;
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('studyhub_settings');
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch { return DEFAULTS; }
  });

  const update = (key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('studyhub_settings', JSON.stringify(next));
      return next;
    });
  };

  // Inject/update a single <style> tag
  useEffect(() => {
    let tag = document.getElementById('studyhub-settings-css');
    if (!tag) {
      tag = document.createElement('style');
      tag.id = 'studyhub-settings-css';
      document.head.appendChild(tag);
    }
    tag.textContent = buildCSS(settings);
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, update, ACCENT_MAP, FONT_SIZE_MAP, FONT_FAMILY_MAP }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
