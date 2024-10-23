<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Comandes en curs</v-toolbar-title>
      <v-spacer></v-spacer>
      <router-link to="/gestioComandes" style="text-decoration: none; color: white;">
        <v-btn text @click="irAGestioComandes">Gestió Comandes</v-btn>
      </router-link>
      <router-link to="/gestioProductes" style="text-decoration: none; color: white;">
        <v-btn text @click="irAGestioProductes">Gestió Productes</v-btn>
      </router-link>
    </v-app-bar>

    <v-main>
      <v-container class="mt-10">
        <v-row>
          <v-col cols="12" md="6" v-for="producto in productos" :key="producto.product_id">
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
            <p><strong>Estado:</strong> {{ productoSeleccionado.estado || 'No asignado' }}</p>
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
      dialogoActivo: false,
      productoSeleccionado: {},
      url: 'http://localhost:21345/getProductes'
    };
  },
  mounted() {
    this.obtenerProductos();
  },
  methods: {
    async obtenerProductos() {
      try {
        const response = await fetch(this.url);
        if (!response.ok) {
          throw new Error('Error en la respuesta de la red');
        }
        this.productos = await response.json();
        console.log(this.productos);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    },
    aceptarProducto(id) {
      const producto = this.productos.find(p => p.product_id === id);
      if (producto) {
        producto.estado = 'preparación';
        alert(`Producto ${producto.product_name} aceptado y puesto en preparación.`);
      }
    },
    rechazarProducto(id) {
      const producto = this.productos.find(p => p.product_id === id);
      if (producto) {
        producto.estado = 'rechazado';
        alert(`Producto ${producto.product_name} rechazado.`);
      }
    },
    dialogoProducto(producto) {
      this.productoSeleccionado = producto;
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
