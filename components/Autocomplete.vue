<template>
  <div class="flex flex-col">
    <input type="text"
      class="p-2 rounded-md drop-shadow-lg
            border-2 border-gray-300 dark:border-gray-500
          bg-gray-100 dark:bg-gray-700 
            focus:ring-2 focus:ring-indigo-400 focus:dark:ring-indigo-800 
            outline-none
            "
      v-model="search"
      @input="searchOptions()"
      :placeholder="placeholder"
    />
    <div 
      class=" w-full pr-4 mt-1 dark:bg-gray-700 bg-gray-100 drop-shadow-lg rounded-md">
      <div v-if="results.length === 0 && search !== ''">
        <p class="text-sm px-4 py-1">No results match your search.</p>
      </div>
      <div v-else>
        <button 
          class="m-2 p-2 rounded-md z-50 w-full hover:bg-gray-300 hover:dark:bg-gray-500 flex flex-row gap-2 items-center"
          v-for="(option, index) in results"
          :key="index"
          @click="selectOption(option.name)"
        >
          <img v-if="option.image !== undefined" :src="option.image" class="max-h-20">
          {{ option.name.replace("NelVari", "Nel'Vari") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'

  const props = defineProps<{
    options: {name: string, image: string|undefined}[],
    placeholder: string|undefined,
  }>()
  const emit = defineEmits(['selected'])
  const search = ref('')
  const results = ref([] as {name: string, image: string|undefined}[])

  onMounted(() => {
    results.value = props.options.slice(0, 5)
  })

  function selectOption(option: string) {
    emit('selected', option)
  }

  function debounce<T extends unknown[]>(
    func: (...args: T) => void,
    delay: number,
  ):
    (...args: T) => void
  {
    let timer: NodeJS.Timeout | null = null;
    return (...args: T) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        func.call(null, ...args);
      }, delay);
    };
  }

  const searchOptions = debounce(() => {
    if (search.value == '') {
      results.value = props.options.slice(0, 5)
    } else {
      results.value = props.options.filter((item) => 
        item.name.toLowerCase().includes(search.value.toLowerCase())
      )
    }
  }, 200)
</script>

<style scoped>
</style>