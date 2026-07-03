export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  controlBackground: string;
  controlActiveBackground: string;
  controlActiveBorder: string;
  cellBackground: string;
  cellDaubedBackground: string;
  cellText: string;
  patternLabel: string;
  previewToggleBackground: string;
  previewToggleBorder: string;
  calledBallsButtonBackground: string;
  calledBallsButtonBorder: string;
  calledBallsButtonText: string;
  windowBoxBackground: string;
  windowBoxBorder: string;
  modalOverlay: string;
  ballCellUncalled: string;
  ballNumberUncalled: string;
  shadow: string;
  statusBarStyle: 'light-content' | 'dark-content';
};

export const lightColors: ThemeColors = {
  background: '#f5f5f5',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  surfaceMuted: '#e0e0e0',
  text: '#222222',
  textSecondary: '#666666',
  textMuted: '#888888',
  border: '#d0d0d0',
  borderLight: '#e0e0e0',
  controlBackground: '#e8e8e8',
  controlActiveBackground: '#D4EDFF',
  controlActiveBorder: '#007AFF',
  cellBackground: '#f0f0f0',
  cellDaubedBackground: '#e6f2ff',
  cellText: '#333333',
  patternLabel: '#2E7D32',
  previewToggleBackground: '#E9F7EC',
  previewToggleBorder: '#B7DEBE',
  calledBallsButtonBackground: '#E6F2FF',
  calledBallsButtonBorder: '#A8CEFF',
  calledBallsButtonText: '#0051A8',
  windowBoxBackground: '#fafafa',
  windowBoxBorder: '#d0d0d0',
  modalOverlay: 'rgba(0, 0, 0, 0.55)',
  ballCellUncalled: '#ECECEC',
  ballNumberUncalled: '#A8A8A8',
  shadow: '#000000',
  statusBarStyle: 'dark-content',
};

export const darkColors: ThemeColors = {
  background: '#121212',
  surface: '#1e1e1e',
  surfaceElevated: '#2c2c2e',
  surfaceMuted: '#3a3a3c',
  text: '#f5f5f5',
  textSecondary: '#a8a8a8',
  textMuted: '#737373',
  border: '#444444',
  borderLight: '#3a3a3c',
  controlBackground: '#3a3a3c',
  controlActiveBackground: '#1a3a5c',
  controlActiveBorder: '#0A84FF',
  cellBackground: '#3a3a3c',
  cellDaubedBackground: '#1a3a5c',
  cellText: '#f5f5f5',
  patternLabel: '#6fcf7a',
  previewToggleBackground: '#1e3a24',
  previewToggleBorder: '#2d5a36',
  calledBallsButtonBackground: '#1a3a5c',
  calledBallsButtonBorder: '#0A84FF',
  calledBallsButtonText: '#64b5ff',
  windowBoxBackground: '#2c2c2e',
  windowBoxBorder: '#444444',
  modalOverlay: 'rgba(0, 0, 0, 0.75)',
  ballCellUncalled: '#3a3a3c',
  ballNumberUncalled: '#666666',
  shadow: '#000000',
  statusBarStyle: 'light-content',
};
