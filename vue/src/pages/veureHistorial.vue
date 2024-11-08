<template>
    <v-app>
      <NavigationDrawer />
  
      <v-main>
        <v-container class="mt-10">
          <v-btn @click="cargarHistorial" color="primary">Cargar Historial</v-btn>
  
          <v-row v-if="historial">
            <v-col cols="12">
              <v-card>
                <v-card-title>Historial de Comandas</v-card-title>
                <v-card-text>
                  <pre>{{ JSON.stringify(historial, null, 2) }}</pre>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
  
          <v-alert v-else type="info">Haz clic en "Cargar Historial" para ver los datos.</v-alert>
        </v-container>
      </v-main>
    </v-app>
  </template>
  
  <script>
  import NavigationDrawer from '@/components/NavigationDrawer.vue';
  
  export default {
    name: 'Historial',
    data() {
      return {
        historial: null
      };
    },
    methods: {
      async cargarHistorial() {
        try {
          const response = await fetch('http://tr1g7.dam.inspedralbes.cat:21345/getHistorial');
          if (!response.ok) throw new Error('Error al cargar el historial');
          this.historial = await response.json();
        } catch (error) {
          console.error('Error cargando el historial:', error);
          this.historial = { error: 'No se pudo cargar el historial' };
        }
      }
    }
  };
  </script>
  
  <style scoped>
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 5px;
  }
  </style>
  