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
                            <v-img :src="getImageSrc(comanda.product_id)" height="350px" width="50%"
                                class="my-4 mx-auto" />
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>

            <v-dialog v-model="dialogoActivo" max-width="600px">
                <v-card>
                    <v-btn icon @click="dialogoActivo = false" class="ml-auto mt-2 mr-2">
                        <v-icon color="grey">mdi-close</v-icon>
                    </v-btn>
                    <v-img :src="getImageSrc(comandaSeleccionada.product_id)" height="350px" width="50%"
                        class="my-2 mx-auto" />
                    <v-card-text class="text-center">
                        {{ comandaSeleccionada.description }}
                    </v-card-text>
                    <v-card-text class="text-center">
                        <strong>Estado:</strong>
                        <v-select v-model="nuevoEstado" :items="estados" label="Cambiar estado" />
                        <br />
                        <strong>Precio:</strong> {{ comandaSeleccionada.total }}€<br />
                    </v-card-text>
                    <v-card-text class="text-center">
                        <strong>{{ productoSeleccionado.product_name }}</strong><br />
                        <strong>Descripción:</strong> {{ productoSeleccionado.description }}<br />
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn color="primary" @click="cambiarEstado(comandaSeleccionada.order_id, nuevoEstado)">
                            Cambiar Estado
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-main>
    </v-app>
</template>

<script>
import { io } from 'socket.io-client';

export default {
    name: 'gestioComandes',
    data() {
        return {
            comandes: [],
            productos: [],
            dialogoActivo: false,
            comandaSeleccionada: {},
            productoSeleccionado: {},
            nuevoEstado: '',
            estados: ['waiting', 'pending', 'shipped', 'verified', 'confirmed', 'canceled'],
            urlBase: 'http://tr1g7.dam.inspedralbes.cat:21345',
            urlComandes: 'http://tr1g7.dam.inspedralbes.cat:21345/getComandes',
            urlProductos: 'http://tr1g7.dam.inspedralbes.cat:21345/getProductes',
            mensaje: '',
            socket: null,
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
        this.conectarSocket();
    },
    methods: {
        conectarSocket() {
            this.socket = io(this.urlBase);
            this.socket.on('connect', () => {
                console.log('Conectado al servidor Socket.IO');
            });
            this.socket.on('cambioEstado', this.actualizarEstadoComanda);
            this.socket.on('stockActualizado', this.actualizarStockProducto);
        },
        actualizarStockProducto({ product_id, stock }) {
            const producto = this.productos.find(p => p.product_id === product_id);
            if (producto) {
                producto.stock = stock;
                console.log(`Stock actualizado para producto ${product_id}: ${stock}`);
            }
        },
        eliminarComanda(order_id) {
            this.comandes = this.comandes.filter(c => c.order_id !== parseInt(order_id));
            this.obtenerProductos();
        },
        actualizarEstadoComanda({ order_id, status }) {
            console.log('Actualizando estado de comanda:', order_id, status);
            const comanda = this.comandes.find(c => c.order_id === parseInt(order_id));
            if (comanda) {
                comanda.status = status;
                this.$forceUpdate(); // Forzar a Vue a re-renderizar
            } else {
                console.warn(`Comanda con id ${order_id} no encontrada`);
                // Opcionalmente, podrías recargar todas las comandas aquí
                this.obtenerComandes();
            }
        },
        agregarNuevaComanda(nuevaComanda) {
            console.log('Nueva comanda recibida:', nuevaComanda);
            this.comandes.push(nuevaComanda);
            this.$forceUpdate(); // Forzar a Vue a re-renderizar
        },
        async obtenerDetallesProducto(productId) {
            try {
                const response = await fetch(`${this.urlProductos}?product_id=${productId}`);
                if (!response.ok) {
                    throw new Error('Error en la respuesta de la red');
                }
                const producto = await response.json();
                if (!this.productos.some(p => p.product_id === producto.product_id)) {
                    this.productos.push(producto);
                }
            } catch (error) {
                console.error('Error al obtener detalles del producto:', error);
            }
        },
        async obtenerComandes() {
            try {
                const response = await fetch(this.urlComandes);
                if (!response.ok) {
                    throw new Error('Error en la respuesta de la red');
                }
                this.comandes = await response.json();
                console.log('Comandes obtenidas:', this.comandes);
            } catch (error) {
                console.error('Error al obtener comandes:', error);
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
                this.mensaje = 'Error al obtener productos.';
            }
        },
        async cambiarEstado(order_id, nuevoEstado) {
            try {
                console.log(`Cambiando estado de la comanda ${order_id} a ${nuevoEstado}`);
                const response = await fetch(`${this.urlBase}/confirmed?order_id=${order_id}`, {
                    method: 'PUT'
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Error al actualizar el estado');
                }
                const data = await response.json();
                console.log(`Respuesta del servidor:`, data);

                // La actualización local se maneja en el método actualizarEstadoComanda
                this.dialogoActivo = false;
            } catch (error) {
                console.error('Error al cambiar el estado de la comanda:', error);
                alert(`Error al cambiar el estado: ${error.message}`);
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
        getImageSrc(productId) {
            const producto = this.productos.find(p => p.product_id === productId);
            return producto
                ? `${this.urlBase}/sources/Imatges/${producto.image_file}`
                : `${this.urlBase}/sources/Imatges/imagen_no_disponible.jpg`;
        },
        dialogoComanda(comanda) {
            this.comandaSeleccionada = comanda;
            this.productoSeleccionado = this.productos.find(producto => producto.product_id === comanda.product_id) || {};
            this.nuevoEstado = comanda.status;
            this.dialogoActivo = true;
        }
    },
    beforeUnmount() {
        if (this.socket) {
            this.socket.disconnect();
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