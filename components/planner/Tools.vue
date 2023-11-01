<template>
  <div class="absolute m-4 top-0 left-0 bg-gray-100 dark:bg-gray-900 rounded-md z-50 p-4 w-60">
    <div class="flex flex-col">
      <p>left click drag to place</p>
      <p>right click drag to erase</p>
      <hr class="opacity-40 my-2"/>
      <div class="flex flex-row gap-1">
        <button
          class="btn-text"
          @click="() => openDropdown === 'Building' ? openDropdown = '' : openDropdown = 'Building'"
        >
          Buildings
        </button>
        <button
          class="btn-text"
          @click="() => openDropdown === 'Crop' ? openDropdown = '' : openDropdown = 'Crop'"
        >
          Crops
        </button>
        <button
          class="btn-text"
          @click="() => openDropdown === 'Path' ? openDropdown = '' : openDropdown = 'Path'"
        >
          Paths
        </button>
      </div>
      <Autocomplete
        v-if="openDropdown === 'Building' && showDropdown"
        :options="buildingOptions"
        placeholder="Search Buildings" 
        @selected="selected"
      />
      <Autocomplete
        v-if="openDropdown === 'Crop' && showDropdown"
        :options="cropOptions"
        placeholder="Search Crops"
        @selected="selected"
      />
      <Autocomplete
        v-if="openDropdown === 'Path' && showDropdown"
        :options="pathOptions"
        placeholder="Search Paths"
        @selected="selected"
      />
      <hr class="opacity-40 my-2"/>
      <label class="text-xs">Grid Opacity</label>
      <Slider
        :min="0"
        :max="60"
        @slider-changed="updateGridOpacity"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'

  const props = defineProps<{
    showDropdown: boolean
  }>()
  const emit = defineEmits(['selectedCrop', 'selectedBuilding', 'selectedPath', 'updateGridOpacity'])

  const buildings = ['House', 'Crafting Table']
  const crops = [
    'Armoranth',
    'Beet',
    'Brr-Nana',
    'Coffee Bean',
    'Corn',
    'Clover',
    'Garlic',
    'Kale',
    'Purple Eggplant',
    'Sugar Cane',
  ]
  const paths = ['Workshop']

  const openDropdown = ref('')

  function selected(option: string) {
    if (crops.includes(option)) {
      emit('selectedCrop', option)
    } else if (buildings.includes(option)) {
      emit('selectedBuilding', option)
    } else if (paths.includes(option)) {
      emit('selectedPath', option)
    }
    openDropdown.value = ''
  }

  const buildingOptions = computed(() => {
    return buildings.map((building) => {
      return {
        name: building,
        image: 'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Buildings/' + building + '.png'
      }
    })
  })

  const cropOptions = computed(() => {
    return crops.map((crop) => {
      return {
        name: crop,
        image: 'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Crops/' + crop + '.png'
      }
    })
  })

  const pathOptions = computed(() => {
    return paths.map((path) => {
      return {
        name: path,
        image: 'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Paths/' + path + '.png'
      }
    })
  })

  function updateGridOpacity(opacity: number) {
    emit('updateGridOpacity', opacity)
  }

</script>

<style scoped>
</style>