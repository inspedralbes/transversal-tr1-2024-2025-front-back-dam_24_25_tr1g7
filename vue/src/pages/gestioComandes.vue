<template>
    <v-app>
        <Header />

        <v-main>
            <v-container class="mt-10">
                <v-row>
                    <v-col cols="12" md="6" v-for="comanda in comandesFiltradas" :key="comanda.order_id">
                        <v-card class="mt-2" @click="dialogoComanda(comanda)">
                            <div style="flex-basis: 50%;" class="d-flex flex-column justify-center">
                                <v-card-text class="text-center">
                                    <strong>Estado:</strong> {{ comanda.status }}<br />
                                    <strong>Precio:</strong> {{ comanda.total }}€<br />
                                </v-card-text>
                                <v-card-text class="text-center">
                                    <strong>{{ getName(comanda.product_id) }}</strong><br />
                                    <v-card-subtitle class="description text-center my-2"
                                        style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; line-clamp: 4; overflow: hidden;">
                                        <strong>Descripción:</strong> {{ getDescription(comanda.product_id) }}
                                    </v-card-subtitle>
                                </v-card-text>
                            </div>
                            <v-img :src="`http://dam.inspedralbes.cat:21345/sources/Imatges/${getImageFile(comanda.product_id)}`"
                                height="350px" width="50%" class="my-4 mx-auto" />
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>

            <v-dialog v-model="dialogoActivo" max-width="600px">
                <v-card>
                    <v-btn icon @click="dialogoActivo = false" class="ml-auto mt-2 mr-2">
                        <v-icon color="grey">mdi-close</v-icon>
                    </v-btn>
                    <v-img :src="`http://dam.inspedralbes.cat:21345/sources/Imatges/${getImageFile(comanda.product_id)}`"
                        height="350px" width="50%" class="my-2 mx-auto" />
                    <v-card-text class="text-center">
                        {{ comandaSeleccionada.description }}
                    </v-card-text>
                    <v-card-text class="text-center">
                        <strong>Estado:</strong> {{ comandaSeleccionada.status }}<br />
                        <strong>Precio:</strong> {{ comandaSeleccionada.total }}€<br />
                    </v-card-text>
                    <v-card-text class="text-center">
                        <strong>{{ productoSeleccionado.product_name }}</strong><br />
                        <strong>Descripción:</strong> {{ productoSeleccionado.description }}<br />
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-main>
    </v-app>
</template>

<script>
export default {
    name: 'gestioComandes',
    data() {
        return {
            comandes: [],
            productos: [],
            dialogoActivo: false,
            comandaSeleccionada: {},
            productoSeleccionado: {},
            urlComandes: 'http://dam.inspedralbes.cat:21345/getComandes',
            urlProductos: 'http://dam.inspedralbes.cat:21345/getProductes'
        };
    },
    computed: {
        comandesFiltradas() {
            return this.comandes.filter(comanda => comanda.status !== 'verified');
        }
    },
    mounted() {
        this.obtenerComandes();
        this.obtenerProductos();
    },
    methods: {
        async obtenerComandes() {
            try {
                const response = await fetch(this.urlComandes);
                if (!response.ok) {
                    throw new Error('Error en la respuesta de la red');
                }
                this.comandes = await response.json();
            } catch (error) {
                console.error('Error al obtener comandas:', error);
            }
        },
        async obtenerProductos() {
            try {
                const response = await fetch(this.urlProductos);
                if (!response.ok) {
                    throw new Error('Error en la respuesta de la red');
                }
                this.productos = await response.json();
            } catch (error) {
                console.error('Error al obtener productos:', error);
            }
        },
        getDescription(productId) {
            const producto = this.productos.find(p => p.product_id === productId);
            return producto ? producto.description : 'Descripción no disponible';
        },
        getName(productId) {
            const producto = this.productos.find(p => p.product_id === productId);
            return producto ? producto.product_name : 'Nom no disponible';
        },
        getImageFile(productId) {
            const producto = this.productos.find(p => p.product_id === productId);
            return producto ? producto.image_file : 'imagen_no_disponible.jpg';
        },
        dialogoComanda(comanda) {
            this.comandaSeleccionada = comanda;
            this.productoSeleccionado = this.productos.find(producto => producto.product_id === comanda.product_id) || {};
            this.dialogoActivo = true;
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