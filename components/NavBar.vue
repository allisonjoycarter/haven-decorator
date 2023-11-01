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
          <NuxtLink class="py-2 no-underline text-gray-900 dark:text-gray-300" :to="item.route">
            {{ item.name }}
          </NuxtLink>
          
          <div 
            v-if="item.route === currentRoute"
            style="width: 100%; height: 2px;"
            class="transition ease-in-out bg-indigo-700"></div>
        </div>
      </div>
    </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'
  
  const route = useRoute()
  const mainStore = useMainStore()

  const tabs = [
    { route: "/customizer", name: "Customizer" },
    { route: "/planner", name: "Planner" },
    { route: "/about", name: "About" }
  ]
  const currentTab = ref(tabs[0].route)
  const currentRoute = computed(() => route.path)
</script>

<style scoped>
.gallery-container{
  height: 30vh;
  overflow-y: scroll;
}
</style>