<template>
  <div class="py-3 mx-6 mb-4">
    <div class="flex flex-row gap-4">
      <button class="btn-primary" @click="openSaveModal"><Icon name="fa:download"/>Save</button>
      <button class="btn-primary"><Icon name="fa:upload"/>Load</button>
    </div>
    <PlannerSaveModal
      v-show="isSaveModalOpen"
      @on-save="saveAsImage"
      @on-close="isSaveModalOpen = false"
    >
      <div ref="savedImage" class="scale-50 origin-top-left h-96 w-96"></div>
    </PlannerSaveModal>
    <div class="relative"
      @mouseover="mouseEnteredPlanner()"
      @mouseleave="mouseLeftPlanner()"

      @mousemove="handleMouseOverMap"
      @mouseup="handleDragEnd()"
      @mousedown="handleMapClick"

      @contextmenu="(event) => event.preventDefault()"
    >
      <PlannerTools
        @selected-building="grabBuilding"
        @selected-crop="grabCrop"
        @selected-path="grabPath"
        @update-grid-opacity="updateGridOpacity"
        :show-dropdown="showToolsDropdown"
        @mouseenter="() => showToolsDropdown = true"
        @mouseleave="() => showToolsDropdown = false"
      ></PlannerTools>
      <div class="indicator-container absolute overflow-clip z-0">
        <div
            v-if="isPlacing !== undefined"
            class="absolute top-0 left-0"
            ref="placingItem"
          >
          <img
            :width="placingWidth"
            :src="'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/' + isPlacing + '.png'"/>
        </div>
      </div>
      <div class="indicator-container absolute top-0 left-0 overflow-hidden">
        <div v-show="showMouseIndicator" ref="mouseIndicator" class="absolute">
          <div class="mouse-lines-vertical"></div>
          <div class="mouse-lines-horizontal"></div>
          <div class="mouse-square"></div>
        </div>
      </div>
      <div ref="plannerScrollContainer">
        <div
          class="planner-area"
          ref="plannerArea"
          >
          <div :style="'opacity: ' + gridOpacity / 100">
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
                :src="'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/' + item.itemName + '.png'"/>
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
            :style="'position: absolute; top: ' + (position.y - 11) + 'px; left: ' + (position.x - 11 + getXAdjustment()) + 'px;'"
            >
              <img 
                v-if="showImageOn(position)"
                :width="position.usedForWidth"
                style="max-width: unset;"
                :src="'https://farmdecoratorassets.blob.core.windows.net/decorations/Planner/' + position.usedFor + '.png'"/>
            </div>
          </div>
          <!-- <div highlight 
          -->
          <!-- <img width="1868" :class="'absolute top-0 left-0 z-10 ' + gridOpacityClass" src="https://farmdecoratorassets.blob.core.windows.net/decorations/sun_haven_farm_smaller_grid.png"/> -->
          <!-- <img width="1868" src="https://farmdecoratorassets.blob.core.windows.net/decorations/sun_haven_farm_smaller.png"/> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import buildingSizes from '~/models/building_sizes.json'
  import type { PlacedItem } from '~/models/placed_item';
  import html2canvas from 'html2canvas';

  const isHoveringPlanner = ref(false)
  const isSaveModalOpen = ref(false)

  const plannerArea = ref(null as null|HTMLElement)
  const plannerGrid = ref(null as null|HTMLElement)
  const plannerScrollContainer = ref(null as null|HTMLElement)
  const mouseIndicator = ref(null as null|HTMLElement)
  const savedImage = ref(null as null|HTMLElement)
  const gridOpacity = ref(40)

  const marginTop = ref(0)
  const marginLeft = ref(0)

  const gridOffsetTop = ref(1)
  const gridOffsetLeft = ref(7)
  
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

  const tileData = ref(new Map<string, PlaceableTile>())
  const subtileData = ref([] as PlacedItem[])

  const showToolsDropdown = ref(false)

  const showMouseIndicator = computed(() => {
    return isHoveringPlanner.value && (isPlacing.value === undefined || placeOnDragEnd.value !== undefined)
  })

  function getXAdjustment() {
    if ((plannerScrollContainer.value as HTMLElement).scrollLeft > 0) {
      return gridOffsetLeft.value
    }
    return 0
  }

  onMounted(() => {
    if (plannerArea.value !== null) {
      console.log(plannerArea.value)
      const rect = (plannerArea.value as HTMLElement).getBoundingClientRect() 
      marginTop.value = rect.y;
      marginLeft.value = rect.x;
    }

    for (var x = gridOffsetLeft.value; x <= 1868; x += 24) {
      for (var y = gridOffsetTop.value; y <= 1868; y += 24) {
        tileData.value.set(`${x}-${y}`, {
          x: x,
          y: y,
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

  function openSaveModal() {
    console.log("opening image...")
  }

  function saveAsImage() {
    console.log("saving")
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
      tileData.value.forEach((tile) => {
        if (tile.isDragged) {
          console.log("placing", placeOnDragEnd.value, "at", tile.x, tile.y)
          tile.usedFor = placeOnDragEnd.value
          tile.usedForWidth = undefined
          tile.isPlacementOrigin = true
        }
      }) 
    }

    if (isDraggingToErase.value) {
      tileData.value.forEach((tile) => {
        if (tile.isDragged) {
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
      }

      item.setAttribute("style", `left: ${pos.x}px; top: ${pos.y}px;`)
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
    
    const style = `top: ${position.y}px; left: ${position.x + getXAdjustment()}px;`;
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
      itemName: isPlacing.value!,
      coversTiles: [] as string[]
    }
    
    const tileX = Math.round(subtilePosition.x / 24) * 24 + gridOffsetLeft.value
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
    const nearestLeft = roundAt((x / 24), .9) * 24
    const nearestTop = roundAt((y / 24), .7) * 24
    
    return {
      x: nearestLeft + gridOffsetLeft.value,
      y: nearestTop + gridOffsetTop.value
    }
  }

  function getSubtilePositionAt(x: number, y: number) {
    const nearestLeft = roundAt((x / 4), .9) * 4
    const nearestTop = roundAt((y / 4), .7) * 4
    
    return {
      x: nearestLeft + gridOffsetLeft.value,
      y: nearestTop + gridOffsetTop.value
    }
  }

  function showImageOn(tile: PlaceableTile) {
    return tile.isPlacementOrigin && tile.usedFor !== undefined
  }

  function mouseEnteredPlanner() {
    isHoveringPlanner.value = true
  }
  
  function mouseLeftPlanner() {
    isHoveringPlanner.value = false
    handleDragEnd()
  }

</script>

<style scoped>

.planner-area {
  background: url("https://farmdecoratorassets.blob.core.windows.net/decorations/sun_haven_farm_smaller.png") left top transparent;
  height: 1868px;
  width: 1868px;
}

.planner-grid {
  background: url("https://farmdecoratorassets.blob.core.windows.net/decorations/sun_haven_farm_smaller_grid.png") left top transparent;
  height: 1868px;
}

.indicator-container {
  height: 1868px;
  width: 1868px;
}

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