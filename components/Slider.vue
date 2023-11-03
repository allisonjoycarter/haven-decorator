<template>
  <div class="w-full h-6 mt-1">
    <input 
      type="range"
      :min="min ?? 1"
      :max="max ?? 100"
      :step="step ?? 10"
      v-model="sliderValue"
      class="slider h-4 bg-gray-300 dark:bg-gray-700 rounded-md hover hover:bg-gray-400 hover:dark:bg-gray-600"
      ref="slider"
      @input="onSliderChanged"
    />
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'

  const props = defineProps<{
    min?: number
    max?: number
    step?: number
  }>()

  const emit = defineEmits(['sliderChanged'])
  const sliderValue = ref(50)

  function onSliderChanged(event: Event) {
    emit('sliderChanged', sliderValue.value)
  }
</script>

<style scoped>

.slider {
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    opacity: 0.7;
    height: 10px;
    -webkit-transition: .2s;
    transition: opacity .2s;
  }
  
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 15px; 
    height: 15px;
    background: #3730a3;
    cursor: pointer;
    border: none;
    border: 3px solid #3730a3;
    border-radius: 15px;
  }
  
  .slider::-moz-range-thumb {
    width: 15px; 
    height: 15px;
    background: #3730a3;
    cursor: pointer;
    border: none;
    border: 3px solid #3730a3;
    border-radius: 15px;
  }

@media (prefers-color-scheme: dark) {
  
  .slider::-webkit-slider-thumb {
    background: #818cf8;
    border: 3px solid #818cf8;
  }
  
  .slider::-moz-range-thumb {
    background: #818cf8;
    border: 3px solid #818cf8;
  }

}

</style>