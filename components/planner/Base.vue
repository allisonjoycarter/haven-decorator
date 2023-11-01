<template>
  <div class="py-3 mx-6 mb-4" :style="fullSizeStyle">
    <a ref="savingPlaceholder"/>
    <div class="relative border-none outline-none ring-0" tabindex="0" ref="planner"
      @mouseover="mouseEnteredPlanner()"
      @mouseleave="mouseLeftPlanner()"

      @mousemove="handleMouseOverMap"
      @mouseup="handleDragEnd()"
      @mousedown="handleMapClick"

      @keydown="handleKeyPress"

      @contextmenu="(event) => event.preventDefault()"
    >
      <PlannerTools
        @selected-building="grabBuilding"
        @selected-crop="grabCrop"
        @selected-path="grabPath"
        @update-grid-opacity="updateGridOpacity"
        @open-save-modal="openSaveModal"
        @save-image="saveAsImage"
        @save-data-as-json="saveAsFile"
        @load-data-from-json="loadFromFile"

        :is-load-complete="isLoadComplete"
        :show-dropdown="showToolsDropdown"
        @mouseenter="() => showToolsDropdown = true"
        @mouseleave="() => showToolsDropdown = false"
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
          :width="placingWidth"
          :src="'https://assets.havendecorator.com/decorations/Planner/' + isPlacing + '.png'"/>
      </div>
      <div class="absolute top-0 left-0 overflow-hidden" :style="fullSizeStyle">
        <div v-show="showMouseIndicator" ref="mouseIndicator" class="absolute">
          <div class="mouse-lines-vertical"></div>
          <div class="mouse-lines-horizontal"></div>
          <div class="mouse-square"></div>
        </div>
      </div>
      <div>
        <div
          :style="mapBackgroundStyle + fullSizeStyle"
          ref="plannerArea"
          >
          <div :style="mapGridBackgroundStyle + fullSizeStyle + ' opacity: ' + gridOpacity / 100">
            <div :class="'planner-grid'" ref="plannerGrid" @dragstart="(event) => event.preventDefault()"></div>
          </div>
          <div>
            <div
              v-for="(item, index) in subtileData"
              :key="index"
              :style="'position: absolute; top: ' + (item.yStart) + 'px; left: ' + (item.xStart) + 'px;'"
              :class="{
                'grayscale contrast-100': collisions.includes(index)
              }"
            >
            <img
                :width="item.xEnd - item.xStart"
                :height="item.yEnd - item.yStart"
                style="max-width: unset;"
                class="no-select"
                :src="'https://assets.havendecorator.com/decorations/Planner/' + item.itemName + '.png'"/>
            </div>
          </div>
          <div ref="tilesContainer">
          <div
            v-for="(position, index) in tileData.values()" :key="index" 
            :class="{
              'tile': true,
              'highlight-square': position.isDragged,
              'bg-white': position.isDragged && !isPlacing && !isDraggingToErase,
              'bg-blue-700': position.isDragged && !isDraggingToErase,
              'bg-red-500': position.isDragged && isDraggingToErase,
            }"
            :style="'position: absolute; top: ' + (position.y - 11) + 'px; left: ' + (position.x - 11) + 'px;'"
            >
              <img 
                v-if="showImageOn(position)"
                class="no-select"
                :width="position.usedForWidth"
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
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import buildingSizes from '~/models/building_sizes.json'
  import type { PlacedItem } from '~/models/placed_item';

  const props = defineProps<{
    mapName: string,
    backgroundImage: string,
    backgroundGridImage: string,
    imageHeight: number,
    imageWidth: number,
    gridOffsetTop: number,
    gridOffsetLeft: number,
    verticalTileThreshold: number,
    horizontalTileThreshold: number,
  }>()

  const isHoveringPlanner = ref(false)
  
  const planner = ref(null as null|HTMLElement)
  const plannerArea = ref(null as null|HTMLElement)
  const plannerGrid = ref(null as null|HTMLElement)
  const mouseIndicator = ref(null as null|HTMLElement)
  const gridOpacity = ref(40)
  
  const originalCanvas = ref(null as null|HTMLCanvasElement)
  const savingPlaceholder = ref(null as null|HTMLElement)
  const isLoadComplete = ref(false)
  
  const marginTop = ref(0)
  const marginLeft = ref(0)

  
  const placeOnDragEnd = ref(undefined as string|undefined)
  const isDragging = ref(false)
  const isDraggingToErase = ref(false)
  const dragStart = ref({x: 0, y: 0})
  const draggedTiles = ref([] as string[])
  const currentDragLocation = ref({x: 0, y: 0})

  const isPlacing = ref(undefined as string|undefined)
  const placingWidth = ref(undefined as number|undefined)
  const placingItem = ref(null as null|HTMLElement)
  const collisions = ref([] as number[])
  const placingSizeX = ref(0)
  const placingSizeY = ref(0)

  // Main data stored here
  const tileData = ref(new Map<string, PlaceableTile>())
  const subtileData = ref([] as PlacedItem[])

  // For Undo
  const canUndo = ref(false)
  const previousTileData = ref(new Map<string, PlaceableTile>())
  const previousSubtileData = ref([] as PlacedItem[])

  const showToolsDropdown = ref(false)

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

  onMounted(() => {
    if (plannerArea.value !== null) {
      console.log(plannerArea.value)
      const rect = (plannerArea.value as HTMLElement).getBoundingClientRect() 
      marginTop.value = rect.y;
      marginLeft.value = rect.x;
    }

    for (var x = props.gridOffsetLeft; x <= 1868; x += 24) {
      for (var y = props.gridOffsetTop; y <= 2008; y += 24) {
        tileData.value.set(`${x}-${y}`, {
          x: x,
          y: y,
          outOfBounds: true,
          isDragged: false,
          isPlacementOrigin: false,
          origin: undefined,
          usedFor: undefined,
          usedForWidth: undefined,
        })
      }
    }

    console.log("Stored data for ", tileData.value.keys.length, "tiles");
  })

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

    console.log(data)

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

      subtileData.value.forEach((item) => {
        const decoImage = new Image()
        decoImage.src = 'https://assets.havendecorator.com/decorations/Planner/' + item.itemName + '.png'
        decoImage.onload = function() {
          console.log("drawing subtile item", item.itemName)
          context.drawImage(
            decoImage,
            // x, y to draw at
            item.xStart, item.yStart,
            // width, height of drawn image
            item.imageWidth, item.imageHeight,
            )
        }
      })

      tileData.value.forEach((tile) => {
        if (tile.usedFor !== undefined) {
          const itemImage = new Image()
          itemImage.src = 'https://assets.havendecorator.com/decorations/Planner/' + tile.usedFor + '.png'
          itemImage.onload = function() {
            console.log("drawing tile", tile.usedFor)
            context.drawImage(itemImage, tile.x - 11, tile.y - 11)
          }
        }
      })
    }
  }

  function loadFromFile(payload: Event) {
    isLoadComplete.value = false
    const files = (payload.target as any).files;
    if (files.length <= 0) {
      return false;
    }

    const fr = new FileReader();

    fr.onload = (e: any) => {
      for (var x = props.gridOffsetLeft; x <= 1868; x += 24) {
        for (var y = props.gridOffsetTop; y <= 2008; y += 24) {
          tileData.value.set(`${x}-${y}`, {
            x: x,
            y: y,
            outOfBounds: false,
            isDragged: false,
            isPlacementOrigin: false,
            origin: undefined,
            usedFor: undefined,
            usedForWidth: undefined,
          })
        }
      }

      const result = JSON.parse(e.target.result);
      subtileData.value = result.subtileData

      Object.values(result.tileData).forEach((entry: any) => {
        tileData.value.set(`${entry.x}-${entry.y}`, entry)
      })
    }
    fr.readAsText(files.item(0))
    isLoadComplete.value = true
  }

  function updateGridOpacity(opacity: number) {
    gridOpacity.value = Math.ceil(opacity / 10) * 10
  }

  function handleMapClick(event: MouseEvent) {
    if (event.buttons === 1) {
      if (isPlacing.value === undefined || placeOnDragEnd.value !== undefined) {
        isDragging.value = true
        // console.log("Begin drag", event)
      } else {
        // Store for undo
        canUndo.value = true
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

      isDragging.value = true
      isDraggingToErase.value = true
    }
  }

  function handleDragEnd() {
    isDragging.value = false
    dragStart.value = {x: 0, y: 0}
    draggedTiles.value = []
    
    if (placeOnDragEnd.value !== undefined) {
      // Store for undo
      canUndo.value = true
      previousTileData.value = new Map()
      previousSubtileData.value = subtileData.value.map((item) => item)

      tileData.value.forEach((tile) => {
        if (tile.isDragged) {
          // Store for undo
          previousTileData.value.set(`${tile.x}-${tile.y}`, {
            x: tile.x, y: tile.y,
            isDragged: false,
            outOfBounds: true,
            usedFor: tile.usedFor,
            usedForWidth: tile.usedForWidth,
            origin: tile.origin,
            isPlacementOrigin: tile.isPlacementOrigin
          })
          
          tile.usedFor = placeOnDragEnd.value
          tile.usedForWidth = undefined
          tile.origin = undefined
          tile.isPlacementOrigin = true
        }
      }) 
    }

    if (isDraggingToErase.value) {
      // Store for undo
      canUndo.value = true
      previousTileData.value = new Map()
      previousSubtileData.value = subtileData.value
      
      tileData.value.forEach((tile) => {
        if (tile.isDragged) {
          // Store for undo
          previousTileData.value.set(`${tile.x}-${tile.y}`, {
            x: tile.x, y: tile.y,
            isDragged: false,
            outOfBounds: true,
            usedFor: tile.usedFor,
            usedForWidth: tile.usedForWidth,
            origin: tile.origin,
            isPlacementOrigin: tile.isPlacementOrigin
          })
          
          tile.usedFor = undefined
          tile.usedForWidth = undefined
          tile.origin = undefined
          tile.isPlacementOrigin = false
          
          subtileData.value = subtileData.value.filter((subtile) => 
            !subtile.coversTiles.includes(`${tile.x}-${tile.y}`)
          )
        }
      })

      // TODO: Recalculate Collisions
      // const collidedItems = []
      // for (let i = 0; i < subtileData.value.length; i++) {
      //   if (collisions.value.includes(i)) {
      //     collidedItems.push(subtileData.value[i])
      //   }
      // }

      collisions.value = []
    }
    
    isDraggingToErase.value = false
    tileData.value.forEach((tile) => tile.isDragged = false)
  }

  function roundAt(value: number, roundUpAt: number) {
    return value - Math.floor(value) >= roundUpAt ? Math.ceil(value) : Math.floor(value)
  }

  function handleMouseOverMap(event: MouseEvent) {
    if (isPlacing.value !== undefined) {
      const item = (placingItem.value as HTMLElement)
      const size = item.getBoundingClientRect()

      const topWithMargin = event.pageY - marginTop.value - (size.width / 2);
      const leftWithMargin = event.pageX - marginLeft.value - (size.height / 2);

      let pos = {x: leftWithMargin, y: topWithMargin};

      if (pos.x < 1868 && pos.y < 2008) {
        if (placeOnDragEnd.value === undefined) {
          pos = getSubtilePositionAt(leftWithMargin, topWithMargin)
  
          collisions.value = []
          for (let i = 0; i < subtileData.value.length; i++) {
            if (subtileData.value[i].xStart <= (pos.x + (placingSizeX.value * 4))
              && subtileData.value[i].xEnd >= pos.x
              && subtileData.value[i].yStart <= (pos.y + (placingSizeY.value * 4))
              && subtileData.value[i].yEnd >= pos.y
              ) {
              collisions.value.push(i)
            }
          }
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
    
    if (isDragging.value && (
      dragStart.value.x === 0 
      || currentDragLocation.value.x !== position.x 
      || currentDragLocation.value.y !== position.y
      )
      ) {
        currentDragLocation.value = {x: position.x , y: position.y}

        if (dragStart.value.x === 0 && dragStart.value.y === 0) {
          dragStart.value = {x: position.x , y: position.y}
        }

        let leftX = Math.min(dragStart.value.x, position.x)
        let rightX = Math.max(dragStart.value.x, position.x)

        let topY = Math.min(dragStart.value.y, position.y)
        let bottomY = Math.max(dragStart.value.y, position.y)

        const inDrag = [`${dragStart.value.x}-${dragStart.value.y}`];
        const previouslyDragged = draggedTiles.value

        for (var x = leftX; x <= rightX; x += 24) {
          for (var y = topY; y <= bottomY; y += 24) {
            inDrag.push(`${x}-${y}`)
          }
        }

        if (previouslyDragged.join(' ') !== inDrag.join(' ')) {
          previouslyDragged.forEach((key) => {
            if (!inDrag.includes(key) && tileData.value.has(key)) {
              tileData.value.get(key)!!.isDragged = false
            }
          })
          inDrag.forEach((key) => {
            if (!previouslyDragged.includes(key) && tileData.value.has(key)) {
              tileData.value.get(key)!!.isDragged = true
            }
          })
        }
        draggedTiles.value = inDrag
    }
  }

  function grabCrop(crop: String) {
    isPlacing.value = 'Crops/' + crop
    placeOnDragEnd.value = 'Crops/' + crop
    placingWidth.value = 24
  }

  function grabPath(path: String) {
    isPlacing.value = 'Paths/' + path
    placeOnDragEnd.value = 'Paths/' + path
    placingWidth.value = 24
  }

  function grabBuilding(name: string) {
    isPlacing.value = 'Buildings/' + name

    placingSizeX.value = (buildingSizes as any)[name]['x']
    placingSizeY.value = (buildingSizes as any)[name]['y']

    placingWidth.value = (placingSizeX.value / 6) * 24
  }

  function placeBuilding(event: MouseEvent) {
    const size = (placingItem.value as HTMLElement).getBoundingClientRect()

    const topWithMargin = event.pageY - marginTop.value - (size.width / 2);
    const leftWithMargin = event.pageX - marginLeft.value - (size.height / 2);

    const subtilePosition = getSubtilePositionAt(leftWithMargin, topWithMargin)

    let subtile = {
      xStart: subtilePosition.x,
      xEnd: subtilePosition.x + (placingSizeX.value * 4),
      yStart: subtilePosition.y,
      yEnd: subtilePosition.y + (placingSizeY.value * 4),
      imageHeight: size.height,
      imageWidth: size.width,
      itemName: isPlacing.value!,
      coversTiles: [] as string[]
    }
    
    const tileX = Math.round(subtilePosition.x / 24) * 24 + props.gridOffsetLeft
    const position = getTilePositionAt(tileX, size.bottom - marginTop.value)
    
    const tileWidth = Math.ceil(placingSizeX.value / 6)
    const tileHeight = Math.ceil(placingSizeY.value / 6)

    console.log(position, 'width', tileWidth, 'height', tileHeight)

    const coveredTiles = []
    for (let x = position.x; x < position.x + (tileWidth*24); x+=24) {
      for (let y = position.y - (tileHeight*24) + 24; y < position.y + 24; y+=24) {
        if (tileData.value.has(`${x}-${y}`)) {
          coveredTiles.push(`${x}-${y}`)
          tileData.value.get(`${x}-${y}`)!.usedFor = undefined
          tileData.value.get(`${x}-${y}`)!.usedForWidth = undefined
        }
      }
    }
    subtile.coversTiles = coveredTiles

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

  function showImageOn(tile: PlaceableTile) {
    return tile.isPlacementOrigin && tile.usedFor !== undefined
  }

  function undo() {
    console.log("reverting to", previousSubtileData.value, previousTileData.value)
    subtileData.value = previousSubtileData.value

    previousTileData.value.forEach((tile) => {
      tileData.value.set(`${tile.x}-${tile.y}`, tile)
    })

    canUndo.value = false
    previousSubtileData.value = []
    previousTileData.value = new Map()
  } 

  function handleKeyPress(event: KeyboardEvent) {
    console.log(event)
    if (event.ctrlKey && event.key == 'z') {
      console.log("Undoing")
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
    handleDragEnd()
  }

</script>

<style scoped>

/* 
Each Map needs the following css:

.planner-area {
  background: url("https://assets.havendecorator.com/decorations/sun_haven_farm_smaller.png") left top transparent;
  height: 2008px;
  width: 1868px; 
}
.planner-grid {
  background: url("https://assets.havendecorator.com/decorations/sun_haven_farm_smaller_grid.png") left top transparent;
  height: 2008px;
}
.full-size {
  height: 2008px;
  width: 1868px;
}
*/

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