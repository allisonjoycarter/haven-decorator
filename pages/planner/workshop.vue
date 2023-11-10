<template>
  <div class="flex flex-col">
    <PlannerNav />
    <PlannerBase
      map-name="Workshop"
      :is-farm="false"
      background-image="https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Maps/WorkshopMap.png"
      background-grid-image="https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Maps/WorkshopMapGrid.png"
      :image-height="429"
      :image-width="659"
      :grid-offset-top="0"
      :grid-offset-left="4"
      :vertical-tile-threshold=".4"
      :horizontal-tile-threshold=".5"
      @go-to-map="goToPlannerArea"
    />
  </div>
</template>

<script lang="ts" setup>

function goToPlannerArea(mapName: string) {
  navigateTo('/planner/' + mapName.toLowerCase().replaceAll(" ", "-").replace("'", ""))
}

</script>
