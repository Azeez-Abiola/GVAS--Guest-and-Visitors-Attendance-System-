/**
 * GVAS Design System
 * Consistent colors, spacing, and component styles across the application
 */

export const colors = {
  // Primary Brand Colors - Slate (matches sidebar bg-slate-900)
  primary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',  // Main dark color matching sidebar
  },
  
  // Neutral/Gray Scale
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Success
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  
  // Warning
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
  },
  
  // Error
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
  },
  
  // Info
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7',
  }
};

export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'Menlo, Monaco, Courier New, monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const components = {
  button: {
    primary: `
      bg-blue-600 hover:bg-blue-700 
      text-white font-semibold
      px-6 py-3 rounded-lg
      shadow-md hover:shadow-lg
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    secondary: `
      bg-white hover:bg-gray-50 
      text-gray-700 font-semibold
      px-6 py-3 rounded-lg
      border-2 border-gray-300
      shadow-sm hover:shadow-md
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
  },
  input: `
    w-full px-4 py-3 
    bg-white border-2 border-gray-200
    rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    transition-all duration-200
    text-gray-900 placeholder:text-gray-400
  `,
  select: `
    w-full px-4 py-3 
    bg-white border-2 border-gray-200
    rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    transition-all duration-200
    text-gray-900
  `,
  card: `
    bg-white rounded-xl shadow-sm border border-gray-100
    p-6
  `,
  modal: {
    overlay: `
      fixed inset-0 bg-black/50 backdrop-blur-sm
      flex items-center justify-center
      z-50 p-4
    `,
    panel: `
      bg-white rounded-2xl shadow-2xl
      max-w-2xl w-full
      max-h-[90vh] overflow-y-auto
    `,
    header: `
      bg-gradient-to-r from-blue-600 to-blue-700
      text-white px-8 py-6 rounded-t-2xl
    `,
    body: `
      px-8 py-6
    `,
    footer: `
      px-8 py-6 border-t-2 border-gray-100
      flex justify-end gap-3
    `,
  },
};
