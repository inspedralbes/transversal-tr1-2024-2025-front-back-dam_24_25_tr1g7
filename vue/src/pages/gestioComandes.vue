<template>
    <v-app>
        <v-app-bar app color="primary" dark>
            <v-toolbar-title>Gestió de comandes</v-toolbar-title>
            <v-spacer></v-spacer>
            <router-link to="/gestioProductes" style="text-decoration: none; color: white;">
                <v-btn text @click="irAGestioProductes">Gestió Productes</v-btn>
            </router-link>
        </v-app-bar>

        <v-main>
            <v-container class="mt-10">
                <v-row>
                    <v-col cols="12" md="6" v-for="comanda in comandesFiltradas" :key="comanda.order_id">
                        <v-card class="mt-2">
                            <v-card-title class="text-center">{{ comanda.product_name }}</v-card-title>
                            <v-card-subtitle class="text-center">{{ comanda.description }}</v-card-subtitle>

                            <v-card-text class="text-center">
                                <strong>Estado:</strong> {{ comanda.status }}<br />
                                <strong>Precio:</strong> {{ comanda.preu }}€<br />
                                <strong>Quantitat:</strong> {{ comanda.quantitat }}<br />
                                <strong>Imatge:</strong>
                                <v-img :src="`/assets/image_${comanda.product_id}.jpg`" height="150px"
                                    class="mx-auto" />
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
export default {
    name: 'gestioComandes',
    data() {
        return {
            comandes: [],
            url: 'http://localhost:21345/getComandes'
        };
    },
    computed: {
        comandesFiltradas() {
            return this.comandes.filter(comanda => comanda.status !== 'waiting');
        }
    },
    mounted() {
        this.obtenerComandes();
    },
    methods: {
        async obtenerComandes() {
            try {
                const response = await fetch(this.url);
                if (!response.ok) {
                    throw new Error('Error en la respuesta de la red');
                }
                this.comandes = await response.json();
                console.log(this.comandes);
            } catch (error) {
                console.error('Error al obtener comandas:', error);
            }
        }

    }
};
</script>

<style scoped>
.description {
    max-width: 100%;
    white-space: normal;
}
</style>
