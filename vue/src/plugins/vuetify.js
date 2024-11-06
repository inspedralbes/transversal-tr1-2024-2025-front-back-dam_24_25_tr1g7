/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// Custom theme colors
const customTheme = {
  dark: false, // Usa `true` si prefieres una versión oscura
  colors: {
    background: '#a69279', // Color beige personalizado para el fondo
    surface: '#d1bfa3', // Un tono más claro como fondo para superficies
    primary: '#a69279', // Tono de beige principal
    secondary: '#8c7b6a', // Color beige complementario para un poco de contraste
    error: '#D32F2F', // Color para errores (rojo)
    info: '#2196F3', // Color para información (azul)
    success: '#4CAF50', // Color para éxito (verde)
    warning: '#FFC107', // Color para advertencias (amarillo)
  },
};

// Crear instancia de Vuetify con tema personalizado
export default createVuetify({
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme,
    },
  },
});
