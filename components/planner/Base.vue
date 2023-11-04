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
        <img
          :style="'max-width: unset;'"
          :width="placingImageWidth"
          :src="'https://assets.havendecorator.com/decorations/Planner/' + isPlacing + '.png'"/>
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
            <div :class="'planner-grid'" ref="plannerGrid" @dragstart="(event) => event.preventDefault()"></div>
          </div>
          <div>
            <div
              v-for="(item, index) in subtileData"
              :key="index"
              :style="'position: absolute; top: ' + (item.yStart) + 'px; left: ' + (item.xStart) + 'px;'"
              :class="{
                'z-30': true,
                'grayscale contrast-200': subtilesWillBeErased.includes(item.id)
              }"
            >
            <img
                :width="item.visibleWidth"
                :style="'max-width: unset;'"
                class="no-select"
                :src="'https://assets.havendecorator.com/decorations/Planner/' + item.itemName + '.png'"/>
            </div>
          </div>
          <div ref="tilesContainer">
          <div
            v-for="(position, index) in tileData.values()" :key="index" 
            :style="'position: absolute; top: ' + (position.y - 11) + 'px; left: ' + (position.x - 11) + 'px;'"
            class="tile"
            >
              <div
                :class="{
                  'no-select z-40 absolute top-0 left-0 tile': true,
                  }"
              ></div>
              <img 
                v-if="position.usedFor !== undefined"
                :class="{
                  'no-select z-20 absolute top-0 left-0 tile': true,
                  'grayscale contrast-200': willBeErased.includes(`${position.x}-${position.y}`),
                }"
                style="max-width: unset;"
                :src="'https://assets.havendecorator.com/decorations/Planner/' + position.usedFor + '.png'"/>
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
  }>()
  const emit = defineEmits(['goToMap'])
  const plannerStore = usePlannerStore()

  const isLoading = ref(true)
  const isHoveringPlanner = ref(false)
  
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
  const draggedTiles = ref([] as string[])

  const isPlacing = ref(undefined as string|undefined)
  const placingItem = ref(null as null|HTMLElement)
  const placingDimensions = ref(undefined as PlaceableItem|undefined)
  
  const subtilesWillBeErased = ref([] as string[])
  const willBeErased = ref([] as string[])

  const buildingSizes = ref([] as PlaceableItem[])
  const craftingTableSizes = ref([] as PlaceableItem[])

  // Main data stored here
  const tileData = ref(new Map<string, PlaceableTile>())
  const subtileData = ref([] as PlacedItem[])

  // For Undo
  const canUndo = ref(false)
  const previousTileData = ref(new Map<string, PlaceableTile>())
  const previousSubtileData = ref([] as PlacedItem[])

  let saveIntervalId: undefined|NodeJS.Timeout = undefined
  const hasPendingChanges = ref(false)

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

  onMounted(() => {
    fetchSizes()

    if (plannerArea.value !== null) {
      const rect = (plannerArea.value as HTMLElement).getBoundingClientRect() 
      marginTop.value = rect.y;
      marginLeft.value = rect.x;
    }

    for (var x = props.gridOffsetLeft; x <= props.imageWidth; x += 24) {
      for (var y = props.gridOffsetTop; y <= props.imageHeight; y += 24) {
        tileData.value.set(`${x}-${y}`, {
          x: x,
          y: y,
          outOfBounds: false,
          isDragged: false,
          usedFor: undefined,
        })
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
        plannerStore.setSubtileData({ map: props.mapName, subtileData: subtileData.value })
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
    plannerStore.setSubtileData({ map: props.mapName, subtileData: subtileData.value })
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

  function saveAsImage() {
    const link = (savingPlaceholder.value as any)
    link.download = `${props.mapName}.png`;
    link.href = (originalCanvas.value as HTMLCanvasElement).toDataURL();
    link.click();
  }

  function saveAsFile() {
    let data = {
      base: props.mapName,
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
          itemImage.src = 'https://assets.havendecorator.com/decorations/Planner/' + tile.usedFor + '.png'
          itemImage.onload = function() {
            context.drawImage(itemImage, tile.x - 11, tile.y - 11)
          }
        }
      })

      subtileData.value.forEach((item) => {
        const decoImage = new Image()
        decoImage.src = 'https://assets.havendecorator.com/decorations/Planner/' + item.itemName + '.png'
        decoImage.onload = function() {
          context.drawImage(
            decoImage,
            // x, y to draw at
            item.xStart, item.yStart,
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
      for (var x = props.gridOffsetLeft; x <= props.imageWidth; x += 24) {
        for (var y = props.gridOffsetTop; y <= props.imageHeight; y += 24) {
          tileData.value.set(`${x}-${y}`, {
            x: x,
            y: y,
            outOfBounds: false,
            isDragged: false,
            usedFor: undefined,
          })
        }
      }

      const result = JSON.parse(e.target.result);
      if (result.base !== props.mapName) {
        emit('goToMap', result.base)
      }

      subtileData.value = result.subtileData

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

  function handleMapClick(event: MouseEvent) {
    if (event.buttons === 1) {
      if (isPlacing.value === undefined || placeOnDragEnd.value !== undefined) {
        isDragging.value = true

        const startingTile = getTilePositionAt(
          event.pageX - marginLeft.value,
          event.pageY - marginTop.value
        )
        dragStart.value = { x: startingTile.x, y: startingTile.y }

        handleMouseOverMap(event)
      } else {
        // Store for undo
        canUndo.value = true
        hasPendingChanges.value = true

        previousTileData.value = new Map()
        previousSubtileData.value = subtileData.value.map((item) => item)

        placeBuilding(event)
      }
    } else if (event.buttons === 2) {
      event.preventDefault()
      if (isPlacing.value !== undefined) {
        isPlacing.value = undefined
        placeOnDragEnd.value = undefined
      } 

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

  function handleDragEnd(event: MouseEvent|undefined) {
    if (placeOnDragEnd.value !== undefined || isDraggingToErase.value) {
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

            // Store for undo
            previousTileData.value.set(`${tile.x}-${tile.y}`, {
              x: tile.x, y: tile.y,
              outOfBounds: false,
              usedFor: tileData.value.get(`${tile.x}-${tile.y}`)!!.usedFor,
            })
            
            if (placeOnDragEnd.value !== undefined) {
              tileData.value.get(`${tile.x}-${tile.y}`).usedFor = placeOnDragEnd.value
            } else {
              tileData.value.get(`${tile.x}-${tile.y}`).usedFor = undefined
            }

            subtileData.value = subtileData.value.filter((subtile) => 
              !subtile.coversTiles.includes(`${tile.x}-${tile.y}`)
            )
          }
        }
      }

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
            if (subtileData.value[i].xStart <= (pos.x + (placingDimensions.value!!.placement_x * 4))
              && subtileData.value[i].xEnd >= pos.x
              && subtileData.value[i].yStart <= (pos.y + (placingDimensions.value!!.placement_y * 4))
              && subtileData.value[i].yEnd >= pos.y
              ) {
              subtilesWillBeErased.value.push(subtileData.value[i].id)
            }
          }
          const size = (placingItem.value as HTMLElement).getBoundingClientRect()
          willBeErased.value = findCoveredTiles(pos.x, size.bottom)

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
          subtilesWillBeErased.value = []
          willBeErased.value = []

          for (let x = leftX; x < rightX + 24; x+=24) {
            for (let y = topY; y < bottomY + 24; y+=24) {
              const tile = getTilePositionAt(x, y)
              if (tileData.value.has(`${tile.x}-${tile.y}`)) {
                willBeErased.value.push(`${tile.x}-${tile.y}`)
                subtileData.value
                  .filter((item) => item.coversTiles.includes(`${tile.x}-${tile.y}`))
                  .forEach((item) => {
                    if (!subtilesWillBeErased.value.includes(item.id)) {
                      subtilesWillBeErased.value.push(item.id)
                    }
                  })
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
      visible_x: 12,
      visible_y: 17,
      placement_x: 12,
      placement_y: 6
    }
  }

  function findCoveredTiles(subtileX: number, imageBottom: number) {
    const tileX = Math.round(subtileX / 24) * 24 + props.gridOffsetLeft
    const position = getTilePositionAt(tileX, imageBottom - marginTop.value)
    
    const tileWidth = Math.ceil(placingDimensions.value!!.placement_x / 6)
    const tileHeight = Math.ceil(placingDimensions.value!!.placement_y / 6)

    const coveredTiles = []
    for (let x = position.x; x < position.x + (tileWidth*24); x+=24) {
      for (let y = position.y - (tileHeight*24) + 24; y < position.y + 24; y+=24) {
        if (tileData.value.has(`${x}-${y}`)) {
          coveredTiles.push(`${x}-${y}`)
        }
      }
    }
    return coveredTiles
  }

  function placeBuilding(event: MouseEvent) {
    const dimensions = placingDimensions.value!!
    const xPixels = dimensions.visible_x * 4
    const yPixels = dimensions.visible_y * 4

    const topWithMargin = event.pageY - marginTop.value - (xPixels / 2);
    const leftWithMargin = event.pageX - marginLeft.value - (yPixels / 2);

    const subtilePosition = getSubtilePositionAt(leftWithMargin, topWithMargin)
    const size = (placingItem.value as HTMLElement).getBoundingClientRect()

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

    subtile.coversTiles = findCoveredTiles(subtilePosition.x, size.bottom)
    subtile.coversTiles.forEach((tileKey) => {
      const tile = tileData.value.get(tileKey)!
      previousTileData.value.set(tileKey, {
        x: tile.x, y: tile.y,
        outOfBounds: tile.outOfBounds,
        usedFor: tile.usedFor
      })
      tile.usedFor = undefined
    })

    subtileData.value = subtileData.value.filter((item) => !subtilesWillBeErased.value.includes(item.id))
    
    subtileData.value.push(subtile)

    isPlacing.value = undefined
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
    if (event.ctrlKey && event.key == 'z') {
      if (canUndo.value) {
        undo()
      }
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
    for (var x = props.gridOffsetLeft; x <= props.imageWidth; x += 24) {
      for (var y = props.gridOffsetTop; y <= props.imageHeight; y += 24) {
        tileData.value.set(`${x}-${y}`, {
          x: x,
          y: y,
          outOfBounds: true,
          isDragged: false,
          usedFor: undefined,
        })
      }
    }
    subtileData.value = []

    plannerStore.setTileData({ map: props.mapName, tileData: {} })
    plannerStore.setSubtileData({ map: props.mapName, subtileData: [] })
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