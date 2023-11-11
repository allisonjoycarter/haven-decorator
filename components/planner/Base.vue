<template>
  <div class="py-3 mx-6 mb-4" :style="fullSizeStyle">
    <a ref="savingPlaceholder"/>
    <div class="relative border-none outline-none ring-0" tabindex="0" ref="planner"
      @mouseover="mouseEnteredPlanner()"
      @mouseleave="mouseLeftPlanner()"

      @mousemove="handleMouseOverMap"
      @mouseup="handleDragEnd"
      @mousedown="handleMapClick"
      @keydown="handleKeyPress"

      @contextmenu="(event) => event.preventDefault()"
    >
      <div v-if="isLoading" class="absolute top-0 left-0 z-50 h-full w-full bg-black bg-opacity-60">
        <div class="flex flex-col items-center mt-60 w-screen">
          <Icon name="fa:spinner" class="animate-spin mx-auto h-12 w-12"/>
          <p class="text-lg mt-2 ml-4">Loading...</p>
        </div>
      </div>
      <AutocompleteModal 
        v-if="isSelectingShedSkin"
        title="Shed Skins"
        :items="shedSkinsAndImages"
        @clicked-outside-modal="isSelectingShedSkin = false"
        @select-item="setShedSkin"
      />
      <PlannerContextMenu 
      v-show="isContextMenuOpen"
      :style="contextMenuStyle"
      :options="contextMenuOptions"
      @on-select-option="onSelectContextOption"
      @mousedown="(event: any) => event.stopPropagation()"
      @keydown="(event: any) => event.stopPropagation()"
      @contextmenu="(event: any) => event.stopPropagation()"
      />
      <PlannerTools
        @selected-building="grabBuilding"
        @selected-crafting="grabCrafting"
        @selected-tree="grabTree"
        @selected-crop="grabCrop"
        @selected-path="grabPath"
        @update-grid-opacity="updateGridOpacity"
        @open-save-modal="openSaveModal"
        @save-image="saveAsImage"
        @save-data-as-json="saveAsFile"
        @load-data-from-json="loadFromFile"
        @start-over="resetData"
        
        :is-farm="isFarm"
        :is-load-complete="isLoadComplete"
        :should-close-dropdown="shouldCloseDropdown"
        @mouseenter="shouldCloseDropdown = false"
        @mousedown="(event: any) => event.stopPropagation()"
        @keydown="(event: any) => event.stopPropagation()"
        @contextmenu="(event: any) => event.stopPropagation()"
      >
        <div style="height: 600px" class="overflow-scroll">
          <div style="height: 1000px; width: 800px;" class="overflow-y-hidden overflow-x-scroll">
            <canvas ref="originalCanvas" :width="imageWidth" :height="imageHeight" class="scale-50 origin-top-left">
            </canvas>
          </div>
        </div>
      </PlannerTools>
      <div
          v-if="isPlacing !== undefined"
          class="absolute z-50"
          ref="placingItem"
        >
        <div class="relative">
          <div class="border-2 border-dashed border-rose-500 absolute top-0 bottom-0" :style="'opacity: ' + (gridOpacity / 100 * 3) + '; width: ' + placingWidth + 'px; height: ' + placingHeight + 'px; '"></div>
          <img
            ref="placingItemImage"
            :style="'max-width: unset; bottom: -' + placingHeight + 'px; left: -' + (((placingImageWidth ?? 0) - (placingWidth ?? 0)) / 2) + 'px;'"
            :class="{
              'absolute': true,
              'grayscale contrast-200': !isValidPlacement
            }"
            :width="placingImageWidth"
            :src="'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/' + isPlacing + '.png'"/>
        </div>
      </div>
      <div class="absolute top-0 left-0 overflow-hidden z-30" :style="fullSizeStyle">
        <div v-show="showMouseIndicator" ref="mouseIndicator" class="absolute">
          <div class="mouse-lines-vertical"></div>
          <div class="mouse-lines-horizontal"></div>
          <div class="mouse-square"></div>
          <div class="no-select ml-6 mt-4 bg-white bg-opacity-40 text-gray-950 px-1 rounded-sm text-sm font-bold" v-show="dragAmount.x > 0">{{ dragAmount.x }} x {{ dragAmount.y }}</div>
        </div>
      </div>
      <div :class="{
        'absolute z-30 opacity-40': true,
        'bg-white': !isPlacing && !isDraggingToErase,
        'bg-blue-700': !isDraggingToErase,
        'bg-red-500': isDraggingToErase,
      }" v-show="isDragging" ref="mouseDragBox"></div>
      <div>
        <div
          :style="mapBackgroundStyle + fullSizeStyle"
          ref="plannerArea"
          >
          <div class="z-20" :style="mapGridBackgroundStyle + fullSizeStyle + ' opacity: ' + gridOpacity / 100">
            <div ref="plannerGrid" @dragstart="(event) => event.preventDefault()"></div>
          </div>
          <div>
            <div
              v-for="(item, index) in subtileData"
              :key="index"
              :style="'position: absolute; top: ' + item.yStart + 'px; left: ' + item.xStart + 'px;'"
              :class="{
                'z-30': true,
                'grayscale contrast-200': subtilesWillBeErased.includes(item.id)
              }"
            >
            <div class="relative">
              <div class="border-2 border-dashed border-rose-500 absolute top-0 bottom-0" :style="'opacity: ' + (gridOpacity / 100 * 3) + '; width: ' + item.collidableWidth + 'px; height: ' + item.collidableHeight + 'px; '"></div>
              <PlannerCustomHouse
                v-if="item.houseCustomizationData !== undefined"
                :visible-width="item.visibleWidth"
                :customizations="item.houseCustomizationData"
                class="no-select absolute"
                :style="'bottom: -' + item.collidableHeight + 'px;'"
              />
              <img
                v-else
                :width="item.visibleWidth"
                :style="'max-width: unset; bottom: -' + item.collidableHeight + 'px; left: -' + ((item.visibleWidth - item.collidableWidth) / 2) + 'px;'"
                class="no-select absolute pixelize"
                :src="item.overrideImage ?? 'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/' + item.itemName + '.png'"/>
              </div>
            </div>

          </div>
          <div ref="tilesContainer">
          <div
            v-for="(position, index) in populatedTiles" :key="index" 
            :style="'position: absolute; top: ' + (position.y - 11) + 'px; left: ' + (position.x - 11) + 'px;'"
            class="tile"
            >
              <div
                :class="{
                  'no-select z-40 absolute top-0 left-0 tile': true,
                  'bg-red-500 bg-opacity-40': invalidTiles.includes(`${position.x}-${position.y}`),
                  }"
              ></div>
              <img 
                v-if="position.usedFor !== undefined"
                :class="{
                  'no-select z-20 absolute top-0 left-0 tile': true,
                  'bg-amber-950 bg-opacity-30': position.usedFor !== undefined,
                  'grayscale contrast-200': willBeErased.includes(`${position.x}-${position.y}`),
                }"
                style="max-width: unset;"
                :src="'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/' + position.usedFor + '.png'"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import axios from 'axios';
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import type PlaceableItem from '~/models/placeable_item';
  import type { PlacedItem } from '~/models/placed_item';
  import { shedSkins } from '~/models/planner_items';

  const props = defineProps<{
    mapName: string,
    isFarm: boolean,
    backgroundImage: string,
    backgroundGridImage: string,
    imageHeight: number,
    imageWidth: number,
    gridOffsetTop: number,
    gridOffsetLeft: number,
    verticalTileThreshold: number,
    horizontalTileThreshold: number,
    bounds?: string,
  }>()
  const emit = defineEmits(['goToMap'])
  const plannerStore = usePlannerStore()
  const customizationStore = useCustomizationsStore()

  const isLoading = ref(true)
  const isHoveringPlanner = ref(false)
  const isSelectingShedSkin = ref(false)
  const shouldCloseDropdown = ref(false)

  // On right click, use these options
  const isContextMenuOpen = ref(false)
  const contextMenuStyle = ref('')
  const contextMenuOptions = ref([] as { name: string, icon?: string }[])
  const contextMenuItemIndex = ref(-1)
  
  const planner = ref(null as null|HTMLElement)
  const plannerArea = ref(null as null|HTMLElement)
  const plannerGrid = ref(null as null|HTMLElement)
  const mouseIndicator = ref(null as null|HTMLElement)
  const gridOpacity = ref(20)
  
  const originalCanvas = ref(null as null|HTMLCanvasElement)
  const savingPlaceholder = ref(null as null|HTMLElement)
  const isLoadComplete = ref(false)
  
  const marginTop = ref(0)
  const marginLeft = ref(0)
  
  const placeOnDragEnd = ref(undefined as string|undefined)
  const isDragging = ref(false)
  const isDraggingToErase = ref(false)
  const mouseDragBox = ref(null as null|HTMLElement)
  const dragStart = ref({x: 0, y: 0})
  const dragEnd = ref({x: 0, y: 0})
  const dragAmount = ref({x: 0, y: 0})

  const isPlacing = ref(undefined as string|undefined)
  const isValidPlacement = ref(true)
  const placingItem = ref(null as null|HTMLElement)
  const placingItemImage = ref(null as null|HTMLImageElement)
  const placingDimensions = ref(undefined as PlaceableItem|undefined)
  
  const invalidTiles = ref([] as string[])
  const subtilesWillBeErased = ref([] as string[])
  const willBeErased = ref([] as string[])

  // Game-relevant data retrieved from Blob storage
  const buildingSizes = ref([] as PlaceableItem[])
  const craftingTableSizes = ref([] as PlaceableItem[])
  const shedSkinsAndImages = ref([] as any[])

  // Main data stored here
  const dataVersion = ref(2)
  const tileData = ref(new Map<string, PlaceableTile>())
  const subtileData = ref([] as PlacedItem[])

  // For Undo
  const canUndo = ref(false)
  const previousTileData = ref(new Map<string, PlaceableTile>())
  const previousSubtileData = ref([] as PlacedItem[])

  let saveIntervalId: undefined|NodeJS.Timeout = undefined
  const hasPendingChanges = ref(false)

  const populatedTiles = computed(() => {
    return [...tileData.value.values()].filter((tile: PlaceableTile) => tile.usedFor !== undefined || invalidTiles.value.includes(`${tile.x}-${tile.y}`));
  })

  const showMouseIndicator = computed(() => {
    return isHoveringPlanner.value && (isPlacing.value === undefined || placeOnDragEnd.value !== undefined)
  })

  const fullSizeStyle = computed(() => {
    return `height: ${props.imageHeight}px; width: ${props.imageWidth}px;`
  })

  const mapBackgroundStyle = computed(() => {
    return `background: url("${props.backgroundImage}") left top transparent;`
  })

  const mapGridBackgroundStyle = computed(() => {
    return `background: url("${props.backgroundGridImage}") left top transparent;`
  })

  const placingImageWidth = computed(() => {
    return placingDimensions.value === undefined ? undefined : (placingDimensions.value.visible_x * 4)
  })

  const placingWidth = computed(() => {
    return placingDimensions.value === undefined ? undefined : (placingDimensions.value.placement_x * 4)
  })

  const placingHeight = computed(() => {
    return placingDimensions.value === undefined ? undefined : (placingDimensions.value.placement_y * 4)
  })

  onMounted(() => {
    fetchSizes()
    fetchShedSkins()

    if (plannerArea.value !== null) {
      const rect = (plannerArea.value as HTMLElement).getBoundingClientRect() 
      marginTop.value = rect.y;
      marginLeft.value = rect.x;
    }
    
    let index = 0
    for (var y = props.gridOffsetTop; y <= props.imageHeight; y += 24) {
      for (var x = props.gridOffsetLeft; x <= props.imageWidth; x += 24) {
        let canPlant = true
        let canBuild = true
        if (props.bounds !== undefined && props.bounds.length > index) {
          if (props.bounds[index] === '0') {
            canBuild = true
            canPlant = true
          } else if (props.bounds[index] === '1') {
            canBuild = false
            canPlant = true
          } else if (props.bounds[index] === '2') {
            canBuild = true
            canPlant = false
          } else if (props.bounds[index] === '3') {
            canBuild = false
            canPlant = false
          }
        }

        tileData.value.set(`${x}-${y}`, {
          x,
          y,
          canPlant,
          canBuild,
          usedFor: undefined,
        })

        index++
      }
    }
    
    // TODO: validate this format
    const existingData = plannerStore.maps.find((map) => map.mapName === props.mapName)
    if (existingData !== undefined) {
      Object.values(existingData.tileData).forEach((entry: any) => {
        tileData.value.set(`${entry.x}-${entry.y}`, entry)
      })
      subtileData.value = existingData.subtileData
    }

    isLoading.value = false

    // Save Progress every 30 seconds
    saveIntervalId = setInterval(() => {
      if (hasPendingChanges.value) {
        const data = {} as any
        tileData.value.forEach((entry) => {
          if (entry.usedFor !== undefined) {
            data[`${entry.x}-${entry.y}`] = entry
          }
        })
        plannerStore.setTileData({ map: props.mapName, tileData: data })
        plannerStore.setSubtileData({ map: props.mapName, subtileData: subtileData.value, version: dataVersion.value })
        
        hasPendingChanges.value = false
      }
    }, 30000)
  })

  onUnmounted(() => {
    const data = {} as any
    tileData.value.forEach((entry) => {
      if (entry.usedFor !== undefined) {
        data[`${entry.x}-${entry.y}`] = entry
      }
    })
    plannerStore.setTileData({ map: props.mapName, tileData: data })
    plannerStore.setSubtileData({ map: props.mapName, subtileData: subtileData.value, version: dataVersion.value })
    hasPendingChanges.value = false

    if (saveIntervalId !== undefined) {
      clearInterval(saveIntervalId)
    }
  })

  function fetchSizes() {
    axios.get('https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Buildings/building_sizes.json').then((result) => {
      buildingSizes.value = result.data.sizes
    })

    axios.get('https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/Crafting/crafting_table_sizes.json').then((result) => {
      craftingTableSizes.value = result.data.sizes
    })
  }

  function fetchShedSkins() {
    shedSkins.forEach((skin: string) => {
      shedSkinsAndImages.value.push({
        name: skin.trim(),
        image: `https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/ShedSkins/${skin.trim()}.png` 
      })
    })
  }

  function saveAsImage() {
    const link = (savingPlaceholder.value as any)
    link.download = `${props.mapName}.png`;
    link.href = (originalCanvas.value as HTMLCanvasElement).toDataURL();
    link.click();
  }

  function saveAsFile() {
    let data = {
      base: props.mapName,
      version: 2,
      tileData: {} as any,
      subtileData: subtileData.value,
    }

    tileData.value.forEach((entry) => {
      if (entry.usedFor !== undefined) {
        data.tileData[`${entry.x}-${entry.y}`] = entry
      }
    })

    var file = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(file)
    const link = savingPlaceholder.value as any
    link.href = url
    link.download = `${props.mapName}.json`
    link.click()
  }
  
  function openSaveModal() {
    createImageCanvas()
  }

  function createImageCanvas() {
    const canvas = (originalCanvas.value as HTMLCanvasElement)
    const context = canvas.getContext("2d")

    if (context !== null) {
      const farmImage = new Image()
      farmImage.src = props.backgroundImage
      farmImage.onload = function() {
        context.drawImage(farmImage, 0, 0)
      }
  
      const gridImage = new Image()
      gridImage.src = props.backgroundGridImage
      gridImage.onload = function() {
        context.globalAlpha = gridOpacity.value!! / 100
        context.drawImage(gridImage, 0, 0)
        context.globalAlpha = 1.0
      }

      tileData.value.forEach((tile) => {
        if (tile.usedFor !== undefined) {
          const itemImage = new Image()
          itemImage.src = 'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/' + tile.usedFor + '.png'
          itemImage.onload = function() {
            context.drawImage(itemImage, tile.x - 11, tile.y - 11)
          }
        }
      })

      subtileData.value.forEach((item) => {
        const decoImage = new Image()
        if (item.houseCustomizationData !== undefined) {
          const yStart = item.yStart - 80 // idk what 80 means, but it fixes it
          const patioImage = new Image()
          patioImage.src = 'https://farmdecoratorassets.blob.core.windows.net/decorations/' + item.houseCustomizationData.patio.filename
          patioImage.onload = function() {
            context.drawImage(patioImage, item.xStart, yStart + 75, 252, 132)
          }
          const doorImage = new Image()
          doorImage.src = 'https://farmdecoratorassets.blob.core.windows.net/decorations/' + item.houseCustomizationData.door.filename
          doorImage.onload = function() {
            context.drawImage(doorImage, item.xStart + 110, yStart + 114, 33, 44)
          }
          const wallsImage = new Image()
          wallsImage.src = 'https://farmdecoratorassets.blob.core.windows.net/decorations/' + item.houseCustomizationData.walls.filename
          wallsImage.onload = function() {
            context.drawImage(wallsImage, item.xStart + 16, yStart + 86, 220, 72)
          }
          const roofImage = new Image()
          roofImage.src = 'https://farmdecoratorassets.blob.core.windows.net/decorations/' + item.houseCustomizationData.roof.filename
          roofImage.onload = function() {
            context.drawImage(roofImage, item.xStart + 10, yStart, 231, 120)
          }
          const windowsImage = new Image()
          windowsImage.src = 'https://farmdecoratorassets.blob.core.windows.net/decorations/' + item.houseCustomizationData.windows.filename
          windowsImage.onload = function() {
            context.drawImage(windowsImage, item.xStart + 25, yStart + 57, 202, 72)
          }
        } else if (item.overrideImage !== undefined) {
          decoImage.src = item.overrideImage
        } else {
          decoImage.src = 'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/' + item.itemName + '.png'
        }
        decoImage.onload = function() {
          context.drawImage(
            decoImage,
            // x, y to draw at
            item.xStart, item.yStart - (item.visibleHeight - item.collidableHeight),
            // width, height of drawn image
            item.visibleWidth, item.visibleHeight,
          )
        }
      })
    }
  }

  function loadFromFile(file: File) {
    isLoadComplete.value = false

    const fr = new FileReader();

    fr.onload = (e: any) => {
      let index = 0
      for (var y = props.gridOffsetTop; y <= props.imageHeight; y += 24) {
        for (var x = props.gridOffsetLeft; x <= props.imageWidth; x += 24) {
          let canPlant = true
          let canBuild = true
          if (props.bounds !== undefined && props.bounds.length > index) {
            if (props.bounds[index] === '0') {
              canBuild = true
              canPlant = true
            } else if (props.bounds[index] === '1') {
              canBuild = false
              canPlant = true
            } else if (props.bounds[index] === '2') {
              canBuild = true
              canPlant = false
            } else if (props.bounds[index] === '3') {
              canBuild = false
              canPlant = false
            }
          }

          tileData.value.set(`${x}-${y}`, {
            x,
            y,
            canPlant,
            canBuild,
            usedFor: undefined,
          })

          index++
        }
      }

      const result = JSON.parse(e.target.result);
      if (result.base !== props.mapName) {
        emit('goToMap', result.base)
      }

      // TODO: update version number when changing image placements
      if (result.version !== 2) {
        plannerStore.migrateSubtileData(props.mapName, result.subtileData, 2, undefined)
        subtileData.value = plannerStore.maps.find((map) => map.mapName === props.mapName)?.subtileData ?? []
      } else {
        subtileData.value = result.subtileData
      }

      Object.values(result.tileData).forEach((entry: any) => {
        tileData.value.set(`${entry.x}-${entry.y}`, entry)
      })
    }
    fr.readAsText(file)
    isLoadComplete.value = true
    hasPendingChanges.value = true
  }

  function updateGridOpacity(opacity: number) {
    gridOpacity.value = Math.ceil(opacity / 10) * 10
  }

  async function onSelectContextOption(option: string) {
    if (option === 'Move') {
      previousSubtileData.value = subtileData.value.map((item) => item)
      canUndo.value = true
      hasPendingChanges.value = true

      isPlacing.value = subtileData.value[contextMenuItemIndex.value].itemName
      placingDimensions.value = {
        name: isPlacing.value.split('/', 1)[1],
        visible_x: subtileData.value[contextMenuItemIndex.value].visibleWidth / 4,
        visible_y: subtileData.value[contextMenuItemIndex.value].visibleHeight / 4,
        placement_x: subtileData.value[contextMenuItemIndex.value].collidableWidth / 4,
        placement_y: subtileData.value[contextMenuItemIndex.value].collidableHeight / 4
      }
      subtileData.value.splice(contextMenuItemIndex.value, 1)
      contextMenuItemIndex.value = -1
    } else if (option === 'Delete') {
      previousSubtileData.value = subtileData.value.map((item) => item)
      canUndo.value = true
      hasPendingChanges.value = true
      
      subtileData.value.splice(contextMenuItemIndex.value, 1)
      contextMenuItemIndex.value = -1
    } else if (option === 'Apply Customization') {
      if (customizationStore.currentSet === undefined) {
        if (customizationStore.savedSets.length > 0) {
          customizationStore.updateCurrentSet(customizationStore.savedSets[0])
        } else {
          customizationStore.updateCurrentSet({
            name: undefined,
            roof: { nameInGame: 'Rickity', filename: 'RickityRoof3.png'},
            walls: { nameInGame: 'Rickity', filename: 'RickityWalls3.png'},
            windows: { nameInGame: 'Rickity', filename: 'RickityWindows3.png'},
            door: { nameInGame: 'Rickity', filename: 'RickityDoor3.png'},
            patio: { nameInGame: 'Rickity', filename: 'RickityPatio3.png'},
          })
        }
      }

      // Setting to undefined first triggers the reactivity, forcing the DOM to update.
      subtileData.value[contextMenuItemIndex.value].houseCustomizationData = undefined
      await nextTick()

      subtileData.value[contextMenuItemIndex.value].houseCustomizationData = {...customizationStore.currentSet}
      hasPendingChanges.value = true
      contextMenuItemIndex.value = -1
    } else if (option === 'Set Skin') {
      isSelectingShedSkin.value = true
    }

    isContextMenuOpen.value = false
  }

  async function setShedSkin(skin: string) {
    // Setting to undefined first triggers the reactivity, forcing the DOM to update.
    subtileData.value[contextMenuItemIndex.value].overrideImage = undefined
    await nextTick()

    subtileData.value[contextMenuItemIndex.value].overrideImage = shedSkinsAndImages.value.find((option) => option.name === skin).image
    contextMenuItemIndex.value = -1
    isSelectingShedSkin.value = false
  }

  function handleMapClick(event: MouseEvent) {
    if (event.buttons === 1) {
      if (isContextMenuOpen.value) {
        isContextMenuOpen.value = false
      } else if (isPlacing.value === undefined || placeOnDragEnd.value !== undefined) {
        isDragging.value = true

        const startingTile = getTilePositionAt(
          event.pageX - marginLeft.value,
          event.pageY - marginTop.value
        )
        dragStart.value = { x: startingTile.x, y: startingTile.y }

        handleMouseOverMap(event)
      } else if (isValidPlacement.value){
        // Store for undo
        canUndo.value = true
        hasPendingChanges.value = true

        previousTileData.value = new Map()
        previousSubtileData.value = subtileData.value.map((item) => item)

        placeBuilding(event)
      }
    } else if (event.buttons === 2) {
      event.preventDefault()
      isContextMenuOpen.value = false
      if (isPlacing.value !== undefined) {
        isPlacing.value = undefined
        placeOnDragEnd.value = undefined
      }

      const clickPos = {
        x: event.pageX - marginLeft.value,
        y: event.pageY - marginTop.value
      }
      
      for (let i = 0; i < subtileData.value.length; i++) {
        const subtile = subtileData.value[i];
        if (clickPos.x >= subtile.xStart
          && clickPos.x <= subtile.xEnd
          && clickPos.y >= subtile.yStart
          && clickPos.y <= subtile.yEnd) {
            isContextMenuOpen.value = true

            const isCloseToBottom = event.pageY - window.scrollY + 300 > window.innerHeight
            const verticalStyle = isCloseToBottom ? `bottom: ${window.innerHeight - event.pageY}px;` : `top: ${event.pageY - window.scrollY - marginTop.value + 150}px;`
            
            const isCloseToSide = event.pageX - window.scrollX + 300 > window.innerWidth
            const horizontalStyle = isCloseToSide ? `right: ${150}px;` : `left: ${event.pageX - marginLeft.value - window.scrollX + 20}px;`

            contextMenuStyle.value = `${verticalStyle} ${horizontalStyle}`

            contextMenuOptions.value = [
                { name: 'Move', icon: 'fa:arrows'},
                { name: 'Delete', icon: 'fa:trash'}
              ]
            if (subtile.itemName.includes("House")) {
              contextMenuOptions.value.push(
                { name: 'Apply Customization', icon: 'fa:paint-brush' }
              )
            } else if (subtile.itemName.includes("Shed")) {
              contextMenuOptions.value.push(
                { name: 'Set Skin', icon: 'fa:paint-brush' }
              )
            }
          
            contextMenuItemIndex.value = i
            break
        }
      }

      if (!isContextMenuOpen.value) {
        const startingTile = getTilePositionAt(
            event.pageX - marginLeft.value,
            event.pageY - marginTop.value
        )
        dragStart.value = { x: startingTile.x, y: startingTile.y }
  
        isDragging.value = true
        isDraggingToErase.value = true
        handleMouseOverMap(event)
      }
    }
  }

  function handleDragEnd(event: MouseEvent) {
    if (isDragging.value && (placeOnDragEnd.value !== undefined || isDraggingToErase.value)) {
      // Store for undo
      canUndo.value = true
      previousTileData.value = new Map()
      previousSubtileData.value = subtileData.value.map((item) => item)

      if (event !== undefined) {
        const endTile = getTilePositionAt(event.pageX - marginLeft.value, event.pageY - marginTop.value)
        dragEnd.value = { x: endTile.x, y: endTile.y }
      }

      const minX = Math.min(dragStart.value.x, dragEnd.value.x)
      const maxX = Math.max(dragStart.value.x, dragEnd.value.x)

      const minY = Math.min(dragStart.value.y, dragEnd.value.y)
      const maxY = Math.max(dragStart.value.y, dragEnd.value.y)

      for (let x = minX; x < maxX + 24; x+=24) {
        for (let y = minY; y < maxY + 24; y+=24) {
          const tile = getTilePositionAt(x, y)
          if (tileData.value.has(`${tile.x}-${tile.y}`)) {
            const editingTile = tileData.value.get(`${tile.x}-${tile.y}`)!!
            if (!editingTile.canPlant && placeOnDragEnd.value?.includes("Crop")) {
              continue
            }
            if (!editingTile.canBuild && placeOnDragEnd.value?.includes("Path")) {
              continue
            }

            // Store for undo
            previousTileData.value.set(`${tile.x}-${tile.y}`, {
              x: tile.x, y: tile.y,
              canPlant: editingTile.canPlant,
              canBuild: editingTile.canBuild,
              usedFor: editingTile.usedFor,
            })
            
            if (placeOnDragEnd.value !== undefined) {
              editingTile.usedFor = placeOnDragEnd.value
            } else {
              editingTile.usedFor = undefined
            }
            
            if (placeOnDragEnd.value === undefined || !placeOnDragEnd.value.includes("Path")) {
              subtileData.value = subtileData.value.filter((subtile) => 
                !subtilesWillBeErased.value.includes(subtile.id)
              )
            }
          }
        }
      }

      invalidTiles.value = []
      willBeErased.value = []
      subtilesWillBeErased.value = []
      hasPendingChanges.value = true
    }
    
    dragStart.value = { x: 0, y: 0 }
    dragEnd.value = { x: 0, y: 0 }
    dragAmount.value = { x: 0, y: 0 }
    isDragging.value = false
    isDraggingToErase.value = false
  }

  function roundAt(value: number, roundUpAt: number) {
    return value - Math.floor(value) >= roundUpAt ? Math.ceil(value) : Math.floor(value)
  }

  function handleMouseOverMap(event: MouseEvent) {
    if (isPlacing.value !== undefined) {
      const item = (placingItem.value as HTMLElement)
      const xPixels = placingDimensions.value!!.visible_x * 4
      const yPixels = placingDimensions.value!!.visible_y * 4

      const topWithMargin = event.pageY - marginTop.value - (xPixels / 2);
      const leftWithMargin = event.pageX - marginLeft.value - (yPixels / 2);

      let pos = {x: leftWithMargin, y: topWithMargin};

      if (pos.x < props.imageWidth && pos.y < props.imageHeight) {
        if (placeOnDragEnd.value === undefined) {
          pos = getSubtilePositionAt(leftWithMargin, topWithMargin)

          subtilesWillBeErased.value = []
          for (let i = 0; i < subtileData.value.length; i++) {
            if (subtileData.value[i].xStart < (pos.x + (placingDimensions.value!!.placement_x * 4))
              && subtileData.value[i].xEnd > pos.x
              && subtileData.value[i].yStart < (pos.y + (placingDimensions.value!!.placement_y * 4))
              && subtileData.value[i].yEnd > pos.y
              ) {
              subtilesWillBeErased.value.push(subtileData.value[i].id)
            }
          }

          invalidTiles.value = getInvalidTiles({
            xStart: pos.x,
            xEnd: pos.x + (placingDimensions.value!!.placement_x * 4),
            yStart: pos.y,
            yEnd: pos.y + (placingDimensions.value!!.placement_y * 4)
          })
          isValidPlacement.value = invalidTiles.value.length === 0

          item.setAttribute("style", `left: ${pos.x}px; top: ${pos.y}px;`)
        } else {
          // Offset a bit so we don't grab the image instead of clicking the map
          item.setAttribute("style", `left: ${pos.x + 15}px; top: ${pos.y + 25}px;`)
        }
  
      }
    } 
    
    if (showMouseIndicator.value) {
      adjustMouseLines(event) 
    }
  }

  function adjustMouseLines(event: MouseEvent) {
    const indicator = (mouseIndicator.value as HTMLElement);

    const position = getTilePositionAt(
      event.pageX - marginLeft.value,
      event.pageY - marginTop.value
    )
    
    const style = `top: ${position.y}px; left: ${position.x}px;`;
    indicator.setAttribute("style", style);
    
    if (isDragging.value 
      && (dragEnd.value.x !== position.x 
      || dragEnd.value.y !== position.y)
      ) {
        dragEnd.value = {x: position.x , y: position.y}
        
        let leftX = Math.min(dragStart.value.x, position.x)
        let rightX = Math.max(dragStart.value.x, position.x)
        
        let topY = Math.min(dragStart.value.y, position.y)
        let bottomY = Math.max(dragStart.value.y, position.y)
        
        if (isDraggingToErase.value) {
          willBeErased.value = []

          for (let x = leftX; x < rightX + 24; x+=24) {
            for (let y = topY; y < bottomY + 24; y+=24) {
              const tile = getTilePositionAt(x, y)
              if (tileData.value.has(`${tile.x}-${tile.y}`)) {
                willBeErased.value.push(`${tile.x}-${tile.y}`)
              }
            }
          }
        } else if (placeOnDragEnd.value?.includes("Crop") || placeOnDragEnd.value?.includes("Path")) {
          invalidTiles.value = []
          for (let x = leftX; x < rightX + 24; x+=24) {
            for (let y = topY; y < bottomY + 24; y+=24) {
              const tile = getTilePositionAt(x, y)
              if (
                tileData.value.has(`${tile.x}-${tile.y}`) 
                && ((placeOnDragEnd.value?.includes("Crop") && tileData.value.get(`${tile.x}-${tile.y}`)!!.canPlant === false)
                || (placeOnDragEnd.value?.includes("Path") && tileData.value.get(`${tile.x}-${tile.y}`)!!.canBuild === false))
              ) {
                invalidTiles.value.push(`${tile.x}-${tile.y}`)
              }
            }
          }
        }

        const dragBox = (mouseDragBox.value as HTMLElement)

        const positionCss = `top: ${topY - 12}px; left: ${leftX - 12}px;`
        const sizeCss = `height: ${bottomY - topY + 24}px; width: ${rightX - leftX + 24}px;`

        dragBox.setAttribute("style", positionCss + sizeCss)

        dragAmount.value = { x: Math.round((rightX - leftX) / 24) + 1, y: Math.round((bottomY - topY) / 24) + 1 }
    }
  }

  function grabCrop(crop: string) {
    isPlacing.value = 'Crops/' + crop
    placeOnDragEnd.value = 'Crops/' + crop
    placingDimensions.value = {
      name: crop,
      placement_x: 6,
      placement_y: 6,
      visible_x: 6,
      visible_y: 6,
    }
  }

  function grabPath(path: string) {
    isPlacing.value = 'Paths/' + path
    placeOnDragEnd.value = 'Paths/' + path
    placingDimensions.value = {
      name: path,
      placement_x: 6,
      placement_y: 6,
      visible_x: 6,
      visible_y: 6,
    }
  }

  function grabBuilding(name: string) {
    placeOnDragEnd.value = undefined
    isPlacing.value = 'Buildings/' + name

    const size = buildingSizes.value.find((building) => building.name.toLowerCase().trim() === name.toLowerCase().trim())
    placingDimensions.value = size ?? {
      name: name,
      visible_x: 12,
      visible_y: 12,
      placement_x: 12,
      placement_y: 12
    }
  }

  function grabCrafting(name: string) {
    placeOnDragEnd.value = undefined
    isPlacing.value = 'Crafting/' + name

    const size = craftingTableSizes.value.find((table) => table.name.toLowerCase().trim() === name.toLowerCase().trim())
    placingDimensions.value = size ?? {
      name: name,
      visible_x: 12,
      visible_y: 12,
      placement_x: 12,
      placement_y: 12
    }
  }

  function grabTree(name: string) {
    placeOnDragEnd.value = undefined
    isPlacing.value = 'Trees/' + name

    placingDimensions.value = {
      name: name,
      visible_x: 20,
      visible_y: 24,
      placement_x: 12,
      placement_y: 6
    }
  }

  function placeBuilding(event: MouseEvent) {
    const dimensions = placingDimensions.value!!
    const xPixels = dimensions.visible_x * 4
    const yPixels = dimensions.visible_y * 4

    const topWithMargin = event.pageY - marginTop.value - (xPixels / 2);
    const leftWithMargin = event.pageX - marginLeft.value - (yPixels / 2);

    const subtilePosition = getSubtilePositionAt(leftWithMargin, topWithMargin)
    const size = (placingItemImage.value as HTMLElement).getBoundingClientRect()

    let subtile = {
      id: `${isPlacing.value}-${subtilePosition.x}-${subtilePosition.y}`,
      xStart: subtilePosition.x,
      xEnd: subtilePosition.x + (dimensions.placement_x * 4),
      yStart: subtilePosition.y,
      yEnd: subtilePosition.y + (dimensions.placement_y * 4),
      visibleWidth: dimensions.visible_x * 4,
      visibleHeight: size.height,
      collidableWidth: dimensions.placement_x * 4,
      collidableHeight: dimensions.placement_y * 4,
      itemName: isPlacing.value!,
      coversTiles: [] as string[]
    }

    subtileData.value = subtileData.value.filter((item) => !subtilesWillBeErased.value.includes(item.id))
    subtileData.value.push(subtile)

    isPlacing.value = undefined
  }

  function getInvalidTiles(subtileDimensions: any) {
    const minX = (roundAt(subtileDimensions.xStart / 24, .6) * 24) + props.gridOffsetLeft
    const maxX = (Math.floor(subtileDimensions.xEnd / 24) * 24) + props.gridOffsetLeft
    const minY = (roundAt(subtileDimensions.yStart / 24, .6) * 24) + props.gridOffsetTop
    const maxY = (Math.floor(subtileDimensions.yEnd / 24) * 24) + props.gridOffsetTop

    const tiles = [] as string[]
    for (var x = minX; x <= maxX; x += 24) {
      for (var y = minY; y <= maxY; y += 24) {
        if (tileData.value.get(`${x}-${y}`)!!.canBuild === false) {
          tiles.push(`${x}-${y}`)
        }
      }
    }

    return tiles
  }
    
  function getTilePositionAt(x: number, y: number) {
    const nearestLeft = roundAt((x / 24), props.horizontalTileThreshold) * 24
    const nearestTop = roundAt((y / 24), props.verticalTileThreshold) * 24
    
    return {
      x: nearestLeft + props.gridOffsetLeft,
      y: nearestTop + props.gridOffsetTop
    }
  }

  function getSubtilePositionAt(x: number, y: number) {
    const nearestLeft = roundAt((x / 4), props.horizontalTileThreshold) * 4
    const nearestTop = roundAt((y / 4), props.verticalTileThreshold) * 4
    
    return {
      x: nearestLeft + props.gridOffsetLeft,
      y: nearestTop + props.gridOffsetTop
    }
  }

  function undo() {
    subtileData.value = previousSubtileData.value

    previousTileData.value.forEach((tile) => {
      tileData.value.set(`${tile.x}-${tile.y}`, tile)
    })

    canUndo.value = false
    previousSubtileData.value = []
    previousTileData.value = new Map()
    willBeErased.value = []
    subtilesWillBeErased.value = []
    hasPendingChanges.value = true
  } 

  function handleKeyPress(event: KeyboardEvent) {
    isContextMenuOpen.value = false
    if (event.ctrlKey && event.key === 'z') {
      if (canUndo.value) {
        undo()
      }
    } else if (event.key === 'w' || event.key === "ArrowUp") {
      window.scrollBy({
        top: -100,
        behavior: "smooth",
      });
    } else if (event.key === 's' || event.key === "ArrowDown") {
      window.scrollBy({
        top: 100,
        behavior: "smooth",
      });
    } else if (event.key === 'a' || event.key === "ArrowLeft") {
      window.scrollBy({
        left: -100,
        behavior: "smooth",
      });
    } else if (event.key === 'd' || event.key === "ArrowRight") {
      window.scrollBy({
        left: 100,
        behavior: "smooth",
      });
    } else if (event.key === 'Escape') {
      shouldCloseDropdown.value = true
    }
  }

  function mouseEnteredPlanner() {
    isHoveringPlanner.value = true;
    (planner.value as HTMLElement).focus();
  }
  
  function mouseLeftPlanner() {
    isHoveringPlanner.value = false;
    (planner.value as HTMLElement).blur();

    dragStart.value = { x: 0, y: 0 }
    dragEnd.value = { x: 0, y: 0 }
    dragAmount.value = { x: 0, y: 0 }
    isDragging.value = false
    isDraggingToErase.value = false
  }

  function resetData() {
    let index = 0
    for (var y = props.gridOffsetTop; y <= props.imageHeight; y += 24) {
      for (var x = props.gridOffsetLeft; x <= props.imageWidth; x += 24) {
        let canPlant = true
        let canBuild = true
        if (props.bounds !== undefined && props.bounds.length > index) {
          if (props.bounds[index] === '0') {
            canBuild = true
            canPlant = true
          } else if (props.bounds[index] === '1') {
            canBuild = false
            canPlant = true
          } else if (props.bounds[index] === '2') {
            canBuild = true
            canPlant = false
          } else if (props.bounds[index] === '3') {
            canBuild = false
            canPlant = false
          }
        }

        tileData.value.set(`${x}-${y}`, {
          x,
          y,
          canPlant,
          canBuild,
          usedFor: undefined,
        })

        index++
      }
    }
    subtileData.value = []

    plannerStore.setTileData({ map: props.mapName, tileData: new Map<string, PlaceableTile>() })
    plannerStore.setSubtileData({ map: props.mapName, subtileData: [], version: dataVersion.value })
  }

</script>

<style scoped>

.mouse-lines-horizontal {
  border-top: 2px solid white;
  border-bottom: 2px solid white;
  height: 24px;
  color: transparent;
  width: 200vw;
  z-index: 10;
  position: absolute;
  top: -11px;
  left: -100vw;
}
.mouse-lines-vertical {
  border-left: 2px solid white;
  border-right: 2px solid white;
  width: 24px;
  color: transparent;
  height: 200vh;
  z-index: 10;
  position: absolute;
  top: -100vh;
  left: -12px;
}

.mouse-square {
  opacity: .3;
  height: 24px;
  width: 24px;
  background: white;
  z-index: 30;
  position: absolute;
  top: -12px;
  left: -12px;
}

.tile {
  height: 24px;
  width: 24px;
}

.highlight-square {
  opacity: .4;
  z-index: 1;
  position: absolute;
}

</style>