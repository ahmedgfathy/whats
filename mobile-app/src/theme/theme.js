// Theme configuration matching web app design
export const theme = {
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    background: '#0f0f23',
    surface: '#1a1a2e',
    card: '#16213e',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    border: 'rgba(255, 255, 255, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    glass: 'rgba(255, 255, 255, 0.05)',
    glassLight: 'rgba(255, 255, 255, 0.03)',
    gradient: {
      primary: ['#667eea', '#764ba2'],
      secondary: ['#a78bfa', '#c084fc'],
      background: ['#0f0f23', '#1a1a2e'],
      card: ['#16213e', '#1a1a2e'],
    }
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
    arabic: 'System', // Will use system Arabic font
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  layout: {
    screenPadding: 16,
    cardPadding: 16,
    buttonHeight: 48,
    inputHeight: 48,
    headerHeight: 60,
    tabBarHeight: 60,
  }
};

export const propertyColors = {
  apartment: '#667eea',
  villa: '#8b5cf6',
  land: '#10b981',
  office: '#f59e0b',
  warehouse: '#ef4444',
  shop: '#06b6d4',
  default: '#6b7280'
};

export const propertyIcons = {
  apartment: 'home',
  villa: 'home-modern',
  land: 'terrain',
  office: 'office-building',
  warehouse: 'warehouse',
  shop: 'store',
  default: 'home'
};
