<template>
    <v-app>
        <Header />

        <v-main>
            <v-container class="mt-10">
                <!-- Selector de fechas -->
                <v-select
                    v-model="fechaSeleccionada"
                    :items="fechas"
                    label="Selecciona una fecha"
                    @change="cargarInformes"
                />

                <!-- Mostrar gráficos -->
                <v-row v-if="imagenes.length">
                    <v-col cols="12" md="6" v-for="imagen in imagenes" :key="imagen">
                        <v-card>
                            <v-img
                                :src="`http://dam.inspedralbes.cat:21345/informes/${fechaSeleccionada}/${imagen}`"
                                height="350px"
                            ></v-img>
                        </v-card>
                    </v-col>
                </v-row>
                <v-alert v-else type="info">Selecciona una fecha para ver los informes.</v-alert>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
export default {
    name: 'Estadistiques',
    data() {
        return {
            fechaSeleccionada: null,
            fechas: [],
            imagenes: [],
            informes: {} // Almacena los informes cargados desde el servidor
        };
    },
    created() {
        this.cargarFechas();
    },
    methods: {
        async cargarFechas() {
        try {
            const response = await fetch('http://dam.inspedralbes.cat:21345/listarInformes');
            if (!response.ok) throw new Error("Error al cargar las fechas");
            this.informes = await response.json();
            this.fechas = Object.keys(this.informes); // Obtener las fechas desde los nombres de las carpetas
        } catch (error) {
            console.error("Error cargando las fechas:", error);
        }
    },
    cargarInformes() {
        if (!this.fechaSeleccionada) return;

        // Cargar las imágenes según la fecha seleccionada
        this.imagenes = this.informes[this.fechaSeleccionada] || [];
        this.imagenes = this.imagenes.map(imagen => `http://dam.inspedralbes.cat:21345/informes/${this.fechaSeleccionada}/${imagen}`);
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
