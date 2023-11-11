<template>
  <div class="flex flex-col">
    <PlannerNav />
    <PlannerBase
      map-name="Withergate Farm"
      :is-farm="true"
      background-image="https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Maps/WithergateFullFarm.png"
      background-grid-image="https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Maps/WithergateFullFarmGrid.png"
      :image-height="1212"
      :image-width="1644"
      :grid-offset-top="14"
      :grid-offset-left="-4"
      :vertical-tile-threshold=".9"
      :horizontal-tile-threshold=".35"
      :bounds="boundsData"
      @go-to-map="goToPlannerArea"
    />
  </div>
</template>

<script lang="ts" setup>
import boundJson from "~/assets/planner_bounds/Withergate Farm_bounds.json"

const boundsData = computed(() => boundJson.tileData)

function goToPlannerArea(mapName: string) {
  navigateTo('/planner/' + mapName.toLowerCase().replaceAll(" ", "-").replace("'", ""))
}
</script>
