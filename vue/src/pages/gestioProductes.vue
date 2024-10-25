<template>
  <v-app>
    <Header />

    <v-main>
      <v-container class="mt-10">
        <v-row>
          <v-col cols="12" md="6" v-for="producto in productos" :key="producto.product_id">
            <v-card class="mt-2">
              <v-card-title class="text-center">{{ producto.product_name }}</v-card-title>
              <v-card-subtitle class="text-center">{{ producto.description }}</v-card-subtitle>
              <v-img :src="`http://dam.inspedralbes.cat:21345/sources/Imatges/${producto.image_file}`" height="350px" class="my-4" />
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

        <!-- Diálogo per editar producte -->
        <v-dialog v-model="dialogoEditarActivo" max-width="600px">
          <v-card>
            <v-card-title class="text-center">Editar Producte</v-card-title>
            <v-card-text>
              <v-text-field v-model="productoEditado.product_name" label="Nom del Producte"></v-text-field>
              <v-textarea v-model="productoEditado.description" label="Descripció"></v-textarea>
              <v-text-field v-model="productoEditado.material" label="Material"></v-text-field>
              <v-text-field v-model="productoEditado.price" label="Preu" type="number"></v-text-field>
              <v-text-field v-model="productoEditado.stock" label="Estoc" type="number"></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="guardarCambios">Guardar</v-btn>
              <v-btn color="secondary" @click="dialogoEditarActivo = false">Cancel·lar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Header from '@/components/Header.vue';

export default {
  data() {
    return {
      productos: [],
      productoEditado: null, // Producte que s'està editant
      dialogoEditarActivo: false, // Controla la visibilitat del diàleg d'edició
      url: 'http://dam.inspedralbes.cat:21345/getProductes' // URL de l'API
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
          throw new Error('Error en la resposta de la xarxa');
        }
        this.productos = await response.json();
      } catch (error) {
        console.error('Error en obtenir productes:', error);
      }
    },
    editarProducto(producto) {
      this.productoEditado = { ...producto }; // Clonar el producte seleccionat
      this.dialogoEditarActivo = true;
    },
    async guardarCambios() {
      if (!this.productoEditado.product_id) {
        alert('No es pot actualitzar, ID no trobat.');
        return;
      }
      try {
        const params = new URLSearchParams({
          product_id: this.productoEditado.product_id,
          product_name: this.productoEditado.product_name,
          description: this.productoEditado.description,
          material: this.productoEditado.material,
          price: this.productoEditado.price,
          stock: this.productoEditado.stock
        });

        const response = await fetch(`http://dam.inspedralbes.cat:21345/updateProducte?${params.toString()}`, {
          method: 'PUT',
        });

        if (!response.ok) {
          throw new Error('Error en actualitzar el producte');
        }

        const index = this.productos.findIndex(p => p.product_id === this.productoEditado.product_id);
        if (index !== -1) {
          this.productos.splice(index, 1, this.productoEditado); // Actualitzar el producte a la llista
        }
        this.dialogoEditarActivo = false;
        alert('Producte actualitzat amb èxit');
      } catch (error) {
        console.error('Error al actualitzar producte:', error);
      }
    },
    async eliminarProducto(id) {
      if (confirm('Estàs segur d’eliminar aquest producte?')) {
        try {
          const response = await fetch(`http://dam.inspedralbes.cat:21345/deleteProducte?product_id=${id}`, {
            method: 'DELETE'
          });
          if (!response.ok) {
            throw new Error('Error en eliminar el producte');
          }

          this.productos = this.productos.filter(p => p.product_id !== id);
          alert('Producte eliminat amb èxit');
        } catch (error) {
          console.error('Error en eliminar el producte:', error);
        }
      }
    }
  }
};
</script>

<style scoped>
.mt-10 {
  margin-top: 10px;
}
</style>
