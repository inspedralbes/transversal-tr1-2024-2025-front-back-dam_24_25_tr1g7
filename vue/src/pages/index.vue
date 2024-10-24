<template>
  <v-app>
    <Header />

    <v-main>
      <v-container class="mt-10">
        <v-row>
          <v-col cols="12" md="6" v-for="producto in productosFiltrados" :key="producto.product_id">
            <v-card class="mt-2 d-flex flex-row" @click="dialogoProducto(producto)">
              <div style="flex-basis: 50%;" class="d-flex flex-column justify-center">
                <v-card-title class="text-center">{{ producto.product_name }}</v-card-title>
                <v-card-subtitle class="description text-center"
                  style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; line-clamp: 4; overflow: hidden;">
                  {{ producto.description }}
                </v-card-subtitle>
                <v-card-actions class="d-flex justify-center">
                  <v-btn icon @click.stop="aceptarProducto(producto.product_id)">
                    <v-icon color="green">mdi-check-circle</v-icon>
                  </v-btn>
                  <v-btn icon @click.stop="rechazarProducto(producto.product_id)">
                    <v-icon color="red">mdi-close-circle</v-icon>
                  </v-btn>
                </v-card-actions>
              </div>
              <v-img :src="`/assets/image_${producto.product_id}.jpg`" height="350px" width="50%" class="my-4" />
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-dialog v-model="dialogoActivo" max-width="600px">
        <v-card>
          <v-btn icon @click="dialogoActivo = false" class="ml-auto mt-2 mr-2">
            <v-icon color="grey">mdi-close</v-icon>
          </v-btn>
          <v-img :src="`/assets/image_${productoSeleccionado.product_id}.jpg`" height="350px" width="50%"
            class="my-4 mx-auto" />
          <v-card-title class="text-center">{{ productoSeleccionado.product_name }}</v-card-title>
          <v-card-text class="text-center">
            {{ productoSeleccionado.description }}
          </v-card-text>
          <v-card-text class="text-center">
            <p><strong>Status:</strong> {{ ordenSeleccionada ? ordenSeleccionada.status : 'No asignado' }}</p>
            <p><strong>Total:</strong> {{ ordenSeleccionada ? ordenSeleccionada.total : 'No asignado' }}</p>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      productos: [],
      comandes: [],
      dialogoActivo: false,
      productoSeleccionado: {},
      ordenSeleccionada: null,
      urlProductos: 'http://localhost:21345/getProductes',
      urlComandes: 'http://localhost:21345/getComandes?status=verified'
    };
  },
  computed: {
    productosFiltrados() {
      const productVerified = this.comandes.map(comanda => comanda.product_id);
      return this.productos.filter(producto => productVerified.includes(producto.product_id));
    }
  },
  mounted() {
    this.obtenerProductos();
    this.obtenerComandes();
  },
  methods: {
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
    async obtenerComandes() {
      try {
        const response = await fetch(this.urlComandes);
        if (!response.ok) {
          throw new Error('Error en la respuesta de la red');
        }
        this.comandes = await response.json();
      } catch (error) {
        console.error('Error al obtener comandes:', error);
      }
    },
    async aceptarProducto(id) {
      const producto = this.comandes.find(c => c.product_id === id);
      try {
        const response = await fetch(`http://localhost:21345/confirmed?order_id=${producto.order_id}`, {
          method: 'PUT',
        });
        if (!response.ok) {
          throw new Error('Error al actualizar el estado del producto');
        }
        // Actualiza el estado en la vista
        producto.status = 'confirmed';
        alert(`Producto ${producto.product_name} aceptado y confirmado.`);
      } catch (error) {
        console.error('Error al aceptar producto:', error);
        alert('Error al aceptar producto.');
      }
    }
  },
  async rechazarProducto(id) {
    const producto = this.comandes.find(c => c.product_id === id);
    if (producto) {
      try {
        const response = await fetch(`http://localhost:21345/canceled?order_id=${producto.order_id}`, {
          method: 'PUT',
        });
        if (!response.ok) {
          throw new Error('Error al actualizar el estado del producto');
        }
        producto.status = 'canceled';
        alert(`Producto ${producto.product_name} rechazado.`);
      } catch (error) {
        console.error('Error al rechazar producto:', error);
        alert('Error al rechazar producto.');
      }
    }
  },
  dialogoProducto(producto) {
    this.productoSeleccionado = producto;
    this.ordenSeleccionada = this.comandes.find(comanda => comanda.product_id === producto.product_id) || null;
    this.dialogoActivo = true;
  }
}
</script>

<style scoped>
.description {
  max-width: 100%;
  white-space: normal;
}
</style>
