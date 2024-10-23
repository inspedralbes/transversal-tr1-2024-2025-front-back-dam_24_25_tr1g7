<template>
    <v-app>
        <v-app-bar app color="primary" dark>
            <v-toolbar-title>Gestió de comandes</v-toolbar-title>
            <v-spacer></v-spacer>
            <router-link to="/gestioComandes" style="text-decoration: none; color: white;">
                <v-btn text @click="irAGestioComandes">Gestió Comandes</v-btn>
            </router-link>
            <router-link to="/gestioProductes" style="text-decoration: none; color: white;">
                <v-btn text @click="irAGestioProductes">Gestió Productes</v-btn>
            </router-link>
        </v-app-bar>
    </v-app>
</template>

<script>
export default {
    name: 'gestioComandes'
}
</script>

<style></style>