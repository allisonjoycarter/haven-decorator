<template>
  <div
    class="absolute m-4 top-0 left-0 bg-gray-100 dark:bg-gray-900 rounded-md z-50 p-4"
    @mouseenter="(event) => event.stopPropagation()"  
    @mouseover="(event) => event.stopPropagation()"  
  >
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
        <hr class="border-gray-400 opacity-80 dark:opacity-40 my-2"/>
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
      <hr class="border-gray-400 opacity-80 dark:opacity-40 my-2"/>
      <div class="flex flex-row border border-indigo-500 rounded-md my-1 justify-between">
        <button
          v-for="item in dropdowns"
          :class="{
            'btn-text px-2 rounded-sm': true,
            'font-semibold bg-indigo-500 text-gray-200': openDropdown === item && showDropdown
          }"
          @mouseenter="() => openDropdown = item"
          @click="() => openDropdown = item"
        >
          {{ item }}s
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
      <Autocomplete
        v-show="openDropdown === 'Tree' && showDropdown"
        :options="treeOptions"
        placeholder="Search Trees"
        @selected="selected"
      />
      <Autocomplete
        v-show="openDropdown === 'Crafting Table' && showDropdown"
        :options="craftingTableOptions"
        placeholder="Search Crafting"
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
  import axios from 'axios'

  const props = defineProps<{
    showDropdown: boolean,
    isLoadComplete: boolean,
    isFarm?: boolean,
  }>()
  const emit = defineEmits([
    'selectedCrop',
    'selectedBuilding',
    'selectedPath',
    'selectedCrafting',
    'selectedTree',
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

  const farmDropdowns = ['Building', 'Crop', 'Path', 'Crafting Table', 'Tree']
  const buildingDropdowns = ['Crafting Table']
  const buildings = ref([] as string[])
  const crops = ref([] as string[])
  const craftingTables = ref([] as string[])
  const trees = ref([] as string[])
  const paths = ['Workshop']

  const openDropdown = ref('')

  const dropdowns = computed(() => props.isFarm ? farmDropdowns : buildingDropdowns)

  const buildingOptions = computed(() => {
    return buildings.value.map((building) => {
      return {
        name: building,
        image: 'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Buildings/' + building + '.png'
      }
    })
  })

  const cropOptions = computed(() => {
    return crops.value.map((crop) => {
      return {
        name: crop,
        image: 'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Crops/' + crop + '.png'
      }
    })
  })

  const craftingTableOptions = computed(() => {
    return craftingTables.value.map((path) => {
      return {
        name: path,
        image: 'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Crafting/' + path + '.png'
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

  const treeOptions = computed(() => {
    return trees.value.map((path) => {
      return {
        name: path,
        image: 'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Trees/' + path + '.png'
      }
    })
  })

  const canShowLoadModal = computed(() => {
    return !props.isLoadComplete || !isCurrentLoadComplete.value
  })

  onMounted(() => {
    axios.get("https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Crops/list.txt").then((result) => {
      crops.value = result.data.split('\n')
    })

    axios.get("https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Buildings/list.txt").then((result) => {
      buildings.value = result.data.split('\n')
    })

    axios.get("https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Crafting/list.txt").then((result) => {
      craftingTables.value = result.data.split('\n')
    })

    axios.get("https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Trees/list.txt").then((result) => {
      trees.value = result.data.split('\n')
    })
  })
  
  function selected(option: string) {
    if (crops.value.includes(option)) {
      emit('selectedCrop', option)
    } else if (buildings.value.includes(option)) {
      emit('selectedBuilding', option)
    } else if (paths.includes(option)) {
      emit('selectedPath', option)
    } else if (craftingTables.value.includes(option)) {
      emit('selectedCrafting', option)
    } else if (trees.value.includes(option)) {
      emit('selectedTree', option)
    }
    openDropdown.value = ''
  }

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