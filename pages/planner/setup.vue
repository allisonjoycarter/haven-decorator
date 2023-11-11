<template>
  <div class="flex flex-col">
    <div class="flex flex-row">
      <button v-for="map in maps"
        :key="map.name" 
        :class="{'btn-text': true, 'active': map.name === currentMap.name }"
        @click="() => currentMap = map"
      >
        {{ map.name }}
      </button>
    </div>
    <div
      v-for="map in maps"
      :key="map.name" 
    >
      <PlannerSetup
        v-if="map.name === currentMap.name"
        :map-name="map.name"
        :background-image="map.background"
        :background-grid-image="map.grid"
        :image-height="map.height"
        :image-width="map.width"
        :grid-offset-top="map.offsetTop"
        :grid-offset-left="map.offsetLeft"
        :vertical-tile-threshold="map.verticalThreshold"
        :horizontal-tile-threshold="map.horizontalThreshold"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>

const maps = [
  {
    name: "Sun Haven Farm",
    background: "https://farmdecoratorassets.blob.core.windows.net/decorations/sun_haven_farm_smaller.png",
    grid: "https://farmdecoratorassets.blob.core.windows.net/decorations/sun_haven_farm_smaller_grid.png",
    height: 2008,
    width: 1868,
    offsetTop: 1,
    offsetLeft: 7,
    verticalThreshold: .7,
    horizontalThreshold: .9
  },
  {
    name: "NelVari Farm",
    background: 'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Maps/NelVariFarm.png',
    grid: 'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Maps/NelVariFarmGrid.png',
    height: 1340,
    width: 1890,
    offsetTop: -4,
    offsetLeft: 10,
    verticalThreshold: .6,
    horizontalThreshold: .7
  },
  {
    name: "Withergate Farm",
    background: "https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Maps/WithergateFullFarm.png",
    grid: "https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Maps/WithergateFullFarmGrid.png",
    height: 1212,
    width: 1644,
    offsetTop: 14,
    offsetLeft: -4,
    verticalThreshold: .9,
    horizontalThreshold: .35
  }
]

const currentMap = ref(maps[0])

</script>
