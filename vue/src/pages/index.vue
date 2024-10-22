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
          <v-col cols="12" md="6" v-for="producto in productos" :key="producto.id">
            <v-card class="mt-2 d-flex flex-row" @click="dialogoProducto(producto)">
              <div style="flex-basis: 50%;" class="d-flex flex-column justify-center">
                <v-card-title class="text-center">{{ producto.nombre }}</v-card-title>
                <v-card-subtitle class="description text-center" 
                  style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; line-clamp: 4; overflow: hidden;">
                  {{ producto.descripcion }}
                </v-card-subtitle>
                <v-card-actions class="d-flex justify-center">
                  <v-btn icon @click.stop="aceptarProducto(producto.id)">
                    <v-icon color="green">mdi-check-circle</v-icon>
                  </v-btn>
                  <v-btn icon @click.stop="rechazarProducto(producto.id)">
                    <v-icon color="red">mdi-close-circle</v-icon>
                  </v-btn>
                </v-card-actions>
              </div>
              <v-img :src="producto.imagen" height="350px" width="50%" class="my-4" />
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-dialog v-model="dialogoActivo" max-width="600px">
        <v-card>
          <v-btn icon @click="dialogoActivo = false" class="ml-auto mt-2 mr-2">
            <v-icon color="grey">mdi-close</v-icon>
          </v-btn>

          <v-img :src="productoSeleccionado.imagen" height="350px" class="my-4" />

          <v-card-title class="text-center">{{ productoSeleccionado.nombre }}</v-card-title>

          <v-card-text class="text-center">
            {{ productoSeleccionado.descripcion }}
          </v-card-text>

          <v-card-text class="text-center">
            <p><strong>Estado:</strong> {{ productoSeleccionado.estado }}</p>
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
      productos: [
        {
          id: 1,
          nombre: 'Skogsvärdet (The Forest Blade)',
          descripcion: 'Straight from the heart of the Scandinavian wilderness, the Skogsvärdet is no ordinary stick—this moss-covered marvel is shaped like a sword and is said to have once been wielded by forest guardians in ancient times. The moss isn’t just for show; it provides a natural camouflage, making this weapon perfect for stealthy operations in the dense underbrush. Legend has it that the sword’s form was carved by nature itself, and it holds the power of the forest, ready to be unleashed by a worthy warrior.',
          imagen: './assets/Skogsvärdet.png',
          estado: 'nueva'
        },
        {
          id: 2,
          nombre: 'Hammer of the Old Three',
          descripcion: "Forged in the heart of the ancient forests, the Hammer of the Old Three carries with it the essence of nature's raw power. This massive wooden hammer is imbued with the blessings of three powerful nature spirits: the Bear, the Oak, and the Mountain. Its sturdy wooden frame hums with an ancient resonance, and when wielded, it feels almost alive, responding to the user's strength and intent. The Hammer of the Old Three is said to have been gifted by the guardians of an ancient forest to a long-forgotten hero. The spirits of the forest dwell within the hammer, granting strength and healing to those who fight in the name of nature. Sin embargo, solo aquellos con una profunda conexión con el mundo natural pueden desbloquear su potencial.",
          imagen: './assets/hammer.png',
          estado: 'nueva'
        },
        {
          id: 3,
          nombre: 'Cadira NPC',
          descripcion: 'És una cadira que no fa res.',
          imagen: './assets/Cadira-NPC.png',
          estado: 'nueva'
        }
      ],
      dialogoActivo: false,
      productoSeleccionado: {}
    };
  },
  methods: {
    aceptarProducto(id) {
      const producto = this.productos.find(p => p.id === id);
      if (producto) {
        producto.estado = 'preparación';
        alert(`Producto ${producto.nombre} aceptado y puesto en preparación.`);
      }
    },
    rechazarProducto(id) {
      const producto = this.productos.find(p => p.id === id);
      if (producto) {
        producto.estado = 'rechazado';
        alert(`Producto ${producto.nombre} rechazado.`);
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
