<template>
  <nav>
    <router-link to="/gestioProductes">Gestio de Productes</router-link>
    <router-link to="/gestioComandes">Gestio de Comandes</router-link>

    <router-view />

    <div>
      <h1>Comandes en curs</h1>
    </div>
  </nav>
</template>

<script setup>
  //
</script>
