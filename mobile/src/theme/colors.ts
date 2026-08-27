export const colors = {
  background: '#F8FAFC',       // Clean modern slate background
  surface: '#FFFFFF',          // Pure crisp white card background
  surfaceSecondary: '#F1F5F9', // Subtle secondary container
  border: '#E2E8F0',           // Crisp divider border
  borderLight: '#F1F5F9',      // Very subtle card border
  
  // Typography
  textPrimary: '#0F172A',      // Slate-900 high contrast primary text
  textSecondary: '#64748B',    // Slate-500 muted secondary text
  textTertiary: '#94A3B8',     // Slate-400 placeholder text
  
  // Status & Brand
  primary: '#2563EB',          // Royal Blue
  primaryLight: '#EFF6FF',     // Soft Blue pill background
  
  success: '#10B981',          // Emerald Green for Live status & new badge
  successLight: '#ECFDF5',     // Soft emerald tint
  
  warning: '#F59E0B',          // Amber for reconnecting
  warningLight: '#FFFBEB',
  
  danger: '#EF4444',           // Coral Red for disconnected
  dangerLight: '#FEF2F2',

  metaBlue: '#1877F2',         // Meta Brand Blue
  metaBlueLight: '#EBF5FF',
};

export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
};
