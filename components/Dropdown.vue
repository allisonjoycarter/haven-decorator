<template>
  <div class="absolute top-50 z-50 dark:bg-gray-700 bg-gray-100 drop-shadow-lg rounded-sm">
    <button
      class="m-2 p-2 rounded-sm z-50hover:bg-gray-300 hover:dark:bg-gray-500 flex flex-row gap-2 items-center"
      v-for="(option, index) in options"
      :key="option"
      @click="selectOption(option)"
    >
      <img v-if="images !== undefined && images.length > index" :src="images[index]" class="max-h-20">
      {{ option }}
    </button>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'

  const props = defineProps<{
    options: string[]
    images?: string[]
  }>()

  const emit = defineEmits(['selected'])

  function selectOption(option: string) {
    emit('selected', option)
  }
</script>

<style scoped>
</style>