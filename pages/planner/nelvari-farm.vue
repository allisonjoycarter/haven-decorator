<template>
  <div class="flex flex-col">
    <PlannerNav />
    <PlannerBase
      map-name="NelVari Farm"
      :is-farm="true"
      background-image="https://assets.havendecorator.com/decorations/Planner/Maps/NelVariFarm.png"
      background-grid-image="https://assets.havendecorator.com/decorations/Planner/Maps/NelVariFarmGrid.png"
      :image-height="1340"
      :image-width="1890"
      :grid-offset-top="-4"
      :grid-offset-left="10"
      :vertical-tile-threshold=".6"
      :horizontal-tile-threshold=".7"
      @go-to-map="goToPlannerArea"
    />
  </div>
</template>

<script lang="ts" setup>
function goToPlannerArea(mapName: string) {
  navigateTo('/planner/' + mapName.toLowerCase().replaceAll(" ", "-").replace("'", ""))
}

</script>
