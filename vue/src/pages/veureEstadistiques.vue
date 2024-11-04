<template>
    <v-app>
        <Header />

        <v-main>
            <v-container class="mt-10">
                <!-- Selector de tipo de informe -->
                <v-select
                    v-model="tipoSeleccionado"
                    :items="['fechas', 'semanales', 'mensuales']"
                    label="Selecciona el tipo de informe"
                    @change="cargarInformes"
                />

                <!-- Selector de fechas si el tipo es 'fechas' -->
                <v-select
                    v-if="tipoSeleccionado === 'fechas'"
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
                                :src="imagen"
                                height="350px"
                            ></v-img>
                        </v-card>
                    </v-col>
                </v-row>
                <v-alert v-else type="info">Selecciona un tipo de informe y, si es necesario, una fecha.</v-alert>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
export default {
    name: 'Estadistiques',
    data() {
        return {
            tipoSeleccionado: null,
            fechaSeleccionada: null,
            fechas: [],
            imagenes: [],
            informes: {} // Almacena los informes cargados desde el servidor
        };
    },
    created() {
        this.cargarInformes();
    },
    methods: {
        async cargarInformes() {
            try {
                const response = await fetch('http://tr1g7.dam.inspedralbes.cat:21345/listarInformes');
                if (!response.ok) throw new Error("Error al cargar los informes");
                this.informes = await response.json();

                // Extraer fechas como opciones si el tipo de informe es "fechas"
                if (this.tipoSeleccionado === 'fechas') {
                    this.fechas = Object.keys(this.informes.fechas);
                }

                // Cargar imágenes según el tipo seleccionado
                this.actualizarImagenes();
            } catch (error) {
                console.error("Error cargando los informes:", error);
            }
        },
        actualizarImagenes() {
            if (this.tipoSeleccionado === 'fechas' && this.fechaSeleccionada) {
                this.imagenes = (this.informes.fechas[this.fechaSeleccionada] || []).map(
                    img => `http://tr1g7.dam.inspedralbes.cat:21345/informes/${this.fechaSeleccionada}/${img}`
                );
            } else if (this.tipoSeleccionado === 'semanales') {
                this.imagenes = (this.informes.semanales || []).map(
                    img => `http://tr1g7.dam.inspedralbes.cat:21345/informes/semanales/${img}`
                );
            } else if (this.tipoSeleccionado === 'mensuales') {
                this.imagenes = (this.informes.mensuales || []).map(
                    img => `http://tr1g7.dam.inspedralbes.cat:21345/informes/mensuales/${img}`
                );
            } else {
                this.imagenes = [];
            }

            // Imprimir las rutas de las imágenes generadas para depuración
            console.log("Imágenes a mostrar:", this.imagenes);
        }
    },
    watch: {
        tipoSeleccionado() {
            this.fechaSeleccionada = null; // Reiniciar la fecha cuando se cambia el tipo de informe
            this.cargarInformes(); // Volver a cargar los informes
        },
        fechaSeleccionada() {
            this.actualizarImagenes(); // Actualizar las imágenes al cambiar la fecha
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
