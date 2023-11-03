<template>
  <div class="py-3">
      <h1 class="px-4 text-lg font-bold">Sun Haven Customizations</h1>
      <div
        class="px-4 flex"
      >
        <div
          v-for="item in tabs"
          class="mx-2"
        >
          <NuxtLink 
            :class="{
              'py-2 no-underline  font-semibold': true,
              'text-indigo-800 dark:text-indigo-200': item.route === currentRoute,
              'text-gray-900 dark:text-gray-300': item.route !== currentRoute
            }" :to="item.route">
            {{ item.name }}
          </NuxtLink>
          
          <div 
            style="width: 100%; height: 2px;"
            :class="{
              'transition-colors ease-in-out': true,
              'bg-transparent': item.route !== currentRoute,
              'bg-indigo-700': item.route === currentRoute,
            }"></div>
        </div>
      </div>
    </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'
  
  const route = useRoute()

  const tabs = [
    { route: "/customizer", name: "Customizer" },
    { route: "/planner", name: "Planner" },
    { route: "/about", name: "About" }
  ]
  const currentRoute = computed(() => route.path)
</script>

<style scoped>
.gallery-container{
  height: 30vh;
  overflow-y: scroll;
}
</style>