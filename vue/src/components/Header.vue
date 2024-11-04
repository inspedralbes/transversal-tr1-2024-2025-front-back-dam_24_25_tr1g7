<template>
  <v-app-bar app color="primary" dark>
    <router-link to="/" style="text-decoration: none; color: white; margin-left: 16px;">
      <v-toolbar-title>{{ getPageTitle }}</v-toolbar-title>
    </router-link>
    <v-spacer></v-spacer>
    <router-link to="/gestioComandes" style="text-decoration: none; color: white;">
      <v-btn text @click="irAGestioComandes">Gestió Comandes</v-btn>
    </router-link>
    <router-link to="/gestioProductes" style="text-decoration: none; color: white;">
      <v-btn text @click="irAGestioProductes">Gestió Productes</v-btn>
    </router-link>
    <router-link to="/veureEstadistiques" style="text-decoration: none; color: white;">
      <v-btn text @click="irAVeureEstadistiques">Estadístiques</v-btn>
    </router-link>
  </v-app-bar>
</template>

<script>
export default {
  name: 'Header',
  computed: {
    getPageTitle() {
      switch (this.$route.path) {
        case '/':
          return 'Comandes en curs';
        case '/gestioComandes':
          return 'Gestió de Comandes';
        case '/gestioProductes':
          return 'Gestió de Productes';
        case '/veureEstadistiques':
          return 'Estadístiques';
        default:
          return 'Aplicació';
      }
    }
  },
  methods: {
    irAGestioComandes() {
      this.$router.push('/gestioComandes');
    },
    irAGestioProductes() {
      this.$router.push('/gestioProductes');
    },
    irAVeureEstadistiques() {
      this.$router.push('/veureEstadistiques');
    }
  }
};
</script>

<style scoped></style>

  