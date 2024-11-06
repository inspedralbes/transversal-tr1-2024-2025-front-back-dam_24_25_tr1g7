<template>
    <NavigationDrawer /> 

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
