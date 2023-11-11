<template>
  <div 
    class="fixed z-50 pr-4 dark:bg-gray-700 bg-gray-100 drop-shadow-lg rounded-md max-h-96"
    @contextmenu="(event) => event.preventDefault()"
    >
    <button 
      class="selectable-item w-full z-50 flex flex-row gap-2 items-center"
      v-for="(option, index) in options"
      :key="index"
      @click="onSelectOption(option.name)"
    >
      <Icon v-if="option.icon !== undefined" :name="option.icon"/>
      {{ option.name.replace("NelVari", "Nel'Vari") }}
    </button>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'
  
  const props = defineProps<{
    options: { name: string, icon?: string }[]
  }>()
  const emit = defineEmits(['onSelectOption'])

  function onSelectOption(option: string) {
    emit('onSelectOption', option)
  }

</script>

<style scoped>
</style>