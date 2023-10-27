<template>
  <div class="gallery-container flex flex-row flex-wrap w-full">
    <div 
      v-for="(image, index) in images"
      :key="index"
      :class="
        'md:w-auto p-2 border ' + mobileWidth + 
        (selectedImageName?.trim() === image.nameInGame.trim() ? 
        ' bg-indigo-400 bg-opacity-30 rounded-md border-indigo-400' : 
        ' border-transparent')
        "
      >
      <img 
        :src="'https://farmdecoratorassets.blob.core.windows.net/decorations/' + image.filename"
        :class="'pixelized mx-auto ' + width"
        @click="selectedImage(image)"
        />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import type { SunHavenImage } from '../models/image'

  const props = defineProps({
    category: String,
    normalizedname: String,
    tier: String,
    mobileWidthClass: String,
    widthClass: String,
    images: Array<SunHavenImage>,
    selectedImageName: String,
    mobileWidth: String,
  })
  const emit = defineEmits(['selectedImage'])

  function selectedImage(image: SunHavenImage) {
    emit("selectedImage", image)
  }

  const mobileWidth = computed(() => {
    return props.mobileWidthClass ?? 'w-1/2' 
  })

  const width = computed(() => {
    return (props.widthClass ?? 'w-40')
  })
</script>

<style scoped>
.gallery-container{
  height: 30vh;
  overflow-y: scroll;
}

</style>