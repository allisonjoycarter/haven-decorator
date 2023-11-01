<template>
  <div class="absolute m-4 top-0 left-0 bg-gray-100 dark:bg-gray-900 rounded-md z-50 p-4 w-60">
    <div class="flex flex-col">
      <p>left click drag to place</p>
      <p>right click drag to erase</p>
      <p>ctrl+z to undo</p>
      <button 
        class="btn-text text-sm py-1 my-1 text-left w-max"
        @click="showMoreOptions = !showMoreOptions"
      >
        {{ showMoreOptions ? 'Hide' : 'Show' }} More Options 
        <Icon :class="{
          'transition-transform duration-200': true,
          'rotate-180': showMoreOptions
        }" name="fa:angle-down"/>
      </button>
      <div :class="{
        'flex flex-col transition-all overflow-hidden duration-200': true,
        'max-h-0': !showMoreOptions,
        'max-h-64': showMoreOptions
      }">
        <hr class="opacity-40 my-2"/>
        <div class="flex flex-row gap-4 my-2">
          <button class="btn-primary" @click="openSaveModal"><Icon name="fa:download"/>&nbsp;Save</button>
          <button class="btn-primary" @click="openLoadModal"><Icon name="fa:upload"/>&nbsp;Load</button>
        </div>
        <label class="text-xs">Grid Opacity</label>
        <Slider
          :min="0"
          :max="60"
          @slider-changed="updateGridOpacity"
        />
      </div>
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
        v-show="openDropdown === 'Building' && showDropdown"
        :options="buildingOptions"
        placeholder="Search Buildings" 
        @selected="selected"
      />
      <Autocomplete
        v-show="openDropdown === 'Crop' && showDropdown"
        :options="cropOptions"
        placeholder="Search Crops"
        @selected="selected"
      />
      <Autocomplete
        v-show="openDropdown === 'Path' && showDropdown"
        :options="pathOptions"
        placeholder="Search Paths"
        @selected="selected"
      />
      
    <PlannerSaveModal
      v-show="isSaveModalOpen"
      @on-save-image="saveAsImage"
      @on-save-config="saveAsFile"
      @on-close="isSaveModalOpen = false"
      @contextmenu="() => true"
    >
      <slot/>
    </PlannerSaveModal>
    <Modal
      v-if="isLoadModalOpen && canShowLoadModal"
      @clicked-outside-modal="isLoadModalOpen = false"
    >
      <label for="loadfile" class="
        relative flex flex-col gap-4 
        justify-center items-center 
        h-60 p-10 rounded-lg border-2 border-dashed border-gray-400
        hover:bg-gray-300 hover:dark:bg-gray-600  transition-colors duration-200
        ">
        <span class="drop-title">Drop file here</span>
        or
        <input class="ml-6" type="file" accept="application/json" id="loadfile" @change="loadFromFile">
      </label>
    </Modal>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'

  const props = defineProps<{
    showDropdown: boolean,
    isLoadComplete: boolean
  }>()
  const emit = defineEmits([
    'selectedCrop',
    'selectedBuilding',
    'selectedPath',
    'updateGridOpacity',
    'openSaveModal',
    'saveImage',
    'saveDataAsJson',
    'loadDataFromJson'
  ])
  
  const showMoreOptions = ref(false)
  const isSaveModalOpen = ref(false)
  const isLoadModalOpen = ref(false)
  const isCurrentLoadComplete = ref(false)
  const savedImage = ref(null as null|HTMLElement)

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

  const canShowLoadModal = computed(() => {
    return !props.isLoadComplete || !isCurrentLoadComplete.value
  })

  function updateGridOpacity(opacity: number) {
    emit('updateGridOpacity', opacity)
  }
  
  function openSaveModal() {
    emit('openSaveModal')
    isSaveModalOpen.value = true
  }

  function openLoadModal() {
    isLoadModalOpen.value = true
    isCurrentLoadComplete.value = false
  }

  function saveAsImage() {
    emit('saveImage')
  }

  function saveAsFile() {
    emit('saveDataAsJson')
  }

  function loadFromFile(payload: Event) {
    emit('loadDataFromJson', payload)
    isCurrentLoadComplete.value = true
  }
</script>

<style scoped>
</style>