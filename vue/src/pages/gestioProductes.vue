<template>
  <v-app>
    <NavigationDrawer />

    <v-main>

      <v-container class="mt-10">
        <v-row>
          <v-col cols="12" md="6" v-for="producto in productos" :key="producto.product_id">
            <v-card class="mt-2">
              <v-card-title class="text-center">{{ producto.product_name }}</v-card-title>
              <v-card-subtitle class="text-center">{{ producto.description }}</v-card-subtitle>
              <v-card-text class="text-center">
                <strong>Stock:</strong> {{ producto.stock }}
              </v-card-text>
              <v-img :src="`http://dam.inspedralbes.cat:21345/sources/Imatges/${producto.image_file}`" height="350px"
                class="my-4" />
              <v-card-actions class="d-flex justify-center">
                <v-btn icon @click="editarProducto(producto)">
                  <v-icon color="blue">mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon @click="eliminarProducto(producto.product_id)">
                  <v-icon color="red">mdi-delete</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-dialog v-model="dialogoEditarActivo" max-width="600px">
          <v-card v-if="productoEditado">
            <v-card-title class="text-center">Editar Producte</v-card-title>
            <v-card-text>
              <v-text-field v-model="productoEditado.product_name" label="Nom del Producte"></v-text-field>
              <v-textarea v-model="productoEditado.description" label="Descripció"></v-textarea>
              <v-text-field v-model="productoEditado.material" label="Material"></v-text-field>
              <v-text-field v-model.number="productoEditado.price" label="Preu" type="number"></v-text-field>
              <v-text-field v-model.number="productoEditado.stock" label="Estoc" type="number"></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="guardarCambios">Guardar</v-btn>
              <v-btn color="secondary" @click="cerrarDialogoEditar">Cancel·lar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Header from '@/components/Header.vue';
import { io } from 'socket.io-client';

export default {
  components: {
    Header
  },
  data() {
    return {
      productos: [],
      productoEditado: null,
      dialogoEditarActivo: false,
      urlBase: 'http://tr1g7.dam.inspedralbes.cat:21345',
      urlProductos: 'http://tr1g7.dam.inspedralbes.cat:21345/getProductes',
      socket: null
    };
  },
  mounted() {
    this.obtenerProductos();
    this.conectarSocket();
  },
  methods: {
    conectarSocket() {
      this.socket = io(this.urlBase);
      this.socket.on('connect', () => {
        console.log('Conectado al servidor Socket.IO');
      });
      this.socket.on('stockActualizado', this.manejarActualizacionStock);
      this.socket.on('nuevoProducto', this.agregarNuevoProducto);
      this.socket.on('productoEliminado', this.eliminarProductoLocal);
    },
    manejarActualizacionStock({ product_id, stock }) {
      console.log('Stock actualizado:', product_id, stock);
      const producto = this.productos.find(p => p.product_id === parseInt(product_id));
      if (producto) {
        producto.stock = parseInt(stock);
        this.$forceUpdate(); // Force Vue to re-render
      } else {
        console.warn(`Producto con id ${product_id} no encontrado`);
        // Opcionalmente, podrías recargar todos los productos aquí
        this.obtenerProductos();
      }
    },
    agregarNuevoProducto(producto) {
      console.log('Nuevo producto recibido:', producto);
      this.productos.push(producto);
      this.$forceUpdate(); // Force Vue to re-render
    },
    eliminarProductoLocal(productId) {
      this.productos = this.productos.filter(p => p.product_id !== parseInt(productId));
      this.$forceUpdate(); // Force Vue to re-render
    },
    async obtenerProductos() {
      try {
        const response = await fetch(this.urlProductos);
        if (!response.ok) {
          throw new Error('Error en la respuesta de la red');
        }
        this.productos = await response.json();
        console.log('Productos obtenidos:', this.productos);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    },
    editarProducto(producto) {
      this.productoEditado = JSON.parse(JSON.stringify(producto));
      console.log('Producto a editar:', this.productoEditado);
      this.dialogoEditarActivo = true;
    },
    async guardarCambios() {
      if (!this.productoEditado || !this.productoEditado.product_id) {
        alert('No es pot actualitzar, ID no trobat.');
        return;
      }
      console.log('Producto a guardar:', this.productoEditado);
      try {
        const params = new URLSearchParams({
          product_id: this.productoEditado.product_id,
          product_name: this.productoEditado.product_name,
          description: this.productoEditado.description,
          material: this.productoEditado.material,
          price: this.productoEditado.price,
          stock: this.productoEditado.stock
        });

        const response = await fetch(`${this.urlBase}/updateProducte?${params.toString()}`, {
          method: 'PUT',
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error en actualitzar el producte: ${errorText}`);
        }

        const updatedProduct = await response.json();
        console.log('Respuesta del servidor:', updatedProduct);

        const index = this.productos.findIndex(p => p.product_id === this.productoEditado.product_id);
        if (index !== -1) {
          this.productos.splice(index, 1, updatedProduct);
        } else {
          console.warn('Producto no encontrado en la lista local');
        }

        this.$forceUpdate();
        this.cerrarDialogoEditar();
        alert('Producte actualitzat amb èxit');
      } catch (error) {
        console.error('Error al actualitzar producte:', error);
        alert(`Error al actualitzar producte: ${error.message}`);
      }
    },
    async eliminarProducto(id) {
      if (confirm('Estàs segur d´eliminar aquest producte?')) {
        try {
          const response = await fetch(`${this.urlBase}/deleteProducte?product_id=${id}`, {
            method: 'DELETE'
          });
          if (!response.ok) {
            throw new Error('Error en eliminar el producte');
          }
          alert('Producte eliminat amb èxit');
        } catch (error) {
          console.error('Error en eliminar el producte:', error);
          alert(`Error en eliminar el producte: ${error.message}`);
        }
      }
    },
    cerrarDialogoEditar() {
      this.dialogoEditarActivo = false;
      this.productoEditado = null;
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
.mt-10 {
  margin-top: 10px;
}
</style>