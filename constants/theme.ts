import { Platform } from 'react-native';

//const tintColorLight = '#0a7ea4';

export const Colors = {
  primary: '#450218',    // Vinho Escuro (Texto/Ícones fortes)
  secondary: '#57021e',  // Vinho Médio
  accent: '#f46c88',     // Rosa Vibrante (Destaques)
  soft: '#f5b7cd',       // Rosa Pastel (Cards/Fundo)
  light: '#ffdbec',      // Rosa Claríssimo (Botões/Destaques leves)
  background: '#f9e9f1', // Oat Milk (Fundo geral que você já usa)
  white: '#FFFFFF',
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});