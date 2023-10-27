<template>
  <div class="gallery-container flex flex-wrap bg-gray-darken-4 ml-2">
    <div 
      v-for="(image, index) in images"
      :key="index"
      :class="{
        'window-container p-2 m-2 border': true,
        'border-indigo-400 bg-indigo-400 bg-opacity-30 rounded-md': selectedImageName === image.nameInGame,
        'border-transparent': selectedImageName !== image.nameInGame
      }"
      >
      <img 
        width="300"
        :src="'https://farmdecoratorassets.blob.core.windows.net/decorations/' + image.filename"
        class="pixelized window-image"
        @click="selectedImage(image)"
        />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { SunHavenImage } from '~/models/image'

  const props = defineProps({
    category: String,
    normalizedname: String,
    tier: String,
    images: Array<SunHavenImage>,
    selectedImageName: String,
  })
  const emit = defineEmits(['selectedImage'])

  function selectedImage(image: SunHavenImage) {
    emit("selectedImage", image)
  }
</script>

<style scoped>
.gallery-container{
  height: 30vh;
  overflow-y: scroll;
}
</style>

<style scoped>
.window-container {
  width: 80px;
  overflow: hidden;
}

.window-image {
  max-width: unset;
}
</style>