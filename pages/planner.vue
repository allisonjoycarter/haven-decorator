<template>
  <div class="flex flex-col">
    <Notification 
      class="md:hidden"
      notificationId="mobile-planner-unavailable"
      text="This planner is not supported on mobile yet. This is something that could be added in the future, but for now it will not function as expected on small devices."
    />
    <div class="flex flex-row gap-4 ml-4">
      <button class="btn-text" @click="planning = plannerAreas[0]">Sun Haven</button>
      <button class="btn-text" @click="planning = plannerAreas[1]">Nel'Vari</button>
      <button class="btn-text" @click="planning = plannerAreas[2]">Withergate</button>
      <button class="btn-text" @click="planning = plannerAreas[3]">Workshop</button>
    </div>
    <div v-if="planning === plannerAreas[0]">
      <PlannerSunHavenFarm/>
    </div>
    <div v-if="planning === plannerAreas[1]">
      <PlannerNelVariFarm/>
    </div>
    <div v-if="planning === plannerAreas[2]">
      <PlannerBase
        map-name="Withergate Farm"
        :is-farm="true"
        background-image="https://assets.havendecorator.com/decorations/Planner/Maps/WithergateFullFarm.png"
        background-grid-image="https://assets.havendecorator.com/decorations/Planner/Maps/WithergateFullFarmGrid.png"
        :image-height="1212"
        :image-width="1644"
        :grid-offset-top="14"
        :grid-offset-left="-4"
        :vertical-tile-threshold=".9"
        :horizontal-tile-threshold=".35"
      />
    
    </div>
    <div v-if="planning === plannerAreas[3]">
      <PlannerBase
        map-name="Workshop"
        :is-farm="false"
        background-image="https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Maps/WorkshopMap.png"
        background-grid-image="https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Maps/WorkshopMapGrid.png"
        :image-height="624"
        :image-width="985"
        :grid-offset-top="12"
        :grid-offset-left="12"
        :vertical-tile-threshold=".9"
        :horizontal-tile-threshold=".9"
      />
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
  "NelVari Farm",
  "Withergate Farm",
  "Workshop",
]
const planning = ref(plannerAreas[0])

</script>
