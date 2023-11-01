<template>
  <div class="">
    <div v-if="planning === plannerAreas[0]">
      <PlannerSunHavenFarm/>
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
  "Workshop"
]
const planning = ref(plannerAreas[0])

</script>
