<template>
  <div class="py-3 mx-6 mb-4" :style="fullSizeStyle">
    <a ref="savingPlaceholder"/>
    <div>
      <button class="btn-primary" @click="saveFile">Save</button>
      <input class="ml-6" type="file" accept="application/json" id="loadfile" @change="loadFromFile">
    </div>
    <div class="relative border-none outline-none ring-0" tabindex="0" ref="planner"
      @mouseover="isHoveringPlanner = true"
      @mouseleave="isHoveringPlanner = false"

      @mousemove="handleMouseOverMap"
      @mouseup="handleDragEnd"
      @mousedown="handleMapClick"

      @contextmenu="(event) => event.preventDefault()"
    >
      <div class="absolute top-0 left-0 overflow-hidden z-30" :style="fullSizeStyle">
        <div v-show="isHoveringPlanner" ref="mouseIndicator" class="absolute">
          <div class="mouse-lines-vertical"></div>
          <div class="mouse-lines-horizontal"></div>
          <div class="mouse-square"></div>
          <div class="
            no-select ml-6 mt-4 
            bg-white bg-opacity-40 
            text-gray-950 px-1 
            rounded-sm text-sm font-bold
            "
            v-show="dragAmount.x > 0">
            {{ dragAmount.x }} x {{ dragAmount.y }}
          </div>
        </div>
      </div>
      <div :class="{
        'absolute z-30 opacity-40': true,
        'bg-blue-700': !isDraggingToErase,
        'bg-red-500': isDraggingToErase,
      }" v-show="isDragging" ref="mouseDragBox"></div>
      <div
        :style="mapBackgroundStyle + fullSizeStyle"
        ref="plannerArea"

        >
        <div class="z-20" :style="mapGridBackgroundStyle + fullSizeStyle + ' opacity: .4;'">
        </div>
        <div ref="tilesContainer">
          <div
            v-for="(position, index) in populatedTiles" :key="index" 
            :style="'position: absolute; top: ' + (position.y - 11) + 'px; left: ' + (position.x - 11) + 'px;'"
            :class="{
              'tile': true,
              'bg-rose-500 bg-opacity-60': !position.canBuild && position.canPlant,
              'bg-blue-500 bg-opacity-60': !position.canPlant && position.canBuild,
              'bg-purple-500 bg-opacity-60': !position.canBuild && !position.canPlant
            }"
            ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue'

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

  const plannerArea = ref(null as null|HTMLElement)
  const mouseIndicator = ref(null as null|HTMLElement)
  const savingPlaceholder = ref(null as null|HTMLElement)
  
  const marginTop = ref(0)
  const marginLeft = ref(0)
  
  const isDragging = ref(false)
  const isDraggingToErase = ref(false)
  const mouseDragBox = ref(null as null|HTMLElement)
  const dragStart = ref({x: 0, y: 0})
  const dragEnd = ref({x: 0, y: 0})
  const dragAmount = ref({x: 0, y: 0})

  const selectedFile = ref(null as File|null)

  // Main data stored here
  const tileData = ref(new Map<string, PlaceableTile>())

  const populatedTiles = computed(() => {
    return [...tileData.value.values()].filter((tile: PlaceableTile) => tile.canPlant === false || tile.canBuild === false);
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

  let saveIntervalId: undefined|NodeJS.Timeout = undefined

  onMounted(() => {
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
          canPlant: true, canBuild: true,
          usedFor: undefined,
        })
      }
    }
    
    saveIntervalId = setInterval(() => {
      let data = ''
      for (var y = props.gridOffsetTop; y <= props.imageHeight; y += 24) {
        for (var x = props.gridOffsetLeft; x <= props.imageWidth; x += 24) {
          const tile = tileData.value.get(`${x}-${y}`)!!
          if (tile.canBuild && tile.canPlant) {
            data += '0'
          } else if (tile.canPlant && !tile.canBuild) {
            data += '1'
          } else if (!tile.canPlant && tile.canBuild) {
            data += '2'
          } else if (!tile.canPlant && !tile.canBuild) {
            data += '3'
          }
        }
        data += '\n'
      }
    }, 30000)
  })

  onUnmounted(() => {
    if (saveIntervalId !== undefined) {
      clearInterval(saveIntervalId)
    }
  })

  async function saveFile() {
    let data = {
      base: props.mapName,
      version: 2,
      tileData: '',
    }

    for (var y = props.gridOffsetTop; y <= props.imageHeight; y += 24) {
      for (var x = props.gridOffsetLeft; x <= props.imageWidth; x += 24) {
        const tile = tileData.value.get(`${x}-${y}`)!!
          if (tile.canBuild && tile.canPlant) {
            data.tileData += '0'
          } else if (tile.canPlant && !tile.canBuild) {
            data.tileData += '1'
          } else if (!tile.canPlant && tile.canBuild) {
            data.tileData += '2'
          } else if (!tile.canPlant && !tile.canBuild) {
            data.tileData += '3'
          }
      }
    }

    var file = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(file)
    const link = savingPlaceholder.value as any
    link.href = url
    link.download = `${props.mapName}_bounds.json`
    link.click()
  }

  function loadFromFile(event: Event) {
    const files = (event.target as any).files;
    const file = files.item(0)

    const fr = new FileReader();

    fr.onload = (e: any) => {
      const result = JSON.parse(e.target.result)

      let index = 0
      let textData = result.tileData.replaceAll("\n", "")
      for (var y = props.gridOffsetTop; y <= props.imageHeight; y += 24) {
        for (var x = props.gridOffsetLeft; x <= props.imageWidth; x += 24) {
          if (textData[index] === '0') {
            tileData.value.get(`${x}-${y}`)!!.canBuild = true
            tileData.value.get(`${x}-${y}`)!!.canPlant = true
          } else if (textData[index] === '1') {
            tileData.value.get(`${x}-${y}`)!!.canBuild = false
            tileData.value.get(`${x}-${y}`)!!.canPlant = true
          } else if (textData[index] === '2') {
            tileData.value.get(`${x}-${y}`)!!.canBuild = true
            tileData.value.get(`${x}-${y}`)!!.canPlant = false
          } else if (textData[index] === '3') {
            tileData.value.get(`${x}-${y}`)!!.canBuild = false
            tileData.value.get(`${x}-${y}`)!!.canPlant = false
          }

          index++
        }
      }
    }
    fr.readAsText(file)
  }

  function handleMapClick(event: MouseEvent) {
    if (event.buttons === 1) {
      isDragging.value = true

      const startingTile = getTilePositionAt(
        event.pageX - marginLeft.value,
        event.pageY - marginTop.value
      )
      dragStart.value = { x: startingTile.x, y: startingTile.y }

      handleMouseOverMap(event)
    } else if (event.buttons === 2) {
      event.preventDefault()

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

  function handleDragEnd(event: MouseEvent) {
    if (isDragging.value || isDraggingToErase.value) {
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
            if (isDraggingToErase.value) {
              tileData.value.get(`${tile.x}-${tile.y}`)!!.canBuild = !tileData.value.get(`${tile.x}-${tile.y}`)!!.canBuild
            } else {
              tileData.value.get(`${tile.x}-${tile.y}`)!!.canPlant = !tileData.value.get(`${tile.x}-${tile.y}`)!!.canPlant
            }
          }
        }
      }
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
    if (isHoveringPlanner.value) {
      adjustMouseLines(event) 
    }
  }

  function adjustMouseLines(event: MouseEvent) {
    const indicator = (mouseIndicator.value as HTMLElement)

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
        
        const dragBox = (mouseDragBox.value as HTMLElement)

        const positionCss = `top: ${topY - 12}px; left: ${leftX - 12}px;`
        const sizeCss = `height: ${bottomY - topY + 24}px; width: ${rightX - leftX + 24}px;`

        dragBox.setAttribute("style", positionCss + sizeCss)

        dragAmount.value = { x: Math.round((rightX - leftX) / 24) + 1, y: Math.round((bottomY - topY) / 24) + 1 }
    }
  }

  function getTilePositionAt(x: number, y: number) {
    const nearestLeft = roundAt((x / 24), props.horizontalTileThreshold) * 24
    const nearestTop = roundAt((y / 24), props.verticalTileThreshold) * 24
    
    return {
      x: nearestLeft + props.gridOffsetLeft,
      y: nearestTop + props.gridOffsetTop
    }
  }

  function mouseEnteredPlanner() {
    isHoveringPlanner.value = true;
  }
  
  function mouseLeftPlanner() {
    isHoveringPlanner.value = false;

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
          canPlant: true, canBuild: true,
          usedFor: undefined,
        })
      }
    }
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