<template>
  <div class="flex flex-col">
    <div class="flex flex-row gap-4">
      <button class="btn-text" @click="planning = plannerAreas[0]">Sun Haven</button>
      <button class="btn-text" @click="planning = plannerAreas[1]">Nel'Vari</button>
    </div>
    <div v-if="planning === plannerAreas[0]">
      <PlannerSunHavenFarm/>
    </div>
    <div v-if="planning === plannerAreas[1]">
      <PlannerNelVariFarm/>
    </div>
  </div>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: 'Haven Decorator - Planner',
  ogTitle: 'Haven Decorator - Planner',
  description: 'Test out farm organizations!',
  ogDescription: 'Test out farm organizations!',
  ogImage: 'https://farmdecoratorassets.blob.core.windows.net/decorations/sample_house.png',
  twitterCard: 'summary',
})

const plannerAreas = [
  "Sun Haven Farm",
  "NelVari Farm"
]
const planning = ref(plannerAreas[0])

</script>
