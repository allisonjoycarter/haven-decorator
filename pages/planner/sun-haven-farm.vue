<template>
  <div class="flex flex-col">
    <PlannerNav />
    <PlannerBase
      map-name="Sun Haven Farm"
      :is-farm="true"
      background-image="https://farmdecoratorassets.blob.core.windows.net/decorations/sun_haven_farm_smaller.png"
      background-grid-image="https://farmdecoratorassets.blob.core.windows.net/decorations/sun_haven_farm_smaller_grid.png"
      :image-height="2008"
      :image-width="1868"
      :grid-offset-top="1"
      :grid-offset-left="7"
      :vertical-tile-threshold=".7"
      :horizontal-tile-threshold=".9"
      :bounds="boundsData"
      @go-to-map="goToPlannerArea"
    />
  </div>
</template>

<script lang="ts" setup>
import boundJson from "~/assets/planner_bounds/Sun Haven Farm_bounds.json"

const boundsData = computed(() => boundJson.tileData)

function goToPlannerArea(mapName: string) {
  navigateTo('/planner/' + mapName.toLowerCase().replaceAll(" ", "-").replace("'", ""))
}


</script>
