<template>
    <v-navigation-drawer app permanent color="#4F7942">
      <v-list-item @click="goToRoute('/')">
        <v-list-item-content>
          <v-list-item-title class="title">Panel de Control</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
  
      <v-divider></v-divider>
  
      <v-list dense>
        <v-list-item @click="goToRoute('/gestioComandes')">
          <v-list-item-icon>
            <v-icon>mdi-format-list-checks</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Gestió Comandes</v-list-item-title>
        </v-list-item>
  
        <v-list-item @click="goToRoute('/gestioProductes')">
          <v-list-item-icon>
            <v-icon>mdi-package-variant</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Gestió Productes</v-list-item-title>
        </v-list-item>
  
        <v-list-item @click="goToRoute('/veureEstadistiques')">
          <v-list-item-icon>
            <v-icon>mdi-chart-bar</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Estadístiques</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </template>
  
  <script>
  export default {
    data() {
      return {
        drawer: true, 
      };
    },
    methods: {
      goToRoute(route) {
        this.$router.push(route); 
      }
    }
  };
  </script>
  
  <style scoped>
  .title {
    font-weight: bold;
  }
  </style>
  