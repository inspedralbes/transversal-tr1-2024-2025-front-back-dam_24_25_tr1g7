<template>
  <v-app>
    <NavigationDrawer />
    <v-main>
      <v-container class="mt-10">
        <h1 class="text-h4 mb-6 text-center">{{ TitutoPagina }}</h1>
        <v-row>
          <v-col cols="12" md="6" v-for="producto in productosFiltrados" :key="producto.product_id">
            <v-card class="mt-2 d-flex flex-column">
              <v-img :src="getProductImage(producto)" height="350px" class="align-end mt-4"></v-img>
              <v-card-title class="text-black bg-opacity-50 text-center">
                {{ producto.product_name }}
              </v-card-title>
              <v-card-text class="text-center">
                <p class="description mb-2" style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; line-clamp: 4; overflow: hidden; width: 70%; margin: 0 auto; text-align: center;">
                  {{ producto.description }}
                </p>
                <p><strong>Estado:</strong> {{ getOrderStatus(producto.product_id) }}</p>
                <p><strong>Total:</strong> {{ getOrderTotal(producto.product_id) }}</p>
              </v-card-text>
              <v-card-actions class="justify-center">
                <v-btn color="success" @click="aceptarProducto(producto.product_id)">
                  Confirmar
                </v-btn>
                <v-btn color="error" @click="rechazarProducto(producto.product_id)">
                  Rechazar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { io } from 'socket.io-client';
import NavigationDrawer from '@/components/NavigationDrawer.vue';

export default {
  
  data() {
    return {
      productos: [],
      comandes: [],
      dialogoActivo: false,
      productoSeleccionado: {},
      ordenSeleccionada: null,
      urlBase: 'http://tr1g7.dam.inspedralbes.cat:21345',
      urlProductos: 'http://tr1g7.dam.inspedralbes.cat:21345/getProductes',
      urlComandes: 'http://tr1g7.dam.inspedralbes.cat:21345/getComandes?status=verified',
      socket: null,
    };
  },
  computed: {
    TitutoPagina() {
      switch (this.$route.path) {
        case '/gestioComandes':
          return 'Gestió de Comandes';
        case '/gestioProductes':
          return 'Gestió de Productes';
        case '/veureEstadistiques':
          return 'Estadístiques';
        default:
          return '';
      }
    },
    productosFiltrados() {
      const productVerified = this.comandes
        .filter(comanda => comanda.status === 'verified')
        .map(comanda => comanda.product_id);
      return this.productos.filter(producto => productVerified.includes(producto.product_id));
    }
  },
  mounted() {
    this.conectarSocket();
    this.obtenerProductos();
    this.obtenerComandes();
  },
  methods: {
    conectarSocket() {
      this.socket = io(this.urlBase);
      this.socket.on('connect', () => {
        console.log('Conectado al servidor Socket.IO');
      });
      this.socket.on('cambioEstado', this.actualizarEstadoComanda);
    },
    actualizarEstadoComanda({ order_id, status }) {
      const comanda = this.comandes.find(c => c.order_id === parseInt(order_id));
      if (comanda) {
        comanda.status = status;
        if (status !== 'verified') {
          this.comandes = this.comandes.filter(c => c.order_id !== parseInt(order_id));
        }
      } else if (status === 'verified') {
        this.obtenerNuevaComanda(order_id);
      }
    },
    async obtenerNuevaComanda(order_id) {
      try {
        const response = await fetch(`${this.urlBase}/getComandes?order_id=${order_id}`);
        if (!response.ok) throw new Error('Error al obtener la nueva comanda');
        const nuevaComanda = await response.json();
        if (nuevaComanda.status === 'verified') {
          this.comandes.push(nuevaComanda);
          this.obtenerProductos();
        }
      } catch (error) {
        console.error('Error al obtener nueva comanda:', error);
      }
    },
    async obtenerProductos() {
      try {
        const response = await fetch(this.urlProductos);
        if (!response.ok) throw new Error('Error en la respuesta de la red');
        this.productos = await response.json();
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    },
    async obtenerComandes() {
      try {
        const response = await fetch(this.urlComandes);
        if (!response.ok) throw new Error('Error en la respuesta de la red');
        this.comandes = await response.json();
      } catch (error) {
        console.error('Error al obtener comandes:', error);
      }
    },
    getProductImage(producto) {
      return producto.image_file
        ? `http://dam.inspedralbes.cat:21345/sources/Imatges/${producto.image_file}`
        : `${this.urlBase}/sources/Imatges/imagen_no_disponible.jpg`;
    },
    getOrderStatus(product_id) {
      const orden = this.comandes.find(comanda => comanda.product_id === product_id);
      return orden ? orden.status : 'No asignado';
    },
    getOrderTotal(product_id) {
      const orden = this.comandes.find(comanda => comanda.product_id === product_id);
      return orden ? `${orden.total} €` : 'No asignado';
    },
    async aceptarProducto(id) {
      const producto = this.comandes.find(c => c.product_id === id);
      try {
        const response = await fetch(`${this.urlBase}/confirmed?order_id=${producto.order_id}`, {
          method: 'PUT',
        });
        if (!response.ok) throw new Error('Error al actualizar el estado del producto');
        alert(`Producto ${producto.product_id} aceptado y confirmado.`);
      } catch (error) {
        console.error('Error al aceptar producto:', error);
        alert('Error al aceptar producto.');
      }
    },
    async rechazarProducto(id) {
      const producto = this.comandes.find(c => c.product_id === id);
      if (producto) {
        try {
          const response = await fetch(`${this.urlBase}/canceled?order_id=${producto.order_id}`, {
            method: 'PUT',
          });
          if (!response.ok) throw new Error('Error al actualizar el estado del producto');
          alert(`Producto ${producto.product_id} rechazado.`);
        } catch (error) {
          console.error('Error al rechazar producto:', error);
          alert('Error al rechazar producto.');
        }
      }
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
.v-card {
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
