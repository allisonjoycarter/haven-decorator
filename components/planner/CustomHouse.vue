<template>
  <canvas
    ref="itemCanvas"
    :width="visibleWidth"
    height=210
    class="no-select"
  />
</template>

<script lang="ts" setup>
import type { CustomSet } from '~/models/custom_set';


const props = defineProps<{
  visibleWidth: number,
  customizations: any,
}>()
const itemCanvas = ref(null as HTMLCanvasElement|null)

onMounted(() => {
  if (itemCanvas !== null) {
    buildHouse(props.customizations)
  }
})

function buildHouse(data: CustomSet) {
  const canvas = (itemCanvas.value as HTMLCanvasElement)
  const context = canvas.getContext("2d")
  
  if (context !== null) {
    const patioImage = new Image()
    patioImage.src = 'https://farmdecoratorassets.blob.core.windows.net/decorations/' + data.patio.filename
    patioImage.onload = function() {
      context.drawImage(patioImage, 0, 75, 252, 132)
    }
    const doorImage = new Image()
    doorImage.src = 'https://farmdecoratorassets.blob.core.windows.net/decorations/' + data.door.filename
    doorImage.onload = function() {
      context.drawImage(doorImage, 110, 114, 33, 44)
    }
    const wallsImage = new Image()
    wallsImage.src = 'https://farmdecoratorassets.blob.core.windows.net/decorations/' + data.walls.filename
    wallsImage.onload = function() {
      context.drawImage(wallsImage, 16, 86, 220, 72)
    }
    const roofImage = new Image()
    roofImage.src = 'https://farmdecoratorassets.blob.core.windows.net/decorations/' + data.roof.filename
    roofImage.onload = function() {
      context.drawImage(roofImage, 10, 0, 231, 120)
    }
    const windowsImage = new Image()
    windowsImage.src = 'https://farmdecoratorassets.blob.core.windows.net/decorations/' + data.windows.filename
    windowsImage.onload = function() {
      context.drawImage(windowsImage, 25, 57, 202, 72)
    }
  }
}

</script>
